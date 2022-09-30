#!/bin/bash

export KDT_WORKDIR=$(pwd)

function clone_if_not_exist() {
    KASPA_REPOS_DIR="$KDT_WORKDIR/kaspa-repos"
    COMPONENT_EXPECTED_DIR="$KASPA_REPOS_DIR/$1"
    echo $COMPONENT_EXPECTED_DIR
    if [ ! -d $COMPONENT_EXPECTED_DIR ]; then
        cd KASPA_REPOS_DIR
        sudo -u $USER git clone $2 $COMPONENT_EXPECTED_DIR
    fi
}

CONFIG_PATH="$KDT_WORKDIR/config/componentsGlobalInfo.json"
# for each row in the config file
for row in $(cat $CONFIG_PATH | jq -r '.[] | @base64'); do
    _jq() {
        echo ${row} | base64 --decode | jq -r ${1}
    }
    clone_if_not_exist $(_jq '.name') $(_jq '.git')
done

cd "$KDT_WORKDIR/infrastructures"
cdktf get
