// const { buildItinerary } = require("./recommendation");
import { buildItinerary } from "./itinerary.js";
import { destinations as destinationsImages } from "./data.js";
const userPreferences = document.querySelector("#submit-preferences");
const formPreferences = document.querySelector("#form-preferences");

function getRandom(l, r) {
    return Math.floor(Math.random() * (r - l + 1)) + l;
}

function roundTo(num, k) {
    let x = 1;
    for (let i = 0; i < k; i++) x *= 10;
    return Math.round(num * x) / x;
}

// Prevent default submit
if (userPreferences)
    userPreferences.onclick = (event) => {
        event.preventDefault();

        const formData = new FormData(formPreferences);
        const dataObject = Object.fromEntries(formData);
    };

const properties = [
    { key: "adventure", label: "Adventure", icon: "🏔️", value: 50 },
    { key: "beach", label: "Beach", icon: "🏖️", value: 50 },
    { key: "budget", label: "Budget", icon: "💰", value: 50 },
    { key: "crowd", label: "Crowd", icon: "👥", value: 50 },
    { key: "culture", label: "Culture", icon: "🎭", value: 50 },
    { key: "family", label: "Family", icon: "👨‍👩‍👧‍👦", value: 50 },
    { key: "food", label: "Food", icon: "🍜", value: 50 },
    { key: "history", label: "History", icon: "🏛️", value: 50 },
    { key: "nature", label: "Nature", icon: "🌿", value: 50 },
    { key: "photo", label: "Photography", icon: "📸", value: 50 },
    { key: "relax", label: "Relax", icon: "🛋️", value: 50 },
];

const misc = [
    { key: "days", label: "days" },
    { key: "topK", label: "topK" },
];

const slidersEl = document.getElementById("sliders");

properties.forEach((p) => {
    const row = document.createElement("div");
    row.className = "field";
    row.innerHTML = `
      <label for="${p.key}">${p.icon} ${p.label}</label>
      <div class="container">
              <div class="slider-wrap">
        <input type="range" id="${p.key}" name="${p.key}" min="0" max="100" step="5" value="${p.value}" style="--val:${p.value}%">
      </div>
      <div class="value" id="${p.key}-val">${p.value}</div>
      </div>
    `;
    slidersEl.appendChild(row);

    const input = row.querySelector("input");
    const valEl = row.querySelector(`#${p.key}-val`);
    input.addEventListener("input", () => {
        input.style.setProperty("--val", input.value + "%");
        valEl.textContent = input.value;
    });
});

const monthsEl = document.getElementById("months");
const selectedMonths = new Set();

for (let m = 1; m <= 12; m++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "month-btn";
    btn.textContent = m;
    btn.setAttribute("aria-pressed", "false");
    btn.addEventListener("click", () => {
        if (selectedMonths.has(m)) {
            selectedMonths.delete(m);
            btn.classList.remove("active");
            btn.setAttribute("aria-pressed", "false");
        } else {
            selectedMonths.add(m);
            btn.classList.add("active");
            btn.setAttribute("aria-pressed", "true");
        }
    });
    monthsEl.appendChild(btn);
}

// new: stepper wiring for days + top K
function wireStepper(inputId, minusId, plusId, min, max) {
    const input = document.getElementById(inputId);
    const minus = document.getElementById(minusId);
    const plus = document.getElementById(plusId);
    const clamp = (v) => Math.min(max, Math.max(min, v));

    minus.addEventListener("click", () => {
        input.value = clamp((Number(input.value) || min) - 1);
    });
    plus.addEventListener("click", () => {
        input.value = clamp((Number(input.value) || min) + 1);
    });
    input.addEventListener("change", () => {
        input.value = clamp(Number(input.value) || min);
    });
}
wireStepper("days", "daysMinus", "daysPlus", 1, 30);
wireStepper("topK", "kMinus", "kPlus", 1, 42);

