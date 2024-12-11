# Fireball

Fireball is a simple tool that spins up a Jaeger instance, using Docker and
Terraform.

## Usage

To stand up Jaeger:

```sh
fireball up
```

This will tail the logs until it receives a ctrl-C, at which point it will
destroy the Jaeger instance. To stand it up and then leave it running in the
background, run:

```sh
fireball up -d
```

Then, to destroy it:

```sh
fireball down
```
