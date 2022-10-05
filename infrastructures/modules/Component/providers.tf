terraform {

  experiments = [module_variable_optional_attrs]
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 1.11.4"
    }

    docker = {
      source = "kreuzwerker/docker"
    }
  }
}
