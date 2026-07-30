const { recommend } = require("./recommendation");
const destinations = require("./stage1_dataset.json");

function sendJSON(res, status, data) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
}

module.exports = (req, res) => {
    if (req.method !== "POST") {
        sendJSON(res, 405, { error: "Method not allowed" });
        return;
    }

    let userPrefs = req.body;
    if (typeof userPrefs === "string") {
        userPrefs = JSON.parse(userPrefs);
    }
    if (!userPrefs) {
        sendJSON(res, 400, { error: "No body provided" });
        return;
    }

    try {
        const results = recommend(userPrefs, destinations);
        sendJSON(res, 200, results);
    } catch (err) {
        sendJSON(res, 500, { error: err.message });
    }
};
