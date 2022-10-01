import { Construct } from "constructs";
import { App, TerraformStack, Token, TerraformHclModule } from "cdktf";

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

    const module = new TerraformHclModule(this, "something", {
      source: "./modules/SomeModule",
      variables: {
        target: name,
        image_name: `${env.docker_user}/${"my-dummy-server"}:latest`,
        name: "my-dummy-server",
        port: 5000,
        replicas: 1,
      },
      providers: [k8sProvider, dockerProvider],
    });

    new TerraformHclModule(this, "something2", {
      source: "./modules/SomeModule",
      variables: {
        target: name,
        image_name: `${env.docker_user}/${"hello"}:latest`,
        name: "hello",
        port: module.getNumber("node_port"),
        replicas: 1,
      },
      providers: [k8sProvider, dockerProvider],
    });

    // let appliedComponents: { [key: string]: KaspaNetComponent } = {};
    // for (const component of this.config.components) {
    //   appliedComponents[component.name] = new KaspaNetComponent(this, {
    //     name: component.name,
    //     replicas: 1,
    //     namespace: name,
    //     port: 80,
    //   });
    //   console.log(appliedComponents["my-dummy-server"].service.spec.port)
    // }
    // const mds = new KaspaNetComponent(this, {
    //   name: "my-dummy-server",
    //   replicas: 1,
    //   namespace: name,
    //   port: 80,
    // });
    // const mdsPort = Token.asNumberList(mds.nodePort);
    // console.log(mdsPort);
    // new KaspaNetComponent(this, {
    //   name: "hello",
    //   replicas: 2,
    //   namespace: name,
    //   port: mdsPort[0],
    // });
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
