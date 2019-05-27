## Create React Env
##### Runtime environment variables

This repository builds a Docker image that generates a `env.json` file from your environment variables as per the [CRA docs](https://facebook.github.io/create-react-app/docs/adding-custom-environment-variables#adding-development-environment-variables-in-env). 

The image is based off the official Nginx alpine distro and includes a best-practices default `nginx.conf` file to servce a CRA application.

## How does this work?

The Docker image contains a small Golang binary that builds the `env.json` file. The binary is run within the ENTRYPOINT script of the Docker image, therefore env variables are read when the container is started. 