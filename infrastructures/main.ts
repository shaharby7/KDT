import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";

import { KubernetesProvider, Namespace } from "./.gen/providers/kubernetes";
import { DockerProvider } from "./.gen/providers/docker";

import { loadEnv, env } from "../env";
import { environments } from "../environments.enum";

import { KaspaNetComponent } from "./custom-constructs";

loadEnv();
interface IKaspaStackConfig {
  environment: environments;
}

class KaspaStack extends TerraformStack {
  constructor(scope: Construct, name: string, config: IKaspaStackConfig) {
    super(scope, name);
    console.log(config);

    new KubernetesProvider(this, "k8s", {
      configPath: "~/.kube/config",
      configContext: "minikube",
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

    new Namespace(this, "environment-namespace", {
      metadata: {
        name: config.environment,
      },
    });

    new KaspaNetComponent(this, {
      name: "my-dummy-server",
      replicas: 1,
      namespace: config.environment,
      port: 80,
    });
    new KaspaNetComponent(this, {
      name: "hello",
      replicas: 2,
      namespace: config.environment,
      port: 81,
    });
  }
}

const app = new App();
new KaspaStack(app, "kaspa-local", { environment: environments.local });
app.synth();
