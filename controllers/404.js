const errorController = (req, res, next) => {
    const path = req.originalUrl;
    res.status(404).render("404", { pageTitle: "PAGE NOT FOUND", path: path });
}
module.exports = { errorFunctionController: errorController };