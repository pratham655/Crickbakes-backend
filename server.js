require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { getLiveMatches, getMatchScorecard } = require("./services/cricketApi");

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
   LIVE MATCHES
========================= */
app.get("/live-matches", async (req, res) => {
  try {
    const raw = await getLiveMatches(
      process.env.RAPIDAPI_KEY,
      process.env.RAPIDAPI_HOST
    );

    const matches = [];

    raw.typeMatches?.forEach(type => {
      type.seriesMatches?.forEach(series => {
        if (!series.seriesAdWrapper) return;

        series.seriesAdWrapper.matches?.forEach(match => {
          matches.push({
            matchId: match.matchInfo?.matchId,
            team1: match.matchInfo?.team1?.teamName,
            team2: match.matchInfo?.team2?.teamName,
            status: match.matchInfo?.status
          });
        });
      });
    });

    res.json(matches);

  } catch (error) {
    console.error("Live Matches Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

/* =========================
   MATCH SCORECARD (RAW SAFE)
========================= */
app.get("/match/:id", async (req, res) => {
  try {
    const matchId = req.params.id;

    const raw = await getMatchScorecard(
      matchId,
      process.env.RAPIDAPI_KEY,
      process.env.RAPIDAPI_HOST
    );

    // Accept both scoreCard and scorecard
    const scoreData = raw.scoreCard || raw.scorecard;

    if (!scoreData) {
      return res.status(404).json({
        error: "Scorecard not available",
        availableKeys: Object.keys(raw)
      });
    }

    const innings = scoreData.map(inning => ({
      inningsId: inning.inningsid,
      team: inning.batteamname,
      runs: inning.score,
      wickets: inning.wickets,
      overs: inning.overs,
      batting: (inning.batsman || []).map(player => ({
        name: player.name,
        runs: player.runs,
        balls: player.balls,
        fours: player.fours,
        sixes: player.sixes,
        strikeRate: player.strkrate,
        dismissal: player.outdec
      })),
      bowling: (inning.bowler || []).map(player => ({
        name: player.name,
        overs: player.overs,
        maidens: player.maidens,
        runs: player.runs,
        wickets: player.wickets,
        economy: player.economy
      }))
    }));

    res.json({
      matchId,
      status: raw.status,
      complete: raw.ismatchcomplete,
      innings
    });

  } catch (error) {
    console.error("Scorecard Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch structured scorecard" });
  }
});

/* =========================
   SERVER
========================= */
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

