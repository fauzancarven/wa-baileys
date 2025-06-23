const router = require('express').Router();
const appController = require('../controllers').app; 
const profileController = require('../controllers').profile;
const verifyUser = require('../configs/verify');

router.get('/', verifyUser.isLogin, appController.home);
router.get('/device', verifyUser.isLogin, appController.device);
router.get('/profile', verifyUser.isLogin, profileController.profile); 

module.exports = router;