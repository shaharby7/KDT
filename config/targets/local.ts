import { TargetConfig, ContainerConfig } from "../../types/TargetConfig";

const config: TargetConfig = {
  k8s: {
    kubectl_config_path: "~/.kube/config",
    kubectl_config_context: "minikube",
  },
  kaspad_version: "v0.12.7",
  components: [
    {
      name: "dnsseeder",
      version: "v0.11.0",
      extra_build_args: {},
      replicas: 1,
      generateContainerConfig: (_others) => {
        const componentConfig: ContainerConfig = {
          volume_mount: [
            {
              mount_path: "/root/.dnsseeder",
              name: "dnsseeder",
            },
          ],
          command: ["/app/dnsseeder"],
          args: [
            "--host",
            "shahar.daglabs-dev.com",
            "--listen",
            "0.0.0.0:53",
            "--nameserver",
            "ns-shahar.daglabs-dev.com",
            // "--default-seeder",
            // "192.168.49.2",
            "--devnet",
            "--profile=6063",
            "--grpclisten=0.0.0.0:17100",
          ],
          port: [
            { container_port: 53 },
            { container_port: 6063 },
            { container_port: 17100 },
          ],
        };
        return componentConfig;
      },
    },
    {
      name: "kaspad",
      version: "v0.12.7",
      extra_build_args: {},
      replicas: 1,
      generateContainerConfig: (others) => {
        const componentConfig: ContainerConfig = {
          volume_mount: [
            {
              mount_path: "/root/.kaspad",
              name: "kaspad",
            },
            {
              mount_path: "/root/.kaspad/logs/kaspa-devnet",
              name: "kaspa-devnet",
            },
          ],
          command: ["/app/kaspad"],
          args: [
            "--devnet",
            "--rpclisten=0.0.0.0:16610",
            "--loglevel=debug",
            `--grpcseed=${others["dnsseeder"].get(
              "service.spec[0].cluster_ip"
            )}:17100`,
            "--profile=1024",
          ],
          port: [
            { container_port: 1024 },
            { container_port: 16610 },
            { container_port: 16611 },
          ],
        };
        return componentConfig;
      },
    },
  ],
};

export default config;
