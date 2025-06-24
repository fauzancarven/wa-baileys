const config = require('../configs/database'); 
let mysql      = require('mysql2/promise'); 
const dbConfig = config(); 

module.exports ={
    login(req,res){
        res.render("login",{
            url : '',
            colorFlash: req.flash('color'),
            statusFlash: req.flash('status'),
            pesanFlash: req.flash('message'),
            layout: false
        });
    },
    loginAuth(req,res){
        let email = req.body.email;
        let password = req.body.pass;
        if (email && password) {
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
                `SELECT * FROM users WHERE user_email = ? AND user_password = SHA2(?,512)`,
                [email, password]
                ).finally(() => {
                    connection.release();
                });
            })
            .then(([results]) => {
                const user = results[0];
                console.log(user)
                if (results.length > 0) {
                    req.session.loggedin = true;
                    req.session.userid = user.user_id;
                    req.session.username = user.user_name;
                    req.session.useremail = user.user_email;
                    res.redirect('/');
                } else {
                    req.flash('color', 'danger');
                    req.flash('status', 'Oops..');
                    req.flash('message', 'Akun tidak ditemukan');
                    res.redirect('/login');
                }
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
    },
    logout(req,res){
        req.session.destroy((err) => {
            if(err) {
                return console.log(err);
            }
            res.clearCookie('fauzancaren');
            res.redirect('/login');
        });
    },
}