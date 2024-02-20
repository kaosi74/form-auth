import express from "express";
import bodyParser from "body-parser";
import { dirname } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import bycryptjs from "bcryptjs";

import { User } from "./models/User.js";

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(()=>{console.log("DB connected successfully");})
  // .then((err) => console.log(err));

// Create a global connection object
const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});

app.get("/signUp", (req, res) => {
  res.sendFile(__dirname + "/public/signUp.html");
});

// POST Methods

app.post("/login", (req, res) => {
  User.findOne({ email: req.query.email })
  .then((result)=> console.log(result))
    .catch((err) => res.status(400).json({ err }))
  res.send("Found user")
});


app.post("/signUp", async (req, res, next) => {
  var user = new User(req.body)
  user.save().then((result) => { console.log(result); })
  next()
  res.send("Signed up successfully!")
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
