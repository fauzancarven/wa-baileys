// Definisi Library yang digunakan
const express = require('express');
const expressSession = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const path = require('path');
const flash = require('req-flash');
const app = express();
const childProcess = require('child_process');
const server = require("http").createServer(app); 
const io = require("socket.io")(server);
const sharedsession = require('express-socket.io-session');

const config = require('./src/configs/database'); 
const dbConfig = config();
const MySQLStore = require('express-mysql-session')(expressSession);
const mysql = require('mysql');
const mysqlprom = require('mysql2/promise');
 
const session_wa = {};
const WhatsApp = require('./bailleys');  
const { phoneNumberFormatter } = require('./phoneNumberFormatter');

// Definisi lokasi file router
const loginRoutes = require('./src/routes/router-login');
const registerRoutes = require('./src/routes/router-register');
const appRoutes = require('./src/routes/router-app');
const datatableRoutes = require('./src/routes/router-datatable');
const conn = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
}); 

const fileUpload = require('express-fileupload');
app.use(fileUpload({
    createParentPath: true
}));
// Configurasi library session
const sessionStore = new MySQLStore({}, conn);
const session = expressSession({
    key: 'mahieraglobalsolution',
    secret: 'fauzancaren',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
        sameSite: true,
        //maxAge: 10000,
        maxAge: 3600000 //1 jam //1 jam
    }
  });
app.use(session);

// Configurasi dan gunakan library
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(flash());

app.use(function(req, res, next) {
    res.setHeader('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    res.setHeader('Pragma', 'no-cache');
    next();
});

// Setting folder views
app.set('views',path.join(__dirname,'src/views'));
app.use(express.static('src/assets'));  
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);
app.set('layout', path.join(__dirname, 'src/layouts/main'));

