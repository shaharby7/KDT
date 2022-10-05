import { Construct } from "constructs";
import { App, TerraformStack, Token, TerraformHclModule } from "cdktf";

import { KubernetesProvider, Namespace } from "./.gen/providers/kubernetes";
import { DockerProvider } from "./.gen/providers/docker";

import { loadEnv, env } from "../env";

import type { TargetConfig } from "../types/TargetConfig";
import { Targets } from "../types/Targets.enum";
import { getTargetConfig } from "../utils";
import {
  generateContainerSpecs,
  generateServiceSpecPorts,
  generateVolumeSpecs,
} from "./utils";
import { Component } from "./modules/Component";

loadEnv();

class KaspaStack extends TerraformStack {
  config: TargetConfig;
  constructor(scope: Construct, name: string, config: TargetConfig) {
    super(scope, name);
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

    new Namespace(this, "target-namespace", {
      metadata: {
        name: name,
      },
    });

    let appliedComponents: { [key: string]: TerraformHclModule } = {};
    for (const componentConfig of this.config.components) {
      const variables = {
        name: componentConfig.name,
        namespace: name,
        replicas: componentConfig.replicas,
        container_specs: generateContainerSpecs(
          appliedComponents,
          componentConfig
        ),
        service_ports_specs: generateServiceSpecPorts(
          appliedComponents,
          componentConfig
        ),
        volume_specs: generateVolumeSpecs(appliedComponents, componentConfig),
      };
      appliedComponents[componentConfig.name] = new TerraformHclModule(
        this,
        componentConfig.name,
        {
          source: "./modules/Component",
          variables,
          providers: [k8sProvider, dockerProvider],
        }
      );
    }
  }
}

const main = async (): Promise<void> => {
  const app = new App();
  // for (const target of Object.keys(Targets)) {
  //   new KaspaStack(app, target, await getTargetConfig(target));
  // }
  let target = "local";
  new KaspaStack(app, target, await getTargetConfig(target));
  app.synth();
};

main();
