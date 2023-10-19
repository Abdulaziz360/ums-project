const express=require('express')
const session=require('express-session')
const userRoute=express();
const cookParser=require('cookie-parser')
userRoute.use(cookParser())
const config=require('../config/config')
userRoute.use(session({
    resave: false,
    saveUninitialized: true,
    secret:config.sessionsecret,
    cookie: {
        expirs:new Date(Date.now() + 50000), // Set the session cookie's expiration time (1 hour in this case)
        httpOnly: true, // Ensures that the cookie is accessible only via HTTP(S) and not JavaScript
        // secure: true, // Ensures that the cookie is only sent over HTTPS connections
      }
  }));
const path=require("path")
const multer=require("multer");
const hbs=require('hbs')
// middleware
// const static=path.join(__dirname,'../public')
userRoute.use(express.static('public'))
const auth=require('../middleware/auth')
const isauth=require('../middleware/is_varified')
userRoute.use(express.json())
userRoute.use(express.urlencoded({ extended:true }))
userRoute.set("view engine",'hbs')
userRoute.set('views','./views/users')
hbs.registerPartials(path.join(__dirname,'../views/partials'))

 const storage = multer.diskStorage(
    { 
        destination:function(req,file,cb){
       cb(null,path.join(__dirname,"../public/userImages")) 
    }, 
    filename:function(req,file,cb){
        const name=Date.now()+'-'+file.originalname;
        cb(null,name)
    }
})
const upload=multer({storage:storage})
const register_Route=require('../controllers/userController')
userRoute.get('/',register_Route.loadhome)
userRoute.get('/register',auth.islogout,register_Route.loadregister)
userRoute.get('/login',auth.islogout,register_Route.loadlogin)
userRoute.post('/register',upload.single('image'),register_Route.insertuser)
userRoute.get("/verify",register_Route.verifymail)
userRoute.post('/login',auth.islogout,register_Route.loginuser)
userRoute.get('/home',auth.islogin,register_Route.loadhome)
userRoute.get('/secret',auth.islogin,register_Route.loadsecret)
userRoute.get('/logout',auth.islogin,register_Route.userlogout)
userRoute.get('/forget',auth.islogout,register_Route.forgetPass)
userRoute.post('/forget',register_Route.forgetPost)
userRoute.get('/forget-password',auth.islogout,register_Route.forgetPassload)
userRoute.post('/forget-password',register_Route.resetPassword)
userRoute.get('/is_verified',register_Route.is_varified_loader)
userRoute.post('/is_verified',register_Route.is_varified_data)
userRoute.get('/edit',register_Route.edit_profile_loader)
userRoute.post('/edit',upload.single('image'),register_Route.update_profile)
module.exports=userRoute;