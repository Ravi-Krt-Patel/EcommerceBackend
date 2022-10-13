const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
	ProductName:{
		type:String,
		required:[true, "please add a product name"]
	},
	Description:{
		type:String,
		required:[true, "please add a description"]
	},
	brand:{type:String, required:[true, "please add a brand"]},
	oldPrice:{
		type:Number,
		required:[true, "please add a price"]
	},
	newPrice:{
		type:Number,
		required:[true, "please add a price"]
	},
	rating:{
		type:Number,
		default:0
	},
	image:[
		{
			type:String,
			required:[true, "please add image"]
		}
	],
	category:{
		type:String,
		required:[true, "please add a category"]
	},
	stock:{
		type:Number,
		default:1
	},
	numOfReviews:{type:Number, default:0},
	discount:{type:Number, default:0}
	// reviews:[
	// 	{
	// 		name:{type:String, required:true},
	// 		email:{type:String, required:true},
	// 		rating:{type:Number, required:true},
	// 		comment:{type:String, required:true}
	// 	}
	// ]
},{
	timestamps:true,
	versionKey:false
});


module.exports = mongoose.model("Product",ProductSchema);