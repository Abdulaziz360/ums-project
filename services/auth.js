const jwt=require('jsonwebtoken')
const secret='mynameisabdulaziz'
const getuser=require('../services/auth')
const sessionid=new Map();
const set_id=async(id,user)=>{
    try {
        await sessionid.set(id,user)
        // const payload={
        //    _id:user._id,
        //    email:user.email

        // }
    //    const token=jwt.sign(payload,secret)
    // //    console.log(token)
    //    return token
    } catch (error) {
     console.log(`set error:${error}`)   
    }
}
const get_id=async(id)=>{
    try {
        // if(!token)return null;
        // const isverify=jwt.verify(token,secret)
        // console.log(isverify)
        // return isverify;
        await sessionid.get(id)
    } catch (error) {
     console.log(`get error:${error}`)   
    }
}
module.exports={
    set_id,
    get_id
}