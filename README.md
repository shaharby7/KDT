# KDT - Kaspa deployment tools

## intro

//TODO

## Getting started

#### prepare

```bash
npm run prepare
```

Installing global dependencies, change permissions and downloads terraform dependencies

#### build

```bash
 npm run build -- target=<local|devnet|testnet|mainnet> [component=<component>]
```

Builds and pushes the images to the docker repository. If the "component" arg is not provided builds all of the images for that environment

#### deploy

```bash
npm run deploy -- target=<local|devnet|testnet|mainnet>
```

Generates all the namespaces, images, deployments and services, as defined at the ./config directory (see "config" section)

#### destroy

```bash
npm run deploy -- target=<local|devnet|testnet|mainnet>
```

Removes all the namespaces, images, deployments and services, as defined at the ./config directory (see "config" section)

## Running locally

To run the deployment locally one should have local kubectl and minikube - a local simulation of k8s. For more details - https://minikube.sigs.k8s.io/docs/start/

To allow mounting to the host with minikube:

```bash
npm run minikube:mount
```

The output should be mounted to `$HOME/minikube`

To restart the local cluster and set the terraform state to the beginning one can use:

```bash
npm run minikube:reset
```

## Config

### Targets

The target is the environment to witch the net is going to be deployed - local, devnet, testnet or mainnet. In order to run a new target the configuration must include the information of the target k8s, the kaspad version, and the configuration of the components if the net (see "components" section below). This information should be provided as a <-target-name->.ts in the directory - config/targets, that implements the type "types/TargetConfig.d.ts"

### Components

A component is a kaspa related project, together with the definition of where it's source code can be found, and how to build, push, deploy and serve it. To add another component one needs to:

- provide the "global" info for this project (information that is relevant to all of the targets) in this file - config/targets
- provide the "target related" information under the target config (see above).

Important note - the deployments of the components are being done sequentially by the order of the "componentConfig" array in the target configuration, in order to allow dependent deployments. For example, as the `dnsseeder` should be deployed before all of the other components, and it's internal IP should be served to the other components as an input. Therefore the `dnsseeder` is first in the array, and the `kaspad` configuration point to it's newly allocated IP address by doing:

```ts
`--grpcseed=${others["dnsseeder"].get("service.spec[0].cluster_ip")`
```

To get better understanding about Terraform dependent deployments, please read https://www.terraform.io/intro