// Gunakan routes yang telah didefinisikan
app.use('/login', loginRoutes);
app.use('/register', registerRoutes);
app.use('/', appRoutes);
app.use('/datatable', datatableRoutes);
app.post('/deploy', (req, res) => deploy_php(req, res));
app.get('/deploy', (req, res) => deploy_php(req, res)); 
function deploy_php(req, res){
    childProcess.exec('git pull', (error, stdout, stderr) =>
    {
        if (error)
        {
            res.status(500).send(`Error: ${error}`);
            return;
        }
        res.send(stdout);
    }); 
}
// send text message to wa user
app.post("/send-message", async (req, res) => {
    try {
        //console.log(req);
        const pesankirim = req.body.message;
        const sender = phoneNumberFormatter(req.body.sender,false);
        const number = req.body.number;
        const fileDikirim = req.files.file_dikirim;  
        if(!session_wa[sender]){
            return res.status(500).json({
                status: false,
                response: `Nomor ${sender} tidak terdaftar di server.`,
            });
        }
        if(session_wa[sender].status == "disconnected"){
            return res.status(501).json({
                status: false,
                response: `Nomor ${sender} tidak terhubung di server. segera aktifkan diserver nomer sender tersebut`,
            });
        }  
        const nomer = phoneNumberFormatter(number,true); 
        const exists = await session_wa[sender].sock.onWhatsApp(nomer); 
        if (exists?.jid || (exists && exists[0]?.jid)) {
            if (!req.files) {
                console.log("send message text")
                session_wa[sender].sock.sendMessage(exists.jid || exists[0].jid, { text: pesankirim })
                .then((result) => {
                    res.status(200).json({
                        status: true,
                        response: result,
                    });
                })
                .catch((err) => {
                    res.status(500).json({
                        status: false,
                        response: err,
                    });
                });
            }else{ 
                console.log('send message file');
                const fs = require("fs");
                const path = require("path");
                let filesimpan = fileDikirim;
                var file_ubah_nama = new Date().getTime() + '_' + filesimpan.name;
                //pindahkan file ke dalam upload directory
                await filesimpan.mv('./uploads/' + file_ubah_nama);
                let fileDikirim_Mime = filesimpan.mimetype;  
                const namafiledikirim = path.join(__dirname, 'uploads/' + file_ubah_nama);
                let extensionName = path.extname(namafiledikirim); 

                if (extensionName === '.jpeg' || extensionName === '.jpg' || extensionName === '.png' || extensionName === '.gif') { 
                    
                    console.log('send document image');
                    await session_wa[sender].sock.sendMessage(exists.jid || exists[0].jid, {
                        image: {
                            url: namafiledikirim
                        },
                        caption: pesankirim
                    }).then((result) => {
                        console.log(result);
                        if (fs.existsSync(namafiledikirim)) {
                            fs.unlink(namafiledikirim, (err) => {
                                if (err && err.code == "ENOENT") {
                                    // file doens't exist
                                    console.info("File doesn't exist, won't remove it.");
                                } else if (err) {
                                    console.error("Error occurred while trying to remove file.");
                                }
                                //console.log('File deleted!');
                            });
                        }
                        res.send({
                            status: true,
                            message: 'Success',
                            data: {
                                name: filesimpan.name,
                                mimetype: filesimpan.mimetype,
                                size: filesimpan.size
                            }
                        });
                    }).catch((err) => {
                        res.status(500).json({
                            dir: namafiledikirim,
                            doc: extensionName,
                            status: false,
                            response: err,
                        });
                        console.log('pesan gagal terkirim');
                    });
                } else if (extensionName === '.mp3' || extensionName === '.ogg') {
                    await session_wa[sender].sock.sendMessage(exists.jid || exists[0].jid, {
                        audio: {
                            url: namafiledikirim,
                            caption: pesankirim
                        },
                        mimetype: 'audio/mp4'
                    }).then((result) => {
                        if (fs.existsSync(namafiledikirim)) {
                            fs.unlink(namafiledikirim, (err) => {
                                if (err && err.code == "ENOENT") {
                                    // file doens't exist
                                    console.info("File doesn't exist, won't remove it.");
                                } else if (err) {
                                    console.error("Error occurred while trying to remove file.");
                                }
                                //console.log('File deleted!');
                            });
                        }
                        res.send({
                            status: true,
                            message: 'Success',
                            data: {
                                name: filesimpan.name,
                                mimetype: filesimpan.mimetype,
                                size: filesimpan.size
                            }
                        });
                    }).catch((err) => {
                        res.status(500).json({
                            status: false,
                            response: err,
                        });
                        console.log('pesan gagal terkirim');
                    });
                } else {
                    await session_wa[sender].sock.sendMessage(exists.jid || exists[0].jid, {
                        document: {
                            url: namafiledikirim,
                            caption: pesankirim
                        },
                        mimetype: fileDikirim_Mime,
                        fileName: filesimpan.name
                    }).then((result) => {
                        if (fs.existsSync(namafiledikirim)) {
                            fs.unlink(namafiledikirim, (err) => {
                                if (err && err.code == "ENOENT") {
                                    // file doens't exist
                                    console.info("File doesn't exist, won't remove it.");
                                } else if (err) {
                                    console.error("Error occurred while trying to remove file.");
                                }
                                //console.log('File deleted!');
                            });
                        }
                        /*
                        setTimeout(() => {
                            sock.sendMessage(exists.jid || exists[0].jid, {text: pesankirim});
                        }, 1000);
                        */
                        res.send({
                            status: true,
                            message: 'Success',
                            data: {
                                name: filesimpan.name,
                                mimetype: filesimpan.mimetype,
                                size: filesimpan.size
                            }
                        });
                    }).catch((err) => {
                        res.status(500).json({
                            status: false,
                            response: err,
                        });
                        console.log('pesan gagal terkirim');
                    });
                } 
            }
        } else {
            res.status(500).json({
                status: false,
                response: `Nomor ${number} tidak terdaftar.`,
            });
        }  
    } catch (err) {
        res.status(500).send({err,status:"err doc utama"});
    } 
});


// Gunakan port server
server.listen(2000, ()=>{
    console.log('Server Berjalan di Port : '+ 2000);
});
 
