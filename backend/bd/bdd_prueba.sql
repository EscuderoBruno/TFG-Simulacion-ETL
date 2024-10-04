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
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

-- Volcando datos para la tabla tfg.users: ~3 rows (aproximadamente)
DELETE FROM `users`;
INSERT INTO `users` (`id`, `username`, `password`, `rol`, `estado`, `createdAt`, `updatedAt`) VALUES
	(10, 'Antonio', '$2b$10$Th26l7FvV7DroaGSa1cSt.wJgxgeWkq9fL7YkRPbbXTjGM1BXOYDu', 1, 1, '2024-09-30 17:12:30', '2024-09-30 17:12:30'),
	(14, 'Juan', '$2b$10$5LLr6bQ6yQOF.SHlI0Ea0OuAJ2iJ6mGCbSfVh7JG/VM3gQ/2sAvV2', 1, 1, '2024-10-01 15:39:02', '2024-10-01 15:39:02'),
	(16, 'admin', '$2b$10$WyoXYPnLHbapoGIScu5fmOQqrnJBrmGm3H8AxZ69U8yd9wHemDDZS', 1, 1, '2024-10-03 18:12:08', '2024-10-03 18:12:08');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
