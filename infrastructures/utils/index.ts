import { TargetComponentConfig } from "../../types/TargetConfig";
import { DeploymentSpecTemplateSpecContainer } from "../.gen/providers/kubernetes/deployment-structs/structs0";
import _ from "lodash";
import { env } from "../../env";
import { TerraformHclModule } from "cdktf";
import { ServiceSpecPort } from "../.gen/providers/kubernetes";

export const generateContainerSpecs = (
  deployedComponents: { [componentName: string]: TerraformHclModule[] },
  targetComponentConfig: TargetComponentConfig,
  unitIndex: number
): DeploymentSpecTemplateSpecContainer => {
  const containerConfig = targetComponentConfig.generateContainerConfig(
    deployedComponents,
    unitIndex
  );
  let containerSpecs = {
    ...containerConfig,
    name: targetComponentConfig.name,
    image: generateImagName(
      targetComponentConfig.name,
      targetComponentConfig.version
    ),
  };
  return containerSpecs;
};

export const generateVolumeSpecs = (
  deployedComponents: { [componentName: string]: TerraformHclModule[] },
  targetComponentConfig: TargetComponentConfig,
  unitIndex: number,
  componentName: string
): { name: string; path: string } => {
  const containerConfig = targetComponentConfig.generateContainerConfig(
    deployedComponents,
    unitIndex
  );
  return (containerConfig.volume_mount || []).map(
    (volumeMount: { name: string; mount_path: string }) => ({
      name: volumeMount.name,
      path: `/${componentName}${volumeMount.mount_path}`,
    })
  );
};

/**
 * Pay attention! has to be consistent with "docker_image" param at scripts/build-and-push-project.sh
 * @param name
 * @param version
 */
export const generateImagName = (name: string, version: string): string => {
  return `${env.docker_user}/${name}:${version}`;
};

export const generateServiceSpecPorts = (
  deployedComponents: { [componentName: string]: TerraformHclModule[] },
  targetComponentConfig: TargetComponentConfig,
  unitIndex: number
): ServiceSpecPort[] => {
  let serviceSpecPorts = (
    targetComponentConfig.generateContainerConfig(deployedComponents, unitIndex)
      .port || []
  ).map((port: any) => {
    return { target_port: port.container_port };
  });
  return serviceSpecPorts;
};

export function generateComponentVariables(
  componentConfig: TargetComponentConfig,
  unitIndex: number,
  target: string,
  appliedComponents: { [key: string]: TerraformHclModule[] }
) {
  const componentName =
    componentConfig.units > 0
      ? `${componentConfig.name}-${unitIndex}`
      : componentConfig.name;
  const variables = {
    name: componentName,
    namespace: target,
    replicas: componentConfig.replicas,
    container_specs: generateContainerSpecs(
      appliedComponents,
      componentConfig,
      unitIndex
    ),
    service_ports_specs: generateServiceSpecPorts(
      appliedComponents,
      componentConfig,
      unitIndex
    ),
    volume_specs: generateVolumeSpecs(
      appliedComponents,
      componentConfig,
      unitIndex,
      componentName
    ),
  };
  return { componentName, variables };
}
