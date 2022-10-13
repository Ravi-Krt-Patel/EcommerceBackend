const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
	buyerAdress:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"shipping",
		required:true
	},
	orderedItems:[
		{
			product:{
				type:mongoose.Schema.Types.ObjectId,
				ref:"Product",
				required:true
			},
			quantity:{
				type:Number,
				required:true
			}
		}
	],
	buyer:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"User",
		required:true
	},
	diliveryStatus:{
		type:String,
		default:"procesing"
	},
	paymentMethod:{
		type:String,
		required:true
	},
	paymentStatus:{
		type:String,
		required:true
	},
	orderAmount:{
		type:Number,
		required:true
	}
},{
	timestamps:true,
	versionKey:false
});

module.exports = mongoose.model("order",orderSchema);