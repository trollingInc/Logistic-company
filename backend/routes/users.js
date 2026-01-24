const express = require("express");
const router = express.Router();
const user = require("../models/User");

require('dotenv').config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authUser = require("../middleware/authenticateUser");

router.post("/", async (req, res) => {
    const trimmedEmail = req.body.email.trim();
    if (!trimmedEmail || !req.body.password) {
        res.status(400).send("email or password is empty");
        return;
    }

    if (await user.findOne({"email": {"$eq": trimmedEmail}})) {
        res.status(400).send("Email already registered!");
        return;
    }
    try {
        const hPwd = await bcrypt.hash(req.body.password, 10);

        const newUser = new user({
            email: trimmedEmail,
            password: hPwd
        })

        await newUser.save();

        userForToken = {
            email: trimmedEmail,
            role: "user"
        };
        const jwtToken = jwt.sign(userForToken, process.env.JWT_TOKEN_SECRET, {expiresIn: "60m"});

        res.json({token: jwtToken})
        res.sendStatus(200);
    }
    catch {
        res.sendStatus(500);
    }
})

router.post("/login", async (req, res) => {
    const logUser = await user.findOne({"email": {"$eq": req.body.email}})
    if (!logUser) {
        res.status(400).send("user not found");
        return;
    }

    try {
        if (await bcrypt.compare(req.body.password, logUser.password)) {
            userForToken = {
                email: logUser.email,
                role: logUser.role
            };
            const jwtToken = jwt.sign(userForToken, process.env.JWT_TOKEN_SECRET, {expiresIn: "60m"});

            res.json({token: jwtToken})
        } else {
            res.status(400).send("wrong credentials");
        }
    } catch {
        res.sendStatus(500);
    }
})

router.post("/test", authUser, async (req, res) => {
    console.log(req.user);
})

module.exports = router;