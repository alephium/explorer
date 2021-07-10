#!/bin/sh

DIR=`dirname $0`
CURRENT_COMMIT=`git rev-parse HEAD`
CURRENT_TAG=`git tag --points-at HEAD`
IMAGE_NAME=alephium/explorer:${CURRENT_COMMIT}

docker build -t $IMAGE_NAME $DIR

if [ ! -z $CURRENT_TAG ]
then
    docker tag $IMAGE_NAME alephium/explorer:${CURRENT_TAG}
fi
