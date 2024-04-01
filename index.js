import express from "express";
import { graphqlHTTP } from "express-graphql";
import cors from "cors";
import { PORT } from "./SECRET.js";
import { connectDB } from "./config/db.js";
import schema from "./graphql/user.schema.js";


connectDB();
const app = express();
app.use(cors());
app.use(express.json());

app.use(
  "/graphql",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
