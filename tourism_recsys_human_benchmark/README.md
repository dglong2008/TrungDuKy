# Human-judgement benchmark cho tourism recommendation system

Bộ này không mã hóa từng địa điểm thành các vector thuộc tính và không dùng
công thức chấm điểm để tạo top-k.

Danh sách `human_reference_topk.csv` được lựa chọn thủ công bằng cách:

1. Đọc preference của từng user.
2. Xác định các sở thích quan trọng nhất của user.
3. Tra cứu thông tin du lịch về 42 địa điểm từ các nguồn Internet đáng tin cậy.
4. Dùng đánh giá tổng hợp để chọn và xếp top-10 phù hợp nhất.

Vì đây là đánh giá của con người, danh sách được xem là một **reference answer**,
không phải ground truth tuyệt đối.

## Các file

- `users.csv`: 10 user profiles ban đầu.
- `human_reference_topk.csv`: top-10 dạng long format, có lý do lựa chọn.
- `human_reference_topk_wide.csv`: top-10 dạng một dòng cho mỗi user.
- `model_predictions_template.csv`: template để model xuất kết quả.
- `compare_topk.py`: chương trình so sánh kết quả model.
- `human_benchmark.xlsx`: workbook tổng hợp và hướng dẫn.
- `README.md`: file này.

## Model cần xuất kết quả thế nào?

Hãy lưu kết quả model thành CSV có đúng ba cột:

```csv
profile_name,rank,place
user_1,1,Lăng Cô
user_1,2,Phong Nha
user_1,3,Sông Hương
...
user_2,1,Hang Sơn Đoòng
...
```

Quy tắc:

- Mỗi user có tối đa `top_k` dòng.
- `rank` bắt đầu từ 1 và tăng dần.
- `place` nên dùng đúng tên trong danh sách 42 địa điểm.
- Không lặp cùng một địa điểm trong một user.
- Có thể thêm cột khác như `score`, nhưng ba cột trên là bắt buộc.
- Script bỏ qua dấu tiếng Việt và khác biệt nhỏ về dấu gạch/khoảng trắng.

## Chạy so sánh

Đặt file kết quả của model, ví dụ `model_predictions.csv`, trong cùng thư mục:

```bash
python compare_topk.py   --reference human_reference_topk.csv   --predictions model_predictions.csv   --k 10   --output comparison_metrics.csv
```

Trên Windows PowerShell có thể chạy một dòng:

```powershell
python compare_topk.py --reference human_reference_topk.csv --predictions model_predictions.csv --k 10 --output comparison_metrics.csv
```

## Metrics

Script chưa xét thứ tự xếp hạng; nó chỉ kiểm tra hai top-k có bao nhiêu địa điểm trùng nhau.

```text
match_percentage = matched_count / K × 100%
precision@K      = matched_count / K
recall@K         = matched_count / số địa điểm trong reference top-k
```

Với reference có đúng 10 địa điểm và model cũng được yêu cầu trả top-10:

```text
7 địa điểm trùng:
match_percentage = 7 / 10 × 100% = 70%
Precision@10 = 0.70
Recall@10    = 0.70
```

Do hai danh sách đều có 10 phần tử, Precision@10 và Recall@10 thường bằng nhau.
Dùng cột `match_percentage` là cách đọc trực quan nhất.

## Cách hiểu kết quả

- `matched_count`: số địa điểm model dự đoán trùng với reference.
- `match_percentage`: tỷ lệ trùng theo phần trăm.
- `matched_places`: những địa điểm dự đoán đúng.
- `missed_reference_places`: địa điểm có trong reference nhưng model không chọn.
- `MACRO_AVERAGE`: trung bình của 10 user.

Đây là benchmark nhỏ và mang tính đánh giá chuyên gia. Khi có người dùng thật,
nên bổ sung ground truth từ rating, lượt lưu, lượt thêm vào lịch trình hoặc lựa
chọn thực tế của người dùng.
