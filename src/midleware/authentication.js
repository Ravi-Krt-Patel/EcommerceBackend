const jwt = require("jsonwebtoken");


require("dotenv").config();
const verifyToken = (token)=>{
	return new Promise(function(resolve, reject){
		 jwt.verify(token, process.env.SALT, function(err, user) {
			if(err) {
				return reject(err);
			}
			return resolve(user);
		  });
	})
}
 
function authenticate(req, res, next) {

	// const token = req.cookies.jwt;

	if (typeof localStorage === "undefined" || localStorage === null) {
		var LocalStorage = require('node-localstorage').LocalStorage;
		localStorage = new LocalStorage('./scratch');
	  }
	  
	 // localStorage.setItem('myFirstKey', 'myFirstValue');
	 // console.log(localStorage.getItem('myFirstKey'));	
	 	
	const token = localStorage.getItem("jwt");

	if(!token) {
		return res.status(403).send({ message:"Please login or register first token"})
	}
	const user = verifyToken(token);
	if(!user) {
		return res.status(401).send({ message:"Your token is not currect please send currect token"})
	}
	req.user = user;
	next();
}

module.exports = authenticate; 