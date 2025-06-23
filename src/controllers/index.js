const login = require('./controller-login');
const register = require('./controller-register');
const app = require('./controller-app');
const profile = require('./controller-profile'); 
const datatable = require('./controller-datatable'); 

module.exports ={
	login,
	register,
	app,
	profile,
	datatable
};