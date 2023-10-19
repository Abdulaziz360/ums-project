const express=require("express")
const app=express();
const userRoute=require("./routes/userRoute")
const adminRoute=require("./routes/adminRoute")
const mongoose=require('mongoose')
mongoose.connect("mongodb://127.0.0.1/Users").then(()=>{
    console.log("connected to database");
}).catch((err)=>{
    console.log(err.message)
});
// route

app.use('/',userRoute)
// admin--------------
app.use('/admin',adminRoute)
// app.use(express.static())
app.listen(3000,()=>{console.log("server running")})


