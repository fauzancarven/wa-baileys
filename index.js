// Definisi Library yang digunakan
const express = require('express');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');
const path = require('path');
const flash = require('req-flash');
const app = express();
const childProcess = require('child_process');
const server = require("http").createServer(app); 
const io = require("socket.io")(server);

const config = require('./src/configs/database'); 
const dbConfig = config();
const MySQLStore = require('express-mysql-session')(session);
const mysql = require('mysql');
const mysqlprom = require('mysql2/promise');
const connection = mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database
}); 

// Definisi lokasi file router
const loginRoutes = require('./src/routes/router-login');
const registerRoutes = require('./src/routes/router-register');
const appRoutes = require('./src/routes/router-app');
const datatableRoutes = require('./src/routes/router-datatable');

// Configurasi library session
app.use(session({
    resave: false,
    saveUninitialized: false,
    store: new MySQLStore({}, connection), 
    secret: 't@1k0ch3ng',
    name: 'secretName',
    cookie: {
        sameSite: true,
        maxAge: 86400000
    },
}))

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
// Gunakan port server
server.listen(2000, ()=>{
    console.log('Server Berjalan di Port : '+ 2000);
});
const session_wa = {};
const WhatsApp = require('./bailleys');  
const { phoneNumberFormatter } = require('./phoneNumberFormatter');
 
async function updateNumber(number,status){
    try {
        const db = await mysqlprom.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database
        });
        await db.execute(`update device set status=${status} where nomor=${number}`); 
    } catch (error) {
        console.error('Error loading numbers and types from DB:', error);
        return [];
    } 
}
async function loadNumbersFromDB() {
    const query = 'SELECT nomor,type FROM device where status = 1';
    try {
        const db = await mysqlprom.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database
        });
        const [rows] = await db.execute(query);
        return rows.map(row => ({ number: row.nomor, type: row.type }));
    } catch (error) {
        console.error('Error loading numbers and types from DB:', error);
        return [];
    } 
} 
function craate_session_wa(number,type){
    const nomer = phoneNumberFormatter(number,false);
    if(session_wa[number]){
        session_wa[number].pairingcode = type;
        session_wa[number].connect();
        
        console.log('renew session :', number);
        return;
    }
    console.log('create new session :', number);
    session_wa[number] = new WhatsApp(nomer,(type==1 ? true : false));  
    session_wa[number].connect();
    
    session_wa[number].on('close', async (data) => { 
        io.emit('whatsapp-status', { number: data.number, status: 'close', reason: data.reason });   
        await updateNumber(data.number,0);
    });
    session_wa[number].on('open', async (data) => { 
        io.emit('whatsapp-status', { number: data.number, status: 'open', reason: data.reason });   
        await updateNumber(data.number,1);
    });
    session_wa[number].on('pairing', async (data) => { 
        io.emit('whatsapp-pairing', { number: data.number, status: 'pairingcode', reason: data.reason });
        await updateNumber(data.number,0);
    }); 
    session_wa[number].on('qr', async (data) => {  
        io.emit('whatsapp-qr', { number: data.number, status: 'qr', reason: data.reason });
        await updateNumber(data.number,0);
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
io.on("connection", async (socket) => {
    console.log('Client terhubung');
    socket.on('load-device', (data) => {  

    });

    // Membaca data dari client
    socket.on('whatsapp-status', (data) => {
        console.log('Data whatsapp-status:', data);
    });

    // Membaca data dari client
    socket.on('whatsapp-message', (data) => {
        console.log('Data whatsapp-message:', data);
    });
    // Membaca data dari client
    socket.on('whatsapp-pairing', (data) => {
        console.log('Data whatsapp-message:', data);
    });
    // Membaca data dari client
    socket.on('whatsapp-qr', (data) => {
        console.log('Data whatsapp-message:', data);
    });
    socket.on('new-device', (data) => {
        craate_session_wa(data["number"],data["type"]);
    });
    
});
connectAllNumbers();

