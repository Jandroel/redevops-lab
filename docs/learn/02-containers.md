# Containers

Containers package an application and its runtime environment so it can run more consistently across machines.

## Dockerfile, Image, Container

- `Dockerfile`: the recipe.
- Image: the built artifact.
- Container: a running instance of the image.

## Docker Compose

Docker Compose runs multiple services together for local development. For example:

- web app
- API
- database
- cache

## Minimal Flow

```bash
docker build -t my-app .
docker run --rm -p 3000:3000 my-app
docker compose up --build
```

## Common Mistakes

- Copying `node_modules` into the image.
- Forgetting `.dockerignore`.
- Baking secrets into the image.
- Creating a Dockerfile that does not match the real start command.
