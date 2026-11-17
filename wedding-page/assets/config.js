// Toàn bộ nội dung thiệp nằm ở đây — chỉ cần sửa file này.
// Ảnh: chép vào thư mục image/ rồi ghi đường dẫn tương đối, ví dụ 'image/anh-1.jpg'. Nhạc: thư mục raw/.
// Để trống ('' hoặc []) thì thiệp tự dùng ảnh mẫu.
window.WEDDING = {
  groom: {
    name: 'Chí Thanh',              // tên hiển thị lớn
    fullName: 'Nguyễn Chí Thanh',
    rank: '',                       // vai trong nhà, ví dụ 'Trưởng Nam'; trống thì ghi 'Chú rể'
    father: 'Ông Nguyễn Huỳnh Hưng',
    mother: 'Bà Phạm Thị Niểm',
    address: 'Ấp Xuân Hòa 2, Xã Thuận Mỹ, Tỉnh Tây Ninh',
  },
  bride: {
    name: 'Hoài Ngọc',
    fullName: 'Lê Trường Hoài Ngọc',
    rank: '',                       // ví dụ 'Út Nữ'; trống thì ghi 'Cô dâu'
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

  events: [
    { title: 'Lễ Thành Hôn', date: '2027-01-11', time: '11:00', place: 'Tại tư gia nhà trai' },
  ],

  venue: {
    name: 'Tư gia nhà trai',
    address: 'Ấp Xuân Hòa 2, Xã Thuận Mỹ, Tỉnh Tây Ninh',
    mapQuery: '10.431670,106.572683', // trống thì tìm bản đồ theo address; bản đồ sai chỗ thì dán tên/toạ độ đúng vào đây
  },

  // icon (tuỳ chọn) hiện cạnh giờ: 'cake' bánh cưới, 'cook' bàn tiệc, 'camera' máy ảnh (ảnh trong image/mau_do_dam/).
  timeline: [
    { time: '10:30', label: 'Đón khách' },
    { time: '11:00', label: 'Làm lễ', icon: 'cake' },
    { time: '11:30', label: 'Khai tiệc', icon: 'cook' },
    { time: '13:00', label: 'Chụp ảnh lưu niệm', icon: 'camera' },
  ],

  heroPhoto: 'image/anh_cuoi_cua_ban.jpg', // ảnh chính: cài trong phong bì đầu thiệp và đứng đầu album (khung dọc 2:3)
  heroFocus: '50% 70%',             // phần ảnh chính được giữ khi cắt vào khung (ngang% dọc%)
  gallery: [
    'image/anh_cuoi_1.jpg',
    'image/anh_cuoi_2.jpg',
    'image/anh_cuoi_3.jpg',
    'image/anh_cuoi_4.jpg',
    'image/anh_cuoi_5.jpg',
    'image/anh_cuoi_6.jpg',
    'image/anh_cuoi_7.jpg',
    'image/anh_cuoi_8.jpg',
  ],
  music: 'raw/nhac_nen.mp3',        // không có file thì nút nhạc tự ẩn

  rsvpUrl: '',                      // link Google Form xác nhận tham dự; trống thì ẩn nút
  dressCode: [],                    // mã màu trang phục, ví dụ ['#511419', '#8c3a3f', '#c9a24a', '#ece4d8']; trống thì ẩn mục

  autoScroll: true,                 // tự cuộn chậm sau khi mở thiệp
  thanks: 'Sự hiện diện của quý khách là niềm vinh hạnh cho gia đình chúng tôi!',

  // Thiệp nhà gái (hoai_ngoc.html): dùng toàn bộ phần trên, chỉ thay các mục dưới đây.
  // Thiệp nhà trai (chi_thanh.html) dùng nguyên phần trên.
  brideSide: {
    brideFirst: true,
    date: '2027-01-10',
    time: '11:00',
    events: [
      { title: 'Lễ Vu Quy', date: '2027-01-10', time: '11:00', place: 'Tại tư gia nhà gái' },
    ],
    venue: {
      name: 'Tư gia nhà gái',
      address: 'Ấp Tây Hoà, Xã Kim Sơn, Tỉnh Đồng Tháp',
      mapQuery: '10.331077,106.264134',
    },
  },
};
