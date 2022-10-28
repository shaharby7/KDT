resource "kubernetes_namespace" "target-namespace" {
  metadata {

    name = var.namespace_name
  }
}
