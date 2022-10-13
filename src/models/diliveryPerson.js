const mongoose = require('mongoose');
const bcrypt = require("bcryptjs");
const diliverySchema = new mongoose.Schema({
	name:{
		type:String,
		required:true,
	},
	email:{
		type:String,
		required:true,
	},
	contact:{
		type:String,
		required:true
	},
	location:{
		type:String,
		required:true
	},
	dist:{
		type:String,
		required:true
	},
	state:{
		type:String,
		required:true
	},
	pincode:{
		type:String,
		required:true
	},
	role:{
		type:String,
		default:"diliveryPerson"
	},
	password:{
		type:String,
		required:true
	}
},{
	timestamps:true,
	versionKey:false
});

diliverySchema.pre("save", function(next){
	if(!this.isModified("password")){
		return next();
	}
	const hash = bcrypt.hashSync(this.password,8);
	this.password = hash
	
	return next();
});


module.exports = mongoose.model("diliveryPerson",diliverySchema);