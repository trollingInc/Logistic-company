const express = require("express");
const router = express.Router();
const user = require("../models/User");
const package = require("../models/Package");

require('dotenv').config();
const authUser = require("../middleware/authenticateUser");
const {
    getUserPackages, 
    getPackagesRegisteredByEmployee,
    getPackagesWithStatusSent,
    getPackagesWithStatusReceived,
    getAllPackages,
    getPackagesReceivedByUser
} = require("../utils/getPackages");

// get user's packages
router.get("/", authUser, async (req, res) => {
    if (!req.user) {
        return res.sendStatus(401);
    }

    const packages = await getUserPackages(req.user.id);
    res.status(200).json({packages: packages});
})

// get packages with employee privileges
router.get("/employeeAccess", authUser, async (req, res) => {
    const employee = req.query.employee;
    const sentButNotReceived = req.query.sentOnly;
    const sentAndReceived = req.query.received;

    if (!req.user) {
        return res.sendStatus(401);
    }

    if (req.user.role === "user") {
        res.sendStatus(403);
    } else if (employee) { // registered by employee
        const e = await user.findOne({email: employee});
        if (!e) {
            return res.status(400).json({message: "Employee not found"});
        }

        const packages = await getPackagesRegisteredByEmployee(employee._id);
        res.status(200).json({packages: packages});
    } else if (sentButNotReceived) { // packages which are sent but are not received
        const packages = getPackagesWithStatusSent();
        res.status(200).json({packages: packages});
    } else if (sentAndReceived) { // packages which are received
        const packages = getPackagesWithStatusReceived();
        res.status(200).json({packages: packages});
    } else { // all packages
        const packages = getAllPackages();
        res.status(200).json({packages: packages});
    }
});

// get all packages received by a specific user
router.get("/employeeAccess/userRelated/received/:usrEmail", authUser, async (req, res) => {
    if (!req.user) {
        return res.sendStatus(401);
    }

    if (req.user.role === "user" && req.user.email != req.params.usrEmail) {
        return res.sendStatus(403);
    }

    const usr = await user.findOne({email: req.params.usrEmail});
    if (!usr) {
        return res.status(400).json({message: "User email not found"});
    }

    const packages = getPackagesReceivedByUser(usr._id);
    res.status(200).json({packages: packages});
})

// get all packages received by a specific user
router.get("/employeeAccess/userRelated/received/:usrEmail", authUser, async (req, res) => {
    if (!req.user) {
        return res.sendStatus(401);
    }

    if (req.user.role === "user" && req.user.email != req.params.usrEmail) {
        return res.sendStatus(403);
    }

    const usr = await user.findOne({email: req.params.usrEmail});
    if (!usr) {
        return res.status(400).json({message: "User email not found"});
    }

    const packages = getPackagesReceivedByUser(usr._id);
    res.status(200).json({packages: packages});
})

// change package status
router.patch("/changeStatus/:id", authUser, async (req, res) => {
    if (!req.user) {
        return res.sendStatus(401);
    }

    if (req.user.role === "user") {
        return res.sendStatus(403);
    }

    if (req.body.status != "sent" && req.body.status != "received") {
        return res.status(400).json({message: "Invalid status"});
    }

    const pckg = await package.findById(req.params.id);

    if (!pckg) {
        return res.status(400).json({message: "Package not found!"});
    }

    try {
        pckg.status = req.body.status;
        if (req.body.status === "sent") {
            pckg.receiveDate = null;
        } else {
            pckg.receiveDate = Date.now();
        }
        await pckg.save();
        res.sendStatus(200);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
})

// create package
router.post("/", authUser, async (req, res) => {
    if (!req.user) {
        return res.sendStatus(401);
    }

    if (req.user.role !== "office" && req.user.role !== "admin") {
        return res.sendStatus(403);
    }

    if (!req.body.recipient || !req.body.origin || !req.body.destination || !req.body.weight || !req.body.sender) {
        return res.status(400).json({message: "Not enough data. Make sure you have filled every field"});
    }

    if (req.body.weight < 0 || req.body.weight > 200) {
        return res.status(400).json({message: "Weight must be between 0 and 200"});
    }

    const sender = await user.findOne({email: req.body.sender});
    if (!sender) {
        return res.status(400).json({message: "Sender user cannot be found"});
    }
    const recipient = await user.findOne({email: req.body.recipient});
    if (!recipient) {
        return res.status(400).json({message: "Recipient user cannot be found"});
    }

    const newPackage = new package({
        origin: req.body.origin,
        destination: req.body.destination,
        sentBy: sender._id,
        recipient: recipient._id,
        weight: req.body.weight,
        registeredBy: req.user.id,
        status: "sent"
    })

    try{
        await newPackage.save();
        res.sendStatus(200);
    } catch (e) {
        res.status(500).json({message: e.message})
    }
})

router.patch("/changeDestination/:id", authUser, async (req, res) => {
    if (!req.user) {
        return res.sendStatus(401);
    }

    if (req.user.role !== "office" && req.user.role !== "admin") {
        return res.sendStatus(403);
    }

    const newDestination = req.body.destination?.trim();
    if (!newDestination) {
        return res.status(400).json({message: "Destination cannot be empty"})
    }

    const pckg = await package.findById(req.params.id);

    if (!pckg) {
        return res.status(400).json({message: "Package not found!"});
    }


    if (pckg.status === "received") {
        return res.status(400).json({message: "Cannot change destination on a package which has already been received"});
    }

    try {
        pckg.destination = newDestination;
        await pckg.save();
        res.sendStatus(200);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
})

module.exports = router;