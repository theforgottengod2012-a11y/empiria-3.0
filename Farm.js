const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  fieldsOwned: { type: Number, default: 0 },
  totalHarvested: { type: Number, default: 0 },
  crops: [
    {
      cropId: { type: String, enum: ["carrot", "potato", "wheat", "corn", "tomato"], required: true },
      quantity: { type: Number, default: 0 },
      plantedAt: { type: Date, default: Date.now },
      readyAt: { type: Date }
    }
  ],
  seeds: [
    {
      seedId: { type: String, enum: ["carrot", "potato", "wheat", "corn", "tomato"], required: true },
      quantity: { type: Number, default: 0 }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Farm", farmSchema);
