import { ApiError } from "../utils/ApiError.js";
import {
  GraphQLObjectType,
  GraphQLID,
  GraphQLString,
  GraphQLSchema,
  GraphQLList,
  GraphQLNonNull,
  GraphQLEnumType,
  GraphQLBoolean,
} from "graphql";
import { Donation } from "../models/donation.model.js"


const DonationType = new GraphQLObjectType({
  name: "Donation",
  fields: () => ({
    id: { type: GraphQLID },
    userId: { type: GraphQLID },
    receiverId: { type: GraphQLID },
    donationDate: { type: GraphQLString },
    donationType: { type: GraphQLString },
    city: { type: GraphQLString },
  }),
});

const DonationQuery = new GraphQLObjectType({
  name: "DonationQuery",
  fields: {
    donations: {
      type: new GraphQLList(DonationType),
      resolve(parent, args) {
        return Donation.find();
      },
    },
    donation: {
      type: DonationType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return Donation.findById(args.id);
      },
    },
  },
});

const DonationMutation = new GraphQLObjectType({
  name: "DonationMutation",
  fields: {
    addDonation: {
      type: DonationType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) },
        receiverId: { type: new GraphQLNonNull(GraphQLID) },
        donationDate: { type: new GraphQLNonNull(GraphQLString) },
        donationType: { type: new GraphQLNonNull(GraphQLString) },
        city: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {

        if([
            args.donationType,
            args.receiverId,
            args.donationDate,
            args.userId,
            args.city
        ].some((field) => field.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }

        const donation = new Donation({
          userId: args.userId,
          receiverId: args.receiverId,
          donationDate: args.donationDate,
          donationType: args.donationType,
          city: args.city,
        });
        return donation.save();
      },
    },
    updateDonation: {
      type: DonationType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        userId: { type: new GraphQLNonNull(GraphQLID) },
        receiverId: { type: new GraphQLNonNull(GraphQLID) },
        donationDate: { type: new GraphQLNonNull(GraphQLString) },
        donationType: { type: new GraphQLNonNull(GraphQLString) },
        city: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        return Donation.findByIdAndUpdate(
          args.id,
          {
            userId: args.userId,
            receiverId: args.receiverId,
            donationDate: args.donationDate,
            donationType: args.donationType,
          },
          { new: true }
        );
      },
    },
    deleteDonation: {
      type: DonationType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(parent, args) {
        return Donation.findByIdAndDelete(args.id);
      },
    },
  },
});



export default new GraphQLSchema({
  query: DonationQuery,
  mutation: DonationMutation,
});