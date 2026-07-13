# Deploying to a DigitalOcean Droplet

The whole deployment is driven by [cloud-init.yml](cloud-init.yml): it installs
Docker, opens the firewall (SSH + HTTP), clones this repo to `/opt/mpif-gui`,
and starts both containers with `docker compose`. The SQLite database lives on
the `mpif-data` Docker volume, so redeploys never touch the data.

## Create the Droplet

**Web UI:** Create Droplet → Ubuntu 24.04 → choose a size (the basic
$6–12/mo shared-CPU sizes are plenty) → Advanced Options → *Add
Initialization scripts* → paste the contents of `cloud-init.yml`.

**CLI:**

```bash
doctl compute droplet create mpif-dashboard \
  --region syd1 --size s-1vcpu-2gb --image ubuntu-24-04-x64 \
  --ssh-keys <your-ssh-key-id> \
  --user-data-file deploy/cloud-init.yml
```

The first boot takes a few minutes (apt + two image builds). Watch it with:

```bash
ssh root@<droplet-ip> tail -f /var/log/cloud-init-output.log
```

When it finishes, the app is at `http://<droplet-ip>/`.

## Enable HTTPS + ORCID login

ORCID requires **HTTPS** redirect URIs (localhost is the only HTTP exception),
so ORCID login on a server needs TLS. The compose file ships an optional Caddy
reverse proxy for this, enabled via a compose profile. No domain? Use
[sslip.io](https://sslip.io): the name `A-B-C-D.sslip.io` resolves to the IP
`A.B.C.D`, and Caddy can get a real Let's Encrypt certificate for it.

1. Open ports 80 **and 443** in the provider firewall/security group.
2. Register a public API client in ORCID developer tools
   (sandbox: sandbox.orcid.org/developer-tools, production:
   orcid.org/developer-tools) with redirect URI
   `https://<your-domain>/orcid-callback`, and make sure
   **"Allow implicit flow" is enabled** — the app has no server-side token
   exchange.
3. Configure `.env` on the server (next to docker-compose.yml):

   ```bash
   COMPOSE_PROFILES=https
   FRONTEND_PORT=8080          # Caddy owns 80/443; frontend moves aside
   DOMAIN=203-101-1-2.sslip.io # or your real domain
   VITE_ORCID_CLIENT_ID=APP-XXXXXXXXXXXXXXXX
   VITE_ORCID_REDIRECT_URI=https://203-101-1-2.sslip.io/orcid-callback
   VITE_ORCID_SANDBOX=false    # true if the client is on sandbox.orcid.org
   ```

4. Rebuild and restart (`mpif-deploy`, or `docker compose up -d --build`).
   The app is then at `https://<domain>/`; the first request may take a few
   seconds while Caddy obtains the certificate.

ORCID settings are baked into the frontend at build time — changing any
`VITE_*` value requires a rebuild, not just a restart.

## Updating the app

```bash
ssh root@<droplet-ip> mpif-deploy
```

`mpif-deploy` (installed by cloud-init) does `git pull`, rebuilds the images,
and restarts the containers. Data on the `mpif-data` volume is untouched.

## Backups

The database is the only state. Options, simplest first:

- **Droplet snapshots** (DigitalOcean UI) — whole-machine, coarse but zero setup.
- **Copy the SQLite file off the volume:**
  ```bash
  docker compose -f /opt/mpif-gui/docker-compose.yml exec api \
    sqlite3 /var/lib/mpif/mpif_publish.sqlite3 ".backup /var/lib/mpif/backup.sqlite3"
  docker cp "$(docker compose -f /opt/mpif-gui/docker-compose.yml ps -q api)":/var/lib/mpif/backup.sqlite3 .
  ```
- **Litestream → DigitalOcean Spaces** for continuous replication (not yet
  set up; add it as a third compose service when the data matters enough).
