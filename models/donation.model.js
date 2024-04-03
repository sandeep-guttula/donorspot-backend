import mongoose, { Schema } from "mongoose";

const previousDonationsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  donationDate: {
    type: Date,
    required: true,
  },

  receiverId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

export const PreviousDonation = mongoose.model(
  "PreviousDonation",
  previousDonationsSchema
);

// // for individual donation
// const requestDonationSchema = new Schema({
//   userId: {
//     type: Schema.Types.ObjectId,
//     ref: "User",
//   },
//   receiverId: {
//     type: Schema.Types.ObjectId,
//     ref: "User",
//   },
//   donationDate: {
//     type: Date,
//     required: true,
//   },
// });

// export const RequestDonation = mongoose.model(
//   "RequestDonation",
//   requestDonationSchema
// );

// // request in your area
// const requestForDonorSchema = new Schema({
//   userId: {
//     type: Schema.Types.ObjectId,
//     ref: "User",
//   },
//   receiverId: {
//     type: Schema.Types.ObjectId,
//     ref: "User",
//   },
//   donationDate: {
//     type: Date,
//     required: true,
//   },
// });

// export const RequestForDonor = mongoose.model(
//   "RequestForDonor",
//   requestForDonorSchema
// );

const donationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  donationDate: {
    type: String,
    required: true,
  },
  city: {
    type: String,
  },
  donationType: {
    type: String,
    enum: ["previous-donation", "request-for-donor","request-in-your-area"],
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "completed", "cancelled"],
    default: "pending",
  },
})


// previous-donation = previous-donation,
// request-for-donor = "send individual request to user through maps",
// request-in-your-area= "Request for donor in your area"

export const Donation = mongoose.model("Donation", donationSchema);