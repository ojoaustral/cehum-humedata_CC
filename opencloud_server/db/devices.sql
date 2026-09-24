-- Humedat@ device registry (`Humedata_devices`) as found on the live OpenCloud server, 2026-09-24.
-- `id` is what `logs`.`dev_id` stores; the subscriber maps the uplink's dev_eui to this id.
-- Buoy names are INFERRED from activity periods (they match the SD-card logs); confirm against TTN.
--   id 1  Atlas (Atlas Scientific sensors)   54,809 rows  2022-09-27 -> 2025-04-28
--   id 2  BP (banco de pruebas)              17,259 rows  2022-09-27 -> 2025-05-05
--   id 3  Lihuen (Xi'an Desun sensors)       47,886 rows  2022-11-08 -> 2024-12-17
--   id 4, 5  registered, no rows in `logs`
-- History: in the 2023-10-23 dump only ids 1-3 existed, and id 3 had dev_eui A8610A3237267209.
-- Its dev_eui was later changed in place (manual: UPDATE Humedata_devices SET dev_eui = ... WHERE id = 3;),
-- i.e. a new radio/board kept the same dev_id so the time series continued.
USE `mqtt`;

INSERT INTO `Humedata_devices` VALUES (1,'A8610A3237277009'),(2,'A8610A32371B6E09'),(3,'A8610A3233298409'),(4,'A8610A343633830F'),(5,'A8610A32342C7210');
