const express = require("express");
const Product = require("../models/Product");
const {
  protectMiddlware,
  isAdminMiddleware,
} = require("../middleware/authMiddlware");

const router = express.Router();

//  create product route
//  access private and only admin

router.post("/", protectMiddlware, isAdminMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      brand,
      category,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimentions,
      weight,
      sku,
    } = req.body;

    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      countInStock,
      brand,
      category,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimentions,
      weight,
      sku,
      user: req.user._id, // reference for the user creating the prdcut
    });

    const createdProduct = await product.save();
    res.status(201).json({ msg: "Product created ", createdProduct });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error creating the product", error });
  }
});

// update products route

router.put("/:id", protectMiddlware, isAdminMiddleware, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      brand,
      category,
      sizes,
      colors,
      collections,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimentions,
      weight,
      sku,
    } = req.body;

    //    finding product by id
    const product = await Product.findById(req.params.id);
    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.price = price || product.price;
      product.discountPrice = discountPrice || product.discountPrice;
      product.countInStock = countInStock || product.countInStock;
      product.brand = brand || product.brand;
      product.category = category || product.category;
      product.sizes = sizes || product.sizes;
      product.colors = colors || product.colors;
      product.collections = collections || product.collections;
      product.material = material || product.material;
      product.gender = gender || product.gender;
      product.images = images || product.images;
      product.tags = tags || product.tags;
      product.dimentions = dimentions || product.dimentions;
      product.weight = weight || product.weight;
      product.sku = sku || product.sku;
      product.isFeatured =
        isFeatured !== undefined ? isFeatured : product.isFeatured;
      product.isPublished =
        isPublished !== undefined ? isPublished : product.isPublished;

      // save the updated product
      const updatedProduct = await product.save();
      res.status(201).json({ msg: "Product updated !", product });
    } else {
      res.status(500).json({ msg: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ msg: "Server error", error });
  }
});

// delete route
router.delete("/:id", protectMiddlware, isAdminMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      await product.deleteOne();
      res.status(200).json({ msg: "Product deleted" });
    } else {
      res.status(404).json({ msg: "Product not found !!!" });
    }
  } catch (error) {
    res.status(500).json({ msg: "server error", error });
  }
});

// get all the producs with filters
// public get api
router.get("/", async (req, res) => {
  try {
    const {
      collection,
      size,
      gender,
      color,
      minPrice,
      maxPrice,
      sortBy,
      search,
      category,
      material,
      brand,
      limit,
    } = req.query;

    let query = {};

    // query parameters
    if (collection && collection.toLocaleLowerCase() !== "all") {
      query.collections = collection;
    }

    if (category && category.toLocaleLowerCase() !== "all") {
      query.category = category;
    }

    if (material) {
      query.material = { $in: material.split(",") };
    }

    if (brand) {
      query.brand = { $in: brand.split(",") };
    }
    if (size) {
      query.sizes = { $in: size.split(",") };
    }

    if (color) {
      query.colors = { $in: [color] };
    }
    if (gender) {
      query.gender = gender;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    let sort = {};
    // sorting logic
    if (sortBy) {
      switch (sortBy) {
        case "priceAsc":
          sort = { price: 1 };
          break;
        case "priceDesc":
          sort = { price: -1 };
          break;
        case "popularity":
          sort = { rating: -1 };
          break;
        default:
          break;
      }
    }

    // fetch products from the database
    let products = await Product.find(query)
      .sort(sort)
      .limit(Number(limit) || 0);
    res.status(200).json({ msg: "Found all the products", products });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Some error occured" });
  }
});

// note always make sure to make the normal routes first in express elase it will not work if you make a normal route after :id route it will be still treated as :id route
// best seller route
router.get("/bestseller",async (req,res)=>{
  try {
    const bestSeller = await Product.findOne().sort({rating : -1})
    if(bestSeller){
      res.status(200).json({msg : "Best seller found",bestSeller})
    }else{
      res.status(404).json({msg : "No best seller found !!!"})
    }
  } catch (error) {
    console.log(error,"bestseller error")
    res.send(error)
  }
})

// new arrival route
router.get("/new-arrival",async (req,res)=>{
  try {
    const newArrival = await Product.find().sort({createdAt : -1}).limit(8)
    res.status(200).json({msg : "New arrival",newArrival})
  } catch (error) {
    console.log(error,"new arrival error")
    res.status(500).json({msg : "Internal server error",error})
  }
})

// product details page by id
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ msg: "No product found !" });
    } else {
      res.status(200).json({ msg: "Porduct found", product });
    }
  } catch (error) {
    res.status(500).json({ msg: "internal server error" });
  }
});

// similar products route
router.get("/similar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ msg: "No product found!" });
    } else {
      const similarProducts = await Product.find({
        _id: { $ne: id },
        gender: product.gender,
        category: product.category,
      }).limit(4);
      res.status(200).json({ msg: "found similar products", similarProducts });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Internal Server Error" });
  }
});

//  best seller route

module.exports = router;
