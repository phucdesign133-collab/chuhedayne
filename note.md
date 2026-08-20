# 📝 NHẬT KÝ CÚ PHÁP CODE CỦA DUSTIN

## 1. Cách chèn Lordicon (Icon Động)

- Thẻ style trong React bắt buộc phải nằm trong 2 cặp dấu ngoặc nhọn `{{ }}`.
- Các giá trị kích thước phải bọc trong dấu nháy đơn `'`.

```jsx
<lord-icon
  src="[https://cdn.lordicon.com/rhrmfnhf.json](https://cdn.lordicon.com/rhrmfnhf.json)"
  trigger="hover"
  style={{ width: '150px', height: '150px' }}
></lord-icon>

## 2. Cách chèn danh sách tổng quát khi chưa có data
const initialPartners = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  name: `Đối tác ${index + 1}`,
  img: `https://dummyimage.com/150x80/f1f1f1/333333.png&text=Partner+${index + 1}`
}));


##Button.jsx
import React from 'react';
import { Link } from 'react-router-dom';

// 🌟 NÚT 1: NHIỆM VỤ VÀO VÒNG QUAY MAY MẮN
export function SpinMissionButton() {
  return (
    <Link to="/lucky-spin-party" style={{ textDecoration: 'none' }}>
      <button style={{...btnStyles.base, ...btnStyles.spin}}>
        🔥 Vào Vòng Quay Nhận Quà VIP
      </button>
    </Link>
  );
}

// 🌟 NÚT 2: NHIỆM VỤ XEM BỘ SƯU TẬP ẢNH
export function GalleryMissionButton() {
  return (
    <Link to="/gallery" style={{ textDecoration: 'none' }}>
      <button style={{...btnStyles.base, ...btnStyles.gallery}}>
        📸 Lướt Xem Mẫu Tiệc Đẹp (+1 Lượt)
      </button>
    </Link>
  );
}

