import { Construct } from "constructs";
import { App, TerraformStack, Token, TerraformHclModule } from "cdktf";

import { KubernetesProvider, Namespace } from "./.gen/providers/kubernetes";
import { DockerProvider } from "./.gen/providers/docker";

import { loadEnv, env } from "../env";

import type { TargetConfig } from "../types/TargetConfig";
import { getTargetConfig, listTargets } from "../utils";
import { generateComponentVariables } from "./utils";

import _ from "lodash";

loadEnv();

class KaspaStack extends TerraformStack {
  config: TargetConfig;
  constructor(scope: Construct, target: string, config: TargetConfig) {
    super(scope, target);
    this.config = config;

    const k8sProvider = new KubernetesProvider(this, "k8s", {
      configPath: config.k8s.kubectl_config_path,
      configContext: config.k8s.kubectl_config_context,
    });

    const dockerProvider = new DockerProvider(this, "docker", {
      registryAuth: [
        {
          username: env.docker_user,
          address: env.docker_registry,
          password: env.docker_password,
        },
      ],
    });

    const base = new TerraformHclModule(this, "base", {
      source: "./modules/Base",
      variables: {
        namespace_name: target,
      },
      providers: [k8sProvider],
    });

    let appliedComponents: { [key: string]: TerraformHclModule[] } = {};
    for (const componentConfig of this.config.components) {
      appliedComponents[componentConfig.name] = [];
      for (const unitIndex of _.range(componentConfig.units)) {
        const { componentName, variables } = generateComponentVariables(
          componentConfig,
          unitIndex,
          target,
          appliedComponents
        );
        appliedComponents[componentConfig.name][unitIndex] =
          new TerraformHclModule(this, componentName, {
            source: "./modules/Component",
            variables: { base: base.toTerraform(), ...variables },
            providers: [k8sProvider, dockerProvider],
          });
      }
    }
  }
}

const main = async (): Promise<void> => {
  const app = new App();
  for (const target of listTargets()) {
    new KaspaStack(app, target, await getTargetConfig(target));
  }
  app.synth();
};

main();
