require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const CRIC_API_KEY = process.env.CRICAPI_KEY;

// ========================
// CACHE SYSTEM
// ========================
let cachedMatches = [];
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ========================
// ROOT
// ========================
app.get("/", (req, res) => {
  res.send("CrickBakes backend running 🏏🔥");
});

// ========================
// LIVE MATCHES
// India + IPL + Domestic + ICC
// ========================
app.get("/live-matches", async (req, res) => {
  try {

    // Return cached data if within 5 minutes
    if (Date.now() - lastFetchTime < CACHE_DURATION) {
      console.log("Returning cached data");
      return res.json(cachedMatches);
    }

    console.log("Fetching fresh data from CricAPI...");

    const response = await axios.get(
      "https://api.cricapi.com/v1/currentMatches",
      {
        params: {
          apikey: CRIC_API_KEY,
          offset: 0
        }
      }
    );

    if (!response.data || !response.data.data) {
      return res.json([]);
    }

    const filteredMatches = response.data.data
      .filter(match => {
        const name = match.name?.toLowerCase() || "";
        const teams = match.teams?.join(" ").toLowerCase() || "";

        return (

          // 🇮🇳 India Men & Women
          name.includes("india") ||
          teams.includes("india") ||

          // 🏏 IPL
          name.includes("ipl") ||
          name.includes("indian premier league") ||

          // 🏟 Indian Domestic
          name.includes("ranji") ||
          name.includes("vijay hazare") ||
          name.includes("syed mushtaq ali") ||
          name.includes("duleep") ||
          name.includes("wpl") ||
          name.includes("women's premier league") ||

          // 🏆 ICC Tournaments
          name.includes("icc") ||
          name.includes("world cup") ||
          name.includes("champions trophy") ||
          name.includes("t20 world cup")
        );
      })
      .slice(0, 25)
      .map(match => ({
        matchId: match.id,
        team1: match.teams?.[0] || "Team 1",
        team2: match.teams?.[1] || "Team 2",
        status: match.status,
        venue: match.venue || "Unknown venue",
        matchType: match.matchType || "N/A"
      }));

    // Save cache
    cachedMatches = filteredMatches;
    lastFetchTime = Date.now();

    res.json(filteredMatches);

  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      error: "API failed or limit reached",
      real: error.message
    });
  }
});

// ========================
// SERVER
// ========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
