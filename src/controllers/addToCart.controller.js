const express = require("express");
const AddToCart = require("../models/addToCart.model");
const Authenticator = require("../midleware/authentication");

const router = express.Router();

//to add item into cart---------------------------------
router.post("/", Authenticator, async (req, res) => {
  try {
    const user = await req.user;
    if (!user) {
      res.status(400).send({ message: "Please login first" });
    }
    const item = await AddToCart.findOne({
      item: req.body.itemId,
    }).exec();
    if (!item) {
      const addtocart = await AddToCart.create({
        buyer: user.user._id,
        item: req.body.itemId,
      });
      res.status(200).send({ addtocart });
    } else {
      const addtocart = await AddToCart.findByIdAndUpdate(
        item._id,
        {
          quantity: Number(item.quantity) + 1,
        },
        { new: true }
      );
      res.status(200).send({ addtocart });
    }
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

//get item from cart-------------------------------------

router.get("/", Authenticator, async (req, res) => {
  try {
    const user = await req.user;

    const addtocart = await AddToCart.find({
      buyer: user.user._id,
    })
      .populate("item")
      .exec();
    res.status(200).send({ addtocart });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

//get single cart with product id and user id-----------------
router.get("/single/:productId", Authenticator, async (req, res) => {
	try {
	  const user = await req.user;
	  const cart = await AddToCart.findOne({
		buyer: user.user._id,
        item: req.params.productId,
	  })
	  if(cart){
		res.status(200).send({cart})
	  }else{
		res.status(300).send({message:"there is no cart itme"});
	  }
	} catch (err) {
	  res.status(500).send({ message: err.message });
	}
  });

//edit the cart item friquency---------------------------------
router.patch("/:id", Authenticator, async (req, res) => {
  try {
    const cart = await AddToCart.findOne({
      _id: req.params.id,
    });
    if (cart.quantity > 1) {
      const addCart = await AddToCart.findByIdAndUpdate(
        req.params.id,
        {
          quantity: Number(cart.quantity) - 1,
        },
        { new: true }
      );
      res.status(200).send({ addCart });
    } else {
      const removCart = await AddToCart.findByIdAndDelete(req.params.id, {
        new: true,
      });
      res.status(201).send({ removCart, message: "no more" });
    }
    //res.status(200).send({cart})
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.get("/all", Authenticator, async (req, res) => {
  const user = await req.user;
  try {
    const addtocart = await AddToCart.find().populate("item").exec();
    res.status(200).send(addtocart);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

//delete item from cart----------------------------------

router.delete("/:id", Authenticator, async (req, res) => {
  try {
    // const user = await req.user;
    // const item = await AddToCart.findOne({
    //   item: req.body.itemId,
    //   buyer: user.user._id,
    // }).exec();
    // if (item) {
        // if (parseInt(item.quantity) > 1) {
        //   const addtocart = await AddToCart.findByIdAndUpdate(
        //     item._id,
        //     {
        //       quantity: parseInt(item.quantity) - 1,
        //     },
        //     { new: true }
        //   );
        //   res.status(200).send(addtocart);
        // } else {
        //   const deleteItem = await AddToCart.findByIdAndDelete(item._id, {
        //     new: true,
        //   });
        //   res.status(200).send({ deleteItem, message: "product is deleted" });
        // }

	  
    // } else {
    //   res.status(404).send({ message: "this is bad request" });
    // }



	const removCart = await AddToCart.findByIdAndDelete(req.params.id, {
        new: true,
      });
      res.status(201).send({ removCart, message: "no more" });

  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

module.exports = router;
