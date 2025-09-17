// scripts/seed-flashcards.js
// CommonJS script — run with: node scripts/seed-flashcards.js

const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Load .env.local explicitly (Next.js uses .env.local)
dotenv.config({ path: '.env.local' });

async function seed() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB || 'flashcardsDB';

  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env.local. Aborting.');
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection('flashcards');

    // Example flashcards (MCQ format)
    const flashcards = [
      {
        question: "How many continents are there on Earth?",
        options: ["5", "6", "7", "8"],
        answer: "7",
      },
      {
        question: "What is the capital of France?",
        options: ["Berlin", "Paris", "Rome", "Madrid"],
        answer: "Paris",
      },
      {
        question: "Which gas do plants absorb during photosynthesis?",
        options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Helium"],
        answer: "Carbon Dioxide",
      },
      {
        question: "Who developed the theory of relativity?",
        options: ["Isaac Newton", "Albert Einstein", "Galileo Galilei", "Nikola Tesla"],
        answer: "Albert Einstein",
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Jupiter", "Venus"],
        answer: "Mars",
      },
      {
        question: "What is the largest ocean on Earth?",
        options: ["Atlantic", "Indian", "Arctic", "Pacific"],
        answer: "Pacific",
      },
      {
        question: "What is the square root of 144?",
        options: ["10", "11", "12", "14"],
        answer: "12",
      },
      {
        question: "Which element has the chemical symbol 'O'?",
        options: ["Gold", "Oxygen", "Silver", "Hydrogen"],
        answer: "Oxygen",
      },
      {
        question: "Which country is known for the samba dance?",
        options: ["Spain", "Brazil", "Argentina", "Mexico"],
        answer: "Brazil",
      },
      {
        question: "In computing, what does 'CPU' stand for?",
        options: ["Central Processing Unit", "Computer Program Unit", "Central Power Unit", "Control Processing Unit"],
        answer: "Central Processing Unit",
      }
    ];

    console.log('🧹 Clearing existing flashcards collection (if any)...');
    await collection.deleteMany({});

    console.log(`➕ Inserting ${flashcards.length} flashcards...`);
    const result = await collection.insertMany(flashcards);

    console.log(`✅ Inserted ${result.insertedCount} flashcards into "${dbName}.flashcards".`);
    console.log('You can verify with your DB viewer (Compass) or with an API call to /api/flashcards if you have one.');
  } catch (err) {
    console.error('❌ Error while seeding flashcards:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
    console.log('🔒 MongoDB connection closed.');
  }
}

seed();
