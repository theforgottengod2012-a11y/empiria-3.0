const express = require("express");
const client = require("./src/client");
const connectDB = require("./src/database/connect");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// Dashboard setup
const dashboard = require("./dashboard/index")(client);
app.use("/", dashboard);

app.listen(port, async () => {
  console.log(`Keep-alive server running on port ${port}`);
  try {
    await connectDB();
    client.login(process.env.TOKEN);
  } catch (err) {
    console.error("Failed to start bot:", err);
  }
});
