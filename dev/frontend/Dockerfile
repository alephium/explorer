FROM node:16 as build

ARG FRONTEND_VERSION=master

WORKDIR /src

RUN git clone https://github.com/alephium/explorer.git . && git checkout $FRONTEND_VERSION

ARG REACT_APP_BACKEND_URL=http://localhost:9090
ARG REACT_APP_NETWORK_TYPE=testnet

RUN npm install && npm run build

FROM nginx

COPY --from=build /src/build /usr/share/nginx/html
