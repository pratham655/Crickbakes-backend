const axios = require("axios");

/* =========================
   LIVE MATCHES
========================= */
async function getLiveMatches(apiKey, host) {
  const response = await axios.get(
    "https://cricbuzz-cricket.p.rapidapi.com/matches/v1/live",
    {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": host
      }
    }
  );

  return response.data;
}

/* =========================
   MATCH SCORECARD (REAL BATTING + BOWLING)
========================= */
async function getMatchScorecard(matchId, apiKey, host) {
  const response = await axios.get(
    `https://cricbuzz-cricket.p.rapidapi.com/mcenter/v1/${matchId}/scard`,
    {
      headers: {
        "X-RapidAPI-Key": apiKey,
        "X-RapidAPI-Host": host
      }
    }
  );

  return response.data;
}

module.exports = { getLiveMatches, getMatchScorecard };
