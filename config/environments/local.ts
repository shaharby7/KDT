import { EnvironmentConfig } from "../../types/EnvironmentConfig";

const config: EnvironmentConfig = {
  k8s: {
    config_path: "~/.kube/config",
    config_context: "minikube",
  },
  kaspad_version: "v0.12.7",
  components: [
    {
      name: "kaspad",
      version: "v0.12.7",
      extra_build_args: [],
    },
    {
      name: "dnsseeder",
      version: "v0.12.7",
      extra_build_args: [],
    },
  ],
};
