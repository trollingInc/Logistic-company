const express = require("express");
const router = express.Router();
const company = require("../models/Company");
const office = require("../models/Office");

const authUser = require("../middleware/authenticateUser");

// create office
router.post("/", authUser, async (req, res) => {
    if (!req.user) {
        return res.sendStatus(401);
    }
    if (req.user.role !== "admin") {
        return res.sendStatus(403);
    }

    if (!req.body.address) {
        return res.status(400).json({message: "Address is missing"});
    }

    const officeExists = await office.findOne({address: req.body.address});
    if (officeExists) {
        return res.status(400).json({message: "There is an office on this address already"});
    }

    try {
        const newOffice = new office({
            address: req.body.address
        });

        await newOffice.save();
        res.sendStatus(200);
    } catch (e) {
        res.status(500).send(e.message);
    }
})


// delete office
router.delete("/:address", authUser, async (req, res) => {
    if (!req.user) {
        return res.sendStatus(401);
    }
    if (req.user.role !== "admin") {
        return res.sendStatus(403);
    }

    try {
        await office.findOneAndDelete({address: req.params.address});
        res.sendStatus(200);
    } catch (e) {
        res.status(500).send(e.message);
    }
})


// get all offices
router.get("/", async (req, res) => {
    try {
        const offices = await office.find({});
        res.status(200).json({offices: offices});
    } catch (e) {
        res.status(500).send(e.message);
    }
})

module.exports = router;