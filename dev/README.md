Explorer backend development setup
====

This folder contains all needs to run a containerized explorer backend running on the testnet, and an example of the frontend if it's needed.

- alephium full node, using community image, configured to connect and sync with the testnet
- postgres db, using community image, required as the persistence of the backend
- explorer backend, using community image, available at [http://localhost:9090](http://localhost:9090)
- optinoal explorer frontend, using a in-place built image, available at [http://localhost:8080](http://localhost:8080)
- an init container, creating required directory structure and setting proper permissions, using busybox community image.

# Run it

```
docker-compose up -d
```

And access the frontend at [http://localhost:8080](http://localhost:8080)

# Build a custom version of the frontend

Change `FRONTEND_VERSION` in `docker-compose.yml`, for instance set it to `v1.1.0`,
and rebuild the frontend using the command below:

```
docker-compose build frontend
```

And back to `Run it` section!
