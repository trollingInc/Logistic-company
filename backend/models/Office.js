const mongoose = require("mongoose");

const officeSchema = new mongoose.Schema({
    address: {
        type: String,
        require: true,
        unique: true
    }
})

module.exports = mongoose.model("Office", officeSchema);