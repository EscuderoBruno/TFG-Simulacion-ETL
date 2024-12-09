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

-- Volcando estructura para tabla tfg.connections
CREATE TABLE IF NOT EXISTS `connections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` int(11) NOT NULL DEFAULT 0,
  `options` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`options`)),
  `userId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`),
  CONSTRAINT `connections_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla tfg.connections: ~3 rows (aproximadamente)
DELETE FROM `connections`;
INSERT INTO `connections` (`id`, `name`, `type`, `options`, `userId`, `createdAt`, `updatedAt`) VALUES
	(4, 'API conexión prueba', 1, '{"host":"https://ingest.kunna.es","token":"TUSqB0vAm2qNHmlLELTRLG25EfGbo6;n4D-Pdv5rANPJA3.ypMmg8Z2Z-NBp@xi3.WXL%pXm0xtwS0++DxvR-7vuFc+0yUf","port":"","username":"","password":"","clientId":"","topic":"ua.kunnagentest.raw"}', 24, '2024-12-02 10:37:17', '2024-12-02 10:37:17'),
	(7, 'Conexion API', 1, '{"URL":"https://ingest.kunna.es","header":"TUSqB0vAm2qNHmlLELTRLG25EfGbo6;n4D-Pdv5rANPJA3.ypMmg8Z2Z-NBp@xi3.WXL%pXm0xtwS0++DxvR-7vuFc+0yUf","username":"","password":"","clientId":"mqtt_3m3kkjy8l56","topic":""}', 24, '2024-12-03 09:52:19', '2024-12-03 09:52:19'),
	(8, 'MQTT prueba', 0, '{"URL":"wss://b1f3d09eed3e4e998e98502c5567a212.s1.eu.hivemq.cloud:8884/mqtt","header":"","username":"admin_genesis","password":"Genesis1","clientId":"clientId-A9UZcYmtr4","topic":"ua"}', 24, '2024-12-03 11:13:31', '2024-12-03 11:13:31');

-- Volcando estructura para tabla tfg.sensors
CREATE TABLE IF NOT EXISTS `sensors` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `coordinates` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`coordinates`)),
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `userId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla tfg.sensors: ~1 rows (aproximadamente)
DELETE FROM `sensors`;
INSERT INTO `sensors` (`id`, `name`, `coordinates`, `createdAt`, `updatedAt`, `userId`) VALUES
	(24, 'Sensores C02', '[{"lat":37.774929,"long":-122.419418,"height":15,"alias":"C02_SENSOR3","dev_eui":"A81758FFFE02ABCD","join_eui":"0102030405060708","dev_addr":"26011B4B"},{"lat":-33.86882,"long":151.20929,"height":12,"alias":"C02_SENSOR4","dev_eui":"70B3D57ED005A7B2","join_eui":"0000000000000000","dev_addr":"260B7694"},{"lat":48.856613,"long":2.352222,"height":8,"alias":"C02_SENSOR5","dev_eui":"A81758FFFE02CDEF","join_eui":"0102030405060708","dev_addr":"26011B4C"},{"lat":34.052235,"long":-118.243683,"height":9.5,"alias":"C02_SENSOR6","dev_eui":"70B3D57ED005A7C3","join_eui":"0000000000000000","dev_addr":"260B7695"},{"lat":-23.55052,"long":-46.633308,"height":11,"alias":"C02_SENSOR7","dev_eui":"A81758FFFE02DCBA","join_eui":"0102030405060708","dev_addr":"26011B4D"},{"lat":55.755825,"long":37.617298,"height":10,"alias":"C02_SENSOR8","dev_eui":"70B3D57ED005A7D4","join_eui":"0000000000000000","dev_addr":"260B7696"}]\r\n', '2024-11-11 10:55:18', '2024-11-11 10:55:18', 24);

