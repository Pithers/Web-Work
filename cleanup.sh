#!/bin/bash

echo "Docker cleanup..."
echo "Stopping docker processes..."
docker stop $(docker ps -aq) 2>/dev/null
docker rm $(docker ps -aq) 2>/dev/null
docker rmi $(docker images -q) 2>/dev/null
echo "Docker processes and images removed/cleaned"
