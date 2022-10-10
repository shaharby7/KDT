#!/bin/bash

export KDT_WORKDIR=$(pwd)

function clone_if_not_exist() {
    KASPA_REPOS_DIR="$KDT_WORKDIR/kaspa-repos"
    COMPONENT_EXPECTED_DIR="$KASPA_REPOS_DIR/$1"
    if [ ! -d $COMPONENT_EXPECTED_DIR ]; then
        cd KASPA_REPOS_DIR
        sudo -u $USER git clone $2 $COMPONENT_EXPECTED_DIR
    fi
}

function create_symlk_if_not_exits() {
    KASPA_REPOS_DIR="$KDT_WORKDIR/kaspa-repos"
    COMPONENT_EXPECTED_DIR="$KASPA_REPOS_DIR/$1"
    if [ ! -d $COMPONENT_EXPECTED_DIR ]; then
        ln -s $2 $COMPONENT_EXPECTED_DIR
    fi
}

CONFIG_PATH="$KDT_WORKDIR/config/componentsGlobalInfo.json"
# for each row in the config file
for row in $(cat $CONFIG_PATH | jq -r '.[] | @base64'); do
    _jq() {
        echo ${row} | base64 --decode | jq -r ${1}
    }
    if [ ! "$(_jq '.path')" = "null" ]; then
        create_symlk_if_not_exits $(_jq '.name') "$(_jq '.path')"
    else
        clone_if_not_exist $(_jq '.name') $(_jq '.git')
    fi
done

cd "$KDT_WORKDIR/infrastructures"
# cdktf get
