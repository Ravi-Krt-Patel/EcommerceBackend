const mongoose = require('mongoose');

const brandCategorySchema = new mongoose.Schema({
	category:{
		type:String,
		required:true
	},
	brand:[
		{
			type:String,
			required:true
		}
	],
	lowPrice:{
		type:Number,
		required:true
	},
	highPrice:{
		type:Number,
		required:true
	}
},{
	timestamps:true,
	versionKey:false
});

module.exports = mongoose.model("brandCategory",brandCategorySchema);