-- Volcando estructura para tabla tfg.simulations
CREATE TABLE IF NOT EXISTS `simulations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `sensorId` int(11) NOT NULL,
  `connectionId` int(11) DEFAULT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla tfg.simulations: ~5 rows (aproximadamente)
DELETE FROM `simulations`;
INSERT INTO `simulations` (`id`, `name`, `sensorId`, `connectionId`, `parameters`, `userId`, `minRegistrosPorInstante`, `maxRegistrosPorInstante`, `minIntervaloEntreRegistros`, `maxIntervaloEntreRegistros`, `numElementosASimular`, `noRepetirCheckbox`, `date`, `createdAt`, `updatedAt`) VALUES
	(1, 'Simulación MQTT', 24, 4, '{"campo2":"^int[0,6]","campo3":"^float[20,25]","campo4":"^bool[8,9]","time":"^time","campo5":"este texto","campo6":"^array[4]int[0,50]","campo7":"^array[4]float[0,50]","campo8":"^array[4]bool","campo9":{"campo10":"^array[4]float[0,50]","campo11":"^float[20,25]"},"campo12":"^positionlong","campo13":"^positionlat","campo14":"^positioncote","campo15":"^positionalias"}', 24, 3, 5, 2, 5, 0, 0, '2024-11-06 12:18:00', '2024-10-27 18:53:16', '2024-12-03 10:45:05'),
	(2, 'S2', 24, 7, '{"campo2":"^int[0,10]","campo3":"^float[20,25]","campo4":"^bool[8,9]","time":"^time","campo5":"este texto","campo6":"^array[4]int[0,50]","campo7":"^array[4]float[0,50]","campo8":"^array[4]bool","campo9":{"campo10":"^array[4]float[0,50]","campo11":"^float[20,25]"},"campo12":"^positionlong","campo13":"^positionlat","campo14":"^positioncote","campo15":"^positionalias"}', 24, 4, 8, 12, 15, 120, 0, '2024-11-08 12:41:27', '2024-10-27 18:54:12', '2024-11-25 18:48:30'),
	(20, 'Simulación de prueba', 24, 8, '{"campo2":"^int[0,10]","campo3":"^float[20,25]","campo4":"^bool","time":"^time","campo5":"este texto","campo6":"^array[4]int[0,50]","campo7":"^array[4]float[0,50]","campo8":"^array[4]bool","campo9":{"campo10":"^array[4]float[0,50]","campo11":"^float[20,25]"},"campo12":"^positionlong","campo13":"^positionlat","campo14":"^positioncote","campo15":"^positionalias","campo16":"^positiondeveui","campo17":"^positionjoineui","campo18":"^positiondevaddr"}', 24, 4, 6, 15, 20, 124, 1, '2024-11-14 11:00:00', '2024-11-17 11:57:39', '2024-12-04 12:27:57'),
	(29, 'Simulación de prueba - Copia', 24, 8, '{"campo2":"^int[0,10]","campo3":"^float[20,25]","campo4":"^bool","time":"^time","campo5":"este texto","campo6":"^array[4]int[0,50]","campo7":"^array[4]float[0,50]","campo8":"^array[4]bool","campo9":{"campo10":"^array[4]float[0,50]","campo11":"^float[20,25]"},"campo12":"^positionlong","campo13":"^positionlat","campo14":"^positioncote","campo15":"^positionalias","campo16":"^positiondeveui","campo17":"^positionjoineui","campo18":"^positiondevaddr"}', 24, 4, 6, 15, 20, 124, 1, '2024-11-14 11:00:00', '2024-12-04 19:36:40', '2024-12-04 19:36:40'),
	(31, 'Simulación de prueba - Copia - Copia', 24, 8, '{"campo2":"^int[0,10]","campo3":"^float[20,25]","campo4":"^bool","time":"^time","campo5":"este texto","campo6":"^array[4]int[0,50]","campo7":"^array[4]float[0,50]","campo8":"^array[4]bool","campo9":{"campo10":"^array[4]float[0,50]","campo11":"^float[20,25]"},"campo12":"^positionlong","campo13":"^positionlat","campo14":"^positioncote","campo15":"^positionalias","campo16":"^positiondeveui","campo17":"^positionjoineui","campo18":"^positiondevaddr"}', 24, 4, 6, 15, 20, 124, 1, '2024-11-14 11:00:00', '2024-12-05 10:21:20', '2024-12-05 10:21:20');

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
	(24, 'admin1', '$2b$10$On2zQX.mevUpRtxmF4ADN.IrEdRr4GDS3h3kWTqY/aR3uxOCJZPi6', 1, 1, '2024-10-17 18:12:48', '2024-12-06 12:20:28'),
	(25, 'user1', '$2b$10$EMJnndPY6eZdCQ7JBjxzXeYsHfa21iomaaWALq33x8xHPbKgTTK5C', 0, 1, '2024-10-17 18:12:52', '2024-12-05 10:51:24'),
	(26, 'user3', '$2b$10$As1A8EIt048U.8ogf2rJiu97JUzTsvKDvH9Tn11erhU2XEFY19p5y', 0, 1, '2024-10-18 10:45:48', '2024-12-01 19:11:32');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
