import mongoose from "mongoose";

const dogSchema = new mongoose.Schema({
  name: String,
  breed: String,
  age: Number,
});

const Dog = mongoose.model("Dog", dogSchema);

export default Dog;
