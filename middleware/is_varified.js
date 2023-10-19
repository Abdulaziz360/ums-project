const userModel = require("../models/userModel");

const isverified=async(req,res,next)=>{
    try {
       const email=req.body.email;
       const isfind=await userModel.findOne({email:email})
       if(isfind.is_varified==0){

       }
       else{
        res.render('login',{message:'you are varified'})
       } 
       next();
    } catch (error) {
        console.log(`error in middlware:${error}`)
    }
}
module.exports=isverified