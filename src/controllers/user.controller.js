const express = require('express');
const {body, validationResult} = require("express-validator");
const jwt = require("jsonwebtoken");
const Authenticator = require("../midleware/authentication");
const sendEmail = require("../midleware/sentEmail");
const crypto = require("crypto");
const Reviews = require("../models/reviews.model");
const Order = require("../models/order.model");
const cloudinary = require("../midleware/cloudinary");

require("dotenv").config();
const User = require("../models/user.model");

const router = express.Router();

const Token = (user)=>{
	return jwt.sign({user},process.env.SALT);
}

// user restration here------------------------------------------------

router.post("/register",
body("name").notEmpty().isLength({min:3}).withMessage("name sould be more than 3 cahrector"),
body("name").isLength({max:15}).withMessage("name should not more than 15 charector"),
body("email").isEmail().withMessage("please provide vailid email"),
body("password").isLength({min:8}).withMessage("password should be atleast 8 characters"),
 async (req, res) => {

	try{


		const error = validationResult(req);
	let finalError = null;
	if(!error.isEmpty()) {
		finalError = error.array().map(error =>{
			return {
				param: error.param,
				msg:error.msg
			}
		});
		return res.status(400).json({errors: finalError});
	}
	let user = await User.findOne({email:req.body.email});
		if(user){
			return res.status(400).json({message:"please check your email address, your email is already exist"})
		}else{
			req.body.role = 'user';
			user = await User.create(req.body);
			let token = Token(user);

			// res.cookie("jwt", token,{
			// 	expires: new Date(Date.now() + 24*60*60*1000),
			// 	httpOnly: true
			// })


			if (typeof localStorage === "undefined" || localStorage === null) {
				var LocalStorage = require('node-localstorage').LocalStorage;
				localStorage = new LocalStorage('./scratch');
			  }
			  
			  localStorage.setItem('jwt', token);
			  


			return res.status(201).send({user:user});

		}
		
	}catch(err){
		return res.send({message:err.message})
	}
});


 
// login user---------------------------------------------------
router.post("/login", async (req,res)=>{

	
	try{
		let user = await User.findOne({email:req.body.email});
		//to check user exist or not
		if(!user) return res.status(400).send({message:"please check email or password"});
		// to check password is matched or not
		let match = user.checkPassword(req.body.password);
		
		if(!match) return res.status(400).send({message:"please check your email or password"});
		//creating jwt token
		let token = Token(user);

		// res.cookie("jwt", token,{
		// 	expires: new Date(Date.now() + 1*24*60*60*1000),
		// 	httpOnly: true
		// })





		if (typeof localStorage === "undefined" || localStorage === null) {
			var LocalStorage = require('node-localstorage').LocalStorage;
			localStorage = new LocalStorage('./scratch');
		  }
		  
		  localStorage.setItem('jwt',token);
		  
	




		return res.status(200).send({token:token,user:user})
	}catch(err){
		return res.status(500).send({message:err.message});
	}
})

// logout the user----------------------------------------------

router.get("/logout",async(req,res)=>{
	// res.cookie("jwt",null,{
	// 	expires: new Date(Date.now()),
	// 	httpOnly: true
	// });
	try{


		if (typeof localStorage === "undefined" || localStorage === null) {
			var LocalStorage = require('node-localstorage').LocalStorage;
			localStorage = new LocalStorage('./scratch');
		  }
		  
		  localStorage.clear('jwt');


		res.status(200).json({
			success: true,
			massege:"logged out"
		})
	}catch(err){
		res.status(500).send(err.message);
	}
});

//forget password -----------------------------------------------
router.post("/forget",async(req,res)=>{
	const user = await User.findOne({email:req.body.email});
	if(!user){
		res.status(404).send({
			message: "email is not vailid please provide your correct email"
		});
	}

	const resetToken = user.getResetPasswordToken();
	//console.log(resetToken);
	await user.save({validateBeforeSave:false});

	const resetPasswordURL = `https://tranquil-scrubland-16626.herokuapp.com/user/forget/${resetToken}`;

	const message = `your password reset token is :- \n\n ${resetPasswordURL} \n\n If you have not requested this email, please ignore it`;
	try{

		await sendEmail({
			email:user.email,
			subject:`Ecommerce password recovery`,
			message,
		})
		res.status(200).json({
			success: true,
			message:`Email sent to ${user.email} successfully`
		})
	}catch(err){
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;
		await user.save({validateBeforeSave:false});
		return res.status(500).send({ message:err.message})
	}
})

// Reset Password------------------------------------------------

router.patch("/forget/:token", async (req, res) => {
	try{
		const resetPasswordToken = crypto
		.createHash("sha256")
		.update(req.params.token)
		.digest("hex");
	
		const user = await User.findOne({
			resetPasswordToken,
			resetPasswordExpire:{$gt:Date.now()},
		});
	
		if(!user){
			res.status(400).json({message:"Reset Password token is invalid or has expired"});
		}
	
		if(req.body.password !== req.body.confirmPassword){
			res.status(400).json({message:"Password does not match"})
		}
	
	
		user.password = req.body.password;
		user.resetPasswordToken = undefined;
		user.resetPasswordExpire = undefined;
		await user.save();
		res.status(200).json({success:true, message:"password updated successfully"})
	}catch(err){
		res.status(500).send(err.message);
	}
	
})

// get all user this is only for admin --------------------------------------------------

router.get("/",Authenticator,async(req,res)=>{
	const admin = await req.user;
	if(admin.user.role !== "admin"){
		res.status(404).send({
			message: "You are not allowed to use this page"
		});
	}
	try{
		const user = await User.find().lean().exec();
		return res.status(200).send({allUser:user});
	}catch(err){
		return res.status(500).send(err.message)
	}
})

// delete your account by yourself or admin can delete account-------

router.delete("/:id",Authenticator,async(req,res)=>{
	try{
		const user = await User.findByIdAndDelete(req.params.id,{new:true});
		return res.status(200).send(user);
	}catch(err){
		return res.status(500).send(err.message)
	}
});



// router.delete("/all/delete",async(req,res)=>{
// 	try{
// 		await User.deleteMany().exec();
// 		return res.status(200).json({success:true,message:`Successfully deleted all user`})
// 	}catch(err){
// 		res.status(500).send({
// 			success: true,
// 			message: err.message
// 		})
// 	}
// })

module.exports = router;
