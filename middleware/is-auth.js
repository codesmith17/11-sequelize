const isAuth = ((req, res, next) => {
    if (req.session.isLoggedin) {
        return res.redirect("/auth/login");
    }
    next();
})
module.exports = { isAuth };