const express = require("express");
const app = express();
require('dotenv').config();
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGODB_URL);
const db = mongoose.connection;
db.on("error", (e) => console.error(e))
db.once("open", () => console.log("Connected to db"));

app.use(express.json());
app.use(express.json({limit: '50mb'}));

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "*");
    next();
});

const usersRouter = require("./routes/users");
app.use("/api/users", usersRouter);

const packagesRouter = require("./routes/packages");
app.use("/api/packages", packagesRouter);

app.listen(5000);