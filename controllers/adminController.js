
const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const Randomstring = require('randomstring')
const nodemailer = require('nodemailer')
// ___________________
// send verify mail
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
            html: '<p>hi, welcom' + name + 'please click here <a href="http://127.0.0.1:3000/admin/forget-password?token=' + token + '">reset</a> your password'
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
// ___________________
// admin loader
const admin_login_loader = async (req, res) => {
    try {
        res.render('login')
    } catch (error) {
        console.log(`error in admin loader:${error}`)
    }
}
// admin data
const admin_Login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await userModel.findOne({ email: email })
        if (userData) {
            const isMatch = await bcrypt.compare(password, userData.password)
            if (isMatch) {
                if (userData.is_admin == 1) {
                    req.session.user_id = userData._id
                    res.redirect('/admin/home')
                }
                else {
                    res.render('login', { message: 'invalid info' })
                }
            }
            else {
                res.render('login', { message: 'invalid data' })
            }
        }
        else {
            res.render('login', { message: 'invalid data' })
        }
    } catch (error) {
        console.log(`error in admin login:${error}`)
    }
}
// load dashboard
const load_home = async (req, res) => {
    try {
        const _id = req.session.user_id
        const adminData = await userModel.findOne({ _id: _id })
        if (adminData) {
            res.render('home', { message: 'Admin Profile', admin: adminData })
        }
        else {
            res.send('not found')
        }
    } catch (error) {
        console.log(`error in admin dashboard:${error}`)
    }
}
// admin logout
const logout_loader = async (req, res) => {
    try {
        req.session.destroy()
        res.redirect('/admin')
    } catch (error) {
        console.log(`error in logout loader:${error}`)
    }
}
// forget password_loader
const forgot_password = async (req, res) => {
    try {
        res.render('Email_send')
    } catch (error) {
        console.log(`Error in forgot:${error}`)
    }
}
// send mail
const send_verify_mail = async (req, res) => {
    try {
        const email = req.body.email;
        const userData = await userModel.findOne({ email: email })
        if (userData) {
            if (userData.is_admin == 0) {
                res.render('Email_send', { message: 'email incorrect' })
            }
            else {
                const randomstring = Randomstring.generate();
                const updateToken = await userModel.updateOne({ email: email }, { $set: { token: randomstring } })
                if (updateToken) {
                    send_verifyresetpass(userData.name, userData.email, randomstring)
                    res.render('Email_send', { message: 'plzz check your mail' })
                }
                else {
                    res.render('Email_send', { message: 'Email incorrect' })
                }
            }
        }
        else {
            console.log('email invalid')
        }
    } catch (error) {
        console.log(`error in mail send:${error}`)
    }
}
// reset admin
const verifyResetPass = async (req, res) => {
    try {
        const token = req.query.token;
        const userData = await userModel.findOne({ token: token })
        if (userData) {
            res.render('resetPass', { user: userData._id })

        }
        else (
            console.log('error load')
        )

    } catch (error) {
        console.log(`error in reset loader:${error}`)
    }
}
const secure = async (password) => {
    try {
        const secupass = await bcrypt.hash(password, 10)
        // console.log(secupass)
        return secupass
    } catch (error) {
        console.log(error.message)
    }

}
// setnew password
const setPass = async (req, res) => {
    try {
        const password = req.body.password
        const secupass = await secure(password)
        // console.log(secupass)
        // const token=req.query.token;
        const _id = req.body.user;
        const setData = await userModel.findByIdAndUpdate({ _id: _id }, { $set: { password: secupass, token: '' } }, { new: true })
        console.log(`setData:${setData}`)
        if (setData) {
            res.redirect('/admin/login')
        }
        else {
            res.status(404).send('not found')
        }
    } catch (error) {
        console.log(`Error in :${error}`)
    }
}
// dashboard_loader
const dashboard_loader = async (req, res) => {
    try {
        var search = '';
        if (req.query.search) {
            search = req.query.search
        }
        var page=0 
        if (req.query.page) {
            page = req.query.page
        }
        const limit = 2;
        const users = await userModel.find({
            is_admin: 0,
            $or: [
                { name: { $regex: '.*' + search + '.*', $options: 'i' } },
                { email: { $regex: '.*' + search + '.*', $options: 'i' } },
                { phone: { $regex: '.*' + search + '.*', $options: 'i' } },

            ]
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

        const count = await userModel.find({
            is_admin: 0,
         
        }).countDocuments();
        // console.log(`data:${count}`)
        const totalpages = Math.ceil(count / limit);
        const pages = [];
        for (let i = 1; i <= totalpages; i++) {
            pages.push(i);
        }
        var  Nextpage=parseInt(page)+1
        if(Nextpage>totalpages){
            Nextpage=null;
        }
        res.render('dashboard', {
            message: 'Users List', list: users,
            totalpages:Math.ceil(count / limit),
            currentpage:page,
            pages: pages,
            prev:page-1,
            Nextpage
        })
    } catch (error) {
        console.log(`error in dashboard:${error}`)
    }
}
// new user loader
const New_User_loader = async (req, res) => {
    try {
        res.render('new-user')
    } catch (error) {
        res.status(404).send(error)
    }
}
// _______________
// verification mail
const addusermail = async (name, email, password, user_id) => {
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
            subject: 'Admin add you and verify your mail',
            html: '<p>hi, welcom' + name + 'please click here <a href="http://127.0.0.1:3000/verify?id=' + user_id + '">verify</a> your mail <br><b>Email </b>' + email + '<br> <b>Password:</b>' + password + ''
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
// __________________
const newUser = async (req, res) => {
    try {
        const password = Randomstring.generate(8)
        const secpass = await secure(password)
        const user = new userModel({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            Image: req.file.filename,
            password: secpass,
        })
        const add = await user.save();
        if (add) {
            addusermail(add.name, add.email, password, add._id)
            res.redirect('/admin/dashboard')
        }
        else {
            res.render('new-user', { message: 'something went wrong' })
        }
    } catch (error) {
        res.status(404).send(error)
    }
}
// admin edit user
const edit_by_admin = async (req, res) => {
    try {
        const _id = req.query._id;
        console.log(`uiiiii:${_id}`)
        const userData = await userModel.findById({ _id: _id })
        if (userData) {
            res.render('edit', { user: userData })
        }
        else {
            res.redirect('/admin/dashboard')
        }
    } catch (error) {
        console.log(`Error in edit loader:${error}`)
    }
}
const edit_user = async (req, res) => {
    try {
        const _id = req.body.id;

        const update = await userModel.findByIdAndUpdate({ _id: req.body.id }, { $set: { name: req.body.name, email: req.body.email, phone: req.body.phone, is_varified: req.body.varification } }, { new: true })
        console.log(`update:${update}`)
        if (update) {
            res.redirect('/admin/dashboard')
        }
        else {
            res.render('edit', { message: 'invalid data' })
        }
    } catch (error) {
        console.log(`error in updating:${error}`)
    }
}
// delete user by admin
const delete_user = async (req, res) => {
    try {
        const _id = req.query.id;
        const del_user = await userModel.findByIdAndDelete({ _id: _id })
        console.log(`del:${del_user}`)
        if (del_user) {
            res.redirect('/admin/dashboard')
        }
        else { }
    } catch (error) {
        console.log(`error in delete:${error}`)
    }
}
module.exports = {
    admin_login_loader,
    admin_Login,
    load_home,
    logout_loader,
    forgot_password,
    send_verify_mail,
    verifyResetPass,
    setPass,
    dashboard_loader,
    New_User_loader,
    newUser,
    edit_by_admin,
    edit_user,
    delete_user
}