const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
    origin:{
        type: String,
        require: true
    },
    destination: {
        type: String,
        require: true
    },
    registeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    sentBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    status: {
        type: String,
        enum: ["sent", "received"]
    },
    weight: {
        type: Number,
        require: true
    }
})

module.exports = mongoose.model("Package", packageSchema);