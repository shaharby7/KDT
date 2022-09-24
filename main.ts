import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";

import {
  KubernetesProvider,
  Deployment,
  Service,
  Namespace,
} from "./.gen/providers/kubernetes";
import { Image, DockerProvider } from "./.gen/providers/docker";

import { env, loadEnv } from "./env";
import { environments } from "./environments.enum";

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

    const componentName = "my-dummy-server";
    const dockerImageName = `${env.docker_user}/${componentName}:latest`;

    new Image(this, `${componentName}-image`, {
      name: dockerImageName,
      keepLocally: true,
    });

    new Namespace(this, "environment-namespace", {
      metadata: {
        name: config.environment,
      },
    });

    new Deployment(this, `${componentName}-deployment`, {
      metadata: {
        name: componentName,
        labels: {
          app: componentName,
        },
        namespace: config.environment,
      },
      spec: {
        replicas: 2,
        selector: {
          matchLabels: {
            app: componentName,
          },
        },
        template: {
          metadata: {
            labels: {
              app: componentName,
            },
          },
          spec: {
            container: [
              {
                image: dockerImageName,
                name: componentName,
                port: [
                  {
                    containerPort: 3010,
                  },
                ],
              },
            ],
          },
        },
      },
    });

    new Service(this, `${componentName}-service`, {
      metadata: {
        name: componentName,
        labels: {
          app: componentName,
        },
        namespace: config.environment,
      },
      spec: {
        selector: {
          app: componentName,
        },
        port: [
          {
            port: 80,
            targetPort: "3010",
          },
        ],
        type: "LoadBalancer",
      },
    });
  }
}

const app = new App();
new KaspaStack(app, "kaspa-local", { environment: environments.local });
app.synth();
