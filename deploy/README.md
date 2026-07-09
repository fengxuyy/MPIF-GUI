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

## Enable ORCID login

ORCID settings are baked into the frontend at build time, so they live in
`/opt/mpif-gui/.env` on the Droplet (created by cloud-init with empty values):

```bash
ssh root@<droplet-ip>
nano /opt/mpif-gui/.env    # fill in VITE_ORCID_* (see .env.local.template)
mpif-deploy                # rebuilds and restarts
```

The ORCID redirect URI must be `http://<your-domain-or-ip>/orcid-callback`
and match what is registered in your ORCID developer tools.

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
