#!/bin/bash
export KDT_WORKDIR=$(pwd)
cd "$KDT_WORKDIR/infrastructures"

for i in "$@"; do
    case $i in
    -y)
        AUTO_APPROVE="--auto-approve"
        ;;
    target=*)
        TARGET="${i#*=}"
        shift
        ;;
    -* | --*)
        echo "Unknown option $i"
        exit 1
        ;;
    *) ;;

    esac
done

export command="cdktf destroy $TARGET $AUTO_APPROVE"
echo $command
eval $command
