import express from "express";
import userModel from "./models/user.js";
import postModel from "./models/post.js";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import { json, urlencoded } from "express";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public  ")));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/register", async (req, res) => {
  const { name, email, password, age } = req.body;
  let user = await userModel.findOne({ email });
  if (user) {
    return res.status(500).send("User already exists");
  }
  bcrypt.hash(password, 10, async (err, hash) => {
    if (err) {
      return res.status(500).send("Something went wrong");
    }
    let user = await userModel.create({
      name,
      email,
      password: hash,
      age,
    });
    let token = jwt.sign({ email: email, userId: user._id }, "secret");
    res.cookie("token", token);
    res.redirect("/login");
  });
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await userModel.findOne({ email });
  if (!user) {
    return res.status(500).send("User does not exist");
  }
  bcrypt.compare(password, user.password, (err, result) => {
    if (err) {
      return res.status(500).send("Something went wrong");
    }
    if (result) {
      
      let token = jwt.sign({ email: email, userId: user._id }, "secret");
      res.cookie("token", token);
      res.status(200).send("Login successful");
    } else {
      res.redirect("/login");
    }
  });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

app.get('/profile', isLoggedInn, async (req, res) => {
    console.log(req.user)
    res.render("login")
})

function isLoggedInnmiddleware(req, res, next) {
  const token = req.cookies.token;
  
  if (token === "") res.send("You are not logged in please try again");
  else {
    jwt.verify(token, "secret", (err, decoded) => {
      if (err) {
        res.send("You are not logged in");
      } else {
        req.user = decoded
        next();
      }
    });
    console.log(req.user)
  }
}

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
