const { makeWASocket, AnyMessageContent, BinaryInfo, delay, DisconnectReason, downloadAndProcessHistorySyncNotification, encodeWAM, fetchLatestBaileysVersion, getAggregateVotesInPollMessage, getHistoryMsg, isJidNewsletter, makeCacheableSignalKeyStore, proto, useMultiFileAuthState, WAMessageContent, WAMessageKey } = require('@whiskeysockets/baileys');
 
const { Boom } = require('@hapi/boom');
const QRCode = require('qrcode'); 
const mysql = require('mysql2/promise');
const EventEmitter = require('events');
const config = require('./src/configs/database');
const { useMySQLAuthState } = require('mysql-baileys') 
const fs = require('fs');
const P = require('pino')
const logLevels = ['info', 'error', 'trace', 'debug', 'warn'];

function getLogFile(date, type) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  if (!fs.existsSync('./logs')) {
    fs.mkdirSync('./logs');
  }
  return `./logs/${type}-${year}-${month}-${day}.txt`;
}

let currentLogFiles = {};
let streams = [];

logLevels.forEach(level => {
  currentLogFiles[level] = getLogFile(new Date(), level);
  streams.push({ level, stream: P.destination(currentLogFiles[level]) });
});

let logger = P({ timestamp: () => `,"time":"${new Date().toJSON()}"` }, P.multistream(streams));

setInterval(() => {
  const newDate = new Date();
  const newLogFiles = {};
  logLevels.forEach(level => newLogFiles[level] = getLogFile(newDate, level));
  if (Object.keys(newLogFiles).some(level => newLogFiles[level] !== currentLogFiles[level])) {
    currentLogFiles = newLogFiles;
    streams = logLevels.map(level => ({ level, stream: P.destination(currentLogFiles[level]) }));
    logger = P({ timestamp: () => `,"time":"${new Date().toJSON()}"` }, P.multistream(streams));
  }
}, 60000); // periksa setiap menit

class WhatsApp extends EventEmitter { 
    constructor(phone,pairingcode = false) {
        super();  
        this.status = "disconnect"; 
        this.sock = null; 
        this.phone = phone;
        this.pairingcode = pairingcode;
    }
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async connect() {  
        const { state, saveCreds, removeCreds } = await useMySQLAuthState(config(this.phone));
        this.sock = makeWASocket({
            logger, 
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            browser: ['ubuntu', 'chrome', ''],
            generateHighQualityLinkPreview: true,
            printQRInTerminal: !this.pairingcode,  
            shouldIgnoreJid: jid => isJidBroadcast(jid),
        });
	   this.sock.ev.on('creds.update', saveCreds);
       this.sock.multi = true;
        // Pairing code for Web clients 
        if (this.pairingcode && !this.sock.authState.creds.registered) {   
            try{
                await delay(500); 
                let code = await this.sock.requestPairingCode(this.phone?.split(':')[0]);  
                this.emit('pairing-code',   {number: this.phone, status:"success", reason: code});  
                console.log(this.phone, code) 
            }catch(err){  
                this.emit('pairing-code',   {number: this.phone, status:"error", reason: err + ' reconecting | Auto change to qr'});        
                this.pairingcode = false;
                this.connect();
            } 
            
        }

        this.sock.ev.on('connection.update', async (update) => { 
            const { connection, lastDisconnect,qr} = update; 
            if (connection === 'close') {
                const reason = new Boom(lastDisconnect.error).output.statusCode;  
                if (reason === DisconnectReason.badSession) {  
                    this.emit('close',   {number: this.phone,reason: `code : 101 | Bad Session File, Please Delete ${this.phone} and Scan Again`});  
                    console.log('close',   {number: this.phone,reason: `code : 101 | Bad Session File, Please Delete ${this.phone} and Scan Again`});  
                    await removeCreds();
                    this.sock.logout();
                    this.connect();
                } else if (reason === DisconnectReason.connectionClosed) {  
                    this.emit('close',   {number: this.phone,reason:`code : 102 | Connection closed, reconnecting....`});  
                    console.log('close',   {number: this.phone,reason:`code : 102 | Connection closed, reconnecting....`});  
                    this.connect();
                } else if (reason === DisconnectReason.connectionLost) { 
                    this.emit('close', {number: this.phone,reason:`code : 103 | Connection Lost from Server, reconnecting...`});  
                    console.log('close', {number: this.phone,reason:`code : 103 | Connection Lost from Server, reconnecting...`});  
                    this.connect();
                } else if (reason === DisconnectReason.connectionReplaced) {  
                    this.emit('close', {number: this.phone,reason:`code : 104 | Connection Replaced, Another New Session Opened, Please Close Current Session First`});  
                    console.log('close', {number: this.phone,reason:`code : 104 | Connection Replaced, Another New Session Opened, Please Close Current Session First`});  
                    this.sock.logout();
                } else if (reason === DisconnectReason.loggedOut) {  
                    this.emit('close', {number: this.phone,reason: `code : 105 | Device Logged Out, Please Delete ${this.phone} and Scan Again.`}); 
                    console.log('close', {number: this.phone,reason: `code : 105 | Device Logged Out, Please Delete ${this.phone} and Scan Again.`}); 
                    await removeCreds();
                    this.connect();
                } else if (reason === DisconnectReason.restartRequired) {  
                    this.emit('close', {number: this.phone,reason: `code : 106 | Restart Required, Restarting...`}); 
                    console.log('close', {number: this.phone,reason: `code : 106 | Restart Required, Restarting...`});    
                    setTimeout(() => {
                        this.connect();
                    }, 5000); // Tunggu 
                } else if (reason === DisconnectReason.timedOut) { 
                    this.emit('close', {number: this.phone,reason: `code : 106 | Restart Required, Restarting...`}); 
                    console.log('close', {number: this.phone,reason: `code : 107 | Connection TimedOut, Reconnecting...`});     
                    this.connect();
                } else {   
                    this.emit('close', {number: this.phone,reason:  `code : 108 | Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`});    
                    console.log('close', {number: this.phone,reason:  `code : 108 | Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`});    
                    this.sock.end(`Unknown DisconnectReason: ${reason}|${lastDisconnect.error}`);
                }
            } else if (connection === 'open') {
                this.status = "connected"; 
                console.log(`whatsaapp ready : ${this.phone}`)
                this.emit('open',{number: this.phone,reason: "whatsapp berhasil terhubung!!!"}); 
            } else if(connection == "connecting" || !!qr){ 
                if (update.qr && !this.pairingcode) { 
                    QRCode.toDataURL(qr, (err, url) => { 
                        this.emit('qr', {number: this.phone,reason: url});  
                    }); 
                }
                
            } 
          
        });
        
    } 

    async sendMessage(number, message) {
        await this.sock.sendMessage(`${number}`, { text: message });
    } 
    destroy() {
        // Logika untuk menghancurkan koneksi WhatsApp
        try {
            this.sock.logout();
            this.sock = null;
        } catch (error) { 
            this.sock = null;
        }
    }
}

module.exports = WhatsApp;