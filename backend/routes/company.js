const express = require("express");
const router = express.Router();
const user = require("../models/User");
const package = require("../models/Package");
const company = require("../models/Company");

require('dotenv').config();
const authUser = require("../middleware/authenticateUser");
const companyName = "Speedier";

// Create a company. Only use this once. In a real world app this would not be here as it does not make sense to save comapany data in a db like this.
router.post("/", authUser, async (req, res) => {
    if (!req.user) {
        return res.sendStatus(401);
    }

    if (req.user.role !== "admin") {
        return res.sendStatus(403);
    }

    if (!req.body.priceFromAddress || !req.body.priceToAddress || !req.body.priceToOffice || !req.body.pricePerKg) {
        return res.status(400).json({message: "Not enough data given." + req.body});
    }

    const doesItExist = await company.findOne({name: companyName});
    if (doesItExist) {
        return res.status(400).json({message: "You already have created a company"});
    }

    const priceFromAddress = parseFloat(req.body.priceFromAddress);
    const priceToAddress = parseFloat(req.body.priceToAddress);
    const pricePerKg = parseFloat(req.body.pricePerKg);
    const priceToOffice = parseFloat(req.body.priceToOffice);

    try {
        const newC = new company({
            priceFromAddress: priceFromAddress,
            priceToAddress: priceToAddress,
            pricePerKg: pricePerKg,
            priceToOffice: priceToOffice,
            name: companyName
        });

        await newC.save();
        res.sendStatus(200);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
})


// change pricing
router.patch("/", authUser, async (req, res) => {
    if (!req.user) {
        return res.sendStatus(401);
    }

    if (req.user.role !== "admin") {
        return res.sendStatus(403);
    }

    const c = await company.findOne({name: companyName});
    if (!c) {
        res.sendStatus(500);
    }

    if (req.body.priceFromAddress) {
        const priceFromAddress = parseFloat(req.body.priceFromAddress).toFixed(2);
        if (priceFromAddress <= 0) {
            return res.status(400).json({message: "Cannot set price to 0 or less"});
        }

        c.priceFromAddress = priceFromAddress
    }

    if (req.body.priceToAddress) {
        const priceToAddress = parseFloat(req.body.priceToAddress).toFixed(2);
        if (priceToAddress <= 0) {
            return res.status(400).json({message: "Cannot set price to 0 or less"});
        }

        c.priceToAddress = priceToAddress
    }

    if (req.body.pricePerKg) {
        const pricePerKg = parseFloat(req.body.pricePerKg).toFixed(2);
        if (pricePerKg <= 0) {
            return res.status(400).json({message: "Cannot set price to 0 or less"});
        }

        c.pricePerKg = pricePerKg
    }

    if (req.body.priceToOffice) {
        const priceToOffice = parseFloat(req.body.priceToOffice).toFixed(2);
        if (priceToOffice <= 0) {
            return res.status(400).json({message: "Cannot set price to 0 or less"});
        }

        c.priceToOffice = priceToOffice
    }

    try {
        await c.save();
        res.sendStatus(200);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
})

module.exports = router;