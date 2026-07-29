const { recommend } = require("../assets/js/recommendation");
const express = require("express");

const app = express();
app.use(express.json());

const destinations = require("../input/stage1/stage1_dataset.json");

app.post("/api/recommend", (req, res) => {
    const results = recommend(req.body, destinations);
    res.json(results);
});

module.exports = app;
