const router = require('express').Router();
const datatable = require('../controllers').datatable;  
const verifyUser = require('../configs/verify');

router.post('/device', verifyUser.isLogin, datatable.device);  
module.exports = router;