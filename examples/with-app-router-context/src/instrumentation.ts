import { makeEnvPublic } from 'next-runtime-env';

export function register() {
  // Here you can define all the environment variables that should be exposed to
  // the client.
  makeEnvPublic(['BAZ']);
}
