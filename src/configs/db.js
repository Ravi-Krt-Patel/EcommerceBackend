const mongoose = require('mongoose');
require("dotenv").config();
const connect = ()=>{
	return mongoose.connect(`mongodb+srv://ravikumar:${process.env.PASSWORD}@cluster0.rlpunox.mongodb.net/?retryWrites=true&w=majority`);
}

module.exports = connect;