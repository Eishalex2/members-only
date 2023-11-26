const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String },
  username: { type: String, required: true },
  password: { type: String, required: true },
  status: { 
    type: String,
    required: true,
    enum: ["user", "member", "admin"],
    default: "user",
  },
});

UserSchema.virtual("fullname").get(function() {
  let fullname = "";
  if (this.first_name && this.last_name) {
    fullname=`${this.first_name} ${this.last_name}`;
  }

  return fullname;
});

module.exports = mongoose.model("User", UserSchema);