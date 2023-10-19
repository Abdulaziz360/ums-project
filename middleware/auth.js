const services=require('../services/auth')
const jwt=require('jsonwebtoken')
const secret='mynameisabdulaziz'
const userModel=require('../models/userModel')
const getuser=require('../services/auth')
const islogin=async(req,res,next)=>{
    try {
        // +++++session
        if(req.session.user_id){
            // return res.redirect('/home')
        }
        else{
            return res.redirect('/')
        }
        // ++++++++++++++++

        // uuid_____________
        // const u_id=req.cookies.uid;
        // if(!u_id){return res.redirect('/login')}
        // const getuid=services.get_id(u_id)
        // if(!getuid){return res.redirect('/login')}
        // req.getuid=getuid;
        // __________________
        // jwt **************
        // const token=req.cookies?.jwt;
        // const useid=req.headers["authorization"];
        // const token=useid.split("Bearer")[1];
        // console.log(t)
        // if(!useid){
        //     // const verify_token=await jwt.verify(token,secret)
        //     // const user=await userModel.findOne({_id:verify_token._id})
        //     // req.token=token
        //     // req.user=user;
        //     return res.redirect('/login')
        // }
        // const user=getuser.get_id(token)
        // console.log(user)
        // if(!user)
        // {
        //     return res.redirect('/login')
        // }

        // req.token=token
        // req.user=user;
        next()
    } catch (error) {
      console.log(error.message)  
    }
}
const islogout=async(req,res,next)=>{
    try {
        if(req.session.user_id){
            res.redirect('/home')
        }
        // if(req.cookies.uid){
        //     res.redirect('/home')  
        // }
       next()
    } catch (error) {
      console.log(error.message)  
    }
}
module.exports={
    islogin,
    islogout
}