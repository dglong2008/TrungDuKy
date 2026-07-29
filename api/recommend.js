const { recommend } = require("../assets/js/recommendation");

const destinations = require("../input/stage1/stage1_dataset.json");

module.exports = (req, res) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }
    const results = recommend(req.body, destinations);
    res.json(results);
};
