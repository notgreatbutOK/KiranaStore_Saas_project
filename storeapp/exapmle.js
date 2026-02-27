// =======================
// IMPORTS
// =======================
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

// =======================
// APP CONFIG
// =======================
const app = express();
app.use(express.json());
app.use(cors());

const PORT = 5000;
const JWT_SECRET = "SECRET123";

// =======================
// DATABASE CONNECT
// =======================
mongoose.connect("mongodb://127.0.0.1:27017/kirana_saas")
.then(()=>console.log("MongoDB Connected"))
.catch(err=>console.log(err));


// =======================
// MODELS (Admin + Product)
// =======================
const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String
});

const Admin = mongoose.model("Admin", adminSchema);

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref:"Admin"
  }
});

const Product = mongoose.model("Product", productSchema);


// =======================
// AUTH MIDDLEWARE
// =======================
const authMiddleware = (req,res,next)=>{
  const token = req.headers.authorization;

  if(!token) return res.status(401).json({msg:"No token provided"});

  try{
    const decoded = jwt.verify(token,JWT_SECRET);
    req.user = decoded.id;
    next();
  }catch{
    res.status(401).json({msg:"Invalid token"});
  }
};


// =======================
// AUTH ROUTES
// =======================

// REGISTER STORE OWNER
app.post("/api/auth/register", async(req,res)=>{
  try{
    const {name,email,password} = req.body;

    const exist = await Admin.findOne({email});
    if(exist) return res.status(400).json({msg:"User exists"});

    const hash = await bcrypt.hash(password,10);

    const admin = await Admin.create({
      name,
      email,
      password:hash
    });

    res.json(admin);
  }catch(err){
    res.status(500).json(err);
  }
});


// LOGIN STORE OWNER
app.post("/api/auth/login", async(req,res)=>{
  try{
    const {email,password} = req.body;

    const admin = await Admin.findOne({email});
    if(!admin) return res.status(400).json({msg:"No user"});

    const match = await bcrypt.compare(password,admin.password);
    if(!match) return res.status(400).json({msg:"Wrong password"});

    const token = jwt.sign({id:admin._id},JWT_SECRET);

    res.json({token});
  }catch(err){
    res.status(500).json(err);
  }
});


// =======================
// PRODUCT ROUTES
// =======================

// ADD PRODUCT (Only logged-in owner)
app.post("/api/products", authMiddleware, async(req,res)=>{
  try{
    const product = await Product.create({
      name:req.body.name,
      price:req.body.price,
      owner:req.user
    });

    res.json(product);
  }catch(err){
    res.status(500).json(err);
  }
});


// GET ONLY MY PRODUCTS (Multi-tenant SaaS logic)
app.get("/api/products", authMiddleware, async(req,res)=>{
  try{
    const products = await Product.find({owner:req.user});
    res.json(products);
  }catch(err){
    res.status(500).json(err);
  }
});


// =======================
// START SERVER
// =======================
app.listen(PORT,()=>{
  console.log("🚀 Kirana SaaS Server Running on port "+PORT);
});

