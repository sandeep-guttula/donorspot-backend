import { PreviousDonation, Donation } from "../models/donation.model.js";
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
import { User } from "../models/user.model.js";

const addressType = new GraphQLObjectType({
  name: "Address",
  fields: () => ({
    city: { type: GraphQLString },
    pincode: { type: GraphQLString },
  }),
});

const coordsType = new GraphQLObjectType({
  name: "Coords",
  fields: () => ({
    lat: { type: GraphQLString },
    lng: { type: GraphQLString },
  }),
});

const previousDonationsType = new GraphQLObjectType({
  name: "PreviousDonation",
  fields: () => ({
    id: { type: GraphQLID },
    userId: { type: GraphQLID },
    receiverId: { type: GraphQLID },
    donationDate: { type: GraphQLString },
  }),
});

const UserType = new GraphQLObjectType({
  name: "User",
  fields: () => ({
    id: { type: GraphQLID },
    firebaseUID: { type: GraphQLString },
    fullName: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    age: { type: GraphQLString },
    bloodType: { type: GraphQLString },
    activeForDonation: { type: GraphQLBoolean },
    address: { type: addressType },
    gender: { type: GraphQLString },
    token: { type: GraphQLString },
    coords: { type: coordsType },
    previousDonations: {
      type: new GraphQLList(previousDonationsType),
      resolve(parent, args) {
        return PreviousDonation.find({ userId: parent.id });
      },
    },
    avatar: { type: GraphQLString },
  }),
});

const DonationType = new GraphQLObjectType({
  name: "Donation",
  fields: () => ({
    id: { type: GraphQLID },
    userId: { type: GraphQLID },
    receiverId: { type: GraphQLID },
    donationDate: { type: GraphQLString },
    donationType: { type: GraphQLString },
    city: { type: GraphQLString },
    status: { type: GraphQLString },
    bloodType: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    user: {
      type: UserType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        return User.findById(args.id);
      },
    },
    findUserByFirebaseUID: {
      type: UserType,
      args: { firebaseUID: { type: GraphQLString } },
      resolve(parent, args) {
        return User.findOne({ firebaseUID: args.firebaseUID });
      },
    },
    findUserByPhoneNumber: {
      type: UserType,
      args: { phone: { type: GraphQLString } },
      resolve(parent, args) {
        return User.findOne({ phone: args.phone });
      },
    },
    users: {
      type: new GraphQLList(UserType),
      resolve(parent, args) {
        return User.find({});
      },
    },
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
    donationsInYourArea: {
      type: new GraphQLList(DonationType),
      args: {
        city: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        return Donation.find({ city: args.city });
      },
    },
    donationRequestsForYou: {
      type: new GraphQLList(DonationType),
      args: {
        receiverId: { type: new GraphQLNonNull(GraphQLID) },
      },
      resolve(parent, args) {
        return Donation.find({ receiverId: args.receiverId });
      },
    }
  },
});

const mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    register: {
      type: UserType,
      args: {
        firebaseUID: { type: new GraphQLNonNull(GraphQLString) },
        fullName: { type: new GraphQLNonNull(GraphQLString) },
        email: { type: new GraphQLNonNull(GraphQLString) },
        phone: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLString) },
        gender: { type: new GraphQLNonNull(GraphQLString) },
        bloodType: { type: new GraphQLNonNull(GraphQLString) },
        city: { type: new GraphQLNonNull(GraphQLString) },
        pincode: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        // Check if any of the fields are empty
        if (
          [
            args.fullName,
            args.email,
            args.phone,
            args.age,
            args.bloodType,
            args.gender,
            args.city,
            args.pincode,
          ].some((field) => field?.trim() === "")
        ) {
          throw new ApiError("All fields are required", 400);
        }
        console.log(args);

        const user = new User({
          firebaseUID: args.firebaseUID,
          fullName: args.fullName,
          email: args.email,
          phone: args.phone,
          age: args.age,
          bloodType: args.bloodType,
          gender: args.gender,
          address: {
            city: args.city,
            pincode: args.pincode,
          },
        });

        // generate token
        user.token = user.generateAuthToken();

        return user.save();
      },
    },
    updateActiveForDonation: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        activeForDonation: { type: new GraphQLNonNull(GraphQLBoolean) },
      },
      resolve(parent, args) {
        return User.findByIdAndUpdate(
          args.id,
          { activeForDonation: args.activeForDonation },
          { new: true }
        );
      },
    },

    // Add user coords
    // Add user coords
    addUserCoords: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        lat: { type: new GraphQLNonNull(GraphQLString) },
        lng: { type: new GraphQLNonNull(GraphQLString) },
      },
      async resolve(parent, args) {
        const { id, lat, lng } = args;

        // Check if user ID is valid
        const existingUser = await User.findById(id);
        if (!existingUser) {
          throw new ApiError("User not found", 404);
        }

        // Update user coordinates
        existingUser.coords = {
          lat,
          lng,
        };

        // Save and return updated user
        try {
          const updatedUser = await existingUser.save();

          return updatedUser;
        } catch (error) {
          throw new ApiError("Error updating user coordinates", 500);
        }
      },
    },

    addDonation: {
      type: DonationType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) },
        receiverId: { type: GraphQLString },
        donationDate: { type: new GraphQLNonNull(GraphQLString) },
        donationType: { type: new GraphQLNonNull(GraphQLString) },
        bloodType: { type: new GraphQLNonNull(GraphQLString) },
        city: { type: GraphQLString },
        status: { type: GraphQLString, defaultValue: "pending" },
      },
      resolve(parent, args) {
        if (
          [
            args.donationType,
            args.donationDate,
            args.bloodType,
            args.userId,
          ].some((field) => field.trim() === "")
        ) {
          throw new ApiError(400, " donationType, donationDate, userId are required");
        }

        const donation = new Donation({
          userId: args.userId,
          receiverId: args.receiverId,
          donationDate: args.donationDate,
          donationType: args.donationType,
          bloodType: args.bloodType,
          city: args.city,
        });
        return donation.save();
      },
    },

    updateAge: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        age: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        return User.findByIdAndUpdate(args.id, { age: args.age }, { new: true });
      },
    },
    updateBloodType: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        bloodType: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        return User.findByIdAndUpdate(
          args.id,
          { bloodType: args.bloodType },
          { new: true }
        );
      },
    },
    updateCity: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        city: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        return User.findByIdAndUpdate(args.id, { city: args.city }, { new: true });
      },
    },
    updatePincode: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        pincode: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, args) {
        return User.findByIdAndUpdate(
          args.id,
          { pincode: args.pincode },
          { new: true }
        );
      },
    },
  },
});

export default new GraphQLSchema({
  query: RootQuery,
  mutation,
});
