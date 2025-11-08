# AI Network Config Helper.

Trợ lý AI dành cho kỹ sư mạng để tạo, phân tích và so sánh cấu hình thiết bị Cisco bằng Gemini API.

## Hướng dẫn triển khai với Jenkins và Kubernetes

Tài liệu này hướng dẫn cách thiết lập một pipeline CI/CD tự động bằng Jenkins để build ứng dụng React, đóng gói vào Docker image, và triển khai lên một cluster Kubernetes.

### Yêu cầu

1.  **Jenkins Server**: Đã cài đặt các plugin: `Pipeline`, `Docker Pipeline`, `Kubernetes CLI`, `Credentials Binding`.
2.  **Docker**: Cài đặt trên agent của Jenkins.
3.  **Kubernetes Cluster**: Một cluster đang hoạt động (ví dụ: Minikube, GKE, EKS).
4.  **`kubectl`**: Cài đặt trên agent của Jenkins và được cấu hình để kết nối tới cluster.
5.  **Docker Registry**: Một tài khoản registry để lưu trữ Docker image (ví dụ: Docker Hub).
6.  **Mã nguồn**: Lưu trữ trên Git.

---

### Bước 1: Container hóa ứng dụng với Docker

Để chạy ứng dụng trên Kubernetes, trước tiên chúng ta cần đóng gói nó vào một Docker image. Vì đây là một ứng dụng frontend tĩnh, chúng ta sẽ sử dụng Nginx để phục vụ các file.

#### `Dockerfile`

File `Dockerfile` sau đây sẽ tạo một image chứa Nginx và các file mã nguồn của ứng dụng.

```dockerfile
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
```

#### `nginx.conf`

Chúng ta cần một file cấu hình Nginx (`nginx.conf`) để đảm bảo các request được định tuyến đúng cách cho một Single Page Application (SPA) và các file `.tsx` được phục vụ với đúng `Content-Type`.

```nginx
server {
    listen 80;
    server_name localhost;

    # Thư mục gốc chứa các file tĩnh
    root /usr/share/nginx/html;
    # File mặc định để phục vụ
    index index.html;

    # Cấu hình định tuyến cho Single Page Application (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Khai báo tường minh MIME type cho các file .tsx
    types {
      application/javascript ts tsx;
    }
}
```

---

### Bước 2: Cấu hình Jenkins Credentials

Bạn cần tạo ba loại credentials trong Jenkins.

1.  **Docker Registry Credentials** (`docker-hub-credentials`):
    *   **Kind**: `Username with password`.
    *   **ID**: `docker-hub-credentials`.
2.  **Kubernetes `kubeconfig` Credentials** (`kubeconfig-credentials`):
    *   **Kind**: `Secret file`.
    *   **File**: Tải lên file `~/.kube/config` của bạn.
    *   **ID**: `kubeconfig-credentials`.
3.  **Gemini API Key** (`gemini-api-key`):
    *   **Kind**: `Secret text`.
    *   **Secret**: Dán Gemini API key của bạn vào đây.
    *   **ID**: `gemini-api-key`.

---

### Bước 3: Cập nhật `Jenkinsfile`

Cập nhật các biến môi trường ở đầu file `Jenkinsfile` để khớp với thông tin của bạn.

```groovy
environment {
    // Thay 'your-docker-registry' bằng username Docker Hub của bạn
    DOCKER_REGISTRY_URL = 'your-docker-registry'
    IMAGE_NAME = 'ai-network-config-helper'

    // ID của credentials bạn đã tạo ở Bước 2
    DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'
    KUBECONFIG_CREDENTIALS_ID = 'kubeconfig-credentials'
    GEMINI_API_KEY_ID = 'gemini-api-key'
}
```

#### Xử lý API Key trong Pipeline

Mã nguồn sử dụng `process.env.API_KEY` để lấy API key, nhưng biến này không tồn tại trong môi trường trình duyệt. **Bước quan trọng nhất** là pipeline CI/CD phải thay thế chuỗi này bằng key thật trước khi build Docker image.

`Jenkinsfile` sẽ có một stage để thực hiện việc này bằng lệnh `sed`:

```groovy
stage('Inject API Key') {
    steps {
        script {
            // Thay thế 'process.env.API_KEY' bằng API key thật từ Jenkins Credentials
            // trong file geminiService.ts.
            sh "sed -i 's|process.env.API_KEY|\\\"${GEMINI_API_KEY}\\\"|g' services/geminiService.ts"
        }
    }
}
```
Stage này phải được chạy **trước** stage 'Build Docker Image'.

---

### Bước 4: Tạo Pipeline Job trong Jenkins

1.  Tạo một **New Item** mới, chọn **Pipeline**.
2.  Trong tab **Pipeline**, cấu hình **Definition** là `Pipeline script from SCM`.
3.  Chọn **Git** và nhập URL repository của bạn.
4.  Lưu lại.

### Bước 5: Chạy Pipeline và Xác minh

1.  Click **Build Now** để chạy pipeline. Jenkins sẽ thực hiện các stage:
    *   **Checkout**: Lấy mã nguồn.
    *   **Inject API Key**: Thay thế placeholder API key.
    *   **Build Docker Image**: Build image.
    *   **Push Docker Image**: Đẩy image lên registry.
    *   **Deploy to Kubernetes**: Áp dụng các file manifest trong thư mục `k8s/`.

2.  Sau khi pipeline thành công, xác minh trên Kubernetes:
    *   **Kiểm tra Pods**:
        ```sh
        kubectl get pods -l app=ai-network-config-helper
        ```
        Bạn sẽ thấy các pod đang ở trạng thái `Running`.

    *   **Truy cập ứng dụng**:
        Service đang chạy với loại `ClusterIP`, chỉ có thể truy cập nội bộ. Để kiểm thử, hãy sử dụng port-forwarding:
        ```sh
        kubectl port-forward svc/ai-network-config-helper-svc 8080:80
        ```
        Bây giờ, mở trình duyệt và truy cập `http://localhost:8080` để xem ứng dụng.

Chúc mừng! Bạn đã triển khai thành công ứng dụng bằng một pipeline CI/CD hoàn chỉnh.
