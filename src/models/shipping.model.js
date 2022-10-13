const mongoose = require('mongoose');

const shippingSchema = new mongoose.Schema({
	landmark:{
		type:String,
		required:[true,"please add a landmark"]
	},
	pincode:{
		type:String,
		required:[true,"please add a pincode"]
	},
	dist:{
		type:String,
		required:[true,"please add a dist"]
	},
	user:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"User",
		required:true
	},
	location:{
		type:String,
		required:[true,"please add a location"]
	},
	state:{
		type:String,
		required:[true,"please add a state"]
	},
	contact:{
		type:String,
		required:[true,"please add a contect"],
		minLength:10,
		maxLength:10
	}

},{
	timestamps:true,
	versionKey:false
});


module.exports = mongoose.model("shipping",shippingSchema);