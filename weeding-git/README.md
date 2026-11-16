# Thiệp cưới online

Trang tĩnh thuần HTML/CSS/JS, không cần build, chạy được trên GitHub Pages.

## Xem thử trên máy

Nhấp đúp `index.html` là xem được. Muốn chạy đúng như trên mạng (nhạc, sao chép số tài khoản) thì dùng server:

```bash
cd weeding-git
python3 -m http.server 8000      # rồi mở http://localhost:8000
```

Thêm `?khach=Tên khách` vào cuối link để thiệp ghi "Trân trọng kính mời …", ví dụ
`index.html?khach=Anh%20Tuấn%20và%20gia%20đình`. Mỗi khách gửi một link riêng.

## Sửa nội dung

Toàn bộ nằm trong `assets/config.js`: tên, bố mẹ, ngày giờ, lịch trình, địa điểm, tài khoản mừng cưới.
Ngày âm lịch được tính tự động từ ngày dương.

| Muốn thêm | Làm thế nào |
|---|---|
| Ảnh cưới | Tạo `assets/img/`, chép ảnh vào, ghi vào `heroPhoto` (ảnh dọc) và `gallery`. Nên nén ảnh dưới 500 KB/ảnh |
| Nhạc nền | Tạo `assets/music/`, chép file mp3 vào, sửa `music`. Không có file thì nút nhạc tự ẩn |
| QR mừng cưới | Chụp mã QR từ app ngân hàng, lưu vào `assets/img/`, ghi vào `qr` của từng người |
| Ảnh rồng / phượng | PNG/WebP nền trong suốt, ghi vào `ornaments`. Để trống thì dùng cành mai vẽ sẵn |
| Xác nhận tham dự | Tạo Google Form, dán link vào `rsvpUrl` |

Đổi tên cô dâu chú rể thì sửa luôn 2 dòng `<title>` và `og:title` đầu `index.html` (Zalo, Messenger đọc
dòng đó khi hiện link).

## Đưa lên GitHub Pages

1. Vào github.com → **New repository**, đặt tên (ví dụ `thiep-cuoi`), chọn **Public** → **Create repository**.
2. Bấm **uploading an existing file**, kéo **nội dung bên trong** `weeding-git/` vào (`index.html` và
   thư mục `assets`, không kéo cả thư mục `weeding-git`) → **Commit changes**.
3. **Settings → Pages**: Source chọn **Deploy from a branch**, Branch chọn `main` và `/ (root)` → **Save**.
4. Đợi 1–2 phút, thiệp có ở `https://<tên-github>.github.io/thiep-cuoi/`.

Sửa gì sau này thì upload đè file đó trong repo, GitHub tự cập nhật sau vài phút.

Lưu ý: repo Public thì ai có link cũng xem được ảnh và số tài khoản trong thiệp.
