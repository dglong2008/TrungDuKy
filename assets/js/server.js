const path = require("path");
const { recommend, buildItinerary } = require("./recommendation");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const ROOT_DIR = path.join(__dirname, "..", "..");
app.use(express.static(ROOT_DIR));

const destinations = require("../../input/stage1/stage1_dataset.json");

app.post("/api/recommend", (req, res) => {
    const userPrefs = req.body;

    const results = recommend(userPrefs, destinations);

    res.json(results);
});
module.exports = app;
