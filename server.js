require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const CRIC_API_KEY = process.env.CRICAPI_KEY;

/* =========================
   ROOT
========================= */
app.get("/", (req, res) => {
  res.send("CrickBakes backend is running 🍞🏏");
});

/* =========================
   ENV TEST
========================= */
app.get("/env-test", (req, res) => {
  res.json({
    cricApiLoaded: CRIC_API_KEY ? "YES" : "NO"
  });
});

/* =========================
   LIVE MATCHES
========================= */
app.get("/live-matches", async (req, res) => {
  try {
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

    const matches = response.data.data.map(match => ({
      matchId: match.id,
      team1: match.teams?.[0] || "Team 1",
      team2: match.teams?.[1] || "Team 2",
      status: match.status,
      venue: match.venue
    }));

    res.json(matches);

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      error: "Failed to fetch matches",
      real: error.response?.data || error.message
    });
  }
});

/* =========================
   MATCH SCORECARD
========================= */
app.get("/match/:id", async (req, res) => {
  try {
    const matchId = req.params.id;

    const response = await axios.get(
      "https://api.cricapi.com/v1/match_scorecard",
      {
        params: {
          apikey: CRIC_API_KEY,
          id: matchId
        }
      }
    );

    if (!response.data || !response.data.data) {
      return res.json({ message: "No scorecard yet" });
    }

    res.json(response.data.data);

  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      error: "Failed",
      real: error.response?.data || error.message
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

