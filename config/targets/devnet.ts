import { TargetConfig } from "../../types/TargetConfig";

const config: TargetConfig = {
  k8s: {
    kubectl_config_path: "~/.kube/config",
    kubectl_config_context: "minikube",
  },
  kaspad_version: "v0.12.7",
  components: [
    {
      name: "kaspad",
      version: "v0.12.7",
      extra_build_args: {},
    },
    {
      name: "dnsseeder",
      version: "v0.11.0",
      extra_build_args: {},
    },
  ],
};

export default config;
