#!/bin/bash
export KDT_WORKDIR=$(pwd)
cd "$KDT_WORKDIR/infrastructures"

for i in "$@"; do
    case $i in
    target=*)
        target="${i#*=}"
        shift
        ;;
    -* | --*)
        echo "Unknown option $i"
        exit 1
        ;;
    *) ;;

    esac
done

echo "TARGET  = ${target}"

if [[ -n $1 ]]; then
    echo "Last line of file specified as non-opt/last argument:"
    tail -1 $1
fi

cdktf deploy $target
