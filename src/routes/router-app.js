const router = require('express').Router();
const appController = require('../controllers').app;  
const verifyUser = require('../configs/verify');

router.get('/', verifyUser.isLogin, appController.home);
router.get('/device', verifyUser.isLogin, appController.device);
router.get('/contact', verifyUser.isLogin, appController.contact);
router.get('/group', verifyUser.isLogin, appController.group);
router.get('/wagroup', verifyUser.isLogin, appController.wagroup);
router.get('/chat', verifyUser.isLogin, appController.chat);  
router.get('/history', verifyUser.isLogin, appController.history);  
router.get('/bot', verifyUser.isLogin, appController.bot);  

module.exports = router;