module.exports ={
    home(req,res){
        res.render("home",{ 
            url: '/',
            session: req.session,
            title: 'Dashboard',   
        });
    },
    device(req,res){
        res.render("device",{
            url: '/',
            session: req.session,
            title: 'Device',
            scr: `<script src="app/devices.js"></script>`
        });
    },
    contact(req,res){
        res.render("contact",{
            url: '/',
            session: req.session,
            title: 'Phonebook',
            subtitle: 'Contact',
            scr: `<script src="app/contact.js"></script>`
        });
    },
    group(req,res){
        res.render("group",{
            url: '/',
            session: req.session,
            title: 'Phonebook',
            subtitle: 'Group',
            scr: `<script src="app/group.js"></script>`
        });
    },
    wagroup(req,res){
        res.render("groupwa",{
            url: '/',
            session: req.session,
            title: 'Phonebook',
            subtitle: 'Groupwa',
            scr: `<script src="app/groupwa.js"></script>`
        });
    },
    chat(req,res){
        res.render("chat",{
            url: '/',
            session: req.session,
            title: 'Chat', 
            scr: `<script src="app/chat.js"></script>`
        });
    },
    bot(req,res){
        res.render("chat",{
            url: '/',
            session: req.session,
            title: 'Chat', 
            scr: `<script src="app/chat.js"></script>`
        });
    },
    history(req,res){
        res.render("chat",{
            url: '/',
            session: req.session,
            title: 'Chat', 
            scr: `<script src="app/chat.js"></script>`
        });
    }
}