-- Humedat@ database `mqtt`: schema only (DDL), extracted in 2026 from
-- mqtt_DB_backup_2023_10_23.sql (mysqldump 10.13, MySQL 8.0.30-0ubuntu0.20.04.2).
-- Data rows are NOT included (see opencloud_server/README.md, "Where the data lives").
-- Device rows: db/devices.sql.
--
-- Note: `logs`.`timestamp` is set by MySQL (DEFAULT CURRENT_TIMESTAMP) at insert time, in the
-- server's local time zone (Europe/London). See README "Caveats: time zone".

CREATE DATABASE IF NOT EXISTS `mqtt`;
USE `mqtt`;

DROP TABLE IF EXISTS `Humedata_devices`;
CREATE TABLE `Humedata_devices` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `dev_eui` varchar(16) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
DROP TABLE IF EXISTS `logs`;
CREATE TABLE `logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `atmospheric_pressure` float DEFAULT NULL,
  `atmospheric_temperature` float DEFAULT NULL,
  `battery_level` float DEFAULT NULL,
  `dissolved_oxygen` float DEFAULT NULL,
  `electrical_conductivity` float DEFAULT NULL,
  `internal_humidity` float DEFAULT NULL,
  `internal_pressure` float DEFAULT NULL,
  `internal_temperature` float DEFAULT NULL,
  `latitude` float DEFAULT NULL,
  `longitude` float DEFAULT NULL,
  `oxide_reduction_potential` float DEFAULT NULL,
  `ph` float DEFAULT NULL,
  `relative_density` float DEFAULT NULL,
  `salinity` float DEFAULT NULL,
  `total_dissolved_solids` float DEFAULT NULL,
  `water_temperature` float DEFAULT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `dev_id` int NOT NULL DEFAULT '1',
  `do_15` float DEFAULT NULL,
  `do_temp` float DEFAULT NULL,
  `ec_temp` float DEFAULT NULL,
  `sat_temp` float DEFAULT NULL,
  `sat` float DEFAULT NULL,
  `ph_temp` float DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
