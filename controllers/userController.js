const userModel = require('../models/userModel')
const bcrypt = require("bcrypt")
const { response } = require('express')
const nodemailer = require("nodemailer")
const Randomstring = require('randomstring')
// const uuid=require('uuid')
const sessionid = require('../services/auth')
const { use } = require('../routes/userRoute')
const loadhome = async (req, res) => {
    try {
        res.render('home')
    } catch (error) {
        console.log(error.message)
    }
}
const loadsecret = async (req, res) => {
    try {
        res.render('secret')
    } catch (error) {
        console.log(`Erro in secret:${error}`)
    }
}
const loadregister = async (req, res) => {
    try {
        res.render('register')
    } catch (error) {
        console.log(error.message)
    }
}
const loadlogin = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message)
    }
}
const secure = async (password) => {
    try {
        const secupass = await bcrypt.hash(password, 10)
        console.log(secupass)
        return secupass
    } catch (error) {
        console.log(error.message)
    }

}
// for email verify
const send_verifymail = async (name, email, user_id) => {
    try {
        const trans = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'mughalmg575@gmail.com',
                pass: 'hcxwdcssmpnwnjcf'
            }
        })
        const options = {
            from: 'mughalmg575@gmail.com',
            to: email,
            subject: 'for verification',
            html: '<p>hi, welcom' + name + 'please click here <a href="http://127.0.0.1:3000/verify?id=' + user_id + '">verify</a> your mail'
        }
        trans.sendMail(options, function (error, info) {
            if (error) {
                console.log(error)
            }
            else {
                console.log(`email has send:${info.response}`)
            }
        })
    } catch (error) {
        console.log(error.message)

    }
}
const insertuser = async (req, res) => {
    try {
        const hashpass = await secure(req.body.password)
        const userinsert = new userModel({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            Image: req.file.filename,
            password: hashpass,
            is_verified: 0

        })
        const result = await userinsert.save()
        console.log(result)
        if (result) {
            send_verifymail(req.body.name, req.body.email, result._id)
            res.render('register', { message: "you have been successfully rigistered.please verify your email" })
        }
        else {
            res.render('register', { message: "you rigisteration have been faild" })
        }
    } catch (error) {
        console.log(error.message)
    }
}
const loginuser = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const useremail = await userModel.findOne({ email: email })
        if (useremail) {
            const isMatch = await bcrypt.compare(password, useremail.password)
            if (isMatch) {
                if (useremail.is_varified === 0) {


                    res.render('login', { message: 'plzz varified your email' })
                }
                else {
                    req.session.user_id = useremail._id

                    res.render('home', { message: 'User Profile', userdata: useremail })
                }
            }
            else {
              
                res.render('login',{ message: 'invalid'})
            }
        }
        else {
            res.render('login', { message: 'login faild' })
        }
    } catch (error) {
        res.send(`${error.message}login error`)
        console.log(error.message)
    }
}
const verifymail = async (req, res) => {
    try {
        const updateinfo = await userModel.updateOne({ _id: req.query.id }, { $set: { is_varified: 1 } })
        console.log(updateinfo)
        res.render("email-verified")
    } catch (error) {
        console.log(error.message)
    }
}
// ___________________________________________________________________________
// forget password
const forgetPass = async (req, res) => {
    try {
        res.render('forget')
    } catch (error) {
        console.log(`error in forget pass:${error}`)
    }
}
// verify recover passs
const send_verifyresetpass = async (name, email, token) => {
    try {
        const trans = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'mughalmg575@gmail.com',
                pass: 'hcxwdcssmpnwnjcf'
            }
        })
        const options = {
            from: 'mughalmg575@gmail.com',
            to: email,
            subject: 'for reset password',
            html: '<p>hi, welcom' + name + 'please click here <a href="http://127.0.0.1:3000/forget-password?token=' + token + '">reset</a> your password'
        }
        trans.sendMail(options, function (error, info) {
            if (error) {
                console.log(error)
            }
            else {
                console.log(`email has send:${info.response}`)
            }
        })
    } catch (error) {
        console.log(error.message)

    }
}
// post forget email/pass
const forgetPost = async (req, res) => {
    try {
        const email = req.body.email;
        const userdata = await userModel.findOne({ email: email })
        if (userdata) {
            if (userdata.is_varified == 0) {
                res.render('forget', { message: 'plzz  provide varified user' })
            }
            else {
                const randomstring = Randomstring.generate()
                const updateuser = await userModel.updateOne({ email: email }, { $set: { token: randomstring } })
                send_verifyresetpass(userdata.name, userdata.email, randomstring)
                res.render('forget', { message: 'plzz check your email' })
            }
        }
        else {
            res.render('forget', { message: 'user is not exist in db' })
        }
    } catch (error) {
        console.log(`error in reset :${error}`)
    }
}
// forget load(will render when click on verify reset mail)
const forgetPassload = async (req, res) => {
    try {
        const token = req.query.token;
        const matchToken = await userModel.findOne({ token: token });

        if (matchToken) {

            res.render('forget-password', { user_id: matchToken._id });
        } else {
            res.status(404).send('Token is invalid');
        }
    } catch (error) {
        console.log(`error: ${error}`);
    }
};
// resetpassword
const resetPassword = async (req, res) => {
    try {
        const password = req.body.password;
        const user_id = req.body.user_id;
        console.log(user_id)
        const secure_password = await secure(password)
        const update_pass = await userModel.findByIdAndUpdate({ _id: user_id }, { $set: { password: secure_password, token: '' } })
        res.redirect('/')
    } catch (error) {
        res.status(404).send('can not reset')
    }
}
// logout
const userlogout = async (req, res) => {
    try {
        req.session.user_id = clearImmediate;
        // res.clearCookie('connect.sid');

        //           Redirect the user to another page after clearing the cookie
        res.redirect('/');
    } catch (error) {
        console.log(`logout :${error}`)
    }
}
// is_varified..............
const is_varified_loader = async (req, res) => {
    try {
        res.render('isvarified')
    } catch (error) {
        console.log(`error in varified loader:${error}`)

    }
}
const is_varified_data = async (req, res) => {
    try {
        const email = req.body.email;
        const userMail = await userModel.findOne({ email: email })
        if (!userMail) {
            res.render('isvarified', { message: 'this user is not exist plzz provide registered user' })
        }
        else {
            if (userMail.is_varified == 1) {
                res.render('isvarified', { message: 'this user has already been verified go to login' })
            }
            else {
                send_verifymail(userMail.name, userMail.email, userMail._id)
                res.render('isvarified', { message: 'plzz check your mail box' })
            }
        }
    } catch (error) {
        console.log(`error in inserting email:${error}`)
    }
}
// edit profile
const edit_profile_loader = async (req, res) => {
    try {
        const id = req.query._id;
        const userData = await userModel.findById({ _id: id })
        // console.log(userData.Image)
        if (userData) {
            res.render('edit-Profile', { user: userData })

        }
        else {
            res.redirect('/home')
        }
    } catch (error) {
        console.log(`error in edit loader:${error}`)
    }
}
// updat
const update_profile = async (req, res) => {
    try {
        if (req.file) {
            const update = await userModel.findByIdAndUpdate({ _id: req.body._id }, { $set: { name: req.body.name, email: req.body.email, phone: req.body.phone, Image: req.file.filename }},{ new: true })
            if (update) {
                res.render('home', { message: 'User Profile', userdata: update })
            }

        }
        else {
            const update = await userModel.findByIdAndUpdate({ _id: req.body._id }, { $set: { name: req.body.name, email: req.body.email, phone: req.body.phone } }, { new: true })
            res.render('home', { message: 'User Profile', userdata: update })
        }
    } catch (error) {
        console.log(`error in updsate:${error}`)
    }
}
module.exports = {
    loadhome,
    loadregister,
    loadlogin,
    insertuser,
    loginuser,
    loadsecret,
    verifymail,
    userlogout,
    forgetPass,
    forgetPost,
    forgetPassload,
    resetPassword,
    is_varified_loader,
    is_varified_data,
    edit_profile_loader,
    update_profile,
    send_verifyresetpass
}