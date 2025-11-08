# Sử dụng image nginx:alpine gọn nhẹ làm image cuối cùng
FROM nginx:1.25-alpine

# Xóa file cấu hình mặc định của nginx
RUN rm /etc/nginx/conf.d/default.conf

# Sao chép file cấu hình nginx tùy chỉnh của chúng ta
COPY nginx.conf /etc/nginx/conf.d/

# Sao chép tất cả tài sản của ứng dụng từ thư mục hiện tại
# vào thư mục public html của nginx.
COPY . /usr/share/nginx/html

# Mở cổng 80 ra bên ngoài
EXPOSE 80

# Lệnh để chạy nginx ở chế độ foreground
CMD ["nginx", "-g", "daemon off;"]
