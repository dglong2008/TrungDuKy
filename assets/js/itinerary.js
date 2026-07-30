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
     * points: list of (lat, lng)
     * k: số ngày = số cụm
     * Returns: list of k lists of indices
     */
    if (points.length <= k) {
        const result = [];
        for (let i = 0; i < points.length; i++) {
            result.push([i]);
        }
        return result;
    }

    // TODO 1a: K-Means++ init
    let centroids = [points[0]]; // centroid đầu tiên = điểm đầu tiên

    while (centroids.length < k) {
        // Tính d² từ mỗi điểm đến centroid gần nhất
        const d2 = points.map((p) => {
            let minDistSq = Infinity;
            for (const c of centroids) {
                const distSq = Math.pow(euclidean(p, c), 2);
                if (distSq < minDistSq) {
                    minDistSq = distSq;
                }
            }
            return minDistSq;
        }); // ← [min(euclidean(p,c)**2 for c in centroids) for p in points]

        const total = d2.reduce((a, b) => a + b, 0); // ← sum(d2)

        // Roulette wheel selection theo xác suất tỉ lệ với d²
        const r = Math.random() * total;
        let cumsum = 0.0;
        let found = false;
        for (let i = 0; i < d2.length; i++) {
            cumsum += d2[i];
            if (cumsum >= r) {
                centroids.push(points[i]);
                found = true;
                break;
            }
        }
        if (!found) {
            centroids.push(points[points.length - 1]);
        }
    }

    // Assign + Recompute (đã có sẵn)
    let clusters = null;
    for (let iter = 0; iter < nIter; iter++) {
        clusters = Array.from(
            {
                length: k,
            },
            () => [],
        );
        for (let i = 0; i < points.length; i++) {
            const p = points[i];
            let nearest = 0;
            let minDist = Infinity;
            for (let ci = 0; ci < k; ci++) {
                const dist = euclidean(p, centroids[ci]);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = ci;
                }
            }
            clusters[nearest].push(i);
        }
        const newC = [];
        for (let ci = 0; ci < k; ci++) {
            if (clusters[ci].length > 0) {
                let sumLat = 0;
                let sumLng = 0;
                for (const i of clusters[ci]) {
                    sumLat += points[i][0];
                    sumLng += points[i][1];
                }
                newC.push([
                    sumLat / clusters[ci].length,
                    sumLng / clusters[ci].length,
                ]);
            } else {
                newC.push(centroids[ci]);
            }
        }

        let changed = false;
        for (let i = 0; i < k; i++) {
            if (
                newC[i][0] !== centroids[i][0] ||
                newC[i][1] !== centroids[i][1]
            ) {
                changed = true;
                break;
            }
        }
        if (!changed) break;
        centroids = newC;
    }

    return clusters;
}

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

// build
export function buildItinerary(selectedPlaces, nDays) {
    /**
     * K-Means++ phân ngày → TSP tối ưu thứ tự trong ngày.
     * Returns: list of day dicts
     */
    const k = Math.min(nDays, selectedPlaces.length);
    const coords = selectedPlaces.map((p) => [p["lat"], p["lng"]]);

    // TODO 3a: Gọi K-Means++ để phân cụm
    const clusters = kmeansPlusPlus(coords, k); // ← kmeans_plus_plus(coords, k)

    const itinerary = [];
    for (let dayIdx = 0; dayIdx < clusters.length; dayIdx++) {
        const ci = clusters[dayIdx];
        if (!ci || ci.length === 0) continue;
        const dayPlaces = ci.map((i) => selectedPlaces[i]);
        const dayCoords = dayPlaces.map((p) => [p["lat"], p["lng"]]);

        // TODO 3b: Gọi TSP để sắp xếp thứ tự
        const order = tspNearestNeighbor(dayCoords); // ← tsp_nearest_neighbor(day_coords)
        const sortedDay = order.map((i) => dayPlaces[i]);

        // Tính khoảng cách giữa các stop
        const legs = [];
        let total = 0.0;
        for (let i = 0; i < sortedDay.length - 1; i++) {
            const km = haversineKm(
                [sortedDay[i]["lat"], sortedDay[i]["lng"]],
                [sortedDay[i + 1]["lat"], sortedDay[i + 1]["lng"]],
            );
            legs.push(parseFloat(km.toFixed(1)));
            total += km;
        }

        itinerary.push({
            day: dayIdx + 1,
            stops: sortedDay,
            legs_km: legs,
            total_km: parseFloat(total.toFixed(1)),
        });
    }
    return itinerary;
}

console.log("build_itinerary() defined.");
