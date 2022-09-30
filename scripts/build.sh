#!/bin/bash

usage() {
    cat <<EOF
Usage: build [-h] project_name project_path dockerfile_location project_version kaspad_version dockerhub_username dockerhub_password dockerhub_registry extra_build_args

Script description here.

Available options:

-h, --help      Print this help and exit
EOF
    exit
}

if [[ $1 = "-h" ]]; then
    usage
fi

if [[ $# -eq 0 ]]; then
    echo "cannot run without arguments, plese see --help"
    exit 1
fi

cd $2
git fetch
git checkout -f $4
docker_image=$6/$1:$4
docker build -t $docker_image -f $3 . --build-arg KASPAD_VERSION=$4 $9
docker login -u $6 -p $7 $8
docker push $docker_image
