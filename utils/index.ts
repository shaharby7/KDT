import type {
  TargetConfig,
  TargetComponentConfig,
} from "../types/TargetConfig";
import type { ComponentGlobalInfo } from "../types/ComponentGlobalInfo";

import { Targets } from "../types/Targets.enum";

import fs from "fs";
import path from "path";
import { spawn } from "child_process";

const componentsConfigPath = path.resolve(__dirname, "../config/componentsGlobalInfo.json");
const componentsConfig: ComponentGlobalInfo[] = JSON.parse(
  fs.readFileSync(componentsConfigPath, "utf-8")
);

export const getTarget = (): Targets => {
  const param = process.argv.find((argv) => argv.startsWith("target="));
  if (!param) {
    throw new Error("No target found");
  }
  return param.split("=")[1] as Targets;
};

export const getTargetConfig = async (
  targeName?: string
): Promise<TargetConfig> => {
  const target = targeName ? targeName : getTarget();
  const targetConfig = (await import(`../config/targets/${target}`))
    .default as TargetConfig;
  return targetConfig as TargetConfig;
};

export const getEffectedComponents = (
  targetConfig: TargetConfig
): TargetComponentConfig[] => {
  const param = process.argv.find((argv) => argv.startsWith("components="));
  if (!param) {
    return targetConfig.components;
  } else {
    const filteredComponentNames = param.split("=")[1].split(",");
    return targetConfig.components.filter((competent) =>
      filteredComponentNames.includes(competent.name)
    );
  }
};

export const getComponentGlobalInfo = (
  componentName: string
): ComponentGlobalInfo => {
  const componentGlobalInfo = componentsConfig.find(
    (component) => component.name == componentName
  );
  if (componentGlobalInfo) {
    return componentGlobalInfo;
  } else throw new Error("no component global info found");
};

export const spawnChildAsPromise = async (
  processName: string,
  command: string,
  options?: string[]
): Promise<string> => {
  const child = spawn(command, options);
  let data = "";
  for await (const chunk of child.stdout) {
    console.log(processName, "stdout chunk: " + chunk);
    data += chunk;
  }
  let error = "";
  for await (const chunk of child.stderr) {
    console.error(processName, "stderr chunk: " + chunk);
    error += chunk;
  }
  const exitCode = await new Promise((resolve, reject) => {
    child.on("close", resolve);
  });

  if (exitCode) {
    throw new Error(`subprocess error exit ${exitCode}, ${error}`);
  }
  return data;
};
