# OpenCloud server: record of the Humedat@ backend as built (2022–2026)

This folder records the **server side** of Humedat@ as it ran on the OpenCloud virtual machine from 2022 to 2026: its architecture, logic, code and operations. The aim is that a future engineer can understand the system, check it and re-engineer it.

- This is **not** a modernization and **not** a tested rebuild. The code and configuration were **retrieved from the live server on 2026-09-24** and are kept as they ran.
- The only changes are:
  - real secrets were replaced by placeholders;
  - small, obvious bugs in the systemd units were fixed in these copies, with a comment on each fix. The live units still have the bugs.
- Improvements are listed in [Notes for future re-engineering](#notes-for-future-re-engineering). They have **not** been implemented.
- Server status: suspended in September 2026, then **reactivated for one more year (until about September 2027)** by a collaborator. See [Status and final backup (2026)](#status-and-final-backup-2026).

The Spanish administration manual ([`../manual_humedata/Humedata_Manual_Admin.docx`](../manual_humedata/Humedata_Manual_Admin.docx), sections *Servidor virtual en la nube* → *Anotaciones gráficas*) holds the day-to-day procedures. This README is the detailed technical reference and takes precedence where the two differ.

## Contents

- [OpenCloud server: record of the Humedat@ backend as built (2022–2026)](#opencloud-server-record-of-the-humedat-backend-as-built-20222026)
  - [Contents](#contents)
  - [Folder layout](#folder-layout)
  - [Secrets and credentials](#secrets-and-credentials)
  - [Architecture and data flow](#architecture-and-data-flow)
  - [Components as deployed](#components-as-deployed)
    - [Caveats: Mosquitto 1.6.9](#caveats-mosquitto-169)
    - [Caveats: server time zone Europe/London](#caveats-server-time-zone-europelondon)
    - [Caveats: network exposure](#caveats-network-exposure)
  - [Data model](#data-model)
  - [Subscriber logic](#subscriber-logic)
  - [systemd services and their history](#systemd-services-and-their-history)
  - [Operations](#operations)
    - [Access (SSH / SCP / WinSCP)](#access-ssh--scp--winscp)
    - [Service control](#service-control)
    - [Add a buoy](#add-a-buoy)
    - [Add a variable](#add-a-variable)
    - [Triggers for calibration](#triggers-for-calibration)
    - [Backup and restore](#backup-and-restore)
    - [Grafana](#grafana)
  - [Where the data lives](#where-the-data-lives)
  - [Notes for future re-engineering](#notes-for-future-re-engineering)
  - [Status and final backup (2026)](#status-and-final-backup-2026)

## Folder layout

| Path | What it is |
|---|---|
| [`subscriber/subscribe_and_insert_to_db.py`](subscriber/subscribe_and_insert_to_db.py) | Generic MQTT → MySQL subscriber (one process per buoy; the TTN device id is its argument). Run by `humedatalihuen.service`. |
| [`subscriber/subscribe_and_insert_to_db_atlas.py`](subscriber/subscribe_and_insert_to_db_atlas.py) | Per-device copy for Atlas (device and credentials hardcoded). Run by `humedata.service`. |
| [`subscriber/subscribe_and_insert_to_db_bp.py`](subscriber/subscribe_and_insert_to_db_bp.py) | Per-device copy for BP. Run by `humedatabp.service`. |
| [`subscriber/agregar_dispositivo.py`](subscriber/agregar_dispositivo.py) | Interactive script that registers a new `dev_eui` in `Humedata_devices` (*agregar dispositivo*, "add device"). |
| [`subscriber/test.py`](subscriber/test.py) | Connectivity check: connects to MySQL and looks up one `dev_eui`. |
| [`subscriber/log_in.example`](subscriber/log_in.example) | Format of `/home/log_in`, the DB connection file read by the generic subscriber. |
| [`systemd/humedata.service`](systemd/humedata.service) | Unit for Atlas (fixed copy). |
| [`systemd/humedatabp.service`](systemd/humedatabp.service) | Unit for BP, the test bench (*banco de pruebas*) (fixed copy). |
| [`systemd/humedatalihuen.service`](systemd/humedatalihuen.service) | Unit for Lihuen, the buoy with Xi'an Desun sensors (fixed copy). |
| [`systemd/humedataxian.service`](systemd/humedataxian.service) | **Retired** unit for Xian. It was replaced by `humedatalihuen.service` on 2024-04-18 and is kept for the record. |
| [`systemd/humedata_template.service`](systemd/humedata_template.service) | Pattern for more buoys (on the server: `/home/humedata_plantilla`). |
| [`db/schema.sql`](db/schema.sql) | DDL of the `mqtt` database (tables `Humedata_devices`, `logs`). Identical in the 2023 and 2026 dumps. |
| [`db/devices.sql`](db/devices.sql) | Rows of `Humedata_devices` on the live server, 2026-09-24. |
| [`grafana/grafana.ini.snippet`](grafana/grafana.ini.snippet) | The non-default Grafana settings, plus a summary of what lived in `grafana.db`. |
| [`grafana/dashboards/`](grafana/dashboards/) | The 7 dashboards exported as JSON, named `<org>__<title>__<uid>.json`. |
| [`grafana/annotations.json`](grafana/annotations.json) | The 102 Grafana annotations (maintenance, experiments, debugging events, 2023-09 → 2024-06). |
| [`grafana/img/`](grafana/img/) | Custom logos and icons used by the dashboards (served from `/usr/share/grafana/public/img/`). |
| [`grafana/grafana-agent.yaml`](grafana/grafana-agent.yaml) | Config of the Grafana Agent that shipped MySQL metrics and logs to Grafana Cloud (secrets replaced). |

Related material elsewhere in the repo:
- [`../TTN_payload_formatters/`](../TTN_payload_formatters/): copies of the TTN payload formatters (JavaScript `decodeUplink`).
- [`../Humedata-software/`](../Humedata-software/): the web and mobile app, whose backend read the same MySQL database.

## Secrets and credentials

The tracked files contain **placeholders only**, written in angle brackets and named after the variables of the private credentials file:

| Placeholder | Where it appears | Variable in the private file |
|---|---|---|
| `<TTN_API_KEY>` | the three `subscriber/subscribe_and_insert_to_db*.py` | `TTN_API_KEY` |
| `<MYSQL_ROOT_PASSWORD>` | `subscriber/*_atlas.py`, `*_bp.py`, `agregar_dispositivo.py`, `test.py`, `log_in.example` | `MYSQL_ROOT_PASSWORD` (the removed 2022–23 script used `MYSQL_ROOT_PASSWORD_2022`) |
| `<GRAFANA_CLOUD_AGENT_*>` | `grafana/grafana-agent.yaml` | `GRAFANA_CLOUD_AGENT_METRICS_*`, `GRAFANA_CLOUD_AGENT_LOGS_*` (both use the same token) |
| `<SMTP_*>` | `grafana/grafana.ini.snippet` (commented pattern only) | never configured |

- The real values live in the git-ignored `credentials/` folder of the maintainer's local working copy:
  - `credentials/Humedata_credentials_private.env` holds the passwords. The manual's placeholders (`SERVER_SSH_PASSWORD`, `MYSQL_ADMIN_PASSWORD`, `GRAFANA_ADMIN_PASSWORD`, `OPENCLOUD_CURRENT_ACCOUNT_*`, …) refer to it.
  - `credentials/opencloud_server/log_in` is the server's `/home/log_in`.
- They are **never** committed. `credentials/` is listed in `.gitignore`.
- The TTN API key was public in this repository from 2023 to 2026 and **must be revoked** in the TTN console. The running subscribers still use it, so revoking it stops ingestion until a new key is installed on the server.
- **Low-risk credentials are left as they are**, by decision of the maintainer:
  - the read-only MySQL user `grafanareader` (SELECT only);
  - the Grafana viewer logins;
  - the TTN MQTT username `cehum-humedata@ttn`;
  - the device `dev_eui` values.

## Architecture and data flow

```
Humedat@ buoy (Arduino MKR WAN 1300 + sensors)
   │  LoRaWAN (AU915)
   ▼
Dragino DLOS8N gateway ──(internet)──► The Things Network v3, application "cehum-humedata", cluster au1
                                          │  payload formatter (JS decodeUplink): binary → JSON keys ap, at, bl, …
                                          ▼
                                   TTN MQTT broker au1.cloud.thethings.network:1883 (plain MQTT)
                                   topic v3/cehum-humedata@ttn/devices/<device-id>/up
                                          │  (the subscribers connect directly to TTN; confirmed 2026)
┌─────────────────────────── OpenCloud VM (Ubuntu 20.04, desarrollo.leufulab.cl) ──────────────────────┐
│  systemd: humedata.service (Atlas), humedatabp.service (BP), humedatalihuen.service (Lihuen)         │
│      └─ python3 subscribe_and_insert_to_db[_atlas|_bp].py [<device-id>]  (1 process/buoy, Restart=always)
│               │ SELECT id FROM Humedata_devices WHERE dev_eui=…  → dev_id                            │
│               │ INSERT INTO mqtt.logs (…)                                                            │
│               ▼                                                                                      │
│  MySQL 8.0.30, database `mqtt` (tables Humedata_devices, logs)   [also: empty test DB `db_test`]     │
│               │ read by Grafana (org 1 as root, org 3 as grafanareader)                              │
│               ▼                                                                                      │
│  Grafana 9.1.6 on :3000 (anonymous Viewer enabled)                                                   │
│  grafana-agent → Grafana Cloud (MySQL metrics and logs only; no sensor data)                         │
│  [Mosquitto 1.6.9 running on :1883 but NOT used; see Caveats]                                        │
└──────────────────────────────────────────────────────────────────────────────────────────────────────┘
               │ MySQL over the internet (:3306, Prisma, env CEHUM_URL)
               ▼
Humedat@-software backend (AWS App Runner) → web and mobile apps
```

The orchestration is done by **systemd**, not by Python. Each buoy has its own unit, which keeps one subscriber process alive and restarts it after a crash or a reboot.

## Components as deployed

Checked on the live server on 2026-09-24.

| Component | Value |
|---|---|
| Provider / plan | OpenCloud, "CloudServer – Estándar 1 GB". Contracted 2022-09-22 and renewed yearly (2023, 2024, 2025) for $32,130 CLP including IVA. Suspended September 2026, then renewed by a collaborator until about September 2027 |
| Address | IP `168.232.165.73`, SSH port `22222`, user `root` |
| Hostname | `desarrollo.leufulab.cl` (system hostname only; no public DNS record) |
| OS | Ubuntu 20.04.5 LTS, kernel 5.4.0-126, KVM guest, 20 GB disk (34 % used) |
| Time zone | Europe/London (see Caveats) |
| Database | MySQL 8.0.30-0ubuntu0.20.04.2 (`mysql.service`), datadir `/var/lib/mysql/`, `secure_file_priv=/var/lib/mysql-files/`, listening on `0.0.0.0:3306` |
| Dashboards | Grafana 9.1.6 (enterprise `.deb`), port 3000, config `/etc/grafana/grafana.ini`, state `/var/lib/grafana/grafana.db` (SQLite) |
| Monitoring | `grafana-agent.service` (installed 2022): MySQL exporter metrics and MySQL logs are sent to Grafana Cloud. Config: [`grafana/grafana-agent.yaml`](grafana/grafana-agent.yaml) |
| MQTT broker | Mosquitto 1.6.9, default config, running but unused (see Caveats) |
| Python | 3.8 (system `python3`). pip packages in `/usr/local`: `paho-mqtt 1.6.1`, `mysqlclient 2.1.1` (`MySQLdb`), `ntplib 0.4.0` (not used by the subscribers) |
| Subscriber code | `/home/subscribe_and_insert_to_db.py`, `/home/subscribe_and_insert_to_db_atlas.py`, `/home/subscribe_and_insert_to_db_bp.py`, `/home/log_in`, `/home/agregar_dispositivo.py`, `/home/test.py`, `/home/humedata_plantilla` |
| Scheduled jobs | None of the project's own. The root crontab is empty; only Ubuntu's default timers exist |

### Caveats: Mosquitto 1.6.9

- **What we know (confirmed 2026-09-24):**
  - Mosquitto runs (`mosquitto.service`) with the packaged default config. It has no listener or auth settings, so version 1.6 listens on `0.0.0.0:1883` and accepts anonymous clients.
  - Every subscriber connects **directly to TTN's broker**. The live processes held connections to TTN (13.55.29.193:1883), and nothing on the server connected to the local broker.
- **Why the manual was inaccurate:** it says Mosquitto "receives data from TTN". It was probably installed during early tests and never removed.
- **Not optimized:** it is an unused, anonymous, internet-exposed service that has to be patched and maintained.
- **Suggestion:** subscribe to TTN directly over TLS (port 8883), and leave out a local broker unless one is needed on purpose (e.g. a bridge that buffers messages or fans them out to several consumers).

### Caveats: server time zone Europe/London

- **What we know (confirmed 2026-09-24):**
  - The VM runs on Europe/London time (`timedatectl`), probably the provider's image default.
  - MySQL uses `time_zone = SYSTEM`. So `logs.timestamp` (`DATETIME DEFAULT CURRENT_TIMESTAMP`) is the insert time in **UK local time**: GMT in winter, BST (UTC+1) in summer.
  - The historical data therefore has a ±1 h jump at each UK daylight-saving change, and it is 3–5 h ahead of Chilean time.
  - The Grafana queries compensate with a hand-coded `DATE_ADD(timestamp, INTERVAL 1 HOUR)`.
- **Not optimized:**
  - Insert time is not measurement time: uplink delays are hidden, and buffered SD-card data can't be aligned.
  - Analysis in Chile needs a conversion that is easy to get wrong.
- **Suggestion:**
  - Run the servers and the DB in UTC.
  - Store the measurement time (TTN `received_at` or the device RTC) in its own column.
  - Convert to `America/Santiago` only for display.
  - Convert the legacy timestamps explicitly as Europe/London local time → UTC (e.g. `CONVERT_TZ(timestamp,'Europe/London','UTC')` with the MySQL time zone tables loaded, or pandas `tz_localize('Europe/London')`).

### Caveats: network exposure

- **What we know (confirmed 2026-09-24):**
  - `ufw` is disabled, and `iptables` has only two ACCEPT rules for 3306 on a default-accept policy. So every listening port is reachable from the internet: SSH 22222, MySQL 3306 and 33060, Grafana 3000, Mosquitto 1883.
  - The Grafana data source of org 1 ("Humedat@ brewer") connects to MySQL as **root**. Org 3 correctly uses `grafanareader`.
  - `grafanareader` also has `ALL PRIVILEGES` on the test database `db_test`.
- **Why:** MySQL was opened so that the Humedat@-software backend (AWS) could read it.
- **Suggestion:** a host firewall that allows only the needed ports; MySQL restricted to known IPs or behind a tunnel; Grafana behind TLS; no root data sources.

## Data model

Database `mqtt`, two tables (full DDL in [`db/schema.sql`](db/schema.sql); unchanged from 2023 to 2026). There are no triggers, events or stored routines. A second database, `db_test` (table `Data`, empty), was a test and plays no part in the system.

- **`Humedata_devices`**: `id` (int unsigned, auto-increment, PK) and `dev_eui` (varchar(16)). It is the registry of buoys.
- **`logs`**: one row per uplink.
  - `id` (auto-increment PK);
  - 22 sensor columns (all `float DEFAULT NULL`);
  - `dev_id` (int, NOT NULL DEFAULT 1);
  - `timestamp` (datetime, DEFAULT CURRENT_TIMESTAMP).
- There is **no foreign key** between `logs.dev_id` and `Humedata_devices.id`. The link is made only by the subscriber.

**Payload key → `logs` column** (the keys are produced by the TTN payload formatter):

| Payload key | Column | Payload key | Column |
|---|---|---|---|
| `ap` | `atmospheric_pressure` | `orp` | `oxide_reduction_potential` |
| `at` | `atmospheric_temperature` | `ph` | `ph` |
| `bl` | `battery_level` | `rd` | `relative_density` |
| `do` | `dissolved_oxygen` | `sal` | `salinity` |
| `ec` | `electrical_conductivity` | `tds` | `total_dissolved_solids` |
| `ih` | `internal_humidity` | `wt` | `water_temperature` |
| `ip` | `internal_pressure` | `do15` | `do_15` |
| `it` | `internal_temperature` | `do_temp` | `do_temp` |
| `lat` | `latitude` | `ec_temp` | `ec_temp` |
| `lon` | `longitude` | `sat_temp` | `sat_temp` |
| `sat` | `sat` | `ph_temp` | `ph_temp` |

**`dev_eui` → `dev_id`:** the subscriber reads `end_device_ids.dev_eui` from each TTN message, looks it up in `Humedata_devices`, and stores the resulting `id` in `logs.dev_id`. So a buoy must be registered (with `agregar_dispositivo.py`) **before** its data can be stored.

**Devices on the live server (2026-09-24):**

| DB `id` | `dev_eui` | Buoy / TTN device id | Rows in `logs` | First → last |
|---|---|---|---|---|
| 1 | `A8610A3237277009` | Atlas, `humedata-atlas` | 54,809 | 2022-09-27 → 2025-04-28 |
| 2 | `A8610A32371B6E09` | BP, `humedata-bp` | 17,259 | 2022-09-27 → 2025-05-05 |
| 3 | `A8610A3233298409` | Lihuen, `humedata-lihuen` | 47,886 | 2022-11-08 → 2024-12-17 |
| 4 | `A8610A343633830F` | `humedata-toto` (per the manual) | 0 | – |
| 5 | `A8610A32342C7210` | `humedata-lihuen-2` (per the manual) | 0 | – |

- The mapping matches the manual and the activity periods of the SD-card logs.
- In the 2023-10-23 dump, id 3 had `dev_eui` `A8610A3237267209`. It was later changed in place (`UPDATE Humedata_devices SET dev_eui = … WHERE id = 3;`, as in the manual), so rows of `dev_id` 3 before about March 2024 may come from a different board or buoy. Check this before analysing `dev_id` 3 across that date.
- The 2023 dump had only ids 1–3 (with `AUTO_INCREMENT` at 11; it is 10 in 2026), so ids 4 and 5 were inserted later, and other ids were created and deleted at some point. The exact history is not recoverable.
- `test.py` looks up `A8610A3237267200`, which is not in the table (it was a test value).

## Subscriber logic

[`subscriber/subscribe_and_insert_to_db.py`](subscriber/subscribe_and_insert_to_db.py) (generic). The `_atlas` and `_bp` copies are identical, except that the device id and the MySQL credentials are hardcoded instead of read from the argument and `/home/log_in`.

1. It takes the TTN device id as its only argument (`humedata-lihuen`, …). Without it, it prints the usage and exits.
2. It reads the DB connection from `/home/log_in`: one CSV line, `host,user,password,db` (see [`log_in.example`](subscriber/log_in.example)). If the connection fails, it exits, and systemd restarts it.
3. It connects to `au1.cloud.thethings.network:1883` (plain MQTT, no TLS) as `cehum-humedata@ttn`, with the TTN API key as the password. In `on_connect`, it subscribes to `v3/cehum-humedata@ttn/devices/<device-id>/up`, so the subscription is renewed after each reconnect.
4. On each message:
   1. It parses the JSON, and takes `end_device_ids.dev_eui` and `uplink_message.decoded_payload`.
   2. `SELECT id FROM Humedata_devices WHERE dev_eui=%s` gives `dev_id`. If the device isn't registered, `fetchone()` returns `None` and the callback raises an exception: the message is lost.
   3. It builds the `INSERT INTO mqtt.logs (…)` by **string concatenation** of `str(value)` for the 22 payload keys plus `dev_id`.
   4. It executes and commits the INSERT. On any error it rolls back and prints `Guardando en base de datos...Falló` ("saving to database... failed"). The row is **lost**, e.g. when a payload key is missing or a value is `None` (it would be written as the SQL token `None`).
5. `timestamp` is not sent. MySQL fills it at insert time (see Caveats: time zone).
6. It runs `loop_forever()`, and paho reconnects on its own after a network drop.

Nothing is buffered or retried, so an outage of the server, MySQL or the network means lost data for that period. The SD card on each buoy ("barrel memory") is the only backup.

## systemd services and their history

| Unit (in `/etc/systemd/system/`) | Buoy | ExecStart (live, 2026) | Status of the copy here |
|---|---|---|---|
| `humedata.service` | Atlas | `/usr/bin/python3 /home/subscribe_and_insert_to_db_atlas.py` | Fixed: `Type=simple`, `After=mysql.service` |
| `humedatabp.service` | BP, test bench (*banco de pruebas*) | `/usr/bin/python3 /home/subscribe_and_insert_to_db_bp.py` | Fixed: `[Unit]` header, Description, `Type=simple`, `After=mysql.service` |
| `humedatalihuen.service` | Lihuen (Xi'an Desun sensors) | `/usr/bin/python3 /home/subscribe_and_insert_to_db.py humedata-lihuen` | Added `After=mysql.service` |
| `humedataxian.service` | Xian (**retired**) | `… subscribe_and_insert_to_db.py humedata-xian` (April 2024 backup) | Kept for the record; not on the server in 2026 |

History:
- **2022–23:** a single-device script with the credentials hardcoded, plus a 2022 MySQL 5.7 schema dump (`db.sql`). This `mqtt_subscriber/` folder was removed from the repo in 2026 because it is superseded by this folder. It remains in the git history, e.g. [at commit `4830a40`](https://github.com/ojoaustral/cehum-humedata_CC/tree/4830a40/mqtt_subscriber). An early unit, `humedatad.service`, remains only as an editor backup file, `/etc/systemd/system/.#humedatad.service`.
- **2022-09-27:** `humedata.service` and `humedatabp.service` were created. They run per-device copies of the script (`_atlas.py`, `_bp.py`), and these copies, last modified 2023-08-24, still ran in 2026.
- **2023-08:** the generic, argument-driven script was written, with the credentials moved to `/home/log_in`, together with the unit template `/home/humedata_plantilla`. A stray copy of the template sits at `/etc/systemd/sytem` (typo). The generic script was first used by `humedataxian.service`.
- **2024-04-18:** `humedatalihuen.service` was created from the template, and `humedataxian.service` was removed. "Xian" referred to the Xi'an Desun sensor buoy, whose TTN device is `humedata-lihuen`.

Bugs in the original units (still present on the server; fixed in the copies here, with a comment on each):
- `humedatabp.service` starts with `Unit]`, so systemd ignores the `[Unit]` section.
- `Type=Simple` should be lowercase.
- `mysqld.service` is not the unit name on Ubuntu (it is `mysql.service`), so the ordering had no effect.

## Operations

All commands run on the VM as `root`, unless stated otherwise. The passwords are in the private credentials file (`SERVER_SSH_PASSWORD`, `MYSQL_ADMIN_PASSWORD`, `GRAFANA_ADMIN_PASSWORD`).

### Access (SSH / SCP / WinSCP)

```bash
ssh -p 22222 root@168.232.165.73
scp -P 22222 root@168.232.165.73:/var/lib/mysql-files/file.csv .   # capital -P for scp; -p means "preserve times"
```

- WinSCP (Windows GUI): protocol SCP, host `168.232.165.73`, port `22222`, user `root`.
- Useful commands:
  - `systemctl list-units --type=service`, `systemctl status humedata.service`, `journalctl -u humedata.service -f`;
  - `cd ..` goes up one level;
  - `exit` or `logout` closes the session.
- MySQL without typing the root password: `mysql --defaults-file=/etc/mysql/debian.cnf` (Ubuntu's maintenance account, full privileges).

### Service control

```bash
sudo systemctl status  humedata.service humedatabp.service humedatalihuen.service
sudo systemctl restart humedata.service humedatabp.service humedatalihuen.service
sudo systemctl enable  humedatalihuen.service   # start at boot
sudo systemctl daemon-reload                    # after editing a unit file
```

### Add a buoy

1. Create the end device in the TTN console (application `cehum-humedata`) and check that its payload formatter outputs the keys listed above.
2. Register its `dev_eui` in MySQL: `python3 /home/agregar_dispositivo.py`, then enter the `dev_eui`. The script prints the new `id`, which is the `dev_id` used in Grafana queries.
3. Copy [`systemd/humedata_template.service`](systemd/humedata_template.service) to `/etc/systemd/system/humedata<name>.service` and set the device id.
4. Run `sudo systemctl daemon-reload && sudo systemctl enable --now humedata<name>.service`, then check `journalctl -u humedata<name>.service`.

To replace a buoy's Arduino (new `dev_eui`) and keep its time series, update the existing row: `UPDATE Humedata_devices SET dev_eui = '<new>' WHERE id = <id>;`. This is what was done for id 3. Record the date, because the data before and after come from different boards.

### Add a variable

1. Back up the database first (see below).
2. `ALTER TABLE logs ADD COLUMN new_variable float DEFAULT NULL;`
3. Add the column and `str(response['<key>'])` to the INSERT in **all three** subscriber scripts. Add the key to the TTN payload formatter **first**: a key missing from the payload makes every insert fail.
4. Restart all the subscriber services.

### Triggers for calibration

`BEFORE INSERT` triggers on `logs` can correct incoming values, for example for a calibration valid over a time window. They don't touch existing rows. See the template in the manual (*Disparadores para ajustes/correcciones*). Keep every trigger's SQL under version control. **No trigger was ever created on this server**: none exists in 2026, and none appears in the root MySQL history.

- Create: `DELIMITER // CREATE TRIGGER … BEFORE INSERT ON logs FOR EACH ROW BEGIN SET NEW.col = …; END; // DELIMITER ;`
- Remove: `DROP TRIGGER name;`
- List: `SHOW TRIGGERS FROM mqtt;`

### Backup and restore

The commands used for the 2026 final backup (run from a PC with SSH access; nothing is written on the server):

```bash
# consistent dump of the data DBs, including routines/triggers/events
ssh -p 22222 root@168.232.165.73 "mysqldump --defaults-file=/etc/mysql/debian.cnf --single-transaction --routines --triggers --events --set-gtid-purged=OFF --databases mqtt db_test | gzip -9" > mysql_mqtt_full_$(date +%F).sql.gz
# users and grants (e.g. grafanareader) are not in a DB dump: export SHOW CREATE USER / SHOW GRANTS per user
# Grafana state (dashboards, users, orgs, annotations): online-safe copy with sqlite3, no service stop needed
ssh -p 22222 root@168.232.165.73 'T=$(mktemp); sqlite3 /var/lib/grafana/grafana.db ".backup $T" && gzip -c $T; rm -f $T' > grafana_db_$(date +%F).sqlite.gz
# code and configuration
ssh -p 22222 root@168.232.165.73 "tar czf - /home /root /etc /usr/local /var/lib/grafana/plugins /usr/share/grafana/public/img" > server_files_$(date +%F).tar.gz
```

- Restore: `gunzip -c mysql_mqtt_full_….sql.gz | mysql -u root -p`. The dump contains `CREATE DATABASE`.
- Dashboards alone can be re-imported from [`grafana/dashboards/`](grafana/dashboards/) through *Dashboards → Import*.

### Grafana

- **URL:** `http://168.232.165.73:3000`. **Logins:** admin, and the viewers `humedata`, `Leufulab`, `viewer`, `cristian` and `david@leufulab.cl` (passwords in the manual / credentials file).
- **Organizations:**
  - `1 "Humedat@ brewer "` is the working org. It has all the dashboards, and its data source connects as root.
  - `3 "Humedata ISF (Atlas beta)"` is where anonymous visitors land. It has the ISF dashboards, and its data source is `grafanareader`.
  - To copy a dashboard between orgs: *Share → Export → View JSON*, then *Dashboards → Import*, then add the data source in the target org.
- **Dashboards** (JSON in [`grafana/dashboards/`](grafana/dashboards/)):
  - "Humedat@ - Atlas" (`3qwsMH87k`);
  - "Humedat@ - Lihuen" (`3qwsMH87x`);
  - "Humedat@s" (`f-QolhDVz`, last edited 2025-04);
  - "Humedat@" (`3qwsMH87k_C`);
  - "Humedat@ - ISF (Atlas beta)" (`3qwsMH87k_B`, in both orgs, plus a "Copy" in org 3).

  Panel types: time series, gauge, bar gauge, geomap, histogram, table, text. The geomap panels are the ones to check when upgrading Grafana.
- **Anonymous access:** set in `[auth.anonymous]` in `/etc/grafana/grafana.ini` (see [`grafana/grafana.ini.snippet`](grafana/grafana.ini.snippet)). No "public dashboard" links were created. Access logs are in `/var/log/grafana/`.
- **Images:** copy them to `/usr/share/grafana/public/img/`, run `chown grafana:grafana`, and reference them as `/public/img/<file>` in Markdown panels. The images used are in [`grafana/img/`](grafana/img/).
- **Gaps in time series:** regularize with `$__timeGroup(ts,'1h',NULL)` and `AVG()`, so hours with no data become `NULL` and show as gaps. The queries also shift `timestamp` by `+1 HOUR` (see Caveats: time zone).
- **Annotations:** stored in `grafana.db`; exported to [`grafana/annotations.json`](grafana/annotations.json), with the tags `mantención`, `Experimento`, `debugging` and `Events`. Use a dashboard-level annotation query with the Grafana source to show them on every panel.
- **SMTP:** never configured (pattern in the snippet).
- **Grafana Agent / Cloud:** the stack `humedata.grafana.net` received only server metrics and logs through `grafana-agent`. Sensor data never went to Grafana Cloud.

## Where the data lives

The data is **not** in this repository. It is archived in the project's Dropbox at `CEHUM-SNCA/Proyecto_CIA/Humedat@/Data/`:

| Source | Coverage |
|---|---|
| **`opencloud_final_backup_2026_09/mysql_mqtt_full_2026-09-24.sql.gz`** (full dump, 3.6 MB gz) | **All 119,954 `logs` rows, 2022-09-27 → 2025-05-05**, `dev_id` 1–3 (see Data model) |
| `mqtt_DB_backup_2023_10_23.sql` (older dump, 9.3 MB) | 58,863 rows, 2022-09-27 → 2023-10-24 (a subset of the above) |
| `Atlas_2024_09_13_barrel memory/LOG-0000.CSV` (1.3 GB; a superset of the earlier Atlas SD files) | SD card, 2023-02 → 2024-09-17 |
| `BP_2024_09_12_barrel memory/` (2 files) | SD card, 2024-05 → 2024-11-06 |
| `Lihuen_2023_lab/`, `Lihuen_2024_10_17_barrel memory/` | SD card, 2023; 2024-03 → 2024-10 |

- **Transmitted data** (the DB) covers every buoy until its last uplink:
  - Lihuen: December 2024;
  - Atlas: April 2025;
  - BP: May 2025.
  - There are gaps (e.g. no uplinks in March 2025). The buoys were not deployed after mid-2025.
- The **SD-card logs** are the on-board copy. They can fill gaps in transmission, but they are raw firmware CSVs with their own header (not the `logs` schema), and many rows have no valid RTC date.
- The same folder `opencloud_final_backup_2026_09/` also holds:
  - `grafana_db_2026-09-24.sqlite.gz` (full Grafana state);
  - `mysql_users_and_grants_2026-09-24.sql`;
  - `server_files_2026-09-24.tar.gz` (`/home`, `/root`, `/etc`, `/usr/local`, Grafana plugins and images, Mosquitto state).

  These files are **private**: they contain password hashes and keys.

## Notes for future re-engineering

These are listed only; **none has been implemented**.

- **Libraries:**
  - paho-mqtt 2.x changed the `Client()` constructor (it needs `CallbackAPIVersion`) and the callback signatures, so this code needs paho-mqtt < 2 (it ran on 1.6.1) or a port.
  - Consider PyMySQL, which is pure Python, instead of `mysqlclient` (which needs C build dependencies).
- **Platform end of life:** Ubuntu 20.04 (standard support ended in April 2025), MySQL 8.0 (end of life in April 2026), and Grafana 9 (current major version is 12; check the geomap panels).
- **Insert logic:**
  - Use a parameterized INSERT built from the key → column mapping.
  - Treat missing keys or `None` as `NULL` instead of dropping the whole row.
  - Handle unregistered `dev_eui` values explicitly.
  - The current string concatenation is also an injection risk, if the payload is ever not trusted.
  - Use one generic script for all buoys, instead of the hardcoded per-device copies.
- **Time:** see [Caveats: time zone](#caveats-server-time-zone-europelondon). Use UTC, and store the measurement time and TTN `received_at`.
- **Transport:** MQTT over TLS on port 8883. Leave out Mosquitto (see [Caveats: Mosquitto](#caveats-mosquitto-169)).
- **Secrets:**
  - Keep them in environment variables or a secrets manager (e.g. a systemd `EnvironmentFile=` with mode 600), not in code or in `/home/log_in`.
  - Use a dedicated MySQL user with INSERT/SELECT on `mqtt` for the subscriber, and never root for Grafana.
- **systemd:** one templated unit, `humedata@.service` with `ExecStart=… %i`, run as a non-root user, instead of one file per buoy.
- **Resilience:**
  - Buffer or retry when MySQL is unavailable.
  - Consider TTN's Storage Integration, or a webhook, as a second path.
  - Automate off-site backups (DB + `grafana.db`).
- **Schema:**
  - Add a foreign key `logs.dev_id → Humedata_devices.id`.
  - Add name and date-range columns to `Humedata_devices`, so board swaps like id 3's are recorded.
  - Add an index on `(dev_id, timestamp)`.
  - Use one character set for both tables (`logs` is `utf8mb3`).
- **Exposure:** see [Caveats: network exposure](#caveats-network-exposure). Add a firewall, restrict MySQL, and put Grafana behind TLS.

## Status and final backup (2026)

- **September 2026:** the VM was suspended for non-payment, and this record was first written from the April 2024 code backup. A collaborator then paid for another year (until about September 2027).
- **2026-09-24:** the live server was inspected and fully backed up. Everything in this folder was checked against it. The backup is described in [Where the data lives](#where-the-data-lives).
- **Earlier record:** a previous self-audit made on the server on 2025-09-21 (`/root/hmedata_audit_2025-09-21_131404/`) is included in the file backup.
- **Nothing known is lost:**
  - code, units and configuration are in this folder;
  - the complete database, Grafana state, users and grants and the full file system configuration are in the private backup;
  - credentials are in the maintainer's `credentials/` folder.
- **At the end of the paid period:**
  - take a last backup if new data arrived (same commands);
  - revoke the TTN API key;
  - then let the service lapse.
- A future server should be rebuilt from this record, applying the [Notes for future re-engineering](#notes-for-future-re-engineering).
