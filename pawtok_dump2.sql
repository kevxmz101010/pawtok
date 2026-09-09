-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: pawtok
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `adopciones`
--

DROP TABLE IF EXISTS `adopciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `adopciones` (
  `id_adopcion` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `id_mascota` int(11) NOT NULL,
  `fecha_adopcion` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` varchar(20) DEFAULT 'pendiente',
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_solicitud` timestamp NOT NULL DEFAULT current_timestamp(),
  `direccion` varchar(255) DEFAULT NULL,
  `fecha_visita` varchar(255) DEFAULT NULL,
  `hora_visita` varchar(255) DEFAULT NULL,
  `ingresos_aprox` varchar(255) DEFAULT NULL,
  `mensaje` text DEFAULT NULL,
  `ocupacion` varchar(255) DEFAULT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `tiene_mascotas` varchar(255) DEFAULT NULL,
  `tipo_vivienda` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_adopcion`),
  KEY `fk_adopciones_usuarios` (`id_usuario`),
  KEY `fk_adopciones_mascotas` (`id_mascota`),
  CONSTRAINT `fk_adopciones_mascotas` FOREIGN KEY (`id_mascota`) REFERENCES `mascotas` (`id`),
  CONSTRAINT `fk_adopciones_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adopciones`
--

LOCK TABLES `adopciones` WRITE;
/*!40000 ALTER TABLE `adopciones` DISABLE KEYS */;
INSERT INTO `adopciones` VALUES (3,2,6,'2026-06-30 22:15:04','pendiente',1,'2026-06-30 22:15:04',NULL,NULL,NULL,NULL,'Motivo: ergerge r gergergerger g\nFecha Visita: 2026-07-09\nHora Visita: 09:00\nTeléfono: 38767567\nDirección: calu\nVivienda: Finca\nOtras mascotas: fgergreg\nOcupación: 34tretret\nIngresos: Menos de 1SMMLV',NULL,NULL,NULL,NULL),(4,1,11,'2026-06-30 23:07:53','pendiente',1,'2026-06-30 23:07:53',NULL,NULL,NULL,NULL,'Motivo: fewfwefew few fewf ewf ewf e\nFecha Visita: 2026-07-10\nHora Visita: 09:00\nTeléfono: 325454654\nDirección: fesfe\nVivienda: Casa\nOtras mascotas: efew\nOcupación: efwefwefe\nIngresos: Menos de 1SMMLV',NULL,NULL,NULL,NULL),(6,2,53,'2026-07-01 03:27:12','pendiente',1,'2026-07-01 03:27:12',NULL,NULL,NULL,NULL,'Motivo: rttrtr\nFecha Visita: 2026-07-30\nHora Visita: 14:00\nTeléfono: 343454434\nDirección: fg\nVivienda: Casa\nOtras mascotas: ttr\nOcupación: rgttrtr\nIngresos: Menos de 1SMMLV',NULL,NULL,NULL,NULL),(7,2,53,'2026-07-01 03:35:36','pendiente',1,'2026-07-01 03:35:36',NULL,NULL,NULL,NULL,'Motivo: eeedd\nFecha Visita: 2026-07-30\nHora Visita: 09:00\nTeléfono: 33255532352\nDirección: crr\nVivienda: Casa\nOtras mascotas: tg\nOcupación: grergegre\nIngresos: Menos de 1SMMLV',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `adopciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria_historial`
--

DROP TABLE IF EXISTS `auditoria_historial`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auditoria_historial` (
  `id_auditoria` int(11) NOT NULL AUTO_INCREMENT,
  `id_adopcion` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_mascota` int(11) NOT NULL,
  `nombre_adoptante` varchar(100) DEFAULT NULL,
  `nombre_mascota` varchar(100) DEFAULT NULL,
  `fecha_adopcion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `estado_previo` varchar(20) DEFAULT NULL,
  `accion` varchar(50) NOT NULL DEFAULT 'inactivado',
  `id_admin` int(11) NOT NULL,
  `fecha_accion` timestamp NOT NULL DEFAULT current_timestamp(),
  `motivo` text DEFAULT NULL,
  PRIMARY KEY (`id_auditoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria_historial`
--

LOCK TABLES `auditoria_historial` WRITE;
/*!40000 ALTER TABLE `auditoria_historial` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditoria_historial` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auditoria_mascotas_eliminadas`
--

DROP TABLE IF EXISTS `auditoria_mascotas_eliminadas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auditoria_mascotas_eliminadas` (
  `id_auditoria` int(11) NOT NULL AUTO_INCREMENT,
  `id_mascota_original` int(11) DEFAULT NULL,
  `nombre_mascota` varchar(100) DEFAULT NULL,
  `id_usuario_elimina` int(11) DEFAULT NULL,
  `fecha_eliminacion` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_auditoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auditoria_mascotas_eliminadas`
--

LOCK TABLES `auditoria_mascotas_eliminadas` WRITE;
/*!40000 ALTER TABLE `auditoria_mascotas_eliminadas` DISABLE KEYS */;
/*!40000 ALTER TABLE `auditoria_mascotas_eliminadas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias_mascotas`
--

DROP TABLE IF EXISTS `categorias_mascotas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias_mascotas` (
  `id_categoria` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_categoria` varchar(100) NOT NULL,
  PRIMARY KEY (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_mascotas`
--

LOCK TABLES `categorias_mascotas` WRITE;
/*!40000 ALTER TABLE `categorias_mascotas` DISABLE KEYS */;
/*!40000 ALTER TABLE `categorias_mascotas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `citas_visita`
--

DROP TABLE IF EXISTS `citas_visita`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `citas_visita` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `id_mascota` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `tipo_vivienda` varchar(50) DEFAULT NULL,
  `tiene_mascotas` varchar(255) DEFAULT NULL,
  `ocupacion` varchar(100) DEFAULT NULL,
  `ingresos_aprox` varchar(50) DEFAULT NULL,
  `mensaje` text DEFAULT NULL,
  `estado` varchar(20) DEFAULT 'pendiente',
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `citas_visita_ibfk_1` (`id_usuario`),
  KEY `citas_visita_ibfk_2` (`id_mascota`),
  CONSTRAINT `citas_visita_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `citas_visita_ibfk_2` FOREIGN KEY (`id_mascota`) REFERENCES `mascotas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `citas_visita`
--

LOCK TABLES `citas_visita` WRITE;
/*!40000 ALTER TABLE `citas_visita` DISABLE KEYS */;
/*!40000 ALTER TABLE `citas_visita` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contacto_mensajes`
--

DROP TABLE IF EXISTS `contacto_mensajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contacto_mensajes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `fecha_envio` datetime(6) NOT NULL,
  `leido` bit(1) NOT NULL,
  `mensaje` text NOT NULL,
  `nombre` varchar(100) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contacto_mensajes`
--

LOCK TABLES `contacto_mensajes` WRITE;
/*!40000 ALTER TABLE `contacto_mensajes` DISABLE KEYS */;
INSERT INTO `contacto_mensajes` VALUES (2,'kevxmz@gmail.com','2026-06-30 20:46:54.000000','','hgt','Kevin'),(3,'kevxmz@gmail.com','2026-06-30 21:02:22.000000','\0','nose','Kevin');
/*!40000 ALTER TABLE `contacto_mensajes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `direcciones`
--

DROP TABLE IF EXISTS `direcciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `direcciones` (
  `id_direccion` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) DEFAULT NULL,
  `id_refugio` int(11) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `codigo_postal` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_direccion`),
  KEY `fk_direcciones_usuarios` (`id_usuario`),
  KEY `fk_direcciones_refugios` (`id_refugio`),
  CONSTRAINT `fk_direcciones_refugios` FOREIGN KEY (`id_refugio`) REFERENCES `refugios` (`id_refugio`),
  CONSTRAINT `fk_direcciones_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `direcciones`
--

LOCK TABLES `direcciones` WRITE;
/*!40000 ALTER TABLE `direcciones` DISABLE KEYS */;
INSERT INTO `direcciones` VALUES (1,NULL,3,'medellin','calle 104aa',NULL),(2,NULL,4,'medellin','calle 104aa',NULL);
/*!40000 ALTER TABLE `direcciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favoritos`
--

DROP TABLE IF EXISTS `favoritos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `favoritos` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `id_mascota` int(11) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_creacion` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `id_usuario` (`id_usuario`,`id_mascota`),
  KEY `favoritos_ibfk_2` (`id_mascota`),
  CONSTRAINT `favoritos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `favoritos_ibfk_2` FOREIGN KEY (`id_mascota`) REFERENCES `mascotas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favoritos`
--

LOCK TABLES `favoritos` WRITE;
/*!40000 ALTER TABLE `favoritos` DISABLE KEYS */;
INSERT INTO `favoritos` VALUES (1,2,3,'2026-06-30 22:13:14','2026-06-30 17:13:14.000000');
/*!40000 ALTER TABLE `favoritos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historial_medico`
--

DROP TABLE IF EXISTS `historial_medico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `historial_medico` (
  `id_historial` int(11) NOT NULL AUTO_INCREMENT,
  `id_mascota` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `descripcion` text NOT NULL,
  `vacuna` tinyint(1) DEFAULT 0,
  `desparasitacion` tinyint(1) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id_historial`),
  KEY `fk_historial_mascotas` (`id_mascota`),
  CONSTRAINT `fk_historial_mascotas` FOREIGN KEY (`id_mascota`) REFERENCES `mascotas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historial_medico`
--

LOCK TABLES `historial_medico` WRITE;
/*!40000 ALTER TABLE `historial_medico` DISABLE KEYS */;
/*!40000 ALTER TABLE `historial_medico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mascota_imagenes`
--

DROP TABLE IF EXISTS `mascota_imagenes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mascota_imagenes` (
  `id_imagen` int(11) NOT NULL AUTO_INCREMENT,
  `id_mascota` int(11) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `orden_img` int(11) DEFAULT 0,
  `fecha_subida` timestamp NOT NULL DEFAULT current_timestamp(),
  `activo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id_imagen`),
  KEY `mascota_imagenes_ibfk_1` (`id_mascota`),
  CONSTRAINT `mascota_imagenes_ibfk_1` FOREIGN KEY (`id_mascota`) REFERENCES `mascotas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mascota_imagenes`
--

LOCK TABLES `mascota_imagenes` WRITE;
/*!40000 ALTER TABLE `mascota_imagenes` DISABLE KEYS */;
/*!40000 ALTER TABLE `mascota_imagenes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mascotas`
--

DROP TABLE IF EXISTS `mascotas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mascotas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_refugio` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `raza` varchar(100) DEFAULT NULL,
  `edad` varchar(50) DEFAULT NULL,
  `ubicacion` varchar(200) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `fecha_publicacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `peso` varchar(50) DEFAULT NULL,
  `tamano` varchar(50) DEFAULT NULL,
  `energia` varchar(50) DEFAULT NULL,
  `con_ninos` varchar(10) DEFAULT NULL,
  `personalidad` varchar(255) DEFAULT NULL,
  `origen` varchar(50) NOT NULL DEFAULT 'refugio',
  `estado` varchar(20) NOT NULL DEFAULT 'Disponible',
  `disponible` tinyint(1) NOT NULL DEFAULT 1,
  `galeria` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mascotas_refugio_fk` (`id_refugio`),
  CONSTRAINT `mascotas_refugio_fk` FOREIGN KEY (`id_refugio`) REFERENCES `refugios` (`id_refugio`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=56 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mascotas`
--

LOCK TABLES `mascotas` WRITE;
/*!40000 ALTER TABLE `mascotas` DISABLE KEYS */;
INSERT INTO `mascotas` VALUES (1,1,'Bobbye','PERRO','Golden Retriever','24','Medellin','Un perro muy amigable.','http://example.com/bobby.jpg','2026-06-30 20:55:08','12.5','Grande','Medio','Si','Cariñoso,Juguetón','refugio','En_Proceso',1,''),(2,1,'docky','PERRO','mestizo','2','Medellin','rgereg rg reg reg','data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNj','2026-06-30 20:59:38','22','Pequeño','Medio','Sí','Juguetón,Obediente,Leal,Energético','refugio','En_Proceso',1,'data:image/jpeg;base64,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jRo0aP8A5yf9BKIrNnbxyZB1vtldpiMMSKmPXClexQIIOwQd7XHUN7363W97CwVx1N73ve9/42yv1uiTR9n/AMx9boUzDjWGNjrdvMqReLi98/j8UIi3Bq5TJq3HqW6CPQIO9g7666NFox/x/wAf8f8AH/H/AB/x/wAcRhW9lBj/AI3434/43434/wCP+P8AjMt73RNGjR9Bv5FAb+P46YzNpNgVYlWdVuVFUj/O/RPpDLLMKZ+1evTtzXLU+VeiVuJdgtNWlVrutOFtVb2CDvYO+t9ddb3ve9731ve+uut73ve99db2TvZJNQ4UPHnMdex6ZCVK/NE233Vu8i8C5fkON3UE7/zshDaG1SFyGqD30663vanVyEiBa4keRd5t4edfDSt72DvfXW99db3vfXXXXXXXXXXXXXXXXXW+t73ve9kk7sspq8Juki4XOU4x8PilH0+wkCX+dIc1vtJREMBbJpqzfpp8dLSWxW97Ki8qSqRQaaeTehd3JBUS/TdCt73ve973ve+ut73111ve99dddddddddddddddb3skq+zdwbuX7Evuupe763vfXW6NFLCYK20SrbLtwRNkS1uV9g533Sm1JDdF9UhTm4y9lSqWE0DW97310DvfXW973ve99ddb3vfXXXW9766663ve9kkur6S8iQl1UcQiyT39O+t72SSHIstM83hy5v3166GS4W4jNqTaUWpMO4OuSFPlzfthaVNnqQoHre/W+ut73ve976631vrrrrrrrrrrrrrrrrrrrrrrolSnFH0FRFxnm3lNOW1y0O251HX0+n0+gpLDET8RyKtBkCQJEVbLhuCrkq4LmTVKO636CUpCkr+ihzjMS8+O5VtZtzLV1kT7sm4XRzdb3ve9wMNzzELchdhZx5uzDFnLRdLVItORWze97xrEofg3LfDtihO40bBFxu6WHre9kqpQI9RaCg6mUieLjLuLkj6d9bpl2M8h8zXZkt5R31FdDvfXW36cGtABISAABW97w2pKn7m7PW3NxN7AxgEzx9BxJnEF4JLxLfW4wjt+bK6ynDH/HTPjvEcZYxBeDO4BdrDve9+AFKX5iXaLezjr9utkaZa1x1QEWC8Y5s0QQRphQX0DvqSomt7310w79y/9HFH20pDn0+pfVKXJJA+YZ+Wq677766xq4X/AMhPyWXXctczyX5Ag3u7+VX8sgX+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'),(3,1,'Bobby Base64','PERRO','Golden Retriever','24','Medellin','Un perro muy amigable.','4e225a9f-3e0f-46c4-b6ec-bb311537aa75.png','2026-06-30 21:04:23','12.5','Grande','Medio','Si','Cariñoso,Juguetón','refugio','En_Proceso',1,'aff84280-79cb-4af8-8d76-49ad637abca1.png,841803d8-a4ca-4855-b789-558ba8f40038.png'),(4,1,'docky','PERRO','mestizo','2','Medellin','ewffewfwefwefwefwef f ewfwe few fefwfe','92430fa7-9310-44bb-8dac-042f03b1dfef.jpg','2026-06-30 21:09:18','22','Pequeño','Medio','Sí','Dulce,Dormilón,Adaptable,Cariñoso,Paciente','refugio','En_Proceso',1,'d0e653c0-ee19-4f75-bdc0-e92701ae2a14.png,de52b93d-1e1e-4551-a624-def2957f27e4.png,375c9480-573a-4807-a5cb-e4a3548244b7.png'),(5,1,'luna','PERRO','Golden Retriever','69','Medellin','fewfewfwef ew e f efew fwfe 67','http://localhost:8080/uploads/4ff78403-5ed1-476b-a7d2-07ec4f7fb214.jpg','2026-06-30 21:28:40','69','Pequeño','Medio','Sí','Compañero,Energético,Extrovertido,Tierno,Tranquilo,Activo,Noble,Dormilón,Dulce,Adaptable,Alegre','refugio','Disponible',1,'http://localhost:8080/uploads/d49d7ade-9607-401d-9180-959f63308802.png,http://localhost:8080/uploads/611db1b8-fe2f-4413-8fe8-c5d4fbebe639.png,http://localhost:8080/uploads/8a1a2a38-7ed5-494f-af7d-03bcafd5acf4.png'),(6,1,'em','PERRO','Golden Retriever','2','Medellin','etwetwe tewt ewt  ','3fba5843-13df-44c2-8da1-69541e4121cb.jpg','2026-06-30 22:14:27','22','Mediano','Alto','Sí','Activo,Tranquilo,Dulce,Dormilón,Alegre','refugio','En_Proceso',1,'c6c858a4-391f-40db-b212-bfd8ce078403.png,05558810-e53e-44fc-93b2-919140d0ffdc.png,2aafa316-11c1-4f30-a9e1-a4cffea6ca93.png,bf8b277f-1e02-4113-b84d-1c92f0026f57.png,96f865b9-0d6c-47d3-bbe2-945517930acd.png'),(8,1,'Nala 1','GATO','Gato Común Europeo','42','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 1','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400','2026-06-15 22:31:11','4 kg','Pequeño','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(9,1,'Rocky 2','PERRO','Mestizo','44','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 2','https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400','2026-06-24 22:31:11','15 kg','Mediano','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(10,1,'Zoe 3','PERRO','Mestizo','30','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 3','https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400','2026-06-24 22:31:11','15 kg','Mediano','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(11,1,'Nala 4','GATO','Gato Común Europeo','41','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 4','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400','2026-06-23 22:31:11','4 kg','Pequeño','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(12,1,'Zoe 5','PERRO','Mestizo','31','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 5','https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400','2026-06-30 22:31:11','15 kg','Mediano','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(13,1,'Chloe 6','GATO','Gato Común Europeo','55','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 6','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400','2026-06-01 22:31:11','4 kg','Pequeño','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(14,1,'Lucy 7','PERRO','Mestizo','23','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 7','https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400','2026-06-01 22:31:11','15 kg','Mediano','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(15,1,'Nala 8','GATO','Gato Común Europeo','32','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 8','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400','2026-06-06 22:31:11','4 kg','Pequeño','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(16,1,'Mia 9','GATO','Gato Común Europeo','51','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 9','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400','2026-06-13 22:31:11','4 kg','Pequeño','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(17,1,'Mia 10','GATO','Gato Común Europeo','53','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 10','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400','2026-06-27 22:31:11','4 kg','Pequeño','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(18,1,'Shadow 11','GATO','Gato Común Europeo','50','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 11','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400','2026-06-22 22:31:11','4 kg','Pequeño','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(19,1,'Chloe 12','GATO','Gato Común Europeo','19','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 12','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400','2026-06-08 22:31:11','4 kg','Pequeño','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(20,1,'Milo 13','GATO','Gato Común Europeo','10','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 13','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400','2026-06-25 22:31:11','4 kg','Pequeño','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(21,1,'Max 14','PERRO','Mestizo','11','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 14','https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400','2026-06-11 22:31:11','15 kg','Mediano','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(22,1,'Charlie 15','PERRO','Mestizo','49','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 15','https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400','2026-06-09 22:31:11','15 kg','Mediano','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(23,1,'Simba 16','GATO','Gato Común Europeo','39','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 16','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400','2026-06-27 22:31:11','4 kg','Pequeño','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(24,1,'Charlie 17','PERRO','Mestizo','41','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 17','https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400','2026-06-05 22:31:11','15 kg','Mediano','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(25,1,'Luna 18','PERRO','Mestizo','42','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 18','https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400','2026-06-01 22:31:11','15 kg','Mediano','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(26,1,'Buddy 19','PERRO','Mestizo','7','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 19','https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400','2026-06-09 22:31:11','15 kg','Mediano','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(27,1,'Nala 20','GATO','Gato Común Europeo','56','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 20','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400','2026-06-30 22:31:11','4 kg','Pequeño','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(28,1,'Lily 1','GATO','Gato Común Europeo','28','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 1','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400','2026-06-27 23:01:12','4 kg','Pequeño','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(29,1,'Zoe 2','PERRO','Mestizo','17','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 2','https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400','2026-06-24 23:01:12','15 kg','Mediano','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(30,1,'Leo 3','GATO','Gato Común Europeo','19','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 3','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400','2026-06-29 23:01:12','4 kg','Pequeño','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(31,1,'Oliver 4','GATO','Gato Común Europeo','16','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 4','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400','2026-06-07 23:01:12','4 kg','Pequeño','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(32,1,'Nala 5','GATO','Gato Común Europeo','45','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 5','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400','2026-06-30 23:01:12','4 kg','Pequeño','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(33,1,'Lily 6','GATO','Gato Común Europeo','22','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 6','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400','2026-06-14 23:01:12','4 kg','Pequeño','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(34,1,'Rocky 7','PERRO','Mestizo','48','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 7','https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400','2026-06-06 23:01:12','15 kg','Mediano','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(35,1,'Bella 8','PERRO','Mestizo','53','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 8','https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400','2026-06-27 23:01:12','15 kg','Mediano','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(36,1,'Shadow 9','GATO','Gato Común Europeo','36','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 9','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400','2026-06-05 23:01:12','4 kg','Pequeño','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(37,1,'Max 10','PERRO','Mestizo','60','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 10','https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400','2026-06-19 23:01:12','15 kg','Mediano','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(38,1,'Shadow 11','GATO','Gato Común Europeo','35','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 11','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400','2026-06-26 23:01:12','4 kg','Pequeño','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(39,1,'Lucy 12','PERRO','Mestizo','43','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 12','https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400','2026-06-25 23:01:12','15 kg','Mediano','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(40,1,'Daisy 13','PERRO','Mestizo','45','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 13','https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400','2026-06-02 23:01:12','15 kg','Mediano','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(41,1,'Max 14','PERRO','Mestizo','39','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 14','https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400','2026-06-21 23:01:12','15 kg','Mediano','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(42,1,'Oliver 15','GATO','Gato Común Europeo','39','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 15','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400','2026-06-30 23:01:12','4 kg','Pequeño','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(43,1,'Leo 16','GATO','Gato Común Europeo','23','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 16','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400','2026-06-05 23:01:12','4 kg','Pequeño','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(44,1,'Bella 17','PERRO','Mestizo','24','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 17','https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400','2026-06-17 23:01:12','15 kg','Mediano','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(45,1,'Zoe 18','PERRO','Mestizo','15','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 18','https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400','2026-06-01 23:01:12','15 kg','Mediano','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(46,1,'Charlie 19','PERRO','Mestizo','43','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 19','https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400','2026-06-09 23:01:12','15 kg','Mediano','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(47,1,'Mia 20','GATO','Gato Común Europeo','56','Ciudad Central','Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: 20','https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400','2026-06-03 23:01:12','4 kg','Pequeño','Alta','Sí','Juguetón,Cariñoso','Rescatado','Disponible',1,NULL),(48,1,'docky','PERRO','mestizo','3','Medellin','tgghrth','61076647-950e-415a-abf9-ddd147c68465.jpg','2026-06-30 23:03:50','23','Pequeño','Medio','Sí','Obediente,Energético','refugio','Disponible',1,'4a2098ec-739f-4f18-a537-b8e95c95b276.jpg,bede866c-96f7-4dfe-a606-a2c000053ea0.png,eb734899-d9ac-4501-9cb4-0a6b44be46eb.png'),(50,1,'Test','PERRO',NULL,NULL,NULL,NULL,NULL,'2026-06-30 23:46:05',NULL,NULL,NULL,NULL,NULL,'refugio','Disponible',1,NULL),(51,1,'Test 4','PERRO',NULL,NULL,NULL,NULL,NULL,'2026-06-30 23:46:55',NULL,NULL,NULL,NULL,NULL,'refugio','Disponible',1,NULL),(52,4,'docky','PERRO','mestizo','2','erreg','rferferf errfwe few ','cde6bbcb-f469-4bc9-8c3a-311dbd7c75fc.jpg','2026-07-01 00:24:18','2','Pequeño','Medio','Sí','Energético,Obediente,Adaptable,Noble,Dormilón','refugio','Disponible',1,''),(53,4,'sara','PERRO','alienigena','3 años','Medellin Catilla','fbvdbfdbdfbfb bfdbfbf','3c94a2ee-ec15-4578-ac10-318cafac9a2c.jpg','2026-07-01 03:16:22','6.9','Pequeño','Alto','Sí','Juguetón,Leal,Curioso,Paciente,Energético,Compañero','refugio','Disponible',1,'c5158819-95a9-4467-a265-7902477ce5db.jpg,69820b18-ea0f-4471-a048-7052f7f1de6c.png,b1c8e718-edc7-4698-8301-544319f50503.png'),(54,4,'sara','PERRO','alienigena','3 meses','Medellin Catilla','gffgfgfg','e9d22e36-9d7a-411d-ae67-207c9fe949b9.jpg','2026-07-01 04:15:42','6.9','Pequeño','Medio','Sí','Juguetón,Leal,Obediente,Noble,Adaptable,Amigable','refugio','Disponible',1,''),(55,4,'sararefre','PERRO','alienigena','3 meses','Medellin Catilla','erreghgreg rg ','333113e6-bfed-406e-8f98-351ad43594f2.jpg','2026-07-01 04:28:51','6.9','Pequeño','Medio','Sí','Juguetón,Leal,Cariñoso,Curioso,Paciente,Valiente,Compañero','refugio','Disponible',1,'');
/*!40000 ALTER TABLE `mascotas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mascotas_categorias`
--

DROP TABLE IF EXISTS `mascotas_categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mascotas_categorias` (
  `id_mascota` int(11) NOT NULL,
  `id_categoria` int(11) NOT NULL,
  PRIMARY KEY (`id_mascota`,`id_categoria`),
  KEY `fk_mc_categorias` (`id_categoria`),
  CONSTRAINT `fk_mc_categorias` FOREIGN KEY (`id_categoria`) REFERENCES `categorias_mascotas` (`id_categoria`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mascotas_categorias`
--

LOCK TABLES `mascotas_categorias` WRITE;
/*!40000 ALTER TABLE `mascotas_categorias` DISABLE KEYS */;
/*!40000 ALTER TABLE `mascotas_categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mensajes`
--

DROP TABLE IF EXISTS `mensajes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `mensajes` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `id_remitente` int(11) NOT NULL,
  `id_destinatario` int(11) NOT NULL,
  `mensaje` text NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `leido` tinyint(1) DEFAULT 0,
  `id_adopcion` bigint(20) DEFAULT NULL,
  `archivo_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `mensajes_ibfk_1` (`id_remitente`),
  KEY `mensajes_ibfk_2` (`id_destinatario`),
  CONSTRAINT `mensajes_ibfk_1` FOREIGN KEY (`id_remitente`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  CONSTRAINT `mensajes_ibfk_2` FOREIGN KEY (`id_destinatario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mensajes`
--

LOCK TABLES `mensajes` WRITE;
/*!40000 ALTER TABLE `mensajes` DISABLE KEYS */;
INSERT INTO `mensajes` VALUES (1,1,2,'hola','2026-06-30 21:58:21',0,1,NULL),(2,2,1,'holi','2026-06-30 21:59:00',0,1,NULL),(3,2,1,'trh','2026-07-01 04:39:26',0,3,NULL),(4,4,2,'Hello test message!','2026-07-01 04:50:38',0,3,NULL),(5,4,2,'Hello test message with file!','2026-07-01 04:51:04',0,3,'/uploads/2e1318a5-fa52-44c1-a664-3db54bd2721d.txt'),(6,2,1,'[Archivo adjunto]','2026-07-01 04:55:33',0,3,'/uploads/22012f86-7312-4862-8332-f252afcc3dce.jpg'),(7,2,1,'[Archivo adjunto]','2026-07-01 04:55:41',0,3,'/uploads/a2757819-cfd6-4f7e-a2db-9fd59f2cd45c.sql'),(8,2,1,'bg','2026-07-01 05:11:07',0,3,NULL);
/*!40000 ALTER TABLE `mensajes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refugios`
--

DROP TABLE IF EXISTS `refugios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `refugios` (
  `id_refugio` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `redes_sociales` varchar(255) DEFAULT NULL,
  `horario` varchar(255) DEFAULT NULL,
  `certificado_url` varchar(255) DEFAULT NULL,
  `documento_representante_url` varchar(255) DEFAULT NULL,
  `fotos_lugar_url` text DEFAULT NULL,
  `estado_verificacion` varchar(255) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_refugio`),
  KEY `fk_refugios_usuarios` (`id_usuario`),
  CONSTRAINT `fk_refugios_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refugios`
--

LOCK TABLES `refugios` WRITE;
/*!40000 ALTER TABLE `refugios` DISABLE KEYS */;
INSERT INTO `refugios` VALUES (1,'Refugio Pawtok','Calle 123','123456789','refugio1@pawtok.com',1,'Somos un refugio amoroso.',NULL,NULL,NULL,NULL,NULL,'Aprobado',NULL),(2,'Refugio Central','Calle Principal 123','111222333','refugio_central@pawtok.com',5,'El refugio principal de la ciudad.',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,'eefef','calle 104aa','3862779317','ka1005918@gmail.com',6,'grregergerg','regerg rg rgergregre','2am 4am','/uploads/7e8380bc-b1b7-40be-bfb6-94b37ad4e7bb.png','/uploads/78ecca64-5db9-459f-9014-24c7249e029b.png','/uploads/4acebc9d-7413-4436-85b5-c221daa97ae4.png','Pendiente','/uploads/0662c896-cd9c-4fba-b428-b7747c5b07ff.png'),(4,'ade','calle 104aa','3862779317','refugionn@gmail.com',7,'fewfwefewf',' fewf ef','2am 4am','/uploads/fb3563ee-1e10-477c-a756-4ff86f220dae.png','/uploads/7d37f61d-14c6-4559-a85d-606b5d7a02ed.png','/uploads/64e1f317-7d0a-40f5-8394-d9e619842562.png','Aprobado','/uploads/a193019c-fbe9-4a67-92fe-2f263daa8d9c.png');
/*!40000 ALTER TABLE `refugios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registros_actividad`
--

DROP TABLE IF EXISTS `registros_actividad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `registros_actividad` (
  `id_registro` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) NOT NULL,
  `accion` varchar(100) NOT NULL,
  `detalles` text DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_registro`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registros_actividad`
--

LOCK TABLES `registros_actividad` WRITE;
/*!40000 ALTER TABLE `registros_actividad` DISABLE KEYS */;
/*!40000 ALTER TABLE `registros_actividad` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `roles` (
  `id_rol` int(11) NOT NULL AUTO_INCREMENT,
  `nombre_rol` varchar(50) NOT NULL,
  PRIMARY KEY (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'ADMIN'),(2,'USUARIO'),(3,'REFUGIO');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seguimiento`
--

DROP TABLE IF EXISTS `seguimiento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `seguimiento` (
  `id_seguimiento` int(11) NOT NULL AUTO_INCREMENT,
  `id_adopcion` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `comentario` text DEFAULT NULL,
  `foto_opcional` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_seguimiento`),
  KEY `fk_seguimiento_adopciones` (`id_adopcion`),
  CONSTRAINT `fk_seguimiento_adopciones` FOREIGN KEY (`id_adopcion`) REFERENCES `adopciones` (`id_adopcion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seguimiento`
--

LOCK TABLES `seguimiento` WRITE;
/*!40000 ALTER TABLE `seguimiento` DISABLE KEYS */;
/*!40000 ALTER TABLE `seguimiento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `bio` text DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_usuarios_roles` (`id_rol`),
  CONSTRAINT `fk_usuarios_roles` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Refugio Pawtok','refugio1@pawtok.com','$2a$10$lyuVny8wokkNoXR4nhpNXuEhKbPJRwxlZyAepPRCGA77sv8r7jY2a',3,'2026-06-30 20:30:41','Somos un refugio amoroso.','/uploads/6b0895bb-dcba-4943-9193-4a5767f2df2f.jpg',NULL),(2,'Juan','adoptante1@pawtok.com','$2a$10$lyuVny8wokkNoXR4nhpNXuEhKbPJRwxlZyAepPRCGA77sv8r7jY2a',2,'2026-06-30 20:30:41','','/uploads/e6f91f49-9c56-4939-a594-517aa76a54bb.jpg',NULL),(4,'Admin Test Proxy','admin@pawtok.com','$2a$10$.ZUEFCo76sqP4T3e6e.g1.AzlEerwhKmcJhb.gnsTe4hSkXNaAY3S',1,'2026-06-30 22:29:49','Proxy test','/uploads/87f2933f-56e6-42c6-9558-70d98e55844b.png','0000000000'),(5,'Refugio Central','refugio_central@pawtok.com','$2a$10$BdsLMuqYzj3FHzknKSQgAOHGoiFvH4sRObLWttk5mYDI6v6./Pl5q',3,'2026-06-30 22:29:49','El refugio principal de la ciudad.',NULL,'111222333'),(6,'refugio nose','refugio2@pawtok.com','$2a$10$/PHTs6PRwEwzcwsAOxYbyuZkzQXr9/dE3k5.vbW5xiP78ORrM0D5C',2,'2026-06-30 23:28:22',NULL,NULL,NULL),(7,'refugio nnf','refugionn@pawtok.com','$2a$10$lhd4WNu87/QsxBjazUkFu.secsKZd4kPQP.hqNZWboTHlcjLzRG3i',3,'2026-06-30 23:32:36',NULL,'/uploads/5f2cd012-7588-4006-b8bf-8d30ff847495.png',NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-01  1:39:35
