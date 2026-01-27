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
    getPackagesReceivedByUser,
    getPackagesSentByUser
} = require("../utils/getPackages");

const calculatePackagePrice = require("../utils/calculatePackagePrice");

// get user's packages
router.get("/", authUser, async (req, res) => {
    if (!req.user) {
        return res.sendStatus(401);
    }

    const packages = await getUserPackages(req.user.id);
    res.status(200).json({packages: packages});
})


/**
 * get packages with extra features for employees
 * URL params:
 * ! Params are exclusive. IF you use one, do not use other params as you will not receive what you want!
 * employee - employee email. when given, request will return all packages registered by this employee
 * sentOnly - could be any non null value. when given, request will return all packages with status "sent"
 * received - could be any non null value. when given, request will return all packages with status "received"
 * no params - if you do not give any params, all packages will be returned.
 */
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

        const packages = await getPackagesRegisteredByEmployee(e._id);
        res.status(200).json({packages: packages});
    } else if (sentButNotReceived) { // packages which are sent but are not received
        const packages = await getPackagesWithStatusSent();
        res.status(200).json({packages: packages});
    } else if (sentAndReceived) { // packages which are received
        const packages = await getPackagesWithStatusReceived();
        res.status(200).json({packages: packages});
    } else { // all packages
        const packages = await getAllPackages();
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

    const packages = await getPackagesReceivedByUser(usr._id);
    res.status(200).json({packages: packages});
})


// get all packages sent by a specific user
router.get("/employeeAccess/userRelated/sent/:usrEmail", authUser, async (req, res) => {
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

    const packages = await getPackagesSentByUser(usr._id);
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

    const pckg = await package.findById(req.params.id);

    if (!pckg) {
        return res.status(400).json({message: "Package not found!"});
    }

    if (pckg.receiveDate) {
        return res.status(400).json({message: "Package has already been received"});
    }

    try {
        pckg.status = "received";
        pckg.receiveDate = Date.now();
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

    if (!req.body.recipient || !req.body.origin || !req.body.destination || !req.body.weight || !req.body.sender || !req.body.courier) {
        return res.status(400).json({message: "Not enough data. Make sure you have filled every field"});
    }

    const weight = parseFloat(req.body.weight);
    if (weight < 0 || weight > 200) {
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
    const courier = await user.findOne({email: req.body.courier});
    if (!courier || courier.role !== "courier") {
        return res.status(400).json({message: "Courier user cannot be found"});
    }

    const price = await calculatePackagePrice(weight, req.body.origin, req.body.destination);
    if (!price) {
        return res.status(500).json({message: "Something went wrong when calculating the price: " + price})
    }

    const newPackage = new package({
        origin: req.body.origin,
        destination: req.body.destination,
        sentBy: sender._id,
        recipient: recipient._id,
        weight: weight,
        registeredBy: req.user.id,
        status: "sent",
        courier: courier._id,
        price: price
    });

    try{
        await newPackage.save();
        res.sendStatus(200);
    } catch (e) {
        res.status(500).json({message: e.message});
    }
})


// delete package
router.delete("/:id", authUser, async (req, res) => {
    if (!req.user) {
        return res.sendStatus(401);
    }

    if (req.user.role !== "office" && req.user.role !== "admin") {
        return res.sendStatus(403);
    }

    try{
        await package.findOneAndDelete({_id: req.params.id});
        res.sendStatus(200);
    } catch (e) {
        res.status(400).json({message: e.message});
    }
})


// get price before creating the package. body should have "weight", "origin" and "destination"
router.post("/getPrice", async (req, res) => {
    if (!req.body.weight || !req.body.origin || !req.body.destination) {
        return res.status(400).json({message: "Not enough data. Make sure to give values for weight, origin and destination"});
    }

    const price = await calculatePackagePrice(req.body.weight, req.body.origin, req.body.destination);
    if (price) {
        res.status(200).json({price: price});
    } else {
        res.status(400).json({message: "something went wrong"});
    }
})


// update package. can only update courier, recipient and weight and only if status is "sent" not "received"
router.patch("/updatePackage/:id", async (req, res) => {
    if (!req.user) {
        return res.sendStatus(401);
    }

    if (req.user.role !== "office" && req.user.role !== "admin") {
        return res.sendStatus(403);
    }

    if (!req.body.recipient && !req.body.weight && !req.body.courier) {
        return res.sendStatus(200);
    }

    const pckg = await package.findById(req.params.id);

    if (!pckg) {
        return res.status(400).json({message: "Package not found!"});
    }

    if (pckg.status === "received") {
        return res.status(400).json({message: "Cannot change a package which has already been received"});
    }

    if (req.body.weight) {
        const newWeight = parseFloat(req.body.weight).toFixed(2);
        if (!newWeight || newWeight < 0 || newWeight > 200) {
            return res.status(400).json({message: "Invalid weight value"});
        }

        pckg.weight = newWeight;
        const newPrice = calculatePackagePrice(pckg.weight, pckg.origin, pckg.destination);
        if (!newPrice) {
            return res.status(400).send("Problem calculating new price");
        }

        pckg.price = newPrice;
    }

    if (req.body.recipient) {
        const newRecipient = await user.findOne({email: req.body.recipient});
        if (!newRecipient) {
            return res.status(400).json({message: "This recipient does not exist"});
        }

        pckg.recipient = newRecipient._id;
    }

    if (req.body.courier) {
        const newCourier = await user.findOne({email: req.body.courier});
        if (!newCourier) {
            return res.status(400).json({message: "This courier does not exist"});
        }

        pckg.courier = newCourier._id;
    }


    try {
        await pckg.save();
        res.status(201).json({package: pckg});
    } catch (e) {
        res.status(500).send(e.message);
    }
})

module.exports = router;