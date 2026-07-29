#!/usr/bin/env python3
"""
Compare a model's top-k recommendations with the human reference list.

The comparison ignores ranking order. The main metric is:

    match_percentage = matched_places / K * 100

Required CSV columns:
    profile_name, rank, place

Example:
    python compare_topk.py \
        --reference human_reference_topk.csv \
        --predictions model_predictions.csv \
        --k 10 \
        --output comparison_metrics.csv
"""

import argparse
import csv
import re
import unicodedata
from collections import defaultdict
from pathlib import Path


def normalize_place(value):
    """Ignore Vietnamese accents, punctuation, dash variants and repeated spaces."""
    value = "" if value is None else str(value)
    value = unicodedata.normalize("NFD", value)
    value = "".join(
        char for char in value
        if unicodedata.category(char) != "Mn"
    )
    value = value.lower().replace("–", "-").replace("—", "-")
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def read_topk(path):
    with open(path, "r", encoding="utf-8-sig", newline="") as file:
        rows = list(csv.DictReader(file))

    if not rows:
        raise ValueError(f"{path} không có dữ liệu.")

    required = {"profile_name", "rank", "place"}
    missing = required - set(rows[0].keys())
    if missing:
        raise ValueError(
            f"{path} thiếu các cột bắt buộc: {sorted(missing)}"
        )

    grouped = defaultdict(list)
    for line_number, row in enumerate(rows, start=2):
        profile = (row.get("profile_name") or "").strip()
        place = (row.get("place") or "").strip()

        if not profile or not place:
            continue

        try:
            rank = int(float(row["rank"]))
        except (TypeError, ValueError):
            raise ValueError(
                f"Rank không hợp lệ tại {path}, dòng {line_number}: "
                f"{row.get('rank')!r}"
            )

        grouped[profile].append((rank, place))

    result = {}
    for profile, items in grouped.items():
        items.sort(key=lambda item: item[0])

        # Remove duplicate destination names, preserving the first rank.
        unique_items = []
        seen = set()
        for _, original_place in items:
            key = normalize_place(original_place)
            if key and key not in seen:
                seen.add(key)
                unique_items.append((key, original_place))

        result[profile] = unique_items

    return result


def join_places(items):
    return " | ".join(place for _, place in items)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--reference",
        default="human_reference_topk.csv",
        help="File top-k do người đánh giá tạo.",
    )
    parser.add_argument(
        "--predictions",
        required=True,
        help="File kết quả top-k của model.",
    )
    parser.add_argument("--k", type=int, default=10)
    parser.add_argument(
        "--output",
        default="comparison_metrics.csv",
    )
    args = parser.parse_args()

    if args.k <= 0:
        raise ValueError("--k phải lớn hơn 0.")

    reference = read_topk(args.reference)
    predictions = read_topk(args.predictions)

    output_rows = []
    total_hits = 0

    for profile in sorted(reference):
        reference_items = reference.get(profile, [])[:args.k]
        prediction_items = predictions.get(profile, [])[:args.k]

        reference_keys = {key for key, _ in reference_items}
        prediction_keys = {key for key, _ in prediction_items}

        matched_keys = reference_keys & prediction_keys
        matched_items = [
            item for item in prediction_items
            if item[0] in matched_keys
        ]
        missed_items = [
            item for item in reference_items
            if item[0] not in prediction_keys
        ]

        hits = len(matched_keys)
        total_hits += hits

        # Precision@K uses K as the denominator:
        # missing predictions are therefore treated as incorrect slots.
        precision_at_k = hits / args.k

        reference_count = len(reference_keys)
        recall_at_k = hits / reference_count if reference_count else 0.0

        match_percentage = precision_at_k * 100

        output_rows.append({
            "profile_name": profile,
            "k": args.k,
            "prediction_count": len(prediction_items),
            "matched_count": hits,
            "match_percentage": round(match_percentage, 2),
            "precision_at_k": round(precision_at_k, 6),
            "recall_at_k": round(recall_at_k, 6),
            "matched_places": join_places(matched_items),
            "missed_reference_places": join_places(missed_items),
        })

    profile_count = len(output_rows)
    macro_match = (
        sum(row["match_percentage"] for row in output_rows) / profile_count
        if profile_count else 0.0
    )
    macro_precision = (
        sum(row["precision_at_k"] for row in output_rows) / profile_count
        if profile_count else 0.0
    )
    macro_recall = (
        sum(row["recall_at_k"] for row in output_rows) / profile_count
        if profile_count else 0.0
    )

    output_rows.append({
        "profile_name": "MACRO_AVERAGE",
        "k": args.k,
        "prediction_count": "",
        "matched_count": "",
        "match_percentage": round(macro_match, 2),
        "precision_at_k": round(macro_precision, 6),
        "recall_at_k": round(macro_recall, 6),
        "matched_places": "",
        "missed_reference_places": "",
    })

    fieldnames = [
        "profile_name",
        "k",
        "prediction_count",
        "matched_count",
        "match_percentage",
        "precision_at_k",
        "recall_at_k",
        "matched_places",
        "missed_reference_places",
    ]

    with open(args.output, "w", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(output_rows)

    print(f"Đã đánh giá {profile_count} user với K={args.k}")
    print(f"Tỷ lệ trùng trung bình: {macro_match:.2f}%")
    print(f"Precision@{args.k}: {macro_precision:.4f}")
    print(f"Recall@{args.k}:    {macro_recall:.4f}")
    print(f"Kết quả: {Path(args.output).resolve()}")

    missing_profiles = sorted(set(reference) - set(predictions))
    if missing_profiles:
        print(
            "Cảnh báo: model chưa có kết quả cho:",
            ", ".join(missing_profiles),
        )

    extra_profiles = sorted(set(predictions) - set(reference))
    if extra_profiles:
        print(
            "Cảnh báo: file model có profile không tồn tại trong reference:",
            ", ".join(extra_profiles),
        )


main()
