// seedFlashcards.js
import clientPromise from "./lib/mongodb.js";

async function seed() {
  try {
    const client = await clientPromise;
    const db = client.db();

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
        options: ["Isaac Newton", "Albert Einstein", "Galileo", "Tesla"],
        answer: "Albert Einstein",
      },
      {
        question: "Which planet is known as the Red Planet?",
        options: ["Earth", "Mars", "Jupiter", "Venus"],
        answer: "Mars",
      },
    ];

    // Save them in a collection named "flashcards"
    await db.collection("flashcards").deleteMany({});
    await db.collection("flashcards").insertMany(flashcards);

    console.log("✅ Flashcards seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding flashcards:", err);
    process.exit(1);
  }
}

seed();
