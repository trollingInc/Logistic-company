const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
    origin:{
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    registeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["sent", "received"]
    },
    weight: {
        type: Number,
        required: true
    },
    sendDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    receiveDate: {
        type: Date,
        required: false
    }
})

module.exports = mongoose.model("Package", packageSchema);