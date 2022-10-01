
variable "replicas" {
  type    = number
  default = 1
}

variable "port" {
  type = number
}

variable "target" {
  type = string
}

variable "name" {
  type = string
}

variable "image_name" {
  type = string
}
