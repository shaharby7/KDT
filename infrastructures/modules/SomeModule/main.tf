resource "docker_image" "hello_image" {
  name         = var.image_name
  keep_locally = true
}


resource "kubernetes_deployment" "hello_deployment" {
  metadata {
    name = var.name
    labels = {
      app = var.name
    }
    namespace = var.target
  }
  spec {
    replicas = var.replicas
    selector {
      match_labels = {
        app = var.name
      }
    }
    template {
      metadata {
        labels = {
          app = var.name
        }
      }
      spec {
        container {
          image = var.image_name
          name  = var.name
          port {
            container_port = 3010
          }
        }
      }
    }
  }
}



resource "kubernetes_service" "hello_service" {
  metadata {
    name      = var.name
    namespace = var.target
  }
  spec {
    selector = {
      app = var.name
    }
    type = "NodePort"
    port {
      port        = var.port
      target_port = 3010
    }
  }
}
