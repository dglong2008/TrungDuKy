const math = {
    sqrt: Math.sqrt,
    sin: Math.sin,
    cos: Math.cos,
    atan2: Math.atan2,
    radians: (degrees) => degrees * (Math.PI / 180),
};

// distance
function euclidean(a, b) {
    /** Euclidean distance on (lat,lng) — dùng cho K-Means và TSP so sánh. */
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2));
}

function haversineKm(a, b) {
    /** Khoảng cách km thực tế (đường chim bay) — dùng để hiển thị output. */
    const R = 6371;
    const dlat = math.radians(b[0] - a[0]);
    const dlng = math.radians(b[1] - a[1]);
    const x =
        Math.pow(Math.sin(dlat / 2), 2) +
        Math.cos(math.radians(a[0])) *
            Math.cos(math.radians(b[0])) *
            Math.pow(Math.sin(dlng / 2), 2);
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

//
function kmeansPlusPlus(points, k, nIter = 60) {
    /**
     * K-Means++ clustering trên (lat, lng).
     * points: list of [lat, lng] or (lat, lng) arrays
     * k: số ngày = số cụm
     * Returns: list of k lists of indices
     */
    if (points.length <= k) {
        return points.map((_, i) => [i]);
    }

    // TODO 1a: K-Means++ init
    const centroids = [points[0]]; // centroid đầu tiên = điểm đầu tiên

    while (centroids.length < k) {
        // Tính d² từ mỗi điểm đến centroid gần nhất
        const d2 = points.map((p) =>
            Math.min(...centroids.map((c) => euclidean(p, c) ** 2)),
        );
        const total = d2.reduce((sum, val) => sum + val, 0.0);

        // Roulette wheel selection theo xác suất tỉ lệ với d²
        const r = Math.random() * total;
        let cumsum = 0.0;
        let selectedIndex = points.length - 1;

        for (let i = 0; i < d2.length; i++) {
            cumsum += d2[i];
            if (cumsum >= r) {
                selectedIndex = i;
                break;
            }
        }
        centroids.push(points[selectedIndex]);
    }

    // Assign + Recompute
    let clusters = [];
    for (let iter = 0; iter < nIter; iter++) {
        clusters = Array.from({ length: k }, () => []);

        // Assign points to nearest centroid
        points.forEach((p, i) => {
            let nearest = 0;
            let minDist = euclidean(p, centroids[0]);

            for (let ci = 1; ci < k; ci++) {
                const dist = euclidean(p, centroids[ci]);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = ci;
                }
            }
            clusters[nearest].push(i);
        });

        // Recompute centroids
        const newC = [];
        for (let ci = 0; ci < k; ci++) {
            if (clusters[ci].length > 0) {
                const sumLat = clusters[ci].reduce(
                    (sum, idx) => sum + points[idx][0],
                    0,
                );
                const sumLng = clusters[ci].reduce(
                    (sum, idx) => sum + points[idx][1],
                    0,
                );
                newC.push([
                    sumLat / clusters[ci].length,
                    sumLng / clusters[ci].length,
                ]);
            } else {
                newC.push(centroids[ci]);
            }
        }

        // Check convergence (comparing coordinates)
        const converged = centroids.every(
            (c, idx) => c[0] === newC[idx][0] && c[1] === newC[idx][1],
        );

        centroids.length = 0;
        centroids.push(...newC);

        if (converged) break;
    }

    // Bitmask DP for TSP ordering of centroids
    const n = k;
    const m = 1 << k;
    const dp = Array.from({ length: m }, () => Array(n).fill(Infinity));
    const trace = Array.from({ length: m }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
        dp[1 << i][i] = 0;
    }

    for (let mask = 0; mask < m; mask++) {
        for (let i = 0; i < n; i++) {
            if (((mask >> i) & 1) === 0) {
                for (let j = 0; j < n; j++) {
                    if (((mask >> j) & 1) === 1) {
                        const cost =
                            dp[mask][j] +
                            haversineKm(centroids[i], centroids[j]);
                        if (dp[mask | (1 << i)][i] > cost) {
                            dp[mask | (1 << i)][i] = cost;
                            trace[mask | (1 << i)][i] = j;
                        }
                    }
                }
            }
        }
    }

    let bestD = Infinity;
    const bestO = [];
    let last = 0;

    for (let i = 0; i < n; i++) {
        if (bestD > dp[m - 1][i]) {
            bestD = dp[m - 1][i];
            last = i;
        }
    }

    bestO.push(last);
    let mask = m - 1;

    for (let step = 0; step < n - 1; step++) {
        const nxt = trace[mask][last];
        mask ^= 1 << last;
        last = nxt;
        bestO.push(last);
    }

    const newClusters = [];
    for (let i = n - 1; i >= 0; i--) {
        newClusters.push(clusters[bestO[i]]);
    }

    return newClusters;
}

console.log("kmeansPlusPlus() defined.");

