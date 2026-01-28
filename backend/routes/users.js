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
        return res.status(400).send("email or password is empty");
    }

    if (await user.findOne({"email": {"$eq": trimmedEmail}})) {
        return res.status(400).send("Email already registered!");
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
            id: newUser._id,
            role: "user"
        };
        const jwtToken = jwt.sign(userForToken, process.env.JWT_TOKEN_SECRET, {expiresIn: "60m"});

        res.status(200).json({token: jwtToken});
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
                id: logUser._id,
                role: logUser.role
            };
            const jwtToken = jwt.sign(userForToken, process.env.JWT_TOKEN_SECRET, {expiresIn: "60m"});

            res.json({token: jwtToken})
        } else {
            res.status(400).json({message: "wrong credentials"});
        }
    } catch (e) {
        res.status(500).json({message: e.message});
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
    } else if (!req.body.role || !["user", "office", "courier"].includes(req.body.role)) {
        return res.status(400).json({message: "Role does not exist. Available roles are 'user', 'office' and 'courier'"});
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

router.patch("/changePassword", async (req, res) => {
    if (!req.user) {
        return res.sendStatus(401);
    } 

    if (!req.body.newPass || !req.body.oldPass || !req.body.email) {
        return res.status(400).json({message: "Missing data"});
    }

    const usr = await user.findOne({email: req.body.email});
    if (!usr) {
        return res.status(400).json({message: "You don't exist."});
    }

    try {
        if (await bcrypt.compare(req.body.oldPass, usr.password)) {
            const hPwd = await bcrypt.hash(req.body.newPass, 10);

            usr.password = hPwd;
            await usr.save();
            
            userForToken = {
                email: usr.email,
                id: usr._id,
                role: usr.role
            };
            const jwtToken = jwt.sign(userForToken, process.env.JWT_TOKEN_SECRET, {expiresIn: "60m"});

            res.json({token: jwtToken})
        } else {
            res.status(400).json({message: "old password does not match"});
        }
    } catch (e) {
        res.status(500).json({message: e.message});
    }
})

router.delete("/", authUser, async (req, res) => {
    if (!req.user) {
        return res.sendStatus(401);
    } 

    if (req.user.role === "office" || req.user.role === "courier") {
        return res.status(400).json({message: "Ask the admin to delete your account"});
    }

    if (req.user.role === "admin") {
        if (!req.query.email) {
            return res.status(400).json({message: "No email given"});
        }

        try {
            await user.deleteOne({email: req.query.email});
            res.sendStatus(200);
        } catch (e) {
            res.status(500).json({message: e.message});
        }
    } else {
        try {
            await user.deleteOne({_id: req.user.id});
            res.sendStatus(200);
        } catch (e) {
            res.status(500).json({message: e.message});
        }
    }
})


// get all employees
router.get("/employees", authUser, async (req, res) => {
    if (!req.user) {
        return res.sendStatus(401);
    }

    if (req.user.role === "user") {
        return res.sendStatus(403);
    }

    const employees = await user.find({$or: [
        {role: "office"},
        {role: "courier"}
    ]});

    if (employees.length == 0) {
        return res.status(400).json({message: "No employees found"});
    }

    res.status(200).json({employees: employees});
})


// get all customers
router.get("/customers", authUser, async (req, res) => {
    if (!req.user) {
        return res.sendStatus(401);
    }

    if (req.user.role === "user") {
        return res.sendStatus(403);
    }

    const customers = await user.find({role: "user"});

    if (customers.length == 0) {
        return res.status(400).json({message: "No customers found"});
    }

    res.status(200).json({customers: customers});
})

module.exports = router;