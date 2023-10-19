const islogin = async (req, res, next) => {
    try {
        if (req.session.user_id) { }
        else {
            res.redirect('/admin')
            return null
        }
        next();
    } catch (error) {
        console.log(`error in islogin:${error}`)
    }
}
const islogout = async (req, res, next) => {
    try {
        if (req.session.user_id) {
            res.redirect('/admin/home')
            return null
        }
        next()
    } catch (error) {
        console.log(`error in logout:${error}`)
    }
}
module.exports = {
    islogin,
    islogout
}