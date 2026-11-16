// Toàn bộ nội dung thiệp nằm ở đây — chỉ cần sửa file này.
// Ảnh: chép vào thư mục image/ rồi ghi đường dẫn tương đối, ví dụ 'image/anh-1.jpg'. Nhạc: thư mục raw/.
// Để trống ('' hoặc []) thì thiệp tự dùng ảnh mẫu.
window.WEDDING = {
  groom: {
    name: 'Chí Thanh',              // tên hiển thị lớn
    fullName: 'Nguyễn Chí Thanh',
    father: 'Ông Nguyễn Huỳnh Hưng',
    mother: 'Bà Phạm Thị Niểm',
    address: 'Ấp Xuân Hòa 2, Xã Thuận Mỹ, Tỉnh Tây Ninh',
  },
  bride: {
    name: 'Hoài Ngọc',
    fullName: 'Lê Trường Hoài Ngọc',
    father: 'Ông Nguyễn Văn Tám',
    mother: 'Bà Trương Thị Ngọc Đạt',
    address: 'Ấp Tây Hoà, Xã Kim Sơn, Tỉnh Đồng Tháp',
  },
  brideFirst: false,                // true: tên cô dâu / nhà gái đứng trước

  // Ngày giờ chính, dùng cho trang bìa và đồng hồ đếm ngược (giờ Việt Nam).
  date: '2027-01-11',
  time: '11:00',
  showLunar: true,                  // tự tính ngày âm lịch

  inviteText: 'Trân trọng kính mời quý khách tới dự buổi tiệc chung vui cùng gia đình chúng tôi',

  // CHƯA XÁC NHẬN: đang giả định tổ chức tại tư gia nhà trai.
  events: [
    { title: 'Lễ Thành Hôn', date: '2027-01-11', time: '11:00', place: 'Tại tư gia nhà trai' },
  ],

  venue: {
    name: 'Tư gia nhà trai',
    address: 'Ấp Xuân Hòa 2, Xã Thuận Mỹ, Tỉnh Tây Ninh',
    mapQuery: '',                   // trống thì tìm bản đồ theo address; bản đồ sai chỗ thì dán tên/toạ độ đúng vào đây
  },

  // MẪU: thay bằng chương trình thật hoặc xoá bớt dòng.
  timeline: [
    { time: '10:30', label: 'Đón khách' },
    { time: '11:00', label: 'Làm lễ' },
    { time: '11:30', label: 'Khai tiệc' },
    { time: '13:00', label: 'Chụp ảnh lưu niệm' },
  ],

  heroPhoto: 'image/anh_cuoi_cua_ban.jpg', // ảnh dọc, tỉ lệ khoảng 3:4
  heroFocus: '50% 70%',             // phần ảnh chính được giữ khi cắt vào khung vòm (ngang% dọc%)
  gallery: [
    'image/anh_cuoi_1.jpg',
    'image/anh_cuoi_2.jpg',
    'image/anh_cuoi_3.jpg',
    'image/anh_cuoi_4.jpg',
    'image/anh_cuoi_5.jpg',
    'image/anh_cuoi_6.jpg',
  ],
  music: 'raw/nhac_nen.mp3',        // không có file thì nút nhạc tự ẩn

  // MẪU: điền ngân hàng, số tài khoản và ảnh QR thật trước khi đăng.
  gifts: [
    { side: 'Chú rể', bank: 'Tên ngân hàng', account: 'Số tài khoản', holder: 'NGUYEN CHI THANH', qr: '' },
    { side: 'Cô dâu', bank: 'Tên ngân hàng', account: 'Số tài khoản', holder: 'LE TRUONG HOAI NGOC', qr: '' },
  ],

  rsvpUrl: '',                      // link Google Form xác nhận tham dự; trống thì ẩn nút

  // Ảnh rồng / phượng nền trong suốt (PNG/WebP) nếu có; trống thì dùng cành mai vẽ sẵn.
  ornaments: { phoenix: '', dragon: '' },

  autoScroll: true,                 // tự cuộn chậm sau khi mở thiệp
  thanks: 'Sự hiện diện của quý khách là niềm vinh hạnh cho gia đình chúng tôi!',
};
