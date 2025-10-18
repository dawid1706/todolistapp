import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "emailRequired"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "emailInvalid"],
  },
  password: {
    type: String,
    required: [true, "passRequired"],
    minlength: [8, "passMinLength"],
    select: false,
  },
  confirmPassword: {
    type: String,
    required: [true, "confirmPassRequired"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "passNotEqual",
    },
  },
  name: {
    type: String,
    required: [true, "nameRequired"],
    default: "user",
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);

  this.confirmPassword = undefined;
  this.role = "user";
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
