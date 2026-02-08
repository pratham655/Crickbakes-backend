require("dotenv").config();

const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());

/* =========================
   ENV TEST
========================= */
app.get("/env-test", (req, res) => {
  res.json({
    RAPIDAPI_KEY: process.env.RAPIDAPI_KEY ? "LOADED" : "NOT LOADED",
    RAPIDAPI_HOST: process.env.RAPIDAPI_HOST || "NOT FOUND"
  });
});

/* =========================
   ROOT
========================= */
app.get("/", (req, res) => {
  res.send("CrickBakes backend running 🚀");
});

/* =========================
   LIVE MATCHES
========================= */
app.get("/live-matches", async (req, res) => {
  try {
    const response = await axios.get(
      "https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live",
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": process.env.RAPIDAPI_HOST
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

/* =========================
   MATCH DETAILS
========================= */
app.get("/match/:id", async (req, res) => {
  try {
    const matchId = req.params.id;

    const response = await axios.get(
      `https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}`,
      {
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
          "X-RapidAPI-Host": process.env.RAPIDAPI_HOST
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