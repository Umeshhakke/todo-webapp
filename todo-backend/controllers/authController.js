const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id)=>{
    return jwt.sign({id} , process.env.JWT_SECRET,{
        expiresIn: '30d',
    });
};

//@desc Register a new user
//@route POST /api/auth/register
//@access Public
const registerUser = async (req , res) =>{
    console.log(req.body);
    try{
        const {username , email , password }= req.body;

        const userExists = await User.findOne({$or: [{email} , {username}]});
        if(userExists){
            return res.status(400).json({message: "User already Exists"});
        }

        const user = await User.create({username , email , password});
        res.status(201).json({
            _id:user._id,
            username: user.username,
            email:user.email,
            token:generateToken(user._id),
        });
    }catch(error){
        res.status(500).json({message: error.message});
    }
};


//@desc Login user
//@route POST /api/auth/login
//@access Public

const loginUser = async (req, res)=>{
    try{
        const {email , password} = req.body;

        const user = await User.findOne({email}).select('+password');

        if(!user){
            return res.status(401).json({message: "Invalid email or Password"});
        }

        const isPasswordMatch = await user.comparePassword(password);
        if(!isPasswordMatch){
            return res.status(401).json({message:'Invalid email or Password'});
        }
        res.status(200).json({
            _id:user._id,
            username:user.username,
            email:user.email,
            token:generateToken(user._id),
        });
    }catch(error){
        res.status(500).json({message: error.message});
    }
};

module.exports = {registerUser , loginUser};