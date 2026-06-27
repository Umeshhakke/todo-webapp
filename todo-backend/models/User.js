const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
    username:{
        type:String,
        required:[true , "please Provide valid username"],
        unique:true,
        trim:true
    },
    email:{
        type:String,
        required:[true , "Please provide email"],
        unique:true,
        match:[/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email']
    },
    password:{
        type:String,
        required:[true, "please provide a password"],
        minlength:6,
        select:false
    },
},{timestamps:true});


UserSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return ;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password , salt);
    // next();
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};


module.exports = mongoose.model('User', UserSchema);