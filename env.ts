import { EnvType, load } from "ts-dotenv";
export type Env = EnvType<typeof schema>;

export const schema = {
  docker_registry: String,
  docker_user: String,
  docker_password: String,
};

export let env: Env;

export function loadEnv(): void {
  env = load(schema, __dirname + "/.env");
}
