
[English](README.md) | [Español](README.es.md)

# Humedat@ — Smart buoy for real-time, cost-effective water quality monitoring

> **Humedat@** is a technological innovation born in Valdivia, Chile, and promoted by the [Centro de Humedales Río Cruces (CEHUM)](https://cehum.org/) in collaboration with [LeufüLab](https://leufulab.cl/), both part of [Universidad Austral de Chile](https://www.uach.cl/). It is designed for remote, continuous, and real-time monitoring of water quality in wetlands and other aquatic ecosystems.  


<p>
  <img src="images/logo_CEHUM.png" alt="CEHUM logo" height="150"/>
  <img src="images/leufulab_logo.jpg" alt="Leufulab logo" height="150"/>
<img src="images/logo_uach.png" alt="Leufulab logo" height="150"/>
</p>

## Table of Contents

- [What is Humedat@?](#what-is-humedat)
- [Project team and contributors](#project-team-and-contributors)
- [Funding and support](#funding-and-support)
- [Repository Contents](#repository-contents)
- [How the System Works](#how-the-system-works)
- [Hardware Overview](#hardware-overview)
- [Software Features](#software-features)
  - [Web Application](#web-application)
  - [Mobile App](#mobile-app)
- [Cloud and Data Infrastructure](#cloud-and-data-infrastructure)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [License](#license)

---
## What is Humedat@?

Humedat@ is an open, low-cost environmental monitoring system born in Valdivia, Chile, designed to continuously track water quality in wetlands and other aquatic ecosystems. Each Humedat@ unit is built around a repurposed stainless steel beer keg, housing waterproof sensors, microcontrollers, power systems, local storage, and wireless communication modules.

![Image of Hunedata floating in a wetland](images/Image1.jpeg)

![Image of Hunedata floating in a wetland](images/Image2.jpg)

The system records environmental variables — such as water temperature, pH, electrical conductivity, dissolved oxygen, and oxidation-reduction potential — alongside internal device health indicators. Data are transmitted wirelessly from the field to cloud-based storage and made available through interactive web and mobile interfaces, in near real time.

Humedat@-software was designed to scale the platform: For example, CEHUM can deploy it across multiple organizations, each managing its own network of buoys grouped into **clusters** (e.g., by project or client) and **zones** (individual measurement sites, one buoy per zone). If a smart buoy requires maintenance and is swapped out, the software handles the transition transparently so that data series remain uninterrupted.

The project aims to make environmental monitoring technology more accessible for research, education, conservation, and community-based wetland stewardship.

---
## Project team and contributors

**Project lead**

- **Cristián Correa, PhD** — Marine Biologist and Ecologist — [cristiancorrea@gmail.com](mailto:cristiancorrea@gmail.com)

**Core technical contributors**

- **Christian Santibáñez** — Electrical Engineer  
- **David Valencia** — Industrial Designer  
- **Ian Zamora** — Electronic Engineer  
- **Kathrina Loyola** — BSc in Biology  
- **Matías Soto** — Software Engineer  

---

## Funding and support

This project has been made possible through the institutional backing and funding of the [Centro de Humedales Río Cruces (CEHUM)](https://cehum.org/), the [Proyecto de Conservación Habitable Isla San Francisco](https://tfertil.cl/proyecto/isla-san-francisco/), contributions from [Cerveza Kunstmann](https://www.cerveza-kunstmann.cl/), collaboration with [LeufüLab](https://leufulab.cl/) . The current Humedat@-software prototype was developed through Course IIC2154 — Proyecto de Especialidad 2024, Pontificia Universidad Católica de Chile, as part of the broader Humedat@ hardware–software ecosystem.

---

## Repository Contents

This repository contains the full codebase and documentation for the Humedat@ system:

| Folder | Description |
|---|---|
| `manual_humedata/` | **Full technical manual** (hardware, firmware, cloud setup, calibration) |
| `Humedata-software/` | Web application (frontend + backend) and mobile app |
| `humedata_atlas/` | Arduino firmware for Atlas Scientific sensor buoys |
| `humedata_xian/` | Arduino firmware for Xi'an Desun sensor buoys |
| `TTN_payload_formatters/` | JavaScript decoders for LoRaWAN data packets (The Things Network) |
| `mqtt_subscriber/` | Service that receives data from TTN and writes it to the MySQL database |
| `data_storage/` | Database scripts and schema definitions |
| `printed_circuit_boards/` | PCB design files for the Humedat@ mainboard |
| `handle_sensors_test/` | Test code for individual sensor modules |
| `humedata_testing/` | Integration test scripts |
| `working_codes/` | Stable/reference versions of device firmware |
| `xian_gps_debug/` | GPS diagnostic utilities |

---

## How the System Works

Data flows through several layers from smart buoy to browser:

```
Sensors → Arduino (MKR WAN 1300) → LoRaWAN radio → Dragino Gateway
    → The Things Network (TTN) → MQTT subscriber → MySQL database
        → Backend API (AWS App Runner) → Web / Mobile App
```

1. **On the smart buoy:** An Arduino microcontroller reads sensors at configurable intervals and packages the data into compact binary packets.
2. **Wireless transmission:** Data are sent via LoRaWAN radio to a Dragino gateway, which forwards them to The Things Network (TTN) over the internet (WiFi or cellular SIM card).
3. **Cloud ingestion:** A payload formatter in TTN decodes the binary packets into readable values. An MQTT subscriber service then writes the data into a MySQL database hosted on OpenCloud.
4. **Visualization:** A web application and companion mobile app allow users to explore and interact with the data — through maps, time-series charts, and downloadable CSV exports.

---

## Hardware Overview

Each Humedat@ smart buoy is built around:

- **Custom PCBs** hosting the Arduino MKR WAN 1300, with ports for Atlas Scientific sensors (I2C), Xi'an sensors (RS485), GPS, and internal environmental sensors.
- **MOSFET-based power circuits** for automatic daily resets, magnetic-switch resets (using a magnet on the outside of the keg), and GPS power management to extend battery life.
- **Atlas Scientific EZO modules** or **Xi'an Desun** for water quality sensing (pH, dissolved oxygen, conductivity, ORP, temperature).
- **Solar panels and batteries** for autonomous operation.
- **SD card** for local data backup in case of connectivity loss.
- **Dragino DLOS8N gateway** for LoRaWAN connectivity (via WiFi or a cellular SIM card).

PCB design files are available in the `printed_circuit_boards/` folder.

---

## Software Features
The current Humedat@-software prototype was developed through Course IIC2154 — Proyecto de Especialidad 2024, Pontificia Universidad Católica de Chile, as part of the broader Humedat@ hardware–software ecosystem.

### Web Application
The web platform serves four user roles with progressively broader permissions:

- **Visitors** can explore maps and view sensor time-series charts without logging in.
- **Common users** (with an account) can also download data as CSV files.
- **Administrators** can annotate time series, mask/unmask data periods, apply mathematical corrections, derive new variables, and configure alarm triggers — for their own organization's buoys.
- **The super user** (CEHUM) can do all of the above across all organizations, and manage user accounts and organizational settings.

Key features include interactive maps, time-series visualization with smoothing and logarithmic scale options, customizable threshold regions for quick status interpretation, and zone-based data identification (so swapping a physical buoy is transparent to users).

### Mobile App
The companion app is designed for fieldwork:

- **Calibration module:** Connect to a smart buoy's Arduino via Bluetooth to read sensor output and upload calibration code — without needing a laptop in the field.
- **Map and data view:** Browse smart buoy locations, select a unit, and explore its data directly on a smartphone.
- **Offline support:** Partial offline functionality allows calibration in remote areas with limited connectivity.
- Compatible with both iOS and Android.


---
## Cloud and Data Infrastructure

Humedat@ can be deployed using different cloud and software configurations depending on the scale, connectivity, visualization needs, and maintenance capacity of each implementation. The current and historical configurations include the following components:

| Component | Technology | Purpose |
|---|---|---|
| LoRaWAN network | The Things Network (TTN) | Receives and manages data packets transmitted by Humedat@ devices through LoRaWAN gateways |
| Payload decoding | TTN payload formatters | Decodes compact LoRaWAN binary packets into readable environmental variables |
| Sensor data ingestion | Python MQTT subscriber | Listens for decoded TTN messages and writes sensor data into the database |
| Sensor data storage | MySQL | Stores decoded environmental measurements, timestamps, and device identifiers |
| Cloud/server hosting | OpenCloud and AWS-based configurations | Hosts database, backend, or application services depending on deployment needs |
| Backend API | Node.js, Express, TRPC, Prisma | Provides the application layer connecting databases, users, and client interfaces |
| User and application data | Application database managed through the software stack | Stores application-level information such as users, organizations, clusters, zones, permissions, and configuration metadata |
| User authentication | Clerk | Manages user identity, login, and role-based access |
| Web interface | React, Next.js, Tailwind CSS, Shadcn/ui | Provides browser-based maps, time-series visualization, data export, annotation, and administration tools |
| Mobile interface | React Native and Expo | Supports field-oriented access, including calibration workflows and mobile data consultation |
| Advanced data processing | R software | Supports advanced analyses, data-quality checks, calibration assessments, and custom visualizations, particularly during experimental and development trials |
| Legacy dashboards | Grafana | Previously used for direct visualization of MySQL sensor data; retained as a reference and backup visualization pathway |


This infrastructure is modular. Individual deployments may use only part of the stack, replace specific services, or adapt the configuration to local technical capacity, connectivity conditions, hosting preferences, and long-term maintenance needs.


---

## Getting Started

For full setup instructions — including PCB assembly, Arduino firmware upload, TTN gateway and end-device registration, MySQL database creation, backend deployment, and sensor calibration procedures — refer to the technical manual:

📄 [`manual_humedata/Humedata_Manual_Admin.docx`](./manual_humedata/Humedata_Manual_Admin.docx)

For developers contributing code:

1. **Fork** this repository and clone your fork locally (GitHub Desktop is recommended for those less familiar with the command line).
2. Work in your local copy, commit changes with clear messages, and push to your fork.
3. When ready, open a **Pull Request** to the main repository with a description of what you changed and why.

All meaningful changes to firmware, electronics, server configuration, SQL queries, calibration procedures, and documentation should be tracked in this repository to support traceability and long-term maintenance.

---

## Contributing

Contributions are welcome — whether you are fixing a bug, improving documentation, proposing new features, or porting the system to new hardware. Please use pull requests with a clear description of the problem addressed, the proposed solution, and any tests performed.

For questions or collaboration inquiries, contact: **Cristián Correa** — [cristiancorrea@gmail.com](mailto:cristiancorrea@gmail.com)

---

## License

The source code in this repository is licensed under **GNU General Public License v3.0** (see [`LICENSE`](./LICENSE) for details). Documentation, images, diagrams, and hardware design files are also distributed under GPL-3.0, or under the specific license indicated in their respective folders.
