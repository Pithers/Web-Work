#!/bin/bash
#Deploy_init.sh
#This shell script installs all the needed programs to run the server.
#The script then builds the server from pither's gitlab image,
#creates the database via manage.py makemigrations and migrate
#then creates a superuser as defined in db_init.sh.

#Before running this script you should:
#1. Change the SECRET_KEY in production-compose.yml
#2. Change the superuser credentials in db_init.sh

#NOTE: This only needs to be run once on the new server. 
#After running this just use docker-compose -f production-compose.yml web up

#Update apt-get
sudo apt-get update

#============Install Docker============
sudo apt-get install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
sudo add-apt-repository \
    "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
    $(lsb_release -cs) \
    stable"
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io

#============Install Docker-Compose============
sudo curl -L "https://github.com/docker/compose/releases/download/1.23.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

#============Install Nginx============
sudo apt-get install nginx

#============Install Certbot============
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install certbot

#Build server, run server db_init script
docker-compose -f production-compose.yml run web ./db_init.sh

#Kill anything using port 443
sudo fuser -k 443/tcp

#Allow website access to the sqlite database
sudo chown www-data testsite/db.sqlite3

#Run server
docker-compose -f production-compose.yml up -d
