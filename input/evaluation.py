import math
import pandas as pd

def precision_at_k(recommended, relevant, k):
    rec_k = recommended[:k]
    hits  = len(set(rec_k) & set(relevant))
    return hits / k

def recall_at_k(recommended, relevant, k):
    rec_k = recommended[:k]
    hits  = len(set(rec_k) & set(relevant))
    return hits / len(relevant) if relevant else 0.0

def dcg_at_k(recommended, relevant, k):
    rec_k = recommended[:k]
    return sum(
        1.0 / math.log2(i + 2)
        for i, item in enumerate(rec_k)
        if item in set(relevant)
    )

def ndcg_at_k(recommended, relevant, k):
    dcg  = dcg_at_k(recommended, relevant, k)
    # ideal: tất cả relevant ở đầu
    idcg = dcg_at_k(relevant, relevant, k)
    return dcg / idcg if idcg > 0 else 0.0


def evaluate_recommendation(dataset, ground_truth, k_values=[3, 5, 10]):
    """
    Chạy evaluation cho tất cả profiles với nhiều giá trị K.
    """
    results = []

    for profile_name, gt in ground_truth.items():
        user_prefs   = gt["user_prefs"]
        travel_month = gt["travel_month"]
        relevant     = gt["relevant"]

        # Chạy recommendation
        scored = []
        for place in dataset:
            score = cosine_sim_13(user_prefs, place, travel_month)
            scored.append((place["place"], score))
        scored.sort(key=lambda x: x[1], reverse=True)
        recommended = [name for name, _ in scored]

        # Tính metrics cho từng K
        for k in k_values:
            p  = precision_at_k(recommended, relevant, k)
            r  = recall_at_k(recommended, relevant, k)
            nd = ndcg_at_k(recommended, relevant, k)
            results.append({
                "profile":      profile_name,
                "K":            k,
                "Precision@K":  round(p,  3),
                "Recall@K":     round(r,  3),
                "NDCG@K":       round(nd, 3),
                "hits":         int(p * k),
                "relevant_size":len(relevant),
            })

        # In top-K vs ground truth để debug
        print(f"\n── {profile_name} (month: {travel_month}) ──")
        print(f"  Ground truth ({len(relevant)}): {relevant}")
        print(f"  Top 10 gợi ý:")
        for i, (name, score) in enumerate(scored[:10], 1):
            tag = "✅" if name in relevant else "  "
            print(f"    {i:>2}. {tag} {name} ({score:.3f})")

    return pd.DataFrame(results)


def summary_table(df_results):
    """Bảng tổng hợp trung bình theo K."""
    summary = df_results.groupby("K")[
        ["Precision@K","Recall@K","NDCG@K"]
    ].mean().round(3)
    print("\n=== Summary (mean across all profiles) ===")
    print(summary.to_string())
    return summary