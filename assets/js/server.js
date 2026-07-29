const { recommend, buildItinerary } = require("./recommendation");
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const destinations = require("../../input/stage1/stage1_dataset.json");

app.post("/api/recommend", (req, res) => {
    const userPrefs = req.body;

    const results = recommend(userPrefs);

    res.json(results);
});
app.listen(3000, () => {
    console.log("Server chạy ở http://localhost:3000");
});
