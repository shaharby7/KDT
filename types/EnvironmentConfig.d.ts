export type EnvironmentConfig = {
  k8s: {
    config_path: string;
    config_context: string;
  };
  kaspad_version: string;
  components: {
    name: string;
    version: string;
    extra_build_args: string[];
  }[];
};
