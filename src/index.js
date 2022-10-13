const express = require('express');
const connection = require("./configs/db");
const cors = require("cors");
const cookieParser = require("cookie-parser");

//all controllers
const ProductController = require("./controllers/product.controller");
const userController = require("./controllers/user.controller");
const reviewController = require("./controllers/reviews.controller")
const brandCategory = require("./controllers/brandCategory.controller")
const AddToCartController = require("./controllers/addToCart.controller")
const orderController = require("./controllers/order.controller");
const shippingController = require("./controllers/shipping.controller");
const diliveryController = require("./controllers/diliveryPerson.model");

//all midleware
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors());



require("dotenv").config();
const port = process.env.PORT || 4235;


//all apis
app.use("/product",ProductController);
app.use("/user",userController);
app.use("/reviews",reviewController);
app.use("/brandCategory",brandCategory);
app.use("/addToCart",AddToCartController);
app.use("/orderProduct",orderController);
app.use("/shipping",shippingController);
app.use("/diliverPerson",diliveryController);



app.listen(port, async()=>{
	await connection();
	console.log('listening on port');
})


