if [ ! -d $HOME/minikube ]; then
    mkdir $HOME/minikube
fi
minikube mount $HOME/minikube:/
