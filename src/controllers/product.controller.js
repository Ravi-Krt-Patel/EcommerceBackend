const express = require('express');
const Product = require("../models/product.model");
const upload = require("../midleware/file-upload");
const Authenticator = require("../midleware/authentication");
const BrandCategory = require("../models/brandCategory.model");
const Reviews = require("../models/reviews.model");
//const { compareSync } = require('bcryptjs');
const router = express.Router();

//post method for product --------------------------------------------
router.post("/",Authenticator,async(req,res)=>{
	
	try{
		const user = await req.user
		if(user.user.role !=="admin"){
			res.status(404).send({message:"you are not admin"})
		}
		const BC = await BrandCategory.findOne({
			category: req.body.category
		});
		let bb;
		if(!BC){
			bb = await BrandCategory.create({
				category: req.body.category,
				brand:[req.body.brand],
				lowPrice:req.body.newPrice,
				highPrice:req.body.oldPrice
			}) 
		}else{
			const brand = await BrandCategory.findOne({
				$and:[
					{category: req.body.category},
					{brand:{$in:[req.body.brand]}}
				]
			}).exec()
			
			if(!brand){
				let lPrice = BC.lowPrice;
				if(lPrice > req.body.newPrice){
					lPrice = req.body.newPrice;
				}
				let hPrice = BC.highPrice;
				if(hPrice < req.body.oldPrice){
					hPrice = req.body.oldPrice;
				}
				bb = await BrandCategory.findByIdAndUpdate(BC._id,{
					brand:[...BC.brand,req.body.brand],
					lowPrice:lPrice,
					highPrice:hPrice
				},{new:true})
			}else{
				let lPrice = BC.lowPrice;
				if(lPrice > req.body.newPrice){
					lPrice = req.body.newPrice;
				}
				let hPrice = BC.highPrice;
				if(hPrice < req.body.oldPrice){
					hPrice = req.body.oldPrice;
				}
				await BrandCategory.findByIdAndUpdate(BC._id,{
					lowPrice:lPrice,
					highPrice:hPrice
				},{new:true})
			}
		}
		let discount;
		if(req.body.newPrice<req.body.oldPrice){
			discount = Math.round(((req.body.oldPrice-req.body.newPrice)*100)/req.body.oldPrice);
			req.body.discount = discount;
		}else{
			req.body.discount = 0;
		}
		
		const product = await Product.create(req.body);
		return res.status(201).send({product,bb});
	}catch(err){
		res.status(500).send({message: err.message});
	}
});

// get all product ---------------------------------------------------
router.get("/",async(req,res)=>{
	try{
		const product = await Product.find().lean().exec();
		return res.status(201).send({product});
	}catch(err){
		res.send({messge:err.message});
	}
});


