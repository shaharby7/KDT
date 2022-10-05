import { Service } from "../../.gen/providers/kubernetes/service";
import { Deployment } from "../../.gen/providers/kubernetes/deployment";
import { Image } from "../../.gen/providers/docker/image";

export type Component = {
  service: Service;
  deployment: Deployment;
  image: Image;
};