// Stylesheet nội bộ gọn gàng
const btnStyles = {
  base: { color: '#fff', border: 'none', padding: '12px 26px', fontSize: '14px', fontWeight: 'bold', borderRadius: '25px', cursor: 'pointer' },
  spin: { background: 'linear-gradient(45deg, #00f5d4, #7b2cbf)' },
  gallery: { background: 'linear-gradient(45deg, #ff5400, #ff007f)' }
};
```

<!-- Các bước push dự án đầu lên Git -->

# 1. Khởi tạo Git (nếu dự án mới tinh chưa từng chạy Git)

git init

# 2. Kết nối dự án ở máy với link GitHub của bạn

git remote add origin https://github.com/phucdesign133-collab/phucparty.git

# 3. Gom tất cả các file đã sửa lại chuẩn bị nộp

git add .

# 4. Tạo một ghi chú cho lần nộp này

git commit -m "feat: hoàn thành khung xương và vòng quay may mắn"

# 5. Đẩy code lên nhánh main

git branch -M main
git push -u origin main

<!-- trước khi deploy thì chọn 3 cái này -->

git add .
git commit -m "ghi chú tính năng mới"
git push origin main

<!-- bảng màu đẹp -->

Để vòng quay trông "sang" như bạn muốn, hãy cập nhật vào PRIZES trong data.js:

Basic (Pastel): \* #FCE7F3 (Hồng phấn), #DCFCE7 (Xanh mint), #FEF9C3 (Vàng kem), #DBEAFE (Xanh nhạt).

VIP (Luxury): \* #D4AF37 (Vàng Gold), #4B0082 (Tím hoàng gia), #1A1A1A (Đen sang trọng), #C0C0C0 (Bạc).

Mẹo nhỏ: Khi bạn dùng màu tối (đen/tím đậm) cho VIP, hãy để màu chữ là trắng hoặc vàng đồng, nhìn cực kỳ cao cấp.

//Mã màu
"#00f5d4"
"#e2e8f0"
---------------------------------------------------------------------x---------------------------------------------------------------------
Đây là code css bật tắt tab che toàn màn hình đúng ý tưởng ban đầu:
/_ --- Header.css --- _/

- {
  box-sizing: border-box;
  }

.main-header {
width: 100%;
background-color: #ffffff;
box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
position: sticky;
top: 0;
z-index: 999;
}

.header-container {
max-width: 1400px;
width: 100%;
margin: 0 auto;
padding: 10px 20px;
display: flex;
justify-content: space-between;
align-items: center;
}

.header-logo-wrapper {
cursor: pointer;
display: flex;
align-items: center;
}
.logo-img {
height: 45px;
width: auto;
object-fit: contain;
}

/_ Desktop Navigation _/
.header-nav {
display: flex;
gap: 30px;
}
.nav-link {
font-weight: 600;
font-size: 0.95rem;
color: #333;
cursor: pointer;
transition: color 0.2s;
padding: 5px 0;
}
.nav-link:hover {
color: #6c5ce7;
}

/_ Hamburger Button _/
.hamburger-btn {
display: none;
flex-direction: column;
justify-content: space-between;
width: 26px;
height: 20px;
background: transparent;
border: none;
cursor: pointer;
z-index: 10000;
}
.hamburger-btn .bar {
width: 100%;
height: 3px;
background-color: #333;
border-radius: 5px;
transition: all 0.3s ease;
}

/_ Responsive Mobile _/
@media (max-width: 768px) {
.hamburger-btn {
display: flex;
}

.header-nav {
position: fixed;
top: 0;
right: -100%;
width: 100%;
height: 100vh;
background: #ffffff;
flex-direction: column;
justify-content: center; /_ Căn giữa các item theo chiều dọc _/
align-items: center; /_ Căn giữa các item theo chiều ngang _/
transition: right 0.3s ease;
z-index: 9999;
padding: 20px;
}

.header-nav.nav-open {
right: 0;
}

.nav-link {
font-size: 1.5rem;
margin: 15px 0;
width: 100%;
text-align: center;
}
}
---------------------------------------------------------------------x---------------------------------------------------------------------
Cách deploy mới nhất để tránh lỗi web: (gõ 3 lệnh thay npm run deploy như cũ)
Gõ: git add .
Gõ: git commit -m "Nội dung cập nhật"
Gõ: git push origin main

bear balloon twisting -> cụm từ tìm ảnh dễ dàng

Đổi tên hàng loạt đồng thời đổi định dạng jpg to webp bằng terminal -> bây giờ đang dùng để nén tự động lần 2

$i = 1; Get-ChildItem -Include *.jpg, *.png, *.jpeg, *.jfif -Recurse | ForEach-Object { $newName = "thumb-baomi-$i.webp"; Write-Host "Đang chuyển đổi: $($_.Name) -> $newName"; magick $_.FullName -resize 1200x -quality 75 $newName; $i++ }

Di chuyển ảnh sua khi đổi tên ra ngoài
Move-Item \*.jpg ..

-----x----- 4. Quy trình làm việc hiệu quả nhất:
Lấy ảnh gốc từ máy ảnh/điện thoại bỏ vào một folder.

Chạy script trên (nó sẽ tự động xử lý toàn bộ: Resize về 1200px, nén WebP, xóa file gốc).

Load file .webp vào dự án phucparty.

Cập nhật mảng files trong galleryData.js.
-----x-----

Đổi tên hàng loạt đồng thời đổi định dạng jpg to webp bằng terminal và xóa luôn file .jpg gốc để move nhanh chóng

# Resize, Strip metadata và nén WebP chất lượng 75

$i = 1
Get-ChildItem -Filter *.jpg | ForEach-Object {
    $newName = "logo-brand-a-$i.webp"
Write-Host "Đang xử lý: $($\_.Name)"
magick $_.FullName -resize 1200x -strip -quality 75 $newName
    if (Test-Path $newName) {Remove-Item $_.FullName
        Write-Host "-> Đã xóa file gốc: $($\_.Name)" -ForegroundColor Green} else {Write-Host "-> LỖI: Không tạo được file $newName" -ForegroundColor Red}
$i++
}

# Lọc tất cả các file có đuôi jpg, jpeg, png


# Dùng -Include với mảng rõ ràng hơn
$i = 1

Get-ChildItem -Include *.jpg, *.jpeg, *.png -Recurse | ForEach-Object {
    $newName = "sinhnhat-bedieusan-$i.jpg"
    $originalPath = $_.FullName
    
    Write-Host "Đang xử lý: $($_.Name)..." -ForegroundColor Yellow
    
    try {
        # -auto-orient=false: TẮT tự động xoay
        # -resize 1200x: giữ nguyên tỷ lệ, chiều rộng 1200px
        # -strip: xóa metadata
        # -quality 75: nén dung lượng
        magick.exe $originalPath -define jpeg:auto-orient=false -resize 1200x -strip -quality 75 $newName
        
        # Kiểm tra xem file mới có thực sự tồn tại không
        if (Test-Path $newName) {
            Remove-Item $originalPath
            Write-Host "-> Xong: $newName (Đã xóa file gốc)" -ForegroundColor Green
            $i++
        } else {
            Write-Host "-> LỖI: Không tạo được $newName" -ForegroundColor Red
        }
    } catch {
        Write-Host "-> LỖI khi xử lý $($_.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

----x----Xem dưới dạng đã Build:
npm install -g serve
serve -s dist
----x----Cách lấy file clean của gpt: tự cắt từng phần của code gửi (~200 dòng/lượt)
-> sau khi gửi đủ sẽ nhắn: Đã gửi đủ 3 phần. Refactor toàn bộ và trả lại theo từng phần để copy.

Refactor đoạn code dưới đây.
Giữ nguyên chức năng.
Tách CSS ra file riêng.
Tối ưu logic.
Chỉ trả về code.

...100-200 dòng...

-----x------
*BIỂU DIỄN ẢO THUẬT

_Vest truyền thống 
Sinh nhật + trường học
          1.000.000
Các sự kiện : 1.500.000
( ngày lễ + 500.000)

_Ảo thuật nhân vật 
Tôn ngộ không : 1.500.000
Chư bác giới : 1.500.000
( ngày lễ + 1.000.000)


*ROBOT KHỔNG LỒ 
 ( giá báo khách )

Compo 1
1 con / 1 giờ / 3.000.000
1 con / 2 giờ/ 5.500.000

Compo 2
2 con / 1 giờ / 6.000.000
2 con / 2 với / 10.000.000

( giá anh nhận )

Compo1 
1 con / 1 giờ / 2.500.000
1 con / 2 giờ / 4.000.000

Compo2 
2 con / 1 giờ / 4.500.000
2 con / 2 giờ / 8.000.000


*MÚA LÂN 
2 lân 1 địa 1 thần tài 2.500.000
   _Nếu khách có thêm nhu cầu 
Cộng thêm 2 lân 1.000.000
Cộng thêm múa rồng 1.000.000
Cộng thêm trống hội  1.000.000
( có tặng xiếc + bắn pháo free )


*BONG BÓNG KÍCH NỔ
     (Giá báo khách) 
4 trái lớn : 3.600.000
6 trái lớn : 5.000.000
8 trái lớn : 6.400.000
10 trái lớn : 7.500.000

    (Giá nhận làm)
4 trái lớn : 2.800.000
6 trái lớn : 4.600.000
8 trái lớn : 5.600.000
10 trái lớn :7.000.000
=>> bảng giá chỉ là bóng kích nổ bay lên 
_Bóng rớt từ trên xuống sẽ tính 
Khách là 300.000
Nhận làm 200.000


*KẸO BÔNG GÒN 
    Ngày thường
1H  500.000
    Ngày lễ 
1H  900.000


*TÒ HE 
 Ngày thường 
1h  500.000 - 600.000
 Ngày lễ 
1h  900.000 - 1.000.000


*CHÚ HỀ BB XÀ PHÒNG
    Tiệc sinh nhật 
1.500.000 đến 2.000.000
(Tùy vào xa hay gần )

  Các tiệt event trung thu lễ vv.....
2.500.000 đến 3.000.000
(Tùy thuộc xa gần)

+Nhược điểm của bb show
Hạn chế khu vực diễn gió mưa bảo chổ chật hẹp vv........

+Ưu điểm của bb show 
Tạo ra cơn mưa bong bóng hài hước thú vị vui nhộn cho các bạn nhỏ .........tạo ra bong bóng xà phòng khổng lồn chứa được người để chụp hình ......

------x-------
Báo giá Chương trình Sự kiện tại Phúc Design: (chi phí áp dụng tại Khu vực HCM)

✨ Set 1 (gói cơ bản) - 1.500.000
- Bong bóng tạo hình + chú hề hoạt náo (kiêm MC) / hoặc bong bóng tạo hình + ảo thuật
- Tặng thêm 1 chú hề (tổng cộng 2 chú hề)
- Không giới hạn: Thời gian, Trò chơi, Số lượng bóng tạo hình

✨ Set 2 (gói ảo thuật) - 2.300.000
- Bong bóng tạo hình + chú hề hoạt náo (kiêm MC) + ảo thuật (trị giá 1.000.000)
- Không giới hạn: Thời gian, Trò chơi, Số lượng bóng tạo hình

✨ Set 3 (gói nhiếp ảnh) - 2.600.000
- Bong bóng tạo hình + chú hề hoạt náo (kiêm MC) + nhiếp ảnh xuyên suốt tiệc (trị giá 1.200.000)
- Không giới hạn: Thời gian, Trò chơi, Số lượng bóng tạo hình

✨ Set 4 (gói trang trí) - Liên hệ
- Bong bóng tạo hình + chú hề hoạt náo (kiêm MC) + trang trí (toàn bộ, cổng, sân khấu…)
- Không giới hạn: Thời gian, Trò chơi, Số lượng bóng tạo hình

✨ Set 4 (gói cao cấp) - Liên hệ
- Bong bóng tạo hình + chú hề hoạt náo (kiêm MC) + ảo thuật (trị giá 1.000.000) + nhiếp ảnh xuyên suốt tiệc (trị giá 1.200.000) + trang trí (toàn bộ, cổng, sân khấu…)
- Không giới hạn: Thời gian, Trò chơi, Số lượng bóng tạo hình