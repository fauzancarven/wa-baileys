const login = require('./controller-login');
const register = require('./controller-register');
const app = require('./controller-app'); 
const datatable = require('./controller-datatable'); 

module.exports ={
	login,
	register,
	app, 
	datatable
};