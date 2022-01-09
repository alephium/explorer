#!/bin/sh

DIR=`dirname $0`
CURRENT_COMMIT=`git rev-parse HEAD`
CURRENT_TAG=`git tag --points-at HEAD`
IMAGE_NAME=alephium/explorer:${CURRENT_COMMIT}

docker build \
       --build-arg backend_url=${REACT_APP_BACKEND_URL:-http://localhost:9090} \
       --build-arg network_type=${REACT_APP_NETWORK_TYPE:-mainnet} \
       -t $IMAGE_NAME \
       $DIR

if [ ! -z $CURRENT_TAG ]
then
    docker tag $IMAGE_NAME alephium/explorer:${CURRENT_TAG}
fi
