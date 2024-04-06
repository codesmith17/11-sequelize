const errorController = (req, res, next) => {
    const path = req.originalUrl;
    res.status(404).render("404", {
        pageTitle: "PAGE NOT FOUND",
        path: path,
        isAuthenticated: req.session.isLoggedin
    });
}
module.exports = { errorFunctionController: errorController };