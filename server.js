require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   ROOT
========================= */
app.get("/", (req, res) => {
  res.send("CrickBakes backend is running 🍞🏏");
});

/* =========================
   LIVE MATCHES (Structured)
========================= */
app.get("/live-matches", async (req, res) => {
  try {
    const response = await axios.get(
      "https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live",
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY.trim(),
          "X-RapidAPI-Host": process.env.RAPIDAPI_HOST.trim()
        }
      }
    );

    const raw = response.data;
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
            venue: match.matchInfo.venueInfo?.ground,
            city: match.matchInfo.venueInfo?.city
          });
        });
      });
    });

    res.json(matches);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

/* /* =========================
   MATCH SCORECARD (Correct Endpoint)
========================= */
app.get("/match/:id", async (req, res) => {
  try {
    const matchId = req.params.id;

    const response = await axios.get(
      `https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}/scard`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY.trim(),
          "X-RapidAPI-Host": process.env.RAPIDAPI_HOST.trim()
        }
      }
    );

    res.json(response.data);

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


