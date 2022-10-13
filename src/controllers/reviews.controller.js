const express = require('express');
const Reviews = require("../models/reviews.model");
const router = express.Router();
const Authenticator = require("../midleware/authentication");
// getting all reviews---------------------------------------------------
router.get("/",Authenticator, async(req,res)=>{
	try{
		const user = await req.user
		if(user.user.role !=="admin"){
			res.status(404).send({message:"you are not admin"})
		}
		const review = await Reviews.find().lean().exec();
		res.status(200).send(review);
	}catch(err){
		res.status(500).send(err.message);
	}
});

//delete all reviews ----------------------------------------------
router.delete("/all/delete",Authenticator ,async(req,res)=>{
	try{
		const user = await req.user
		if(user.user.role !=="admin"){
			res.status(404).send({message:"you are not admin"})
		}
		await Reviews.deleteMany().exec();
		res.status(200).send({
			success: true,
			message: "all Reviews deleted successfully"
		})
	}catch(err){
		res.status(500).send({message: err.message});
	}
	
})

module.exports = router;