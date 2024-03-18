import { PreviousDonation } from "../models/donation.model.js";
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
        // check if user exists
        // const { email, phone } = args;
        // const existedUser = User.findOne({
        //   $or: [{ email }, { phone }],
        // });
        // console.log(existedUser);
        // if (existedUser) {
        //   throw new ApiError(409, "User already exists");
        // }

        // create user object
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
    login: {
      type: UserType,
      args: {
        email: { type: new GraphQLNonNull(GraphQLString) },
        password: { type: new GraphQLNonNull(GraphQLString) },
      },
      resolve(parent, { email, password }) {
        if (email === "" || password === "") {
          throw new ApiError("All fields are required", 400);
        }
        const user = User.findOne({
          email,
          password,
        }).select("-password");

        console.log(user);
        return user;
      },
    },
  },
});

export default new GraphQLSchema({
  query: RootQuery,
  mutation,
});
