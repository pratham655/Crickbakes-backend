require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.CRICKETDATA_KEY;

/* ======================
   ROOT
====================== */
app.get("/", (req, res) => {
  res.send("CrickBakes backend running 🚀");
});

/* ======================
   LIVE MATCHES
====================== */
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

    res.json(response.data);

  } catch (error) {
    console.error("REAL ERROR:", error.response?.data || error.message);

    res.status(500).json({
      error: "Failed",
      real: error.response?.data || error.message
    });
  }
});

/* ======================
   MATCH DETAILS
====================== */
app.get("/match/:id", async (req, res) => {
  try {
    const matchId = req.params.id;

    const response = await axios.get(
      `https://api.cricketdata.org/v1/matches_info?apikey=${API_KEY}&id=${matchId}`
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: "Failed",
      real: error.response?.data || error.message
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port", PORT));

