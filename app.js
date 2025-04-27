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


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix)
  }
})

const upload = multer({ storage: storage })









app.get("/", (req, res) => {
  res.render("index");
});

app.post("/register", async (req, res) => {
  const { name, email, password, age } = req.body;
  let user = await userModel.findOne({
    email,
  });
  if (user) {
    return res.status(500).send("User already exists");
  }
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, async (err, hash) => {
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
      res.redirect("/profile");
    } else {
      res.redirect("/login");
    }
  });
});

app.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/login");
});

app.get("/profile", isLoggedInn, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email }).populate("posts");
  console.log(user);
  res.render("profile", { user });
});

app.get("/like/:id", isLoggedInn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");
  
  if(post.likes.indexOf(req.user.userId) === -1){
    post.likes.push(req.user.userId);
  }
  else{
    post.likes.splice(post.likes.indexOf(req.user.userId), 1);
  }
  await post.save();
  res.redirect("/profile");
  
});

app.get("/edit/:id", isLoggedInn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id }).populate("user");
  res.render("edit", { post });
})

app.post("/update/:id", isLoggedInn, async (req, res) => {
  let post = await postModel.findOne({ _id: req.params.id });
  post.content = req.body.content;
  await post.save();
  res.redirect("/profile");

})

app.get("/test", (req, res) => {
  res.render("test");
})

app.post("/upload",(req, res) => {
  console.log(req.body);
})

app.post("/post", isLoggedInn, async (req, res) => {
  let { content } = req.body;
  let user = await userModel.findOne({ email: req.user.email });
  let post = await postModel.create({
    user: user._id,
    content: content,
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

function isLoggedInn(req, res, next) {
  const token = req.cookies.token;

  if (token === "") res.redirect("/login");
  else {
    jwt.verify(token, "secret", (err, decoded) => {
      if (err) {
        res.redirect("/login");
      } else {
        req.user = decoded;
        next();
      }
    });
    console.log(req.user);
  }
}

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
