import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.mongoDbURL;

if (!MONGODB_URI) {
  console.error("mongoDbURL does not exist as a environment variable");
  process.exit(1);
}

export default async function connectToCluster() {
  try {
    const mongoClient = new MongoClient(MONGODB_URI);
    await mongoClient.connect();

    return mongoClient;
  } catch (error) {
    console.error("Connection to MongoDB failed!", error);
    process.exit();
  }
}
