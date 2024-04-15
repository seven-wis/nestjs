#!/bin/bash

curl -JLO "https://dl.filippo.io/mkcert/latest?for=linux/amd64"
chmod +x mkcert-v*-linux-amd64
cp mkcert-v*-linux-amd64 /usr/local/bin/mkcert


# mkdir -p src/cert
# mkcert -install
# mkcert -key-file ./src/cert/key.pem -cert-file ./src/cert/cert.pem localhost

npm run migration:run
npm run start