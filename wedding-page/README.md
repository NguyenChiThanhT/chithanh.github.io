# Thiệp cưới online

Trang tĩnh thuần HTML/CSS/JS, không cần build, chạy được trên GitHub Pages. Giao diện tối giản tông đỏ đô
(nền kem, thẻ đỏ đô, ảnh trang trí trong `image/mau_do_dam/`). Bản rồng phượng cũ được giữ ở `.ban-cu-rong-phuong/`.

## Thiệp nhà trai / nhà gái

| Trang | Dành cho | Khác biệt |
|---|---|---|
| `chi_thanh.html` | Nhà trai | Tên chú rể đứng trước, Lễ Thành Hôn tại tư gia nhà trai |
| `hoai_ngoc.html` | Nhà gái | Tên cô dâu đứng trước, Lễ Vu Quy tại tư gia nhà gái |

Hai trang dùng chung ảnh, nhạc, lịch trình trong `assets/config.js`. Ngày giờ, sự kiện và địa điểm riêng của nhà gái
nằm ở mục `brideSide` cuối file đó.

## Xem thử trên máy

Nhấp đúp `chi_thanh.html` hoặc `hoai_ngoc.html` là xem được. Muốn chạy đúng như trên mạng (nhạc nền) thì dùng server:

```bash
cd wedding-page
python3 -m http.server 8000      # rồi mở http://localhost:8000/chi_thanh.html hoặc /hoai_ngoc.html
```

Thêm `?khach=Tên khách` vào cuối link để bìa thiệp ghi "Thân mời …", ví dụ
`hoai_ngoc.html?khach=Anh%20Tuấn%20và%20gia%20đình`. Mỗi khách gửi một link riêng.

## Sửa nội dung

Toàn bộ nằm trong `assets/config.js`: tên, bố mẹ, ngày giờ, lịch trình, địa điểm.
Ngày âm lịch được tính tự động từ ngày dương.

| Muốn thêm | Làm thế nào |
|---|---|
| Ảnh cưới | Chép ảnh vào `image/`, ghi vào `heroPhoto` (ảnh chính, cài trong phong bì đầu thiệp và đứng đầu album) và `gallery`. Album cắt ảnh theo khung dọc 2:3. Tên file không dấu, không khoảng trắng; JPG/PNG/WebP (ảnh HEIC của iPhone phải đổi sang JPG); nên dưới 500 KB/ảnh |
| Nhạc nền | Chép file mp3 vào `raw/` với tên `nhac-nen.mp3` (hoặc sửa `music` theo tên file). Không có file thì nút nhạc tự ẩn |
| Vai trong nhà | Ghi `rank` cho chú rể / cô dâu, ví dụ `'Trưởng Nam'`, `'Út Nữ'`. Để trống thì ghi "Chú rể" / "Cô dâu" |
| Biểu tượng lịch trình | Thêm `icon` vào dòng trong `timeline`: `cake`, `cook` hoặc `camera` |
| Xác nhận tham dự | Tạo Google Form, dán link vào `rsvpUrl` |
| Dress code | Ghi mã màu trang phục vào `dressCode`, ví dụ `['#511419', '#c9a24a']`. Để trống thì ẩn mục này |

Đổi tên cô dâu chú rể thì sửa luôn 2 dòng `<title>` và `og:title` đầu `chi_thanh.html` và `hoai_ngoc.html`
(Zalo, Messenger đọc dòng đó khi hiện link).

## Đưa lên GitHub Pages

1. Vào github.com → **New repository**, đặt tên (ví dụ `thiep-cuoi`), chọn **Public** → **Create repository**.
2. Bấm **uploading an existing file**, kéo **nội dung bên trong** `wedding-page/` vào (`chi_thanh.html`,
   `hoai_ngoc.html`, thư mục `assets`, `image` và `raw`, không kéo cả thư mục `wedding-page`)
   → **Commit changes**.
3. **Settings → Pages**: Source chọn **Deploy from a branch**, Branch chọn `main` và `/ (root)` → **Save**.
4. Đợi 1–2 phút, thiệp nhà trai có ở `https://<tên-github>.github.io/thiep-cuoi/chi_thanh.html`, thiệp nhà gái ở
   `https://<tên-github>.github.io/thiep-cuoi/hoai_ngoc.html`.

Sửa gì sau này thì upload đè file đó trong repo, GitHub tự cập nhật sau vài phút.

Lưu ý: repo Public thì ai có link cũng xem được ảnh và thông tin trong thiệp.
