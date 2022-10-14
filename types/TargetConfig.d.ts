import { DeploymentSpecTemplateSpecContainer } from "../infrastructures/.gen/providers/kubernetes/deployment-structs/structs0.ts";
import { TerraformHclModule } from "cdktf";

export type ContainerConfig = Omit<
  DeploymentSpecTemplateSpecContainer,
  "name|image"
>;

export type TargetComponentConfig = {
  name: string;
  version: string;
  extra_build_args?: {
    [key: string]: string;
  };
  units: number;
  replicas: number;
  generateContainerConfig: (
    others: {
      [componentName: string]: TerraformHclModule[];
    },
    unitIndex: number
  ) => any;
};

export type TargetConfig = {
  k8s: {
    kubectl_config_path: string;
    kubectl_config_context: string;
  };
  kaspad_version: string;
  components: TargetComponentConfig[];
};
