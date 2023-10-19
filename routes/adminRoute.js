const express=require('express')
const admin_route=express();
const path=require('path')
const hbs=require('hbs')
const config=require('../config/config')
const session=require('express-session')
const adminController=require('../controllers/adminController')
admin_route.use(session({
    resave: false,
    saveUninitialized: true,
    secret:config.sessionsecret, 
}))
const multer=require('multer')
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/userimages'))
    },
    filename:function(req,file,cb){
       const name=Date.now()+'-'+file.originalname;
       cb(null,name) 
    }
})
const upload=multer({storage:storage})
admin_route.use(express.json())
admin_route.use(express.urlencoded({extended:false}))
// admin_route.use(express.static('public'))
// Define the 'gt' helper
function gt(a, b) {
    return a > b ;
  }
  
  // Register the 'gt' helper in your template engine
  // For Handlebars:
 // In your server or application code
// const handlebars = require('handlebars');

hbs.registerHelper('for', function (context, start, end, options) {
    let ret = '';
    for (let i = start; i <= end; i++) {
      ret = ret + options.fn(i);
    }
    return ret;
  });
  


  // For Mustache:
  hbs.registerHelper('gt', gt);
  
admin_route.set('view engine','hbs')
admin_route.set('views','./views/Admin')
// middleware.....
const adminAuth=require('../middleware/adminAuth')
admin_route.get('/',adminAuth.islogout,adminController.admin_login_loader)
admin_route.post('/',adminController.admin_Login)
admin_route.get('/home',adminAuth.islogin,adminController.load_home)
admin_route.get('/logout',adminAuth.islogin,adminController.logout_loader)
admin_route.get('/forgot',adminAuth.islogout,adminController.forgot_password)
admin_route.post('/forgot',adminController.send_verify_mail)
admin_route.get('/forget-password',adminController.verifyResetPass)
admin_route.post('/forget-password',adminController.setPass)
admin_route.get('/dashboard',adminAuth.islogin,adminController.dashboard_loader)
admin_route.get('/new_User',adminAuth.islogin,adminController.New_User_loader)
admin_route.post('/new_User',upload.single('image'),adminController.newUser)
admin_route.get('/edit',adminAuth.islogin,adminController.edit_by_admin)
admin_route.post('/edit',adminController.edit_user)
admin_route.get('/edit',adminAuth.islogin,adminController.edit_by_admin)
admin_route.get('/delete',adminController.delete_user)
admin_route.get('*',async(req,res)=>{
    try {
        res.redirect('/admin')
    } catch (error) {
       console.log(`eror in route:${error}`) 
    }
})
module.exports=admin_route