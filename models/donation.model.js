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
});

export const PreviousDonation = mongoose.model(
  "PreviousDonation",
  previousDonationsSchema
);