async function updateStatusNumber(number,status){
    const db = await mysqlprom.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database
    });
    try { 
        await db.execute(`update device set status=${status} where nomor=${number}`); 
        console.log(`update device set status=${status} where nomor=${number}`);
    } catch (error) {
        console.error('Error loading numbers and types from DB:', error);
        return [];
    } finally {
        await db.end();
    }
}
async function updateMetodeNumber(number,status){
    const db = await mysqlprom.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database
    });
    try { 
        await db.execute(`update device set type=${status} where nomor=${number}`); 
        console.log(`update device set type=${status} where nomor=${number}`);
    } catch (error) {
        console.error('Error loading numbers and types from DB:', error);
        return [];
    } finally {
        await db.end();
    }
}
async function loadNumbersFromDB() {
    const query = 'SELECT nomor,type FROM device where status = 1'; 
    const db = await mysqlprom.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database
    });
    try { 
        const [rows] = await db.execute(query);
        await db.end();
        return rows.map(row => ({ number: row.nomor, type: row.type }));
    } catch (error) {
        console.error('Error loading numbers and types from DB:', error);
        await db.end();
        return [];
    }  finally {
        await db.end();
    }
} 
async function craate_session_wa(number,type){
    const nomer = phoneNumberFormatter(number,false);
    await updateMetodeNumber(number,type);
    if (session_wa[number]) {
        session_wa[number].destroy();
        delete session_wa[number];
        console.log('delete session :', number);
    }
    console.log('create new session :', number);
    session_wa[number] = new WhatsApp(nomer,(type==1 ? true : false));  
    session_wa[number].connect();
    session_wa[number].on('close', async (data) => { 
        io.emit('whatsapp-status', { number: data.number, status: 'close', reason: data.reason });   
        await updateStatusNumber(data.number,0);
    });
    session_wa[number].on('open', async (data) => { 
        io.emit('whatsapp-status', { number: data.number, status: 'open', reason: data.reason });   
        await updateStatusNumber(data.number,1);
    });
    session_wa[number].on('pairing-code', async (data) => { 
        io.emit('whatsapp-pairing', { number: data.number,status: data.status, reason: data.reason });
        await updateStatusNumber(data.number,0);
    }); 
    session_wa[number].on('qr', async (data) => {  
        io.emit('whatsapp-qr', { number: data.number, status: 'qr', reason: data.reason });
        await updateStatusNumber(data.number,0);
    }); 

    // const number = phoneNumberFormatter("6289676143063");
    // session_wa[data.number].sendMessage(number,"test")
    io.emit('load-device',{
        status: session_wa[number].status,
        number: number
    });
}
async function connectAllNumbers() {
    const numbers = await loadNumbersFromDB();
    numbers.forEach(({ number, type }) => {  
        console.log("start whatsapp ",number)
        craate_session_wa(number, type)
       
    });  
}
io.use(sharedsession(session, {
    autoSave: true
}));
io.on("connection", async (socket) => { 
    const sessionId = socket.handshake.sessionID;
    const namaSocket = socket.handshake.query.nama;
    const emailSocket = socket.handshake.query.email;
    console.log(`Socket ${emailSocket} ${namaSocket} ${socket.id} terhubung`); 

    socket.on('disconnect', () => {
        console.log(`Socket ${socket.id} disconnected`); 
    }); 
    socket.on('whatsapp-status', (data) => {
        console.log('Data whatsapp-status:', data);
    });  
    socket.on('whatsapp-message', (data) => {
        console.log('Data whatsapp-message:', data);
    }); 
    socket.on('whatsapp-pairing', (data) => {
        console.log('Data whatsapp-message:', data);
    }); 
    socket.on('whatsapp-qr', (data) => {
        console.log('Data whatsapp-message:', data);
    });
    socket.on('new-device', (data) => {
        craate_session_wa(data["number"],data["type"]);
    }); 
    socket.on('update-session', () => { 
        sessionStore.get(sessionId, (err, session) => {
        if (err) {
            socket.emit("logout")
            console.error("Error getting session",err);
        } else if (!session) {
            console.error("Session not found");
        } else {
            sessionStore.set(sessionId, session, (err) => {
                if (err) {
                    console.error("Error updating session:", err);
                  }
            });
        }
        });
    });
});
connectAllNumbers();

