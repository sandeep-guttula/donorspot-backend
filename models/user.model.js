import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../SECRET.js";

const userSchema = new Schema({
  firebaseUID: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  token: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  age: {
    type: String,
    required: true,
  },
  bloodType: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    required: true,
  },
  activeForDonation: {
    type: Boolean,
    default: false,
  },

  address: {
    city: {
      type: String,
    },
    pincode: {
      type: String,
    },
    coords: {
      lat: {
        type: Number,
      },
      lng: {
        type: Number,
      },
    },
  },

  gender: {
    type: String,
  },
  previousDonations: [
    {
      type: Schema.Types.ObjectId,
      ref: "PreviousDonation",
    },
  ],
  avatar: {
    type: String,
    default: "https://avatar.iran.liara.run/public/boy?username=Ash",
  },
});

userSchema.methods.generateAuthToken = function () {
  const user = this;
  const token = jwt.sign(
    { _id: user._id, email: user.email, fullName: user.fullName },
    JWT_SECRET
  );
  user.token = token;
  return token;
};

export const User = mongoose.model("User", userSchema);