// tsp
function tspNearestNeighbor(points) {
    /** Multi-start Nearest Neighbor TSP. Returns list of indices. */
    const n = points.length;
    const m = 1 << n;
    if (n <= 1) {
        const res = [];
        for (let i = 0; i < n; i++) res.push(i);
        return res;
    }
    const dp = Array.from(
        {
            length: m,
        },
        () => Array(n).fill(Infinity),
    );
    const trace = Array.from(
        {
            length: m,
        },
        () => Array(n).fill(0),
    );

    for (let i = 0; i < n; i++) {
        dp[1 << i][i] = 0;
    }

    for (let mask = 0; mask < m; mask++) {
        for (let i = 0; i < n; i++) {
            if (((mask >> i) & 1) === 0) {
                for (let j = 0; j < n; j++) {
                    if (((mask >> j) & 1) === 1) {
                        const dist = haversineKm(points[i], points[j]);
                        if (dp[mask | (1 << i)][i] > dp[mask][j] + dist) {
                            dp[mask | (1 << i)][i] = dp[mask][j] + dist;
                            trace[mask | (1 << i)][i] = j;
                        }
                    }
                }
            }
        }
    }

    let bestD = Infinity;
    const bestO = [];
    let last = 0;
    for (let i = 0; i < n; i++) {
        if (bestD > dp[m - 1][i]) {
            bestD = dp[m - 1][i];
            last = i;
        }
    }

    let mask = m - 1;
    bestO.push(last);
    for (let i = 0; i < n - 1; i++) {
        const nxt = trace[mask][last];
        mask ^= 1 << last;
        last = nxt;
        bestO.push(last);
    }
    bestO.reverse();
    return bestO;
    // print(best_d)
    // print(best_o)

    // best_order, best_dist = None, float('inf')

    // for start in range(n):
    //     visited, order, cur = {start}, [start], start
    //     while len(order) < n:
    //         # TODO 2a: Tìm điểm chưa thăm gần nhất
    //         nxt = min((i for i in range(n) if i not in visited), key = lambda i: euclidean(points[cur], points[i]))  # ← min((i for i in range(n) if i not in visited),
    //                     #        key=lambda i: euclidean(points[cur], points[i]))
    //         visited.add(nxt); order.push(nxt); cur = nxt

    //     # TODO 2b: Tính tổng khoảng cách Haversine của route này
    //     total = sum(haversine_km(points[order[i]], points[order[i+1]]) for i in range(len(order)-1))  # ← sum(haversine_km(points[order[i]], points[order[i+1]])
    //                   #        for i in range(len(order)-1))

    //     if total < best_dist:
    //         best_dist = total; best_order = order
    // print(best_dist)
    // print(best_o)
    // print("haha")
    // return best_order
}

console.log("tsp_nearest_neighbor() defined.");

/**
 * K-Means++ phân ngày → TSP tối ưu thứ tự trong ngày.
 * Returns: array of day objects
 */
export function buildItinerary(selectedPlaces, nDays) {
    /**
     * K-Means++ phân ngày → TSP tối ưu thứ tự trong ngày.
     * Returns: Array of day objects
     */
    const k = Math.min(nDays, selectedPlaces.length);
    const coords = selectedPlaces.map((p) => [p.lat, p.lng]);

    const clusters = kmeansPlusPlus(coords, k);

    const itinerary = [];

    clusters.forEach((ci, dayIdx) => {
        if (!ci || ci.length === 0) return;

        const dayPlaces = ci.map((i) => selectedPlaces[i]);
        const dayCoords = dayPlaces.map((p) => [p.lat, p.lng]);

        const order = tspNearestNeighbor(dayCoords);
        const sortedDay = order.map((i) => dayPlaces[i]);

        // Khởi tạo các danh sách lưu chặng và tổng quãng đường
        const legsKm = [];
        const timeTravelLegs = [];
        let totalKm = 0.0;

        for (let i = 0; i < sortedDay.length - 1; i++) {
            const km = haversineKm(
                [sortedDay[i].lat, sortedDay[i].lng],
                [sortedDay[i + 1].lat, sortedDay[i + 1].lng],
            );

            // Thêm khoảng cách chặng (km)
            legsKm.push(Number(km.toFixed(1)));

            // Thêm thời gian di chuyển chặng (giờ) = km / 40
            timeTravelLegs.push(Number((km / 40).toFixed(1)));

            totalKm += km;
        }

        itinerary.push({
            day: dayIdx + 1,
            stops: sortedDay,
            legs_km: legsKm, // Danh sách km từng chặng: [12.5, 5.0, ...]
            time_travel: timeTravelLegs, // Danh sách giờ tương ứng: [0.3, 0.1, ...]
            total_km: Number(totalKm.toFixed(1)), // Tổng km trong ngày
            time_travel_total: Number((totalKm / 40).toFixed(1)), // Tổng thời gian di chuyển trong ngày (giờ)
        });
    });

    return itinerary;
}

console.log("buildItinerary() defined.");

// JS doesn't have Python's built-in round(x, ndigits), so a small helper:
function round(value, decimals) {
    const factor = 10 ** decimals;
    return Math.round(value * factor) / factor;
}
