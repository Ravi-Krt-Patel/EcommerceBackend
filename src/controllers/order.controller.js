const express = require('express');
const Order = require("../models/order.model");
const Product = require("../models/product.model");
const Authenticator = require("../midleware/authentication");
//const { populate } = require('../models/order.model');

const router = express.Router();


router.post("/product/orders",Authenticator,async(req,res)=>{
	const user = await req.user;
	try{
		req.body.buyer = user.user._id;
		req.body.orderAmount = Number(req.body.orderAmount);
		// let tempForOrder = [];
		// req.body.orderedItems.forEach(async(item)=>{
		// 	const product = await Product.findOne({
		// 		_id:item.product
		// 	});
		// 	if(parseInt(product.stock) !== 0){

		// 	}
			
		// })
		const order = await Order.create(req.body);
		
		req.body.orderedItems.forEach(async(el)=>{
			const product = await Product.findOne({
				_id:el.product
			});
			//console.log(el)
			let finalStock = parseInt(product.stock)-parseInt(el.quantity);
			await Product.findByIdAndUpdate(el.product,{
				stock:finalStock
				},{new:true})
		})
		res.status(201).send({order});
	}catch(err){
		res.status(500).send({ message: err.message})
	}
});

//user can see all order created by him-----------------------------

router.get("/user/orders",Authenticator,async(req,res)=>{
	const user = await req.user;
	try{
		const order = await Order.find({
			buyer:user.user._id
		})
		.populate("buyerAdress")
		.populate({
			path:"buyer",
			select:["name","email"]
		})
		.populate({
			path:"orderedItems",
			populate:{path:"product"}
		})
		.exec()
		res.status(200).send({order})
	}catch(err){
		res.status(500).send({ message: err.message})
	}
})

//for cancel the order by user -------------------------

router.delete("/user/orders/:id",Authenticator,async(req,res)=>{
	const user = await req.user;
	try{
		//this item which is ordered-------------------
		const orderedItem = await Order.findOne({
			_id:req.params.id
		})
		.populate("buyerAdress")
		.populate({
			path:"buyer",
			select:["name","email"]
		})
		.populate({
			path:"orderedItems",
			populate:{path:"product"}
		})
		.exec();

		//to get the current stock-----------------------
		// console.log(orderedItem.orderedItems[0].product._id);

		orderedItem.orderedItems.forEach(async(el)=>{
			const product = await Product.findOne({
				_id:el.product._id
			});
			let finalStock = parseInt(product.stock) + parseInt(el.quantity);

			await Product.findByIdAndUpdate(el.product._id,{
		    stock:finalStock
		    },{new:true});
		})
		
		// so itemId will be orderedItem.product-----------
		const order = await Order.findByIdAndDelete(req.params.id,{new:true});
		res.status(200).send({order,message:"this order is cancelled"})
	}catch(err){
		res.status(500).send({ message: err.message})
	}
})



// admin rout from here----------------------------------


//to see all order
router.get("/admin/orders/",Authenticator,async(req, res)=>{
	try{
		const admin = await req.user;
	    
	    if(admin.user.role !== "admin"){
		res.status(404).send({message: "you are not admin so you can not access this page"})
	    }else{
			const order = await Order.find().populate("buyerAdress")
			.populate({
				path:"buyer",
				select:["name","email"]
			})
			.populate({
				path:"orderedItems",
				populate:{path:"product"}
			}).lean().exec();
			res.status(200).send({order})
		}
		
	}catch(err){
		res.status(500).send({ message: err.message})
	}
})

//update the status of order----------------------------------

router.patch("/admin/orders/:id",Authenticator,async(req,res)=>{
	try{
		const admin = await req.user;
		if(admin.user.role !== "admin"){
			res.status(404).send({message: "you are not a admin so cannot access this page"});
		}else{
			const order = await Order.findByIdAndUpdate(req.params.id,req.body,{new:true});
			res.status(200).send({order,message:"product is successfully dilivered"});
		}

	}catch(err){
		res.status(500).json({ message: err.message})
	}
})

//delete the order--------------------------------

router.delete("/admin/orders/:id",Authenticator,async(req,res)=>{
	try{
		const admin = await req.user;
		if(admin.user.role !== "admin"){
			res.status(404).send({message: "you are not a admin so cannot access this page"});
		}else{
			const order = await Order.findByIdAndDelete(req.params.id,{new:true});
			res.status(200).send({order,message:"product is successfully deleted"});
		}

	}catch(err){
		res.status(500).json({ message: err.message})
	}
})

router.delete("/admin/orders/All/delete",Authenticator, async(req,res)=>{
	try{
		const admin = await req.user;
		if(admin.user.role !== "admin"){
			res.status(404).send({message: "you are not a admin so cannot access this page"});
		}else{
			const order = await Order.deleteMany().exec();
			res.status(200).send({message:"users are successfully deleted"});
		}

	}catch(err){
		res.status(500).json({ message: err.message})
	}
})


module.exports = router;