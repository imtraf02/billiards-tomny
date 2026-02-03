# Tài liệu Hệ thống Quản lý Quán Billiards

## Mục lục

1. [Tổng quan hệ thống](#tổng-quan-hệ-thống)
2. [Quản lý người dùng](#quản-lý-người-dùng)
3. [Quản lý bàn chơi](#quản-lý-bàn-chơi)
4. [Quy trình đặt bàn và chơi](#quy-trình-đặt-bàn-và-chơi)
5. [Quản lý sản phẩm và đồ uống](#quản-lý-sản-phẩm-và-đồ-uống)
6. [Quản lý kho](#quản-lý-kho)
7. [Quản lý thu chi](#quản-lý-thu-chi)
8. [Báo cáo và thống kê](#báo-cáo-và-thống-kê)

---

## Tổng quan hệ thống

Hệ thống quản lý quán billiards được thiết kế để xử lý toàn bộ quy trình vận hành từ đặt bàn, tính tiền chơi, bán đồ uống/đồ ăn, quản lý kho hàng đến thu chi và báo cáo doanh thu.

### Các module chính:

- **User Management**: Quản lý tài khoản (Admin, Staff, Customer)
- **Table Management**: Quản lý bàn bi-a
- **Booking System**: Đặt bàn và tính giờ chơi
- **Product & Order**: Bán hàng (đồ ăn, nước uống, phụ kiện)
- **Inventory**: Quản lý kho hàng
- **Transaction & Finance**: Quản lý thu chi
- **Reporting**: Báo cáo thống kê

---

## Quản lý người dùng

### Phân quyền hệ thống

#### 1. ADMIN (Quản lý/Chủ quán)

**Quyền hạn:**

- Xem tất cả báo cáo doanh thu, lợi nhuận
- Quản lý nhân viên (thêm/xóa/sửa Staff)
- Cấu hình giá bàn, sản phẩm
- Quản lý kho hàng (nhập hàng, điều chỉnh)
- Xem lịch sử giao dịch đầy đủ
- Xuất báo cáo tháng/quý/năm

#### 2. STAFF (Nhân viên)

**Quyền hạn:**

- Tạo booking cho khách
- Bắt đầu/kết thúc phiên chơi
- Nhận order đồ ăn/uống
- Thu tiền khách hàng
- Xem thông tin bàn, sản phẩm
- Ghi chú trong ca làm việc

#### 3. CUSTOMER (Khách hàng)

**Quyền hạn:**

- Đăng ký tài khoản
- Đặt bàn online (nếu có tính năng)
- Xem lịch sử chơi của mình
- Tích điểm (nếu có chương trình khách hàng thân thiết)

### Quy trình đăng ký/đăng nhập

```
1. Khách hàng đăng ký:
   - Số điện thoại (bắt buộc, unique)
   - Email (tùy chọn)
   - Tên, mật khẩu
   - Mặc định role = CUSTOMER

2. Admin tạo tài khoản Staff:
   - Nhập thông tin nhân viên
   - Set role = STAFF
   - Cấp quyền truy cập hệ thống
```

---

## Quản lý bàn chơi

### Loại bàn (TableType)

- **POOL**: Bi-a lỗ (8 bi, 9 bi)
- **CAROM**: Bi-a 3 băng/libre
- **SNOOKER**: Bi-a snooker (bàn lớn)

### Trạng thái bàn (TableStatus)

- **AVAILABLE**: Trống, sẵn sàng phục vụ
- **OCCUPIED**: Đang có khách chơi
- **MAINTENANCE**: Đang bảo trì
- **RESERVED**: Đã được đặt trước

### Cấu hình bàn

Mỗi bàn có:

- **Tên bàn**: VD: "Bàn 1", "Pool A", "Carom VIP"
- **Loại bàn**: Pool/Carom/Snooker
- **Giá theo giờ** (hourlyRate): VD: 50,000đ/giờ
- **Trạng thái hiện tại**

### Quy tắc tính tiền theo giờ

```
Công thức cơ bản:
totalAmount = (endTime - startTime) × hourlyRate

Ví dụ:
- Bàn Pool: 40,000đ/giờ
- Chơi từ 14:00 đến 16:30 (2.5 giờ)
- Tiền bàn = 2.5 × 40,000 = 100,000đ

Lưu ý:
- Làm tròn theo phút/15 phút/30 phút tùy quy định quán
- Có thể có giá khác nhau theo khung giờ (giờ vàng/thường)
```

---

## Quy trình đặt bàn và chơi

### Luồng nghiệp vụ chính

#### 1. Khách đến quán (Walk-in)

```
BƯỚC 1: Nhân viên tạo Booking
- Chọn bàn trống (status = AVAILABLE)
- Nhập thông tin khách (hoặc chọn customer có sẵn)
- Booking status = PENDING
- Ghi chú yêu cầu đặc biệt (nếu có)

BƯỚC 2: Bắt đầu chơi
- Nhân viên click "Bắt đầu"
- Tạo BookingTable với startTime = now()
- Cập nhật Table status = OCCUPIED
- Cập nhật Booking status = CONFIRMED

BƯỚC 3: Trong khi chơi
- Khách có thể gọi thêm đồ ăn/uống
- Nhân viên tạo Order liên kết với Booking
- Giao đồ và cập nhật Order status

BƯỚC 4: Kết thúc chơi
- Nhân viên click "Kết thúc"
- Ghi endTime = now()
- Tính tổng tiền bàn
- Tính tổng tiền order (nếu có)
- Tổng thanh toán = tiền bàn + tiền order

BƯỚC 5: Thanh toán
- Khách thanh toán (tiền mặt/chuyển khoản/ví điện tử)
- Tạo Transaction (type = SALE)
- Cập nhật Booking status = COMPLETED
- Cập nhật Table status = AVAILABLE
- In hóa đơn
```

#### 2. Đặt bàn trước (Reservation)

```
BƯỚC 1: Khách đặt bàn
- Chọn ngày giờ
- Chọn loại bàn
- Booking status = PENDING
- Table status = RESERVED (trong khung giờ đặt)

BƯỚC 2: Khách đến đúng giờ
- Nhân viên xác nhận
- Booking status = CONFIRMED
- Bắt đầu chơi như walk-in

BƯỚC 3: Khách không đến (No-show)
- Sau 15-30 phút:
  - Booking status = CANCELLED
  - Table status = AVAILABLE
  - Giải phóng bàn cho khách khác
```

### Cơ chế BookingTable

Một Booking có thể sử dụng nhiều bàn (khách chơi nhiều bàn cùng lúc):

```
Booking #123
├── BookingTable #1 (Bàn Pool A)
│   ├── startTime: 14:00
│   ├── endTime: 16:00
│   ├── priceSnapshot: 40,000đ/giờ
│   └── Subtotal: 80,000đ
│
└── BookingTable #2 (Bàn Pool B)
    ├── startTime: 14:30
    ├── endTime: 16:00
    ├── priceSnapshot: 40,000đ/giờ
    └── Subtotal: 60,000đ

Total Booking Amount: 140,000đ
```

**Lý do lưu priceSnapshot:**

- Giá bàn có thể thay đổi theo thời gian
- Lưu lại giá tại thời điểm chơi để tránh tranh chấp
- Đảm bảo tính minh bạch trong lịch sử giao dịch

---

## Quản lý sản phẩm và đồ uống

### Phân loại sản phẩm (Category)

Ví dụ các danh mục:

- Nước ngọt
- Bia
- Nước suối
- Snack
- Phụ kiện (phấn, găng tay, ...)
- Đồ ăn nhanh

### Thông tin sản phẩm (Product)

```
Ví dụ: Coca Cola lon
├── Tên: Coca Cola 330ml
├── Danh mục: Nước ngọt
├── Giá bán: 15,000đ
├── Giá vốn: 10,000đ
├── Tồn kho hiện tại: 50 lon
├── Tồn kho tối thiểu: 10 lon (cảnh báo khi < 10)
├── Đơn vị tính: lon
└── Trạng thái: Còn hàng
```

### Quy trình đặt hàng (Order)

#### 1. Order độc lập (không liên kết Booking)

```
Trường hợp: Khách vào mua đồ không chơi bàn

BƯỚC 1: Nhân viên tạo Order
- Không có bookingId
- Chọn sản phẩm và số lượng
- Order status = PENDING

BƯỚC 2: Chuẩn bị và giao hàng
- Order status = PREPARING
- Giao cho khách
- Order status = DELIVERED

BƯỚC 3: Thanh toán
- Tạo Transaction (type = SALE)
- Trừ kho tự động
- In hóa đơn
```

#### 2. Order liên kết Booking

```
Trường hợp: Khách đang chơi bàn gọi thêm đồ

BƯỚC 1: Nhân viên tạo Order
- bookingId = ID của booking đang chơi
- Chọn sản phẩm
- Order status = PENDING

BƯỚC 2: Giao đồ
- Giao tới bàn khách đang chơi
- Order status = DELIVERED

BƯỚC 3: Thanh toán
- Tính cùng lúc khi thanh toán bàn
- Hoặc thanh toán riêng nếu khách yêu cầu
```

### Cơ chế lưu giá (Snapshot)

Tại sao cần `priceSnapshot` và `costSnapshot`?

```
OrderItem lưu lại:
- priceSnapshot: Giá bán tại thời điểm order
- costSnapshot: Giá vốn tại thời điểm order

Lý do:
1. Giá sản phẩm thay đổi theo thời gian
2. Cần tính chính xác lợi nhuận trong quá khứ
3. Tránh sai lệch khi xuất báo cáo

Ví dụ:
- Hôm nay: Coca = 15,000đ (giá vốn 10,000đ)
- Tuần sau: Coca = 18,000đ (giá vốn 12,000đ)
- Order hôm nay vẫn lưu 15,000đ để báo cáo đúng
```

---

## Quản lý kho

### Cơ chế nhập/xuất kho

Hệ thống sử dụng **InventoryLog** để ghi lại mọi thay đổi tồn kho.

#### 1. Nhập hàng (IN)

```
BƯỚC 1: Admin/Staff nhập hàng
- Chọn sản phẩm
- Nhập số lượng (VD: +50 lon)
- Nhập giá nhập (unitCost = 9,000đ/lon)
- Lý do (reason = "purchase")
- Ghi chú: "Nhập từ nhà cung cấp ABC"

BƯỚC 2: Hệ thống ghi log
InventoryLog:
- type: "IN"
- quantity: +50
- unitCost: 9,000đ
- stockBefore: 20 (tồn kho trước)
- stockAfter: 70 (tồn kho sau)
- createdAt: timestamp

BƯỚC 3: Cập nhật Product
- currentStock: 70
- cost: 9,000đ (cập nhật giá vốn mới)

BƯỚC 4: Tạo Transaction (tùy chọn)
- type: PURCHASE
- amount: 50 × 9,000 = 450,000đ
- description: "Nhập hàng Coca Cola"
```

#### 2. Xuất kho khi bán hàng (OUT)

```
Tự động khi Order được thanh toán:

BƯỚC 1: Khách mua 2 lon Coca
- OrderItem: quantity = 2

BƯỚC 2: Hệ thống tự động ghi log
InventoryLog:
- type: "OUT"
- quantity: -2
- reason: "sale"
- stockBefore: 70
- stockAfter: 68
- Liên kết với OrderItem/Order

BƯỚC 3: Cập nhật Product
- currentStock: 68
```

#### 3. Điều chỉnh kho (ADJUSTMENT)

```
Trường hợp: Kiểm kê phát hiện sai lệch, hàng hỏng, hết hạn

BƯỚC 1: Admin điều chỉnh
- Chọn sản phẩm
- Nhập số lượng thay đổi (VD: -5)
- Lý do (reason = "damaged")
- Ghi chú: "5 lon bị móp méo"

BƯỚC 2: Ghi log
InventoryLog:
- type: "OUT"
- quantity: -5
- reason: "adjustment"
- note: "Hàng hỏng"
- stockBefore: 68
- stockAfter: 63
```

### Cảnh báo tồn kho

```
Hệ thống kiểm tra:
if (currentStock < minStock) {
  → Cảnh báo "Sắp hết hàng"
  → Gửi thông báo cho Admin
  → Hiển thị badge đỏ trên dashboard
}

Ví dụ:
- Coca Cola: currentStock = 8, minStock = 10
- ⚠️ Cảnh báo: Cần nhập thêm hàng
```

---

## Quản lý thu chi

### Các loại giao dịch (TransactionType)

#### 1. SALE - Doanh thu bán hàng

```
Nguồn thu từ:
- Khách chơi bàn (liên kết Booking)
- Khách mua đồ (liên kết Order)

Ví dụ:
Transaction:
- type: SALE
- amount: 200,000đ
- paymentMethod: CASH
- bookingId: "abc123"
- description: "Thanh toán bàn Pool A - 2.5 giờ"
```

#### 2. PURCHASE - Chi phí nhập hàng

```
Khi nhập hàng vào kho:

Transaction:
- type: PURCHASE
- amount: 5,000,000đ
- paymentMethod: TRANSFER
- description: "Nhập 500 lon nước ngọt"
- userId: admin_id
```

#### 3. EXPENSE - Chi phí vận hành

```
Các khoản chi khác:
- Tiền điện, nước
- Lương nhân viên
- Sửa chữa bàn, thiết bị
- Thuê mặt bằng

Ví dụ:
Transaction:
- type: EXPENSE
- amount: 10,000,000đ
- description: "Tiền điện tháng 1"
- paymentMethod: TRANSFER
```

#### 4. REVENUE - Thu nhập khác

```
Nguồn thu ngoài bán hàng:
- Thu từ quảng cáo
- Cho thuê không gian event
- Bán thẻ thành viên

Transaction:
- type: REVENUE
- amount: 3,000,000đ
- description: "Thu từ event cuối tuần"
```

#### 5. REFUND - Hoàn trả

```
Trường hợp:
- Khách hủy booking có cọc
- Trả lại tiền do sai sót

Transaction:
- type: REFUND
- amount: -100,000đ (số âm)
- description: "Hoàn tiền booking bị hủy"
- bookingId: "xyz789"
```

#### 6. ADJUSTMENT - Điều chỉnh

```
Trường hợp:
- Điều chỉnh sổ sách
- Ghi nhận chênh lệch kiểm quỹ

Transaction:
- type: ADJUSTMENT
- amount: 50,000đ
- description: "Điều chỉnh chênh lệch kiểm quỹ"
```

### Phương thức thanh toán (PaymentMethod)

- **CASH**: Tiền mặt
- **CARD**: Thẻ tín dụng/ghi nợ
- **TRANSFER**: Chuyển khoản ngân hàng
- **MOMO**: Ví MoMo
- **ZALOPAY**: Ví ZaloPay

### Quy trình ghi nhận giao dịch

```
Mỗi khi có tiền vào/ra:

1. Tạo Transaction record
   - Chọn type phù hợp
   - Nhập số tiền
   - Chọn phương thức thanh toán
   - Ghi description rõ ràng
   - Liên kết với Booking/Order (nếu có)
   - Ghi nhận userId (người thực hiện)

2. Hệ thống timestamp tự động
   - createdAt: thời điểm giao dịch
   - updatedAt: lần sửa cuối (nếu có)

3. Không được xóa Transaction
   - Chỉ có thể tạo Transaction điều chỉnh/hoàn trả
   - Đảm bảo audit trail đầy đủ
```

---

## Báo cáo và thống kê

### Báo cáo theo tháng (MonthlyReport)

Hệ thống tự động tổng hợp hoặc Admin có thể tạo thủ công:

```
MonthlyReport - Tháng 1/2024:

THU NHẬP:
├── Tổng doanh thu: 50,000,000đ
├── ├── Doanh thu từ bàn: 35,000,000đ
├── └── Doanh thu từ sản phẩm: 15,000,000đ
│
CHI PHÍ:
├── Tổng chi phí: 30,000,000đ
├── ├── Chi phí nhập hàng: 8,000,000đ
├── └── Chi phí khác: 22,000,000đ
│       ├── Lương: 15,000,000đ
│       ├── Điện nước: 4,000,000đ
│       └── Khác: 3,000,000đ
│
KẾT QUẢ:
├── Lãi gộp: 20,000,000đ
├── Lãi ròng (sau trừ chi phí): 20,000,000đ
└── Số sản phẩm đã bán: 1,250 món
```

### Cách tính các chỉ số

#### 1. Doanh thu từ bàn (tableRevenue)

```sql
SELECT SUM(totalAmount)
FROM Booking
WHERE status = 'COMPLETED'
  AND MONTH(createdAt) = 1
  AND YEAR(createdAt) = 2024
```

#### 2. Doanh thu từ sản phẩm (productRevenue)

```sql
SELECT SUM(oi.priceSnapshot * oi.quantity)
FROM OrderItem oi
JOIN Order o ON oi.orderId = o.id
WHERE o.status IN ('DELIVERED', 'COMPLETED')
  AND MONTH(o.createdAt) = 1
  AND YEAR(o.createdAt) = 2024
```

#### 3. Chi phí nhập hàng (purchaseExpense)

```sql
SELECT SUM(amount)
FROM Transaction
WHERE type = 'PURCHASE'
  AND MONTH(createdAt) = 1
  AND YEAR(createdAt) = 2024
```

#### 4. Lãi gộp (Gross Profit)

```
Lãi gộp = Doanh thu bán hàng - Giá vốn hàng bán

Ví dụ:
- Bán 100 lon Coca @ 15,000đ = 1,500,000đ
- Giá vốn 100 lon @ 10,000đ = 1,000,000đ
- Lãi gộp = 500,000đ
```

#### 5. Lãi ròng (Net Profit)

```
Lãi ròng = Tổng thu - Tổng chi

Tổng thu = SALE + REVENUE
Tổng chi = PURCHASE + EXPENSE

Net Profit = (50,000,000 + 0) - (8,000,000 + 22,000,000)
           = 20,000,000đ
```

### Các báo cáo thường dùng

#### 1. Báo cáo doanh thu theo ngày

```
Mục đích: Theo dõi hoạt động kinh doanh hàng ngày

Nội dung:
- Số lượng booking
- Số giờ chơi
- Doanh thu bàn
- Doanh thu sản phẩm
- Tổng doanh thu
- So sánh với ngày trước
```

#### 2. Báo cáo sản phẩm bán chạy

```sql
SELECT
  p.name,
  SUM(oi.quantity) as totalSold,
  SUM(oi.priceSnapshot * oi.quantity) as revenue,
  SUM((oi.priceSnapshot - oi.costSnapshot) * oi.quantity) as profit
FROM OrderItem oi
JOIN Product p ON oi.productId = p.id
GROUP BY p.id
ORDER BY totalSold DESC
LIMIT 10
```

#### 3. Báo cáo hiệu suất bàn

```
Mỗi bàn thống kê:
- Số giờ sử dụng trong tháng
- Doanh thu tạo ra
- Tỷ lệ sử dụng (%)
- Doanh thu trung bình/giờ

Mục đích: Đánh giá bàn nào hiệu quả, bàn nào ế
```

#### 4. Báo cáo tồn kho

```
Danh sách sản phẩm:
- Tên sản phẩm
- Tồn kho hiện tại
- Tồn kho tối thiểu
- Giá trị tồn kho (số lượng × giá vốn)
- Cảnh báo (nếu < minStock)
```

#### 5. Báo cáo nhân viên

```
Mỗi nhân viên:
- Số booking xử lý
- Số order xử lý
- Tổng doanh thu mang lại
- Số ca làm việc

Mục đích: Đánh giá hiệu suất, tính lương thưởng
```

---

## Các luồng nghiệp vụ đặc biệt

### 1. Chuyển bàn giữa chừng

```
Tình huống: Khách đang chơi Bàn 1, muốn chuyển sang Bàn 2

BƯỚC 1: Nhân viên kết thúc BookingTable hiện tại
- BookingTable (Bàn 1):
  - endTime = now()
  - Tính tiền đã chơi

BƯỚC 2: Tạo BookingTable mới
- BookingTable (Bàn 2):
  - startTime = now()
  - Cùng bookingId

BƯỚC 3: Cập nhật trạng thái
- Bàn 1: AVAILABLE
- Bàn 2: OCCUPIED

Kết quả: Booking vẫn giữ nguyên, chỉ tạo thêm BookingTable
```

### 2. Tạm dừng và tiếp tục

```
Tình huống: Khách nghỉ giữa giờ, muốn giữ bàn

BƯỚC 1: Nhân viên tạm dừng
- Lưu pausedAt = now()
- Bàn vẫn OCCUPIED (không cho khách khác dùng)
- Có thể đánh dấu "Đang tạm dừng"

BƯỚC 2: Khách quay lại
- Tính thời gian = (pausedAt - startTime) + (endTime - resumedAt)
- Hoặc vẫn tính cả lúc nghỉ (tùy chính sách quán)

BƯỚC 3: Kết thúc bình thường
```

### 3. Hủy booking có hoàn tiền

```
Tình huống: Khách đặt trước có cọc, sau đó hủy

BƯỚC 1: Khách đặt bàn
- Booking status = PENDING
- Transaction (cọc):
  - type: SALE
  - amount: 50,000đ
  - description: "Đặt cọc booking"

BƯỚC 2: Khách hủy
- Booking status = CANCELLED
- Transaction (hoàn tiền):
  - type: REFUND
  - amount: -50,000đ
  - description: "Hoàn cọc do hủy booking"

BƯỚC 3: Giải phóng bàn
- Table status = AVAILABLE
```

### 4. Xử lý khách bỏ đi không thanh toán

```
Tình huống: Khách chơi xong nhưng bỏ đi

BƯỚC 1: Nhân viên phát hiện
- Vẫn kết thúc Booking bình thường
- Tính tổng tiền

BƯỚC 2: Ghi nhận công nợ (nếu có thông tin khách)
- Tạo Transaction type = SALE với note "Chưa thanh toán"
- Đánh dấu khách hàng có nợ
- Liên hệ đòi tiền

BƯỚC 3: Nếu không có thông tin khách
- Ghi nhận thiệt hại
- Transaction type = EXPENSE
- Description: "Khách bỏ trốn - Bàn 3"
```

---

## Best Practices

### 1. Quản lý ca làm việc

```
Mỗi ca làm việc:
- Nhân viên đăng nhập đầu ca
- Ghi nhận tiền mặt đầu ca
- Trong ca: Xử lý booking, order, thanh toán
- Cuối ca: Kiểm quỹ
  - Đếm tiền mặt thực tế
  - So sánh với Transaction trong ca
  - Ghi nhận chênh lệch (nếu có)
```

### 2. Sao lưu dữ liệu

```
- Backup database hàng ngày
- Lưu trữ ít nhất 30 ngày
- Export báo cáo tháng sang file (PDF/Excel)
- Lưu hóa đơn, chứng từ quan trọng
```

### 3. Bảo mật

```
- ADMIN: Mật khẩu mạnh, đổi định kỳ
- STAFF: Mỗi người một tài khoản riêng
- Không share mật khẩu
- Log mọi thao tác quan trọng (Transaction, Inventory)
```

### 4. Kiểm kê định kỳ

```
Mỗi tháng/quý:
- Kiểm đếm tồn kho thực tế
- So sánh với currentStock trong hệ thống
- Điều chỉnh nếu có sai lệch
- Ghi rõ lý do (hỏng, mất, sai sót nhập liệu...)
```

### 5. Chính sách giá

```
- Giá giờ vàng (18h-22h): +20%
- Giờ thấp điểm (9h-14h): -10%
- Khách quen/thành viên: Giảm giá cố định
- Gói giờ chơi (10 giờ): Chiết khấu 15%
```

---

## Kết luận

Hệ thống được thiết kế với các nguyên tắc:

1. **Tính minh bạch**: Mọi giao dịch đều có log, audit trail
2. **Tính chính xác**: Snapshot giá để tính toán đúng lợi nhuận
3. **Tính linh hoạt**: Hỗ trợ nhiều kịch bản nghiệp vụ khác nhau
4. **Tính mở rộng**: Dễ dàng thêm tính năng mới (loyalty, promotion...)
5. **Tính bảo mật**: Phân quyền rõ ràng, bảo vệ dữ liệu quan trọng

Hệ thống có thể tùy chỉnh theo nhu cầu cụ thể của từng quán billiards.
