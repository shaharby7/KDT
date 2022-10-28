output "target-namespace" {
  value = kubernetes_namespace.target-namespace
  depends_on = [
    kubernetes_namespace.target-namespace
  ]
}
