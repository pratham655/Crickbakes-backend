require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("CrickBakes backend running 🏏🔥");
});

// Static data (No API calls - Safe version)
app.get("/live-matches", (req, res) => {
  res.json([
    {
      matchId: "1",
      team1: "Mumbai Indians",
      team2: "Chennai Super Kings",
      status: "Live - IPL",
      venue: "Wankhede Stadium",
      matchType: "IPL"
    },
    {
      matchId: "2",
      team1: "India",
      team2: "Australia",
      status: "Live - ICC T20 World Cup",
      venue: "Melbourne",
      matchType: "ICC"
    },
    {
      matchId: "3",
      team1: "India Women",
      team2: "England Women",
      status: "Upcoming - WPL",
      venue: "Delhi",
      matchType: "WPL"
    },
    {
      matchId: "4",
      team1: "Karnataka",
      team2: "Mumbai",
      status: "Ranji Trophy - Day 2",
      venue: "Bengaluru",
      matchType: "Domestic"
    }
  ]);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
