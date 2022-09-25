#!/bin/bash
export KDT_WORKDIR=$(pwd)
cd "$KDT_WORKDIR/infrastructures"
cdktf deploy