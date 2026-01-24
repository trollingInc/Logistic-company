const mongoose = require("mongoose");

const officeSchema = new mongoose.Schema({
    address: {
        type: String,
        required: true,
        unique: true
    }
})

module.exports = mongoose.model("Office", officeSchema);