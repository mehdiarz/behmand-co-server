import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

import Customer from "../models/Customer.js";
import { customers } from "../customers.js";

// شبیه‌سازی __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// چون .env داخل src هست
dotenv.config({ path: path.join(__dirname, "../../.env") });

console.log("MONGO_URI:", process.env.MONGO_URI);

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { dbName: "behmand" });
        console.log("✅ Connected to MongoDB");

        await Customer.deleteMany({});
        console.log("🗑️ Old customers removed");

        const docs = customers.map(c => ({ name: c.name }));
        await Customer.insertMany(docs);

        console.log(`✅ Inserted ${docs.length} customers`);
        process.exit();
    } catch (err) {
        console.error("❌ Error seeding customers:", err);
        process.exit(1);
    }
}

seed();
