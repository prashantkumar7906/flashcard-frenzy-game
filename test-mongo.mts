import clientPromise from "./lib/mongodb";

async function test() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);
    const collections = await db.listCollections().toArray();
    console.log("Connected! Collections:", collections.map(c => c.name));
    process.exit(0);
  } catch (err) {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  }
}

test();
