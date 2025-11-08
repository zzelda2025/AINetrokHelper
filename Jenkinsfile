pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY_URL = 'register.vinhthai.io.vn/vinhtechlab/ai-network-config-helper/'
        IMAGE_NAME = 'ai-network-config-helper'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        DOCKER_CREDENTIALS_ID = 'devops-k8s'
        KUBECONFIG_CREDENTIALS_ID = 'kubeconfig-k8s'
        GEMINI_API_KEY_ID = 'gemini-api-key'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo "Lấy mã nguồn..."
            }
        }
        
        stage('Inject API Key') {
            steps {
                withCredentials([string(credentialsId: "${GEMINI_API_KEY_ID}", variable: 'GEMINI_API_KEY')]) {
                    sh '''
                        sed -i "s|process.env.API_KEY|\\"${GEMINI_API_KEY}\\"|g" services/geminiService.ts
                    '''
                }
            }
        }
        
        stage('Build and Push Docker Image') {
            steps {
                script {
                    withCredentials([usernamePassword(
                        credentialsId: "${DOCKER_CREDENTIALS_ID}",
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh '''
                            echo $DOCKER_PASS | docker login ${DOCKER_REGISTRY_URL} -u $DOCKER_USER --password-stdin
                            
                            docker build -t ${DOCKER_REGISTRY_URL}${IMAGE_NAME}:${IMAGE_TAG} .
                            docker tag ${DOCKER_REGISTRY_URL}${IMAGE_NAME}:${IMAGE_TAG} ${DOCKER_REGISTRY_URL}${IMAGE_NAME}:latest
                            
                            docker push ${DOCKER_REGISTRY_URL}${IMAGE_NAME}:${IMAGE_TAG}
                            docker push ${DOCKER_REGISTRY_URL}${IMAGE_NAME}:latest
                            
                            docker logout ${DOCKER_REGISTRY_URL}
                        '''
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: "${KUBECONFIG_CREDENTIALS_ID}", variable: 'KUBECONFIG')]) {
                    sh '''
                        export KUBECONFIG=${KUBECONFIG}
                        
                        sed -i "s|image: .*:latest|image: ${DOCKER_REGISTRY_URL}${IMAGE_NAME}:${IMAGE_TAG}|g" k8s/deployment.yaml
                        
                        kubectl apply -f k8s/
                    '''
                }
            }
        }
    }
}
