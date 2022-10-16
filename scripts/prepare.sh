
export KDT_WORKDIR=$(pwd)
npm i -g cdktf-cli@0.12.2
sudo apt install jq
chmod -R +x ./scripts
cd "$KDT_WORKDIR/infrastructures"
cdktf getnp