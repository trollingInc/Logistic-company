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
        return res.status(400).send("user not found");
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

router.patch("/changeRole", authUser, async (req, res) => {
    if (!req.user) {
        return res.sendStatus(401);
    } else if (req.user.role != "admin") {
        return res.sendStatus(403);
    } else if (!req.body.role || !["user", "office", "transporter"].includes(req.body.role)) {
        return res.status(400).json({message: "Role does not exist. Available roles are 'user', 'office' and 'transporter'"});
    }

    const changeUser = await user.findOne({"email": {"$eq": req.body.email}});
    if (!changeUser) {
        return res.status(400).json({message: "User not found"});
    }

    try {
        changeUser.role = req.body.role;
        await changeUser.save();
        res.sendStatus(200);
    } catch (e) {
        res.status(400).json({message: e.message});
    }
    
})

module.exports = router;