//search product------------------------------------------------------
router.get("/search",async(req,res)=>{
	try{
		const data = await BrandCategory.find().lean().exec();
		//get all category
		const category = [];
		data.forEach((e)=>{
			category.push(e.category);
		});
		

		if(!req.query.name){
			req.query.name = "";
		}
		
		const makeCategory = await Product.find(
			{
				$or:[
					{ProductName:{"$regex":req.query.name,"$options":"i"}},
					{brand:{$regex:req.query.name,"$options":"i"}},
					{category:{$regex:req.query.name,"$options":"i"}}
				]
			}
		);
		
		let categoryWithfr ={};
		
		makeCategory.forEach((el)=>{
			;
			if(categoryWithfr[el.category]=categoryWithfr[el.category]){
				categoryWithfr[el.category] += 1;
			}else{
				categoryWithfr[el.category]=1;
			}
		})
		let moreFr = 0;
		let fCategory ="";
		for(const key in categoryWithfr){
			if(categoryWithfr[key] > moreFr){
				moreFr = categoryWithfr[key];
				fCategory = key;
			}
		}
		
		let Qcategory;
		if(!Object.keys(req.query).includes("category")){
			Qcategory = [fCategory];
		}else{
			Qcategory = [req.query.category];
		}
	
		
		// all brand of product--------------------
		let brand = [];
		let temp = await BrandCategory.findOne({
			category: Qcategory
		});
		if(temp){
			brand = temp.brand
		}
		
		

		let QueryBrand = [];
		
		let Q = req.query;
		for(let item in Q){
			if(item[0]=="b"){
				QueryBrand.push(Q[item]);
			}
		}
		if(QueryBrand.length ==0){
			QueryBrand = brand;
		}
		
		
        // low and high price of product
		let lowPrice;
		let highPrice;
		if(temp){
			 lowPrice = temp.lowPrice;
		     highPrice = temp.highPrice;
		}
		
		
		
		
		let Qlowprice = +req.query.lprice || lowPrice;
		let Qhighprice = +req.query.hprice || highPrice;

		//console.log(req.query.name);

		if(!Object.keys(req.query).includes("name")){
			req.query.name = "";
		}

		//rating filtration
	
		let Rating = [0,1,2,3,4,5];
		let R_arr = [];
		let R = req.query;
		for(let item in R){
			if(item[0] =="r"){
				R_arr.push(+R[item]);
			}
		}
		
		if(R_arr.length !==0){
			Rating = R_arr;
		}
		
		

		//discount filtration 
		// let Discount = []
		let lDiscount = 0;
		let hDiscount = 0;
		let Dcheck = false;
		let D_arr = [];
		let D = req.query;
		for(let item in D){
			if(item[0]=="d"){
				Dcheck = true;
				D_arr.push(+D[item])
			}
		}
		if(D_arr.length>0){
			if(D_arr[0]>D_arr[1]){
				lDiscount = D_arr[1];
				hDiscount = D_arr[0];
			}else{
				lDiscount = D_arr[0];
				hDiscount = D_arr[1];
			}
		}else{
			if(!Dcheck){
				lDiscount = 0;
				hDiscount = 100;
			}
		}
		
		
		//for pagination
		let page = +req.query.page || 1;
		let item = +req.query.item || 8;
		let offset = (page - 1) * item;
		

		if(Object.keys(req.query).length>0){
			// const product = await Product.find(
			// 	{
			// 		$or:[
			// 			{ProductName:{"$regex":req.query.name,"$options":"i"}},
			// 			{brand:{$regex:req.query.name,"$options":"i"}},
			// 			{category:{$regex:req.query.name,"$options":"i"}}
			// 		]
			// 	}
			// ).where({category:{$in:[...Qcategory]}}).where({brand:{$in:[...QueryBrand]}})
			// .where("newPrice").gte(Qlowprice).where("newPrice").lte(Qhighprice)
			// .where("rating").gte(Rating)
			// .skip(offset).limit(item)
			// .exec(); 


			const product = await Product.find({
				$and:[
					{$or:[
						{ProductName:{"$regex":req.query.name,"$options":"i"}},
						{brand:{$regex:req.query.name,"$options":"i"}},
						{category:{$regex:req.query.name,"$options":"i"}}
					]},
					{
						category:{$in:[...Qcategory]}
					},
					{
						brand:{$in:[...QueryBrand]}
					},
					{
						newPrice:{$gte:Qlowprice,$lte:Qhighprice}
					},
					{
						// rating:{$gte:lRating,$lte:hRating}
						rating:{$in:[...Rating]}
					},
					{
						discount:{$gte:lDiscount,$lte:hDiscount}
					}
				]
			}).skip(offset).limit(item);




			// const countItem = await Product.find(
			// 	{
			// 		$or:[
			// 			{ProductName:{"$regex":req.query.name,"$options":"i"}},
			// 			{brand:{$regex:req.query.name,"$options":"i"}},
			// 			{category:{$regex:req.query.name,"$options":"i"}}
			// 		]
			// 	}
			// ).where({category:{$in:[...Qcategory]}}).where({brand:{$in:[...QueryBrand]}})
			// .where("newPrice").gte(Qlowprice).where("newPrice").lte(Qhighprice)
			// .where("rating").gte(Rating)
			// .countDocuments();

			const countItem = await Product.find({
				$and:[
					{$or:[
						{ProductName:{"$regex":req.query.name,"$options":"i"}},
						{brand:{$regex:req.query.name,"$options":"i"}},
						{category:{$regex:req.query.name,"$options":"i"}}
					]},
					{
						category:{$in:[...Qcategory]}
					},
					{
						brand:{$in:[...QueryBrand]}
					},
					{
						newPrice:{$gte:Qlowprice,$lte:Qhighprice}
					},
					{
						rating:{$in:[...Rating]}
					},
					{
						discount:{$gte:lDiscount,$lte:hDiscount}
					}
				]
			}).countDocuments();



			const totalPage = Math.ceil(countItem/item);

			return res.status(201).send({
				totalPageCount: totalPage,
				productData: product,
				lowPrice:Qlowprice,
				highPrice:Qhighprice,
				totalBrand:brand
			});

		
		}else{
			try{
				const product = await Product.find().lean().exec();
				return res.status(201).send(product);
			}catch(err){
				res.send(err.message);
			}
		}
		
	}catch(err){
		res.send({message:err.message});
	}
});




// testing search api---------------------------------
router.get("/search/test",async(req,res)=>{
	try{
		const product = await Product.find({
			$and:[
				{newPrice:{$gte:5000,$lte:9000}}
			]
		});
		// const product = await Product.find().where("newPrice").gte(1000).where("newPrice").gte(9000).exec()
		return res.status(201).send(product);
	}catch(err){
		res.status(500).send({message:err.message});
	}
})