// new: score a destination against the user's slider preferences + month overlap
function scoreDestination(dest, userPrefs, userMonths) {
    const keys = properties.map((p) => p.key);
    const diffSum = keys.reduce(
        (sum, k) => sum + Math.abs(dest.scores[k] - userPrefs[k]),
        0,
    );
    const avgDiff = diffSum / keys.length;
    const prefMatch = 100 - avgDiff; // 0-100, higher = closer match

    let monthBonus = 0;
    if (userMonths.length > 0) {
        const overlap = dest.months.filter((m) =>
            userMonths.includes(m),
        ).length;
        monthBonus = (overlap / userMonths.length) * 100;
    }

    // weighted blend: preference fit matters most, month fit is a smaller nudge
    const finalScore =
        userMonths.length > 0
            ? prefMatch * 0.85 + monthBonus * 0.15
            : prefMatch;

    return Math.round(finalScore);
}

let globalDestinations;
let globalNumberOfDays;
document.getElementById("prefsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = {};
    properties.forEach((p) => {
        data[p.key] = Number(document.getElementById(p.key).value / 100);
    });
    misc.forEach((p) => {
        data[p.key] = Number(document.getElementById(p.key).value);
    });
    data.months = Array.from(selectedMonths).sort((a, b) => a - b);
    globalNumberOfDays = data["days"];
    fetch("/api/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then((res) => res.json())
        .then((results) => {
            if (results.error) {
                alert("Lỗi server: " + results.error);
                return;
            }
            displayResults(results);
        })
        .catch((err) => {
            console.error("Fetch error:", err);
            alert("Không kết nối được server: " + err.message);
        });
});

async function displayResults(results) {
    const parent = document.querySelector(".destinations__grid");
    parent.innerHTML = "";

    const showing = document.querySelector(".destinations__showing");
    showing.innerHTML = `Showing ${results.length} ${results.length === 1 ? "place" : "places"} of 42 places`;

    const keys = [
        "adventure",
        "beach",
        "budget",
        "crowd",
        "culture",
        "family",
        "food",
        "history",
        "nature",
        "photo",
        "relax",
    ];

    const icons = [
        "🏔️", // adventure
        "🏖️", // beach
        "💰", // budget
        "👥", // crowd
        "🎭", // culture
        "👨‍👩‍👧‍👦", // family
        "🍜", // food
        "🏛️", // history
        "🌿", // nature
        "📸", // photo
        "🛋️", // relax
    ];

    const monthMap = {
        jan: 1,
        feb: 2,
        mar: 3,
        apr: 4,
        may: 5,
        jun: 6,
        jul: 7,
        aug: 8,
        sep: 9,
        oct: 10,
        nov: 11,
        dec: 12,
    };

    fetch("../../input/stage1/stage1_dataset.json")
        .then((res) => res.json())
        .then((destinations) => {
            globalDestinations = destinations;
            for (const index in results) {
                const des = results[index];
                const matchingDest = destinations.find(
                    (dest) => dest.place == des.place,
                );

                const card = document.createElement("div");
                card.className = "destinations__card";
                if (index < 3) {
                    if (index === "0") card.classList.add("top");
                    else card.classList.add("emphasize");
                }

                const headings = document.createElement("div");
                headings.className = "destinations__headings";
                const img = document.createElement("img");
                img.className = "destinations__img";
                img.src = `./assets/sources/img/${destinationsImages[des.place].image}`;

                const title = document.createElement("div");
                title.className = "destinations__title";
                title.innerHTML = `<span>${matchingDest["place"]}</span><p>${matchingDest["province"]}</p>`;
                headings.append(img, title);

                const score = document.createElement("div");
                score.className = "destinations__score";
                score.innerHTML = `<span>${Math.round(des.score * 100)}%</span> <p>Match</p>`;
                headings.append(score);

                const content = document.createElement("div");
                content.className = "destinations__content";
                let featureIndex = 0;
                for (let key of keys) {
                    const feature = document.createElement("div");
                    feature.className = "feature";

                    const left = document.createElement("div");
                    left.className = "left";
                    left.innerHTML = `${icons[featureIndex]} ${key}`;

                    const mid = document.createElement("div");
                    mid.className = "mid";
                    const bar = document.createElement("div");
                    bar.className = "bar";
                    const progress = document.createElement("div");
                    progress.className = "progress";
                    let points = 100 * (1 - matchingDest[key]);
                    if (roundTo(matchingDest[key] * 100, 0) == 0) points = 150;

                    setTimeout(() => {
                        progress.style.transform = `translateX(-${points}%)`;
                    }, 10);
                    bar.appendChild(progress);
                    mid.appendChild(bar);

                    const right = document.createElement("div");
                    right.className = "right";
                    right.innerHTML = `${roundTo(matchingDest[key] * 100, 0)}`;

                    feature.append(left, mid, right);

                    content.appendChild(feature);
                    featureIndex++;
                }

                const months = document.createElement("div");
                months.className = "destinations__best-months";
                const allMonthsStr =
                    "jan-feb-mar-apr-may-jun-jul-aug-sep-oct-nov-dec";
                const tmpMonth =
                    matchingDest["best_months"] === "all-year"
                        ? allMonthsStr
                        : matchingDest["best_months"];
                const months_input = tmpMonth.split("-");
                for (let month of months_input) {
                    const monthElement = document.createElement("div");
                    monthElement.className = "month";
                    monthElement.innerHTML = `${monthMap[month]}`;
                    months.appendChild(monthElement);
                }
                const checkboxWrapper = document.createElement("label");
                checkboxWrapper.className = "checkbox-wrapper";

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.name = `${des.place}`;
                checkbox.className = "checkbox-input";
                if (index < 5) checkbox.checked = true;

                const checkboxBox = document.createElement("span");
                checkboxBox.className = "checkbox-box";

                const checkboxContent = document.createElement("span");
                checkboxContent.className = "checkbox-label";
                checkboxContent.textContent = "Select";

                checkboxWrapper.append(checkboxContent, checkbox, checkboxBox);

                const footerWrapper = document.createElement("div");
                footerWrapper.className = "footerWrapper";
                footerWrapper.append(months, checkboxWrapper);

                card.append(headings, content, footerWrapper);
                parent.appendChild(card);
            }
            renderItinerary();
        });
}

const destinationsGrid = document.querySelector(".destinations__grid");

function convertToMin(hour) {
    return roundTo(hour * 60, 0);
}

function renderItinerary() {
    const destinationsCheckboxes = document.querySelectorAll(".checkbox-input");
    const destinationsList = [];
    for (let checkbox of destinationsCheckboxes) {
        if (checkbox.checked) {
            const name = checkbox.name;
            const card = checkbox.closest(".destinations__card");
            const match = card.querySelector(
                ".destinations__score span",
            ).innerHTML;
            const matchingDest = globalDestinations.find(
                (dest) => dest.place == name,
            );
            matchingDest.match = match;
            destinationsList.push(matchingDest);
        }
    }

    const itinerary = buildItinerary(destinationsList, globalNumberOfDays);
    let totalKms = 0,
        totalTime = 0;
    for (let day of itinerary) {
        totalKms += day["total_km"];
        totalTime += day["time_travel_total"];
    }
    const itinerarySummary = document.querySelector(".itinerary__summary");
    itinerarySummary.innerHTML = `${destinationsList.length} selected · estimated ${roundTo(totalKms, 2)} km and ${convertToMin(totalTime)} minutes, velocity: 40 km per hour`;

    const daysGrid = document.querySelector(".days-grid");
    daysGrid.innerHTML = "";
    itinerary.forEach((curData, index) => {
        // 1. Generate dynamic HTML for each stop in the day's route
        const time = curData["time_travel"];
        const dist = curData["legs_km"];
        const stopsHTML = curData.stops
            .map(
                (stop, stopIdx) => `
            <li class="stop">
                <span class="stop__index">${stopIdx + 1}</span>
                <div>
                    <div class="stop__name">${stop.place}</div>
                    <div class="stop__meta">
                        ${stop.province || "Quảng Bình"} · ${stop.match || 0} match
                    </div>
                </div>
                <span class="stop__time">${stopIdx < time.length ? roundTo((dist[stopIdx] / 40) * 60, 0) : 0} minutes</span>
                <span class="distance__time">${stopIdx < dist.length ? roundTo(dist[stopIdx], 2) : 0} km</span>
            </li>
        `,
            )
            .join("");

        // 2. Build the main day card
        const dayCard = document.createElement("div");
        dayCard.className = "day-card";
        dayCard.innerHTML = `
        <div class="day-card__header">
            <span class="day-card__title">Day ${curData.day}</span>
             <span class="day-card__km">${curData.total_km} km</span> 
        </div>
        <ul class="day-card__list">
            ${stopsHTML}
        </ul>
    `;

        daysGrid.appendChild(dayCard);
    });
}
destinationsGrid.addEventListener("change", renderItinerary);
