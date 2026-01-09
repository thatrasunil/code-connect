module.exports = function (app) {
    app.use(function (req, res, next) {
        // Relax COOP policy to allow Google Sign-In popup to communicate with the app
        res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
        res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
        next();
    });
};
