module.exports ={
    home(req,res){
        res.render("home",{ 
            url: 'http://localhost:5050/',
            userName: req.session.username,
            title: 'Dashboard',  
        });
    },
    device(req,res){
        res.render("device",{
            url: 'http://localhost:5050/',
            userName: req.session.username,
            title: 'Device',
            scr: `<script src="js/devices.js"></script>`
        });
    }
}