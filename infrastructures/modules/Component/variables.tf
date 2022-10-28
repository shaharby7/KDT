variable "name" {
  type = string
}

variable "namespace" {
  type = string
}

variable "replicas" {
  type = number

}
variable "container_specs" {
  type = object({
    args    = optional(list(string))
    command = optional(list(string))
    name    = optional(string)
    image   = optional(string)
    env = optional(list(object({
      name  = optional(number)
      value = optional(string)
    })))
    resources = optional(object({
      limits = optional(object({
        cpu    = optional(string),
        memory = optional(string)
      }))
      requests = optional(object({
        cpu    = optional(string),
        memory = optional(string)
      }))
    }))
    port = optional(list(object({
      container_port = optional(number)
      host_ip        = optional(string)
      host_port      = optional(number)
      name           = optional(string)
      protocol       = optional(string)
    })))
    volume_mount = optional(list(object({
      mount_path        = optional(string)
      name              = optional(string)
      read_only         = optional(bool)
      sub_path          = optional(string)
      mount_propagation = optional(string)
    })))
  })
}

variable "service_ports_specs" {
  type = list(object({
    target_port = optional(number)
    port        = optional(number)
  }))
  default = []
}


variable "volume_specs" {
  type = list(object({
    name : string,
    path : string
  }))
  default = []
}

variable "dependencies" {
  type    = list(string)
  default = []
}

variable "base" {
  type = any
}
