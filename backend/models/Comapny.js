const mongoose = require("mongoose");

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    pricePerKg: {
        type: Number,
        required: true,
        min: 0.01
    },
    priceToOffice: {
        type: Number,
        required: true,
        min: 0.01
    },
    priceToAddress: {
        type: Number,
        required: true,
        min: 0.01
    },
    priceFromAddress: {
        type: Number,
        required: true,
        min: 0.01
    }
})

module.exports = mongoose.model("Company", companySchema);