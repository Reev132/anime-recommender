require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
}));
app.use(bodyParser.json());

// OAuth2 Callback Endpoint
app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) {
    console.error("No code provided");
    return res.status(400).send("Authorization code is missing.");
  }

  try {
    const response = await axios.post(
      "https://myanimelist.net/v1/oauth2/token",
      new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: process.env.REDIRECT_URI,
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const data = response.data;
    console.log("Access token from MAL:", data.access_token);
    res.redirect(`http://localhost:5173?token=${data.access_token}`);
  } catch (error) {
    console.error("Error fetching access token:", error.response?.data || error.message);
    res.status(500).send("Failed to fetch access token.");
  }
});

// Test Endpoint
app.post("/test", (req, res) => {
  const { access_token } = req.body;
  if (!access_token) {
    return res.status(400).json({ message: "Access token is missing" });
  }

  console.log("Received token for testing:", access_token);

  // Simulate token validation (replace with actual API call if needed)
  res.json({
    message: "Token is valid!",
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
