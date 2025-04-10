import mongoose from "mongoose";

mongoose.connect("mongodb://127.0.0.1:27017/postDB");

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  password: String,
  email: String,
  age: Number,
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
});

const User = mongoose.model("User", userSchema);

export default User;
