const package = require("../models/Package");

// get all packages sent or received by the user;
async function getUserPackages(usrId) {
    const packages = await package.find({$or: [
        { sentBy: usrId },
        { recipient: usrId}
    ]}).populate("sentBy", "email").populate("recipient", "email").populate("registeredBy", "email").lean();

    return transformPackages(packages);
}

async function getPackagesRegisteredByEmployee(employeeId) {
    const packages = await package.find({registeredBy: employeeId})
    .populate("sentBy", "email").populate("recipient", "email").populate("registeredBy", "email").lean();

    return transformPackages(packages);
}

async function getAllPackages() {
    const packages = await package.find({})
    .populate("sentBy", "email").populate("recipient", "email").populate("registeredBy", "email").lean();

    return transformPackages(packages);
}

async function getPackagesWithStatusSent() {
    const packages = await package.find({ status: "sent" })
    .populate("sentBy", "email").populate("recipient", "email").populate("registeredBy", "email").lean();

    return transformPackages(packages);
}

async function getPackagesWithStatusReceived() {
    const packages = await package.find({ status: "received" })
    .populate("sentBy", "email").populate("recipient", "email").populate("registeredBy", "email").lean();

    return transformPackages(packages);
}

async function getPackagesSentByUser(usrId) {
    const packages = await package.find({ sentBy: usrId })
    .populate("sentBy", "email").populate("recipient", "email").populate("registeredBy", "email").lean();

    return transformPackages(packages);
}

async function getPackagesReceivedByUser(usrId) {
    const packages = await package.find({ recipient: usrId })
    .populate("sentBy", "email").populate("recipient", "email").populate("registeredBy", "email").lean();

    return transformPackages(packages);
}

function transformPackages(packages) {
    return packages.map(p => ({
        id: p._id,
        status: p.status,
        sendDate: p.sendDate,
        sentBy: p.sentBy?.email || "Deleted user",
        recipient: p.recipient?.email || "Deleted user",
        registeredBy: p.registeredBy?.email || "Deleted user",
        receiveDate: p.receiveDate || "to be received",
        origin: p.origin,
        destination: p.destination,
        weight: p.weight
    }));
}

module.exports = {
    getUserPackages: getUserPackages,
    getPackagesRegisteredByEmployee: getPackagesRegisteredByEmployee,
    getAllPackages: getAllPackages,
    getPackagesWithStatusSent: getPackagesWithStatusSent,
    getPackagesWithStatusReceived: getPackagesWithStatusReceived,
    getPackagesSentByUser: getPackagesSentByUser,
    getPackagesReceivedByUser: getPackagesReceivedByUser
};