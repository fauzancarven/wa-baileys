module.exports ={
    home(req,res){
        res.render("home",{ 
            url: '/',
            userName: req.session.username,
            title: 'Dashboard',   
        });
    },
    device(req,res){
        res.render("device",{
            url: '/',
            userName: req.session.username,
            title: 'Device',
            scr: `<script src="js/devices.js"></script>`
        });
    },
    contact(req,res){
        res.render("contact",{
            url: '/',
            userName: req.session.username,
            title: 'Phonebook',
            subtitle: 'Contact',
            scr: `<script src="js/contact.js"></script>`
        });
    },
    group(req,res){
        res.render("group",{
            url: '/',
            userName: req.session.username,
            title: 'Phonebook',
            subtitle: 'Group',
            scr: `<script src="js/group.js"></script>`
        });
    },
    wagroup(req,res){
        res.render("groupwa",{
            url: '/',
            userName: req.session.username,
            title: 'Phonebook',
            subtitle: 'Groupwa',
            scr: `<script src="js/groupwa.js"></script>`
        });
    },
    chat(req,res){
        res.render("chat",{
            url: '/',
            userName: req.session.username,
            title: 'Chat', 
            scr: `<script src="js/chat.js"></script>`
        });
    },
    bot(req,res){
        res.render("chat",{
            url: '/',
            userName: req.session.username,
            title: 'Chat', 
            scr: `<script src="js/chat.js"></script>`
        });
    },
    history(req,res){
        res.render("chat",{
            url: '/',
            userName: req.session.username,
            title: 'Chat', 
            scr: `<script src="js/chat.js"></script>`
        });
    }
}