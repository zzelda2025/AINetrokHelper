// Toàn bộ pipeline cần được bọc trong khối 'pipeline'
pipeline {
    // Chỉ định agent sẽ chạy toàn bộ pipeline
    agent any

    // Định nghĩa các biến môi trường
    environment {
        // Thay 'your-docker-registry' bằng username Docker Hub của bạn
        DOCKER_REGISTRY_URL = 'your-docker-registry'
        IMAGE_NAME = 'ai-network-config-helper'
        IMAGE_TAG = "${env.BUILD_NUMBER}" // Sử dụng số build làm tag

        // ID của credentials đã tạo
        DOCKER_CREDENTIALS_ID = 'docker-hub-credentials'
        KUBECONFIG_CREDENTIALS_ID = 'kubeconfig-credentials'
        GEMINI_API_KEY_ID = 'gemini-api-key'
    }

    // Các stage chính của pipeline
    stages {
        stage('Checkout') {
            steps {
                // Thường tự động thực hiện khi chọn 'Pipeline script from SCM'
                // Nếu không, sử dụng checkout scm
                echo "Lấy mã nguồn..."
            }
        }

        stage('Inject API Key') {
            steps {
                // Lấy Gemini API Key từ Jenkins Credentials
                withCredentials([string(credentialsId: "${GEMINI_API_KEY_ID}", variable: 'GEMINI_API_KEY')]) {
                    // Thay thế 'process.env.API_KEY' bằng API key thật
                    // Lưu ý: Cần đảm bảo file geminiService.ts tồn tại ở đường dẫn này
                    sh "sed -i 's|process.env.API_KEY|\\\"${GEMINI_API_KEY}\\\"|g' services/geminiService.ts"
                }
            }
        }

        stage('Build and Push Docker Image') {
            steps {
                script {
                    // Đăng nhập vào Docker Registry và thực hiện build/push
                    docker.withRegistry("https://${DOCKER_REGISTRY_URL}", DOCKER_CREDENTIALS_ID) {
                        def customImage = docker.build("${DOCKER_REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG}", ".")
                        customImage.push()
                        // Tag latest để dễ dàng deploy
                        customImage.push("latest")
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                // Lấy Kubeconfig file từ Jenkins Credentials
                withCredentials([file(credentialsId: "${KUBECONFIG_CREDENTIALS_ID}", variable: 'KUBECONFIG')]) {
                    // Đặt KUBECONFIG trỏ đến file vừa được tạo
                    sh "export KUBECONFIG=${KUBECONFIG}"
                    
                    // Thực hiện deploy
                    // Lệnh này cần thay thế tag cũ bằng tag mới vừa build
                    sh "sed -i 's|image: .*:latest|image: ${DOCKER_REGISTRY_URL}/${IMAGE_NAME}:${IMAGE_TAG}|g' k8s/deployment.yaml"
                    sh "kubectl apply -f k8s/"
                }
            }
        }
    }
}
