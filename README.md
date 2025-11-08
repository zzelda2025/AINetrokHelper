# AI Network Config Helper

Trợ lý AI dành cho kỹ sư mạng để tạo, phân tích và so sánh cấu hình thiết bị Cisco bằng Gemini API.

## Hướng dẫn triển khai với Jenkins và Kubernetes

Tài liệu này hướng dẫn cách thiết lập một pipeline CI/CD tự động bằng Jenkins để build ứng dụng React, đóng gói vào Docker image, và triển khai lên một cluster Kubernetes.

### Yêu cầu

Trước khi bắt đầu, bạn cần chuẩn bị:

1.  **Jenkins Server**: Một Jenkins server đang hoạt động với các plugin sau được cài đặt:
    *   `Pipeline`
    *   `Docker Pipeline`
    *   `Kubernetes CLI`
    *   `Credentials Binding`
2.  **Docker**: Docker phải được cài đặt trên agent của Jenkins (hoặc trên chính Jenkins server nếu agent là master).
3.  **Kubernetes Cluster**: Một cluster Kubernetes đang hoạt động (ví dụ: Minikube, kind, GKE, EKS).
4.  **`kubectl`**: `kubectl` phải được cài đặt trên agent của Jenkins và được cấu hình để kết nối tới cluster của bạn.
5.  **Docker Registry**: Một tài khoản registry để lưu trữ Docker image (ví dụ: Docker Hub, Google Container Registry).
6.  **Mã nguồn**: Mã nguồn của dự án được lưu trữ trên một hệ thống quản lý phiên bản như Git.

### Bước 1: Cấu hình Jenkins Credentials

Bạn cần tạo hai credentials trong Jenkins để pipeline có thể xác thực với Docker Registry và Kubernetes Cluster.

1.  **Docker Registry Credentials**:
    *   Đi tới **Manage Jenkins** -> **Credentials**.
    *   Chọn store và domain phù hợp, sau đó click **Add Credentials**.
    *   **Kind**: `Username with password`.
    *   **Username**: Tên người dùng Docker Hub hoặc registry của bạn.
    *   **Password**: Mật khẩu hoặc access token của bạn.
    *   **ID**: `docker-hub-credentials` (Hoặc một ID khác, nhưng bạn phải cập nhật nó trong `Jenkinsfile`).
    *   Lưu lại.

2.  **Kubernetes `kubeconfig` Credentials**:
    *   Đi tới **Manage Jenkins** -> **Credentials**.
    *   Click **Add Credentials**.
    *   **Kind**: `Secret file`.
    *   **File**: Tải lên file `kubeconfig` của bạn. File này thường nằm ở `~/.kube/config`.
    *   **ID**: `kubeconfig-credentials` (Hoặc một ID khác, nhưng bạn phải cập nhật nó trong `Jenkinsfile`).
    *   Lưu lại.

### Bước 2: Cập nhật `Jenkinsfile`

File `Jenkinsfile` trong thư mục gốc của dự án định nghĩa các bước của pipeline. Bạn cần cập nhật một số biến môi trường ở đầu file:

```groovy
environment {
    // Thay 'your-docker-registry' bằng username Docker Hub của bạn
    // hoặc URL tới registry riêng của bạn.
    DOCKER_REGISTRY_URL = 'your-docker-registry'

    // ID của credentials Docker bạn đã tạo ở Bước 1.
    DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'

    // ID của credentials kubeconfig bạn đã tạo ở Bước 1.
    KUBECONFIG_CREDENTIALS_ID = 'kubeconfig-credentials'
    // ...
}
```

### Bước 3: Tạo Pipeline Job trong Jenkins

1.  Trên giao diện Jenkins, click **New Item**.
2.  Đặt tên cho job của bạn (ví dụ: `ai-network-helper-pipeline`).
3.  Chọn **Pipeline** và click **OK**.
4.  Trong phần cấu hình job, đi tới tab **Pipeline**.
5.  **Definition**: Chọn `Pipeline script from SCM`.
6.  **SCM**: Chọn `Git`.
7.  **Repository URL**: Nhập URL của repository Git chứa mã nguồn của bạn.
8.  **Branch Specifier**: `*/main` hoặc `*/master` tùy theo nhánh chính của bạn.
9.  **Script Path**: Mặc định là `Jenkinsfile`. Giữ nguyên nếu file của bạn có tên này và nằm ở thư mục gốc.
10. Click **Save**.

### Bước 4: Chạy Pipeline

Sau khi đã lưu job, click vào **Build Now** để kích hoạt pipeline. Jenkins sẽ thực hiện các bước sau:

1.  **Checkout**: Lấy mã nguồn từ repository Git.
2.  **Build Docker Image**: Build một Docker image từ `Dockerfile` của dự án. Image sẽ được tag với số build của Jenkins (ví dụ: `your-docker-registry/ai-network-config-helper:build-1`).
3.  **Push Docker Image**: Đẩy image vừa build lên Docker Registry đã cấu hình.
4.  **Deploy to Kubernetes**:
    *   Sử dụng `kubectl` để kết nối tới cluster Kubernetes.
    *   Cập nhật file `k8s/deployment.yaml` để sử dụng image mới nhất.
    *   Áp dụng các manifest trong thư mục `k8s/` (`service.yaml` và `deployment.yaml`) để triển khai hoặc cập nhật ứng dụng.

### Bước 5: Xác minh triển khai

Sau khi pipeline hoàn tất thành công, bạn có thể kiểm tra trạng thái triển khai trên cluster Kubernetes.

1.  **Kiểm tra Pods**:
    ```sh
    kubectl get pods -l app=ai-network-config-helper
    ```
    Bạn sẽ thấy các pod đang ở trạng thái `Running`.

2.  **Kiểm tra Service**:
    ```sh
    kubectl get service ai-network-config-helper-svc
    ```
    Bạn sẽ thấy service đã được tạo với loại là `ClusterIP`.

3.  **Truy cập ứng dụng**:
    Vì service có loại là `ClusterIP`, nó chỉ có thể được truy cập từ bên trong cluster. Để truy cập từ máy local của bạn cho mục đích kiểm thử, bạn có thể sử dụng port-forwarding:
    ```sh
    kubectl port-forward svc/ai-network-config-helper-svc 8080:80
    ```
    Bây giờ, bạn có thể mở trình duyệt và truy cập vào `http://localhost:8080` để xem ứng dụng.

Chúc mừng! Bạn đã triển khai thành công ứng dụng AI Network Config Helper bằng pipeline CI/CD tự động.
