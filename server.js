require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { getLiveMatches, getMatchScorecard } = require("./services/cricketApi");

const app = express();

app.use(cors());
app.use(express.json());

/* =========================
   ROOT ROUTE
========================= */
app.get("/", (req, res) => {
  res.send("CrickBakes backend is running 🍞🏏");
});

/* =========================
   ENV TEST ROUTE
========================= */
app.get("/env-test", (req, res) => {
  res.json({
    rapidKeyLoaded: process.env.RAPIDAPI_KEY ? "YES" : "NO",
    rapidHost: process.env.RAPIDAPI_HOST || "NOT FOUND"
  });
});

/* =========================
   LIVE MATCHES
========================= */
app.get("/live-matches", async (req, res) => {
  try {
    const raw = await getLiveMatches(
      process.env.RAPIDAPI_KEY,
      process.env.RAPIDAPI_HOST
    );

    const matches = [];

    raw.typeMatches.forEach(type => {
      type.seriesMatches.forEach(series => {
        if (!series.seriesAdWrapper) return;

        series.seriesAdWrapper.matches.forEach(match => {
          matches.push({
            matchId: match.matchInfo.matchId,
            team1: match.matchInfo.team1.teamName,
            team2: match.matchInfo.team2.teamName,
            status: match.matchInfo.status,
            venue: match.matchInfo.venueInfo.ground,
            city: match.matchInfo.venueInfo.city
          });
        });
      });
    });

    res.json(matches);

  } catch (error) {
    console.error("Live Matches Error:", error.response?.data || error.message);

    res.status(500).json({
      error: "Failed to fetch matches"
    });
  }
});
/* =========================
   MATCH SCORECARD
========================= */
app.get("/match/:id", async (req, res) => {
  try {
    const matchId = req.params.id;

    const raw = await getMatchScorecard(
      matchId,
      process.env.RAPIDAPI_KEY,
      process.env.RAPIDAPI_HOST
    );

    res.json(raw);
  } catch (error) {
    console.error(
      "Scorecard Error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Failed to fetch structured scorecard"
    });
  }
});

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

