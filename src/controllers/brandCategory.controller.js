const express = require('express');
const BrCat = require("../models/brandCategory.model");
const router = express.Router();
const Authenticator = require("../midleware/authentication");

router.get("/",async(req,res)=>{
	try{
		const brcat = await BrCat.find().lean().exec();
		res.status(200).send(brcat);
	}catch(err){
		res.status(500).json({
			success: false,
			message: err.message});
	}
	
})

router.delete("/all/delete",Authenticator, async(req,res)=>{
	try{
		const admin = await req.user;
	    if(admin.user.role !== "admin"){
		res.status(404).send({
			message: "You are not allowed to use this page"
		});
	}
		await BrCat.deleteMany().exec();
		res.status(200).send({
			success: true,
			message:"all brandCategory are deleted successfully"
		})
	}catch(err){
		res.status(500).send({ message: err.message})
	}
	
})

module.exports = router;