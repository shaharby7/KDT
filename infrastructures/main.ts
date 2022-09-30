import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";

import { KubernetesProvider, Namespace } from "./.gen/providers/kubernetes";
import { DockerProvider } from "./.gen/providers/docker";

import { loadEnv, env } from "../env";

import { KaspaNetComponent } from "./custom-constructs";

import type { TargetConfig } from "../types/TargetConfig";
import { Targets } from "../types/Targets.enum";
import { getTargetConfig } from "../utils";

loadEnv();

class KaspaStack extends TerraformStack {
  config: TargetConfig;
  constructor(scope: Construct, name: string, config: TargetConfig) {
    super(scope, name);
    this.config = config;

    new KubernetesProvider(this, "k8s", {
      configPath: config.k8s.kubectl_config_path,
      configContext: config.k8s.kubectl_config_context,
    });

    new DockerProvider(this, "docker", {
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

    new KaspaNetComponent(this, {
      name: "my-dummy-server",
      replicas: 1,
      namespace: name,
      port: 80,
    });
    new KaspaNetComponent(this, {
      name: "hello",
      replicas: 2,
      namespace: name,
      port: 81,
    });
  }
}

const main = async (): Promise<void> => {
  const app = new App();
  for (const target of Object.keys(Targets)) {
    new KaspaStack(app, target, await getTargetConfig(target));
  }
  app.synth();
};

main();
