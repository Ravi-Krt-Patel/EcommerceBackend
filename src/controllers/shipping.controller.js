const express = require('express');
const Shipping = require("../models/shipping.model");
const Authenticator = require("../midleware/authentication");
const router = express.Router();


// user can post their own address
router.post("/user/address",Authenticator, async (req, res) => {
	try{
		const user = await req.user;
		req.body.user = user.user._id;
		const shippingAddress = await Shipping.create(req.body);
		res.status(201).send({shippingAddress})
	}catch(err){
		res.status(500).json({message: err.message});
	}
});
// user will get all addresses with this rout
router.get("/user/address/me",Authenticator, async (req, res) => {
	try{
		const user = await req.user;
		const shippingAddress = await Shipping.find(
			{
				user:user.user._id
			}
		)
		res.status(201).send({shippingAddress})
	}catch(err){
		res.status(500).json({message: err.message});
	}
});

//user can update shipping addresses
router.patch("/user/address/me/:id",Authenticator, async (req, res) => {
	try{
		const user = await req.user;
		if(user.user.role !== "user"){
			res.status(404).send({message:"your role is not user"})
		}else{
			const sippingAddress = await Shipping.findByIdAndUpdate(req.params.id,req.body,{new:true});
			res.status(201).send({sippingAddress});
		}
		
	}catch(err){
		res.status(500).json({message: err.message});
	}
})

// user can delete thier address with thi rout
router.delete("/user/address/me/:id",Authenticator, async (req, res) => {
	try{
		const user = await req.user;
		const shippingAddress = await Shipping.findByIdAndDelete(req.params.id);
		res.status(201).send({shippingAddress,message:"address is deleted successfully"})
	}catch(err){
		res.status(500).json({message: err.message});
	}
});


router.delete("/user/address/all/delete",Authenticator, async (req, res) => {
	try{
		const user = await req.user;
		const shippingAddress = await Shipping.deleteMany(
			{user:user.user._id}
		).exec()
		res.status(201).send({shippingAddress})
	}catch(err){
		res.status(500).json({message: err.message});
	}
})


// get all adress by admin
router.get("/user/address/all",Authenticator, async (req, res) => {
	try{
		const user = await req.user;
	//	console.log(user)
		const shippingAddress = await Shipping.find(
			{user:user.user._id}
		).populate(
			{
				path:"user",
				select:["name","email"]
			}
		);
		res.status(201).send({shippingAddress});
	}catch(err){
		res.status(500).json({message: err.message});
	}
})


module.exports = router;