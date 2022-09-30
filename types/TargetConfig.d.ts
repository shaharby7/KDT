export type TargetComponentConfig = {
  name: string;
  version: string;
  extra_build_args?: {
    [key: string]: string;
  };
};

export type TargetConfig = {
  k8s: {
    kubectl_config_path: string;
    kubectl_config_context: string;
  };
  kaspad_version: string;
  components: TargetComponentConfig[];
};
