# This script is used to build the frontend image
cd codes && npm install
cd .. && docker build -t frontend:latest . 