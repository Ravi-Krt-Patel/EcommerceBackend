const express = require('express');
const DiliveryPerson = require("../models/diliveryPerson");
const Authenticator = require("../midleware/authentication");
const router = express.Router();

//only admin will create a dilivery person

router.post("/admin/creation",Authenticator,async(req,res)=>{
	try{
		const user = await req.user;
		if(user.user.role !== "admin"){
			res.status(404).send({message:"you are admin, you can not create dilivery person"});
		}else{
			const diliveryPerson = await DiliveryPerson.create(req.body);
			res.status(200).send({diliveryPerson})
		}
	}catch(err){
		res.status(500).send({ message: err.message})
	}
});



module.exports = router;