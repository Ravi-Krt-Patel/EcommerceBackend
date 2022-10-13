const mongoose = require('mongoose');

const addtoCartSchema = new mongoose.Schema({
	quantity: {
		type:Number,
		default:1
	},
	buyer:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"User",
		required:true
	},
	item:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"Product",
		required:true
	}
},{
	timestamps:true,
	versionKey:false
});

module.exports = mongoose.model("addtocart",addtoCartSchema);