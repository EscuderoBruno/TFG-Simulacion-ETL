-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         11.4.0-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.3.0.6589
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Volcando estructura para tabla tfg.sensors
CREATE TABLE IF NOT EXISTS `sensors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `coordinates` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`coordinates`)),
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla tfg.sensors: ~1 rows (aproximadamente)
DELETE FROM `sensors`;
INSERT INTO `sensors` (`id`, `name`, `coordinates`, `createdAt`, `updatedAt`, `userId`) VALUES
	(24, 'Sensores C02', '[{"lat":37.774929,"long":-122.419418,"height":15,"alias":"C02_SENSOR3","dev_eui":"A81758FFFE02ABCD","join_eui":"0102030405060708","dev_addr":"26011B4B"},{"lat":-33.86882,"long":151.20929,"height":12,"alias":"C02_SENSOR4","dev_eui":"70B3D57ED005A7B2","join_eui":"0000000000000000","dev_addr":"260B7694"},{"lat":48.856613,"long":2.352222,"height":8,"alias":"C02_SENSOR5","dev_eui":"A81758FFFE02CDEF","join_eui":"0102030405060708","dev_addr":"26011B4C"},{"lat":34.052235,"long":-118.243683,"height":9.5,"alias":"C02_SENSOR6","dev_eui":"70B3D57ED005A7C3","join_eui":"0000000000000000","dev_addr":"260B7695"},{"lat":-23.55052,"long":-46.633308,"height":11,"alias":"C02_SENSOR7","dev_eui":"A81758FFFE02DCBA","join_eui":"0102030405060708","dev_addr":"26011B4D"},{"lat":55.755825,"long":37.617298,"height":10,"alias":"C02_SENSOR8","dev_eui":"70B3D57ED005A7D4","join_eui":"0000000000000000","dev_addr":"260B7696"}]\r\n', '2024-11-11 10:55:18', '2024-11-11 10:55:18', 24);

-- Volcando estructura para tabla tfg.simulations
CREATE TABLE IF NOT EXISTS `simulations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `sensorId` int(11) NOT NULL,
  `parameters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`parameters`)),
  `userId` int(11) NOT NULL,
  `minRegistrosPorInstante` int(11) NOT NULL,
  `maxRegistrosPorInstante` int(11) NOT NULL,
  `minIntervaloEntreRegistros` int(11) NOT NULL,
  `maxIntervaloEntreRegistros` int(11) NOT NULL,
  `numElementosASimular` int(11) NOT NULL,
  `noRepetirCheckbox` int(11) DEFAULT 0,
  `date` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  KEY `locationId` (`sensorId`) USING BTREE,
  CONSTRAINT `simulations_ibfk_1` FOREIGN KEY (`sensorId`) REFERENCES `sensors` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  CONSTRAINT `simulations_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla tfg.simulations: ~4 rows (aproximadamente)
DELETE FROM `simulations`;
INSERT INTO `simulations` (`id`, `name`, `sensorId`, `parameters`, `userId`, `minRegistrosPorInstante`, `maxRegistrosPorInstante`, `minIntervaloEntreRegistros`, `maxIntervaloEntreRegistros`, `numElementosASimular`, `noRepetirCheckbox`, `date`, `createdAt`, `updatedAt`) VALUES
	(1, 'Simulación MQTT', 24, '{"campo2":"^int[0,6]","campo3":"^float[20,25]","campo4":"^bool[8,9]","time":"^time","campo5":"este texto","campo6":"^array[4]int[0,50]","campo7":"^array[4]float[0,50]","campo8":"^array[4]bool","campo9":{"campo10":"^array[4]float[0,50]","campo11":"^float[20,25]"},"campo12":"^positionlong","campo13":"^positionlat","campo14":"^positioncote","campo15":"^positionalias"}', 24, 3, 5, 2, 5, 0, 0, '2024-11-06 12:18:00', '2024-10-27 18:53:16', '2024-10-27 18:53:16'),
	(2, 'S2', 24, '{"campo2":"^int[0,10]","campo3":"^float[20,25]","campo4":"^bool[8,9]","time":"^time","campo5":"este texto","campo6":"^array[4]int[0,50]","campo7":"^array[4]float[0,50]","campo8":"^array[4]bool","campo9":{"campo10":"^array[4]float[0,50]","campo11":"^float[20,25]"},"campo12":"^positionlong","campo13":"^positionlat","campo14":"^positioncote","campo15":"^positionalias"}', 24, 4, 8, 12, 15, 1, 0, '2024-11-08 12:41:27', '2024-10-27 18:54:12', '2024-11-21 10:42:21'),
	(20, 'Simulación de prueba', 24, '{"campo2":"^int[0,10]","campo3":"^float[20,25]","campo4":"^bool[8,9]","time":"^time","campo5":"este texto","campo6":"^array[4]int[0,50]","campo7":"^array[4]float[0,50]","campo8":"^array[4]bool","campo9":{"campo10":"^array[4]float[0,50]","campo11":"^float[20,25]"},"campo12":"^positionlong","campo13":"^positionlat","campo14":"^positioncote","campo15":"^positionalias","campo16":"^positiondeveui","campo17":"^positionjoineui","campo18":"^positiondevaddr"}', 24, 4, 6, 15, 20, 164, 1, '2024-11-14 11:00:00', '2024-11-17 11:57:39', '2024-11-19 10:34:35');

-- Volcando estructura para tabla tfg.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` int(11) NOT NULL DEFAULT 0,
  `estado` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla tfg.users: ~3 rows (aproximadamente)
DELETE FROM `users`;
INSERT INTO `users` (`id`, `username`, `password`, `rol`, `estado`, `createdAt`, `updatedAt`) VALUES
	(24, 'admin', '$2b$10$2Tp7wyCyL6Fa1VxSqEr9SOOwY/0vA317fkAKXcWnLrzlwjC/7zwCq', 1, 1, '2024-10-17 18:12:48', '2024-10-17 18:12:48'),
	(25, 'user1', '$2b$10$0YlwUrDhy0gHQKgShHPSEOzz4//b47/Fp3BeqKyzX.tU9y5F4D6d2', 0, 0, '2024-10-17 18:12:52', '2024-10-17 18:12:52'),
	(26, 'user 2', '$2b$10$yRcRSiOP229GUtH8LjuTE.tDmOPlnEtpC7CLu8A2jLtsQRM6opGR6', 0, 1, '2024-10-18 10:45:48', '2024-10-18 10:45:48');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
