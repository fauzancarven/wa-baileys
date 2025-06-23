module.exports ={
    home(req,res){
        res.render("home",{ 
            url: '',
            userName: req.session.username,
            title: 'Dashboard',  
        });
    },
    device(req,res){
        res.render("device",{
            url: '',
            userName: req.session.username,
            title: 'Device',
            scr: `<script src="js/devices.js"></script>`
        });
    }
}