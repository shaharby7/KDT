import { TargetConfig, ContainerConfig } from "../../types/TargetConfig";

const config: TargetConfig = {
  k8s: {
    kubectl_config_path: "~/.kube/config",
    kubectl_config_context: "minikube",
  },
  kaspad_version: "v0.12.7",
  components: [
    {
      name: "kaspad-for-seeder",
      version: "v0.12.7",
      extra_build_args: {},
      units: 1,
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
            `--nodnsseed`,
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
    {
      name: "dnsseeder",
      version: "60d0172b2537b3715ed0789a939b01b6c2ea9698",
      extra_build_args: {},
      units: 1,
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
            "--default-seeder",
            _others["kaspad-for-seeder"][0].get("service.spec[0].cluster_ip"),
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
      units: 5,
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
            `--grpcseed=${others["dnsseeder"][0].get(
              "service.spec[0].cluster_ip"
            )}:17100`,
            "--profile=1024",
            "--allow-submit-block-when-not-synced",
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
    {
      name: "kaspaminer",
      version: "v0.12.7",
      extra_build_args: {},
      units: 5,
      replicas: 1,
      generateContainerConfig: (others, unitIndex) => {
        const componentConfig: ContainerConfig = {
          volume_mount: [
            {
              mount_path: "/root/.kaspad",
              name: "kaspad",
            },
            {
              mount_path: "/root/.kaspaminer",
              name: "kaspaminer",
            },
          ],
          command: ["/app/kaspaminer"],
          args: [
            "--devnet",
            `--rpcserver=kaspad-${unitIndex}.local.svc.cluster.local`,
            "--miningaddr=kaspadev:qqm623fpmjv7ztq702udymaw5j64hty5qwgslv85fwaherrxhr5aslq23qyau",
            "--mine-when-not-synced",
          ],
          port: [{ container_port: 16210 }],
        };
        return componentConfig;
      },
    },
  ],
};

export default config;
