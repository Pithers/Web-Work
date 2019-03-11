#!/bin/bash

#Create a directory for the certs and run certbot
#Certbot will create a process that autorenews the certs when they are about to expire
sudo mkdir /home/certs-data/
sudo certbot certonly --webroot -w /home/certs-data/ -d pithers.org -d www.pithers.org
