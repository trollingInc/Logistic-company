require('dotenv').config();
const jwt = require('jsonwebtoken');

function checkJwt(req, res, next) {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
        next();
        return;
    }

    jwt.verify(token, process.env.JWT_TOKEN_SECRET, (err, user) => {
        if (!err) {
            req.user = user;
        }

        next();
    })
}

module.exports = checkJwt;