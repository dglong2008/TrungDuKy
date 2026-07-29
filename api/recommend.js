const { recommend } = require("../assets/js/recommendation");

const destinations = require("../input/stage1/stage1_dataset.json");

module.exports = (req, res) => {
    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
        return;
    }

    let userPrefs = req.body;
    if (typeof userPrefs === "string") {
        userPrefs = JSON.parse(userPrefs);
    }
    if (!userPrefs) {
        res.status(400).json({ error: "No body provided" });
        return;
    }

    try {
        const results = recommend(userPrefs, destinations);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