//update single product---------------------------------------------------------
router.patch("/:id",Authenticator, async(req,res)=>{
	const user = await req.user
	try{
		let product;
		// if user is admin----------
		if(user.user.role == "admin"){
			const disObj = await Product.findOne({
				_id:req.params.id
			}).exec();
			let discount;
			if(disObj.oldPrice > req.body.newPrice){
				discount = Math.round(((disObj.oldPrice-req.body.newPrice)*100)/disObj.oldPrice);
			}
			req.body.discount = discount;
			product = await Product.findByIdAndUpdate(req.params.id,req.body,{new:true});

			//updating new price and old price------------------------

			const brandCate = await Product.findOne({
				_id: req.params.id
			});

			let lprice = brandCate.newPrice;
			if(lprice > req.body.newPrice){
				lprice = req.body.newPrice;
			}
			let hprice = brandCate.oldPrice;
			if(hprice < req.body.oldPrice){
				hprice = req.body.oldPrice;
			}
			const BC = await BrandCategory.findOne({
				category: brandCate.category
			});
			if(BC){
				await BrandCategory.findByIdAndUpdate(BC._id,{
					lowPrice:lprice,
					highPrice:hprice
				},{new:true})
			}
			return res.status(201).send({product});
			//if user is user----------
		}else if(user.user.role == "user"){

			// let productArray = await Product.findById(req.params.id);
			// let totalRating = 0;
			// let checkUserReview = true;
			// productArray.reviews.forEach((el)=>{
			// 	if(el.email == user.user.email){
			// 		checkUserReview = false;
			// 		el.rating = req.body.rating;
			// 		el.comment = req.body.comment;
			// 	}
			// 	totalRating += el.rating;
			// })
			// if(checkUserReview){
			// 	product = await Product.findByIdAndUpdate(req.params.id,
			// 		{
			// 			reviews:[...productArray.reviews,{
			// 					name:user.user.name,
			// 					email:user.user.email,
			// 					rating:req.body.rating,
			// 					comment:req.body.comment
			// 				}],
			// 			numOfReviews:productArray.reviews.length+1,
			// 			rating:totalRating+req.body.rating
			// 		}	
			// 		,{new:true});
	
			// 		return res.status(201).send(product);
			// }else{
			// 	product = await Product.findByIdAndUpdate(req.params.id,
			// 		{
			// 			reviews:[...productArray.reviews],
			// 			numOfReviews:productArray.reviews.length,
			// 			rating:totalRating
			// 		}
						
			// 		,{new:true});
	
			// 		return res.status(201).send(product);
			// }




		


			const existReview = await Reviews.findOne({
				creater:user.user._id,
				item:req.params.id}).exec();
			//	console.log(existReview);
			let finalnumOfReviews;
			let finalRating;
			if(!existReview){
				const rw = await Reviews.create({
					comment: req.body.comment,
					rating:req.body.rating,
					creater:user.user._id,
					item:req.params.id
					});
				const oldrating = await Product.findOne({
					_id:req.params.id
				}).exec();
				finalnumOfReviews = oldrating.numOfReviews + 1;
				finalRating = (oldrating.rating*oldrating.numOfReviews + parseInt(req.body.rating))/finalnumOfReviews;
			}else{
				const creater = await Reviews.findOne({
					creater:user.user._id,
					item:req.params.id
				});
				await Reviews.findByIdAndUpdate(creater._id,{
					comment:req.body.comment,
					rating:req.body.rating
				},{new:true})
				const oldrating = await Product.findOne({
					_id:req.params.id
				}).exec();
				finalnumOfReviews = oldrating.numOfReviews;
				finalRating = (oldrating.rating*oldrating.numOfReviews-creater.rating + parseInt(req.body.rating))/finalnumOfReviews
				//console.log(creater)
			}
			
			product = await Product.findByIdAndUpdate(req.params.id,
						{
							rating:finalRating,
							numOfReviews:finalnumOfReviews
						}	
						,{new:true});
			const reviews = await Reviews.find({item:req.params.id}).populate({
				path:"creater",
				select:["name", "email"]
			}).exec();

			res.status(200).send({product,reviews});
		
		}
		
	}catch(err){
		res.send({message:err.message});
	}
})

//get single product----------------------------------------------------
router.get("/:id",async(req,res)=>{
	try{
		
		const product = await Product.findOne({_id:req.params.id}).lean().exec();
		if(!product){
			return res.status(500).json({
				success:false,
				message: 'Product not found'
			})
		}
		let searchName = product.ProductName;
		//for similer product
		const Similerproduct = await Product.find(
			{
				$or:[
					{ProductName:{"$regex":searchName.substring(0,5),"$options":"i"}},
					{brand:{$regex:product.brand,"$options":"i"}}
					
				]
			}
		).where("category").equals(product.category)
		.where("newPrice").gte(product.newPrice).exec();
		return res.status(201).send({product,Similerproduct});

	}catch(err){
		res.send(err.message);
	}
});

// delete single product--------------------------------------------------
router.delete("/:id",Authenticator,async(req,res)=>{
	try{
		const user = await req.user;
		if(user.user.role == "admin"){
			const product = await Product.findByIdAndDelete({_id:req.params.id},{new:true});
			return res.status(201).send(product);
		}else{
			return res.status(404).send(
				{message:"you are not allowed to delete a product"});
		}
		//console.log(user.user);
		
	}catch(err){
		res.send(err.message);
	}
});


router.delete("/all/delete",Authenticator,async(req,res)=>{
	try{
		const user = await req.user;
	    if(user.user.role === "user"){
		res.status(404).send({
			message:"you can not delete all product"
		  })
	    }
		const product = await Product.deleteMany();
		return res.status(201).send(product);
	}catch(err){
		res.send(err.message);
	}
})








module.exports = router;