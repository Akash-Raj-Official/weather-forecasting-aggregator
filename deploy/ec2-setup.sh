#!/usr/bin/env bash
# One-time setup for a fresh EC2 instance (Amazon Linux 2023 or Ubuntu).
# Run on the instance:  bash ec2-setup.sh   then log out and back in.
set -euo pipefail

if command -v dnf >/dev/null 2>&1; then
  sudo dnf install -y docker
else
  sudo apt-get update -y
  sudo apt-get install -y docker.io
fi

sudo systemctl enable --now docker
# Let the SSH user run docker without sudo (GitHub Actions deploys as this user)
sudo usermod -aG docker "$USER"

# Swap gives the JVM headroom on 1 GB instances (t2/t3.micro)
if ! swapon --show | grep -q /swapfile; then
  sudo fallocate -l 1G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

echo "Docker installed. Log out and back in so the docker group applies."
