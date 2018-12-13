#!/bin/bash

shopt -s expand_aliases
alias docker='docker.exe'

echo "Docker cleanup..."
if [ $(docker ps -aq) ]
then
    echo "Stopping docker processes"
    docker stop $(docker ps -aq)
    docker rm $(docker ps -aq)
    docker rmi $(docker images -q)
    echo "Docker processes and images removed/cleaned"
else
    echo "Nothing to stop or remove"
fi