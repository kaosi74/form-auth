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
  .then(() => {
    console.log("DB connected successfully");
  });
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



app.post("/signUp", async (req, res) => {
  let fName = req.body["fName"];
  let lName = req.body["lName"];
  let email = req.body["email"];
  let psw = req.body["psw"];
  fName = fName.trim();
  lName = lName.trim();
  email = email.trim();
  psw = psw.trim();
  console.log(fName);
  console.log(lName);
  console.log(email);
  console.log(psw);

  if (fName == "" || lName == "" || email == "" || psw == "") {
    res.json({
      status: "FAILED",
      message: "Empty input field!",
    });
  } else if (!/^[a-zA-Z]*$/.test(fName)) {
    res.json({
      status: "FAILED",
      message: "Invalid name entered",
    });
  } else if (!/^[a-zA-Z]*$/.test(lName)) {
    res.json({
      status: "FAILED",
      message: "Invalid name entered",
    });
  } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    res.json({
      status: "FAILED",
      message: "Invalid type of email entered",
    });
  } else if (psw.length < 8) {
    res.json({
      status: "FAILED",
      message: "password is too short",
    });
  } else {
    // check if uer exist already
    User.find({ email })
      .then((result) => {
        if (result.length) {
          res.json({
            status: "FAILED",
            message: "User with the provided email already exists",
          });
        } else {
          const saltRounds = 10;
          bycryptjs
            .hash(psw, saltRounds)
            .then((hashedPassword) => {
              const newUser = new User({
                fName,
                lName,
                email,
                psw: hashedPassword,
              });
              var user = new User(req.body);
              newUser
                .save()
                .then((result) => {
                  res.json({
                    status: "SUCCESS",
                    message: "SignUp successful",
                    data: result,
                  });
                })
                .catch((err) => {
                  res.json({
                    status: "FAILED",
                    message: "An error occurred while saving user account",
                  });
                });
            })
            .catch((err) => {
              res.json({
                status: "FAILED",
                message: "An error occurred while hashing password!",
              });
            });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "FAILED",
          message: "An error occurred while checking existing user",
        });
      });
  }
});

// app.post("/signUp", async (req, res, next) => {
//   var user = new User(req.body)
//   user.save().then((result) => { console.log(result); })
//   next()
//   res.send("Signed up successfully!")
// })

app.post("/login", (req, res) => {
  let { email, psw } = req.body;
  if (email == "" || psw == "") {
    res.json({
      status: "FAILED",
      message: "Empty credentials given",
    });
  } else {
    User.find({ email })
      .then((data) => {
        if (data) {
          // console.log("User found:", result);
          // res.json({ data: result });
          const hashedPassword = data[0].psw;
          bycryptjs
            .compare(psw, hashedPassword)
            .then((result) => {
              if (result) {
                res.json({
                  status: "SUCCESS",
                  message: "Sign in successful",
                  success: result,
                });
              } else {
                res.json({
                  status: "FAILED",
                  message: "Invalid password entered",
                });
              }
            })
            .catch((err) => {
              res.json({
                status: "FAILED",
                message: "An error occurred while comparing password",
              });
            });
        } else {
          // res.status(404).json({
          //   error: "User not found",
          res.json({
            status: "FAILED",
            message: "Invalid credentials entered",
          });
        }
      })
      .catch((err) => res.status(500).json({ data: err }));
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
