const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // This unlocks the .env vault

const app = express();

// Middleware: Allows your Cloudflare frontend to talk to this backend
app.use(cors());
app.use(express.json());

// 1. Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Enterprise Database Connected Successfully'))
  .catch((err) => console.error('❌ Database connection error:', err));

// 2. Define the Logistics Schema
const inventorySchema = new mongoose.Schema({
  batch: String,
  quantity: String,
  rate: String,
  status: String
});

const Inventory = mongoose.model('Inventory', inventorySchema);
// --- DATABASE SEEDING SCRIPT ---
const seedDatabase = async () => {
    try {
      const count = await Inventory.countDocuments();
      if (count === 0) {
        await Inventory.insertMany([
          { batch: 'Coorg Premium Black', quantity: '2.0 Tons', rate: '₹615/kg', status: 'Ready for Dispatch' },
          { batch: 'Chikmagalur Standard', quantity: '1.5 Tons', rate: '₹580/kg', status: 'Quality Check' },
          { batch: 'Lingsugur Transit', quantity: '0.5 Tons', rate: '₹600/kg', status: 'In Transit' }
        ]);
        console.log('🌱 Cloud Database successfully seeded with Karnataka dispatch data!');
      }
    } catch (err) {
      console.error('Seeding error:', err);
    }
  };
  seedDatabase();
  // -------------------------------

// 3. Define the API Route (The frontend will call this!)
app.get('/api/inventory', async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// --- MANUAL SEED TRIGGER ---
app.get('/api/seed', async (req, res) => {
    try {
      // 1. Clear any broken or partial data
      await Inventory.deleteMany({});
      
      // 2. Force inject the enterprise data
      await Inventory.insertMany([
        { batch: 'Coorg Premium Black', quantity: '2.0 Tons', rate: '₹615/kg', status: 'Ready for Dispatch' },
        { batch: 'Chikmagalur Standard', quantity: '1.5 Tons', rate: '₹580/kg', status: 'Quality Check' },
        { batch: 'Lingsugur Transit', quantity: '0.5 Tons', rate: '₹600/kg', status: 'In Transit' }
      ]);
      
      res.send('✅ SUCCESS: Black Pepper data has been locked into the cloud database!');
    } catch (err) {
      res.status(500).send('❌ FAILED: ' + err.message);
    }
  });
  // ---------------------------

// 4. Ignite the Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Logistics Server running on port ${PORT}`));