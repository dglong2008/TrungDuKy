const math = {
    sqrt: Math.sqrt,
    sin: Math.sin,
    cos: Math.cos,
    atan2: Math.atan2,
    radians: (degrees) => degrees * (Math.PI / 180),
};

const ALL_FEATURES = [
    "beach",
    "history",
    "food",
    "nature",
    "adventure",
    "culture",
    "relax",
    "photo",
    "budget",
    "family",
    "crowd",
    "month_score",
];

const MONTH_NAMES = [
    "jan",
    "feb",
    "mar",
    "apr",
    "may",
    "jun",
    "jul",
    "aug",
    "sep",
    "oct",
    "nov",
    "dec",
];

function encodeMonth(bestMonths, travelMonth) {
    /**
     * Returns:
     *     1.0  nếu travel_month khớp với best_months (hoặc all-year)
     *     0.5  nếu travel_month rỗng (neutral)
     *     0.0  nếu trái mùa
     */
    // TODO 1: Điền logic vào đây
    if (!travelMonth) {
        return 0.5; // ← neutral
    }

    if (bestMonths === "all-year") {
        return 1.0; // ← luôn match
    }

    if (bestMonths.split("-").includes(travelMonth)) {
        return 1.0; // ← đúng mùa
    }

    return 0.0; // ← trái mùa
}

// Cosine
function cosineSim13(userPrefs, place, travelMonth = null) {
    // Bước 1: Build destination vector (12 features + month on-the-fly)
    const dVec = {};
    ALL_FEATURES.forEach((f) => {
        if (f !== "month_score") {
            dVec[f] = parseFloat(place[f] || 0.0);
        }
    });
    dVec["month_score"] = encodeMonth(place["best_months"], travelMonth); // ← encode_month(place['best_months'], travel_month)

    // Bước 2: Build user vector (user luôn có month_score = 1.0)
    const uVec = Object.assign({}, userPrefs);
    uVec["month_score"] = 1.0; // ← 1.0

    // Bước 3: Tính dot product và norms
    let dot = 0.0;
    let nu = 0.0;
    let nv = 0.0;
    for (const f of ALL_FEATURES) {
        const u = parseFloat(uVec[f] || 0.0);
        const d = parseFloat(dVec[f] || 0.0);
        // TODO: tích lũy dot, nu, nv
        dot += u * d; // ← u * d
        nu += u * u; // ← u * u
        nv += d * d; // ← d * d
    }

    // Bước 4: Guard + return
    if (nu === 0 || nv === 0) {
        return 0.0;
    }
    const similarity = dot / (Math.sqrt(nu) * Math.sqrt(nv));
    return parseFloat(similarity.toFixed(4)); // ← dot / (math.sqrt(nu) * math.sqrt(nv))
}

// Recommend
function recommend(userPrefs, dataset) {
    const prefs = {};
    ALL_FEATURES.forEach((f) => {
        if (f !== "month_score" && f in userPrefs) {
            prefs[f] = parseFloat(userPrefs[f]);
        }
    });

    const topK = parseInt(userPrefs.topK || 10);
    const monthNumbers = userPrefs.months || [];
    const travelMonths = monthNumbers.map((m) => MONTH_NAMES[m - 1]);

    const scored = [];
    for (const place of dataset) {
        let bestScore = 0;
        let bestMonthScore = 0.5;

        if (travelMonths.length === 0) {
            bestScore = cosineSim13(prefs, place, null);
            bestMonthScore = 0.5;
        } else {
            for (const tm of travelMonths) {
                const score = cosineSim13(prefs, place, tm);
                const ms = encodeMonth(place["best_months"], tm);
                if (score > bestScore) {
                    bestScore = score;
                    bestMonthScore = ms;
                }
            }
        }

        scored.push({
            place: place["place"],
            province: place["province"],
            score: bestScore,
            month_score: bestMonthScore,
        });
    }

    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, topK);

    return top;
}

module.exports = {
    encodeMonth,
    cosineSim13,
    recommend,
};
