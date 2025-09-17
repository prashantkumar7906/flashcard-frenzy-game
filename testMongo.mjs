import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

if (!uri) {
  console.error("❌ No MONGODB_URI found in .env file");
  process.exit(1);
}

const client = new MongoClient(uri);

async function test() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB!");
    const db = client.db(dbName);
    console.log("📦 Using DB:", db.databaseName);
    const collections = await db.listCollections().toArray();
    console.log("📂 Collections:", collections);
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  } finally {
    await client.close();
  }
}

test();
