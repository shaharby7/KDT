import { Construct } from "constructs";
import { Deployment, Service } from "../../.gen/providers/kubernetes";
import { Image } from "../../.gen/providers/docker";

import { env } from "../../env";
export type KaspaNetComponentConfig = {
  name: string;
  replicas: number;
  port: number;
  namespace: string;
};
export class KaspaNetComponent extends Construct {
  public service: Service;
  public deployment: Deployment;
  public image: Image;

  constructor(scope: Construct, config: KaspaNetComponentConfig) {
    super(scope, config.name);

    const dockerImageName = `${env.docker_user}/${config.name}:latest`;

    this.image = new Image(this, `${config.name}-image`, {
      name: dockerImageName,
      keepLocally: true,
    });

    this.deployment = new Deployment(this, `${config.name}-deployment`, {
      metadata: {
        name: config.name,
        labels: {
          app: config.name,
        },
        namespace: config.namespace,
      },
      spec: {
        replicas: config.replicas,
        selector: {
          matchLabels: {
            app: config.name,
          },
        },
        template: {
          metadata: {
            labels: {
              app: config.name,
            },
          },
          spec: {
            container: [
              {
                image: dockerImageName,
                name: config.name,
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

    this.service = new Service(this, `${config.name}-service`, {
      metadata: {
        name: config.name,
        labels: {
          app: config.name,
        },
        namespace: config.namespace,
      },
      spec: {
        selector: {
          app: config.name,
        },
        port: [
          {
            port: config.port,
            targetPort: "3010",
          },
        ],
        type: "LoadBalancer",
      },
    });
  }
}
