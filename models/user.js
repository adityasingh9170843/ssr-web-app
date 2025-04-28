import { profile } from "console";
import mongoose from "mongoose";
import { type } from "os";

mongoose.connect("mongodb://127.0.0.1:27017/postDB");

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  password: String,
  email: String,
  age: Number,
  profilepic:{
    type: String,
    default : "default.jpeg"
  },
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
});

const User = mongoose.model("User", userSchema);

export default User;
 