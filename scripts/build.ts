import { exit } from "process";
import path from "path";

import {
  getTargetConfig,
  getComponentGlobalInfo,
  spawnChildAsPromise,
  getEffectedComponents,
} from "../utils";
import { env, loadEnv } from "../env";
import { TargetComponentConfig } from "../types/TargetConfig";

loadEnv();

const main = async (): Promise<void> => {
  await spawnChildAsPromise(
    `set-env.sh`,
    path.resolve(__dirname, "./set-env.sh"),
    []
  );
  const targetConfig = await getTargetConfig();
  const effectedComponents = getEffectedComponents(targetConfig);
  for (const component of effectedComponents) {
    const componentGlobalInfo = getComponentGlobalInfo(component.name);
    const extraBuildArgs = parseExtraBuildArgs(component);
    await spawnChildAsPromise(
      `build ${component.name}`,
      path.resolve(__dirname, "./build-and-push-project.sh"),
      [
        component.name,
        path.resolve(__dirname, `../kaspa-repos/${component.name}`),
        componentGlobalInfo.Dockerfile,
        component.version,
        targetConfig.kaspad_version,
        env.docker_user,
        env.docker_password,
        env.docker_registry,
        extraBuildArgs,
      ]
    );
  }
  exit(0);
};

function parseExtraBuildArgs(component: TargetComponentConfig) {
  if (!component.extra_build_args) {
    return "";
  }
  return Object.entries(component.extra_build_args)
    .map(([key, val]) => `--build-arg ${key}=${val}`)
    .join(" ");
}

main();
