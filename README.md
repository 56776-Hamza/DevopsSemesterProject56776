# 🚀 Node.js on Kubernetes — AWS Free Tier CI/CD Project

Deploying a Node.js web application on AWS Free Tier using Docker, Kubernetes (Minikube on EC2), Amazon ECR, and a fully automated GitHub Actions CI/CD pipeline.

---

## 📁 Project Structure

```
project-root/
├── app.js                          # Node.js Express application
├── package.json
├── Dockerfile                      # Docker image definition
├── .dockerignore
├── README.md
├── k8s/
│   ├── deployment.yaml             # Kubernetes Deployment
│   └── service.yaml                # Kubernetes NodePort Service
└── .github/
    └── workflows/
        └── deploy.yml              # GitHub Actions CI/CD pipeline
```

---

## ⚙️ Prerequisites (Local Machine)

- Node.js 18+
- Docker Desktop
- AWS CLI
- Git
- AWS Free Tier account
- GitHub account

---

## 🏗️ Phase 1 — Local Development

```bash
npm install
node app.js
# Visit http://localhost:3000
```

---

## 🐳 Phase 2 — Docker Build & Test

```bash
docker build -t nodejs-k8s-app .
docker run -p 3000:3000 nodejs-k8s-app
# Visit http://localhost:3000
curl http://localhost:3000/health
```

---

## ☁️ Phase 3 — Amazon ECR Setup

```bash
# Set your variables
export AWS_ACCOUNT_ID=123456789012
export AWS_REGION=us-east-1
export ECR_REPOSITORY_NAME=nodejs-k8s-app

# Create ECR repository
aws ecr create-repository \
  --repository-name $ECR_REPOSITORY_NAME \
  --region $AWS_REGION

# Authenticate Docker with ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Build, tag, and push
docker build -t $ECR_REPOSITORY_NAME .
docker tag $ECR_REPOSITORY_NAME:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME:latest
docker push \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPOSITORY_NAME:latest
```

---

## 🖥️ Phase 4 — EC2 Setup (Ubuntu 22.04 t2.micro)

SSH into your EC2 instance, then run:

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
sudo apt-get install -y docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
newgrp docker

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -sL https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Install Minikube
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Install AWS CLI
sudo apt-get install -y awscli

# Start Minikube with Docker driver
minikube start --driver=docker

# Verify cluster
kubectl get nodes
kubectl get pods -A
```

---

## 🚢 Phase 5 — Deploy to Kubernetes

```bash
# Authenticate ECR on EC2
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com

# Pull image into Minikube
minikube image load $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/nodejs-k8s-app:latest

# Apply manifests
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml

# Verify
kubectl get pods
kubectl get services

# Get NodePort and access app
minikube service nodejs-service --url
# Or: http://EC2_PUBLIC_IP:30080
```

---

## 🔑 Phase 6 — GitHub Secrets

Add these in: **Settings → Secrets → Actions**

| Secret | Purpose |
|--------|---------|
| `AWS_ACCESS_KEY_ID` | IAM user access key for AWS CLI authentication |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `AWS_REGION` | AWS region where ECR and EC2 are running (e.g. us-east-1) |
| `AWS_ACCOUNT_ID` | 12-digit AWS account ID for ECR image URI |
| `EC2_HOST` | Public IP address of your EC2 instance |
| `EC2_USERNAME` | SSH login username (ubuntu for Ubuntu AMIs) |
| `EC2_SSH_KEY` | Private SSH key (.pem file contents) to authenticate with EC2 |

---

## 🔄 Phase 7 — CI/CD Pipeline

Push to `main` branch → pipeline runs automatically:

1. Checkout code
2. Build Docker image
3. Push to Amazon ECR
4. SSH into EC2
5. Pull new image
6. `kubectl rollout restart deployment/nodejs-app`
7. Verify rollout status

---

## 📊 Testing Commands

```bash
# Health check
curl http://localhost:3000/health

# Kubernetes
kubectl get pods
kubectl get services
kubectl logs deployment/nodejs-app

# Scaling
kubectl scale deployment nodejs-app --replicas=2
kubectl get pods   # Should show 2 running pods
```

---

## 💰 Cost Analysis

| Resource | Free Tier Limit | Used | Cost |
|----------|----------------|------|------|
| EC2 t2.micro | 750 hrs/month | ~720 hrs | $0 |
| Amazon ECR | 500 MB storage | ~50 MB | $0 |
| GitHub Actions | 2000 min/month | ~20 min | $0 |
| Minikube | Free (local K8s) | — | $0 |
| **Total** | | | **$0** |

---

## 🏛️ Architecture

```
Developer (Local Machine)
        │
        ▼
  GitHub Repository
  (push to main)
        │
        ▼
  GitHub Actions
  CI/CD Pipeline
        │
   ┌────┴────┐
   ▼         ▼
Build      Push
Docker     to ECR
Image      (Amazon)
   └────┬────┘
        │
        ▼
    SSH to EC2
    t2.micro
        │
        ▼
  Minikube Cluster
  (single-node K8s)
        │
        ▼
  Node.js Pod(s)
  Port 30080
        │
        ▼
  Public Browser
  http://EC2_IP:30080
```
