const config = require('../configs/database');
let mysql      = require('mysql2/promise'); 
const dbConfig = config();  
module.exports ={
    formRegister(req,res){
        res.render("register",{
            url : '',
            title : "Register",
            layout: false
        });
    },
    saveRegister(req,res){
        let username = req.body.username;
        let email = req.body.email;
        let password = req.body.pass;
        if (username && email && password) {
            let pool = mysql.createPool({
                host: dbConfig.host,
                user: dbConfig.user,
                password: dbConfig.password,
                database: dbConfig.database
            });
            pool.on('error',(err)=> {
                console.error(err);
            });
            pool.getConnection()
            .then(connection => {
                return connection.query(
                `INSERT INTO users (user_name,user_email,user_password) VALUES (?,?,SHA2(?,512));`,
                [username, email, password]
                );
            })
            .then(results => {
                req.flash('color', 'success');
                req.flash('status', 'Yes..');
                req.flash('message', 'Registrasi berhasil');
                res.redirect('/login');
            })
            .catch(error => {
                throw error;
            })
            .finally(() => {
                pool.end();
            }); 
        } else {
            res.redirect('/login');
            res.end();
        }
    }
}