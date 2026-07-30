// const { buildItinerary } = require("./recommendation");
import { buildItinerary } from "./itinerary.js";
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

// fetch("./input/stage1/stage1_dataset.json")
//     .then((response) => {
//         if (!response.ok) throw new Error("Không thể tải được file");
//         return response.json();
//     })
//     .then((data) => loadData(data))
//     .catch((error) => console.error(error));

// function loadData(formerData, indices = [-1]) {
//     const data = [];
//     if (indices[0] === -1) {
//         indices.pop();
//         for (let i = 0; i < formerData.length; i++) indices.push(i);
//     }
//     for (let i of indices) {
//         data.push(formerData[i]);
//     }
//     const parent = document.querySelector(".destinations__grid");
//     parent.innerHTML = "";
//     const keys = [
//         "adventure",
//         "beach",
//         "budget",
//         "crowd",
//         "culture",
//         "family",
//         "food",
//         "history",
//         "nature",
//         "photo",
//         "relax",
//     ];
//     const monthMap = {
//         jan: 1,
//         feb: 2,
//         mar: 3,
//         apr: 4,
//         may: 5,
//         jun: 6,
//         jul: 7,
//         aug: 8,
//         sep: 9,
//         oct: 10,
//         nov: 11,
//         dec: 12,
//     };

//     const len = data.length;
//     const showing = document.querySelector(".destinations__showing");
//     showing.innerHTML = `Showing ${len} places`;

//     for (let index in data) {
//         const des = data[index];

//         const bootstrapCol = document.createElement("div");
//         bootstrapCol.className = "col";

//         const card = document.createElement("div");
//         card.className = "destinations__card";
//         bootstrapCol.appendChild(card);

//         const headings = document.createElement("div");
//         headings.className = "destinations__headings";

//         const img = document.createElement("img");
//         img.className = "destinations__img";
//         img.src =
//             "https://nld.mediacdn.vn/thumb_w/698/291774122806476800/2024/11/18/dong-phong-nha-ke-bang-dep-den-choang-ngop-17319168370561406931222.jpg";

//         const title = document.createElement("div");
//         title.className = "destinations__title";
//         title.innerHTML = `<span>${des["place"]}</span><p>${des["province"]}</p>`;
//         headings.append(img, title);

//         const content = document.createElement("div");
//         content.className = "destinations__content";
//         for (let key of keys) {
//             const feature = document.createElement("div");
//             feature.className = "feature";

//             const left = document.createElement("div");
//             left.className = "left";
//             left.innerHTML = `${key}`;

//             const mid = document.createElement("div");
//             mid.className = "mid";
//             const bar = document.createElement("div");
//             bar.className = "bar";
//             const progress = document.createElement("div");
//             progress.className = "progress";
//             let points = 100 * (1 - des[key]);
//             if (roundTo(des[key] * 100, 0) == 0) points = 150;

//             setTimeout(() => {
//                 progress.style.transform = `translateX(-${points}%)`;
//             }, 10);
//             bar.appendChild(progress);
//             mid.appendChild(bar);

//             const right = document.createElement("div");
//             right.className = "right";
//             right.innerHTML = `${roundTo(des[key] * 100, 0)}`;

//             feature.append(left, mid, right);

//             content.appendChild(feature);
//         }

//         const months = document.createElement("div");
//         months.className = "destinations__best-months";
//         const allMonthsStr = "jan-feb-mar-apr-may-jun-jul-aug-sep-oct-nov-dec";
//         const tmpMonth =
//             des["best_months"] === "all-year"
//                 ? allMonthsStr
//                 : des["best_months"];
//         const months_input = tmpMonth.split("-");
//         for (let month of months_input) {
//             const monthElement = document.createElement("div");
//             monthElement.className = "month";
//             monthElement.innerHTML = `${monthMap[month]}`;
//             months.appendChild(monthElement);
//         }

//         card.append(headings, content, months);
//         parent.appendChild(bootstrapCol);
//     }
// }

const properties = [
    { key: "adventure", label: "adventure", value: 50 },
    { key: "beach", label: "beach", value: 50 },
    { key: "budget", label: "budget", value: 50 },
    { key: "crowd", label: "crowd", value: 50 },
    { key: "culture", label: "culture", value: 50 },
    { key: "family", label: "family", value: 50 },
    { key: "food", label: "food", value: 50 },
    { key: "history", label: "history", value: 50 },
    { key: "nature", label: "nature", value: 50 },
    { key: "photo", label: "photo", value: 50 },
    { key: "relax", label: "relax", value: 50 },
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
      <label for="${p.key}">${p.label}</label>
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
    // console.log(minus);
    // console.log(input);
    // console.log(plus);
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
wireStepper("topK", "kMinus", "kPlus", 1, 40);

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

// function setupShowMore(gridSelector, initialCount = 10, step = 5) {
//     const grid = document.querySelector(gridSelector);
//     let cards;
//     let visibleCount = 0;
//     setTimeout(() => {
//         console.log(grid.querySelectorAll(".col"));
//         cards = Array.from(grid.querySelectorAll(".col"));
//         visibleCount = Math.min(initialCount, cards.length);
//         render();
//     }, 50);

//     // Create the button once
//     const showMoreBtn = document.createElement("button");
//     showMoreBtn.className = "show-more-btn";
//     grid.insertAdjacentElement("afterend", showMoreBtn);

//     function render() {
//         console.log(cards);
//         cards.forEach((card, i) => {
//             card.style.display = i < visibleCount ? "" : "none";
//             console.log(card);
//         });

//         const remaining = cards.length - visibleCount;

//         if (remaining <= 0) {
//             showMoreBtn.style.display = "none";
//         } else {
//             showMoreBtn.style.display = "";
//             const nextBatch = Math.min(step, remaining);
//             showMoreBtn.textContent = `Show ${nextBatch} more (${remaining} left)`;
//         }
//     }

//     showMoreBtn.addEventListener("click", () => {
//         visibleCount += step;
//         render();
//     });
// }

function displayResults(results) {
    const parent = document.querySelector(".destinations__grid");
    parent.innerHTML = "";

    const showing = document.querySelector(".destinations__showing");
    showing.innerHTML = `Showing ${results.length} places`;

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

    // const destinations = require("../../input/stage1/stage1_dataset.json");
    // console.log(destinations);
    // console.log(results);

    fetch("../../input/stage1/stage1_dataset.json")
        .then((res) => res.json())
        .then((destinations) => {
            globalDestinations = destinations;
            for (const index in results) {
                const des = results[index];
                const matchingDest = destinations.find(
                    (dest) => dest.place == des.place,
                );

                const bootstrapCol = document.createElement("div");
                bootstrapCol.className = "col";

                const card = document.createElement("div");
                card.className = "destinations__card";
                if (index < 3) card.classList.add("emphasize");
                bootstrapCol.appendChild(card);

                const headings = document.createElement("div");
                headings.className = "destinations__headings";

                const img = document.createElement("img");
                img.className = "destinations__img";
                img.src =
                    "https://nld.mediacdn.vn/thumb_w/698/291774122806476800/2024/11/18/dong-phong-nha-ke-bang-dep-den-choang-ngop-17319168370561406931222.jpg";

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
                for (let key of keys) {
                    const feature = document.createElement("div");
                    feature.className = "feature";

                    const left = document.createElement("div");
                    left.className = "left";
                    left.innerHTML = `${key}`;

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
                parent.appendChild(bootstrapCol);
            }
        });
}

const destinationsGrid = document.querySelector(".destinations__grid");

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

    // console.log(destinationsList);
    // console.log(globalNumberOfDays);
    const itinerary = buildItinerary(destinationsList, globalNumberOfDays);
    let totalKms = 0;
    for (let day of itinerary) totalKms += day["total_km"];
    const itinerarySummary = document.querySelector(".itinerary__summary");
    console.log(totalKms);
    itinerarySummary.innerHTML = `${destinationsList.length} selected · estimated ${totalKms} km`;

    const daysGrid = document.querySelector(".days-grid");
    daysGrid.innerHTML = "";
    itinerary.forEach((curData, index) => {
        // 1. Generate dynamic HTML for each stop in the day's route
        console.log(curData);
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

setTimeout(() => {
    renderItinerary();
}, 5000);
