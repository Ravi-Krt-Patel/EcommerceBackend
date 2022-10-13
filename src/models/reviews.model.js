const mongoose = require('mongoose');


const reviewsSchema = new mongoose.Schema({
	comment:{
		type:String,
		required:[true,"please add a comment"]
	},
	creater:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"User",
		required:true
	},
	item:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"Product",
		required:true
	},
	rating:{
		type:Number,
		required:true
	}
},{
	timestamps:true,
	versionKey:false
});

module.exports = mongoose.model("Reviews",reviewsSchema);