import UserModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const signup = async (req, res, next) => {
  try {
    const newUser = await UserModel.create({
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      name: req.body.name,
      lastName: req.body.lastName,
    });

    const token = signToken(newUser._id);

    newUser.password = undefined;
    res.status(201).json({
      status: "success",
      token,
      user: newUser,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message.split(":")[2]?.slice(1),
    });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email jest niepoprawny",
      });
    }

    const user = await UserModel.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: "fail",
        message: "Błędne dane logowania",
      });
    }

    const token = signToken(user._id);
    res.status(200).json({
      status: "success",
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
      },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

export const authGuard = async (req, res, next) => {
  try {
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "Token authoryzacyjny nie został podany lub jest niepoprawny",
      });
    }

    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await UserModel.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "tokenInvalid",
      });
    }

    req.user = currentUser;
    console.log(`req by: ${req.user.name}`);
    next();
  } catch (err) {
    res.status(401).json({
      status: "fail",
      message: "Token authoryzacyjny nie został podany lub jest niepoprawny",
    });
  }
};

export const getUserProfile = async (req, res) => {
  res.status(200).json({
    status: "success",
    user: req.user,
  });
};
