output "service" {
  value = kubernetes_service.service
}

output "deployment" {
  value = kubernetes_deployment.deployment
}

output "image" {
  value = docker_image.image
}
