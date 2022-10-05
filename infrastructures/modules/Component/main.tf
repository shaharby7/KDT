resource "docker_image" "image" {
  name         = var.container_specs.image
  keep_locally = true
}


resource "kubernetes_deployment" "deployment" {
  metadata {
    name = var.name
    labels = {
      app = var.name
    }
    namespace = var.namespace
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
          name    = var.container_specs.name
          image   = var.container_specs.image
          args    = lookup(var.container_specs, "args", null)
          command = lookup(var.container_specs, "command", null)
          dynamic "env" {
            for_each = var.container_specs.env == null ? [] : var.container_specs.env
            content {
              name  = lookup(env.value, "name", null)
              value = lookup(env.value, "value", null)
            }
          }
          resources {
            limits {
              cpu    = lookup(var.container_specs, "resources.limits.cpu", null)
              memory = lookup(var.container_specs, "resources.limits.memory", null)
            }
            requests {
              cpu    = lookup(var.container_specs, "resources.requests.cpu", null)
              memory = lookup(var.container_specs, "resources.requests.memory", null)
            }
          }
          dynamic "port" {
            for_each = var.container_specs.port == null ? [] : var.container_specs.port
            content {
              container_port = lookup(port.value, "container_port", null)
              host_ip        = lookup(port.value, "host_ip", null)
              host_port      = lookup(port.value, "host_port", null)
              name           = lookup(port.value, "name", null)
              protocol       = lookup(port.value, "protocol", null)
            }
          }
          dynamic "volume_mount" {
            for_each = var.container_specs.volume_mount == null ? [] : var.container_specs.volume_mount
            content {
              mount_path        = lookup(volume_mount.value, "mount_path", null)
              read_only         = lookup(volume_mount.value, "read_only", null)
              sub_path          = lookup(volume_mount.value, "sub_path", null)
              name              = lookup(volume_mount.value, "name", null)
              mount_propagation = lookup(volume_mount.value, "mount_propagation", null)
            }
          }
        }
          security_context {
          run_as_user     = 0 //run as user
          run_as_non_root = false
        }
        dynamic "volume" {
          for_each = var.volume_specs
          content {
            name = lookup(volume.value, "name", null)
            empty_dir {}
          }
        }
      }
    }
  }
}



resource "kubernetes_service" "service" {
  metadata {
    name      = var.name
    namespace = var.namespace
  }
  spec {
    selector = {
      app = var.name
    }
    type = "NodePort"
    dynamic "port" {
      for_each = var.service_ports_specs
      content {
        name        = "${var.name}-${lookup(port.value, "target_port", null)}"
        port        = lookup(port.value, "target_port", null)
        target_port = lookup(port.value, "target_port", null)
      }
    }
  }
}
