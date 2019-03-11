# Web Work

A small repository of test work done for web development

When running on a production server for the first time, run the 'deploy_init.sh' shell script.
Once the server is up and running, run the 'cert_init.sh' script to generate certbot certificates.

After the certs are generated cleanup the docker with cleanup.sh and rerun the server using:

docker-compose -f production-compose.yml up -d

Master:
[![coverage report](https://gitlab.com/pithers/Web-Work/badges/master/coverage.svg)](https://gitlab.com/pithers/Web-Work/commits/master)
[![pipeline status](https://gitlab.com/pithers/Web-Work/badges/master/pipeline.svg)](https://gitlab.com/pithers/Web-Work/commits/master)
