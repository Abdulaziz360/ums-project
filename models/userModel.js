const mongoose=require('mongoose')
const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:[true,'already exist']
    },
    phone:{
          type:String,
          required:true

    },
    Image:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,
        required:true,
        default:0
    },
    is_varified:{
        type:Number,
        required:true,
        default:0
    },
    token:{
        type:String,
        default:''
    }
})
const userModel=new mongoose.model('User',userSchema)
module.exports=userModel;