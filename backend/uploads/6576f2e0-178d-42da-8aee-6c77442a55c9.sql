-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 30-06-2026 a las 13:22:26
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `pawtok`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `adopciones`
--

CREATE TABLE `adopciones` (
  `id_adopcion` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_mascota` bigint(20) NOT NULL,
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
  `tipo_vivienda` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `adopciones`
--

INSERT INTO `adopciones` (`id_adopcion`, `id_usuario`, `id_mascota`, `fecha_adopcion`, `estado`, `activo`, `fecha_solicitud`, `direccion`, `fecha_visita`, `hora_visita`, `ingresos_aprox`, `mensaje`, `ocupacion`, `telefono`, `tiene_mascotas`, `tipo_vivienda`) VALUES
(1, 24, 12, '2026-05-22 01:22:27', 'aprobada', 0, '2026-05-22 01:21:18', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(2, 22, 13, '2026-05-22 01:42:50', 'aprobada', 1, '2026-05-08 14:59:54', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, 1, 9, '2026-06-10 12:28:36', 'aprobada', 1, '2026-06-10 12:27:01', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(4, 43, 25, '2026-06-30 05:53:00', 'pendiente', 1, '2026-06-30 10:53:00', '54', '2026-07-10', '09:00', 'Menos de 1SMMLV', 'gfg', '54', '5454', 'fgf', 'Apartamento');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditoria_historial`
--

CREATE TABLE `auditoria_historial` (
  `id_auditoria` int(11) NOT NULL,
  `id_adopcion` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL COMMENT 'Adoptante',
  `id_mascota` int(11) NOT NULL,
  `nombre_adoptante` varchar(100) DEFAULT NULL,
  `nombre_mascota` varchar(100) DEFAULT NULL,
  `fecha_adopcion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `estado_previo` varchar(20) DEFAULT NULL,
  `accion` varchar(50) NOT NULL DEFAULT 'inactivado',
  `id_admin` int(11) NOT NULL COMMENT 'Admin que realizó la acción',
  `fecha_accion` timestamp NOT NULL DEFAULT current_timestamp(),
  `motivo` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Volcado de datos para la tabla `auditoria_historial`
--

INSERT INTO `auditoria_historial` (`id_auditoria`, `id_adopcion`, `id_usuario`, `id_mascota`, `nombre_adoptante`, `nombre_mascota`, `fecha_adopcion`, `estado_previo`, `accion`, `id_admin`, `fecha_accion`, `motivo`) VALUES
(1, 1, 24, 12, 'mincho', 'Kira', '2026-05-22 01:22:27', 'aprobada', 'inactivado', 13, '2026-05-22 01:41:16', '');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `auditoria_mascotas_eliminadas`
--

CREATE TABLE `auditoria_mascotas_eliminadas` (
  `id_auditoria` int(11) NOT NULL,
  `id_mascota_original` int(11) DEFAULT NULL,
  `nombre_mascota` varchar(100) DEFAULT NULL,
  `id_usuario_elimina` int(11) DEFAULT NULL,
  `fecha_eliminacion` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `auditoria_mascotas_eliminadas`
--

INSERT INTO `auditoria_mascotas_eliminadas` (`id_auditoria`, `id_mascota_original`, `nombre_mascota`, `id_usuario_elimina`, `fecha_eliminacion`) VALUES
(1, 20, 'mel', 13, '2026-05-08 09:25:49');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias_mascotas`
--

CREATE TABLE `categorias_mascotas` (
  `id_categoria` int(11) NOT NULL,
  `nombre_categoria` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `citas_visita`
--

CREATE TABLE `citas_visita` (
  `id` int(11) NOT NULL,
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
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `citas_visita`
--

INSERT INTO `citas_visita` (`id`, `id_usuario`, `id_mascota`, `fecha`, `hora`, `telefono`, `direccion`, `tipo_vivienda`, `tiene_mascotas`, `ocupacion`, `ingresos_aprox`, `mensaje`, `estado`, `fecha_creacion`) VALUES
(1, 24, 1, '2025-11-27', '16:00:00', '3233718433', 'crr 40 #91 79', 'Casa', 'No', 'prostituta', '1-2 SMMLV', 'pq si', 'rechazada', '2025-11-25 15:55:20'),
(2, 24, 6, '2025-11-26', '10:00:00', '+57 304 3288802', 'crr 40 #91 79', 'Casa', 'No', 'prostituta', 'Menos de 1SMMLV', 'tin', 'pendiente', '2025-11-25 16:13:18'),
(3, 24, 6, '2025-11-28', '14:00:00', '+57 304 3288102', 'crr 40 #91 79', 'Casa', 'No', 'prostituta', 'Menos de 1SMMLV', 'wefusgbhker', 'aprobada', '2025-11-25 16:21:17'),
(5, 22, 10, '2026-06-03', '09:00:00', '34', '34', 'Apartamento', '43', '43', '1-2 SMMLV', '34', 'pendiente', '2026-05-08 14:58:20'),
(6, 22, 13, '2026-05-28', '09:00:00', '34', '34', 'Casa', '43', '43', '1-2 SMMLV', 'trh', 'aprobada', '2026-05-08 14:59:54'),
(7, 24, 12, '2026-05-27', '09:00:00', '34', '34', 'Apartamento', 'f', '43', '1-2 SMMLV', 'fd', 'aprobada', '2026-05-22 01:21:18'),
(8, 1, 9, '2026-06-18', '09:00:00', '39856565654', 'crr 4343', 'Casa', 'no', 'rerer', '1-2 SMMLV', 'pq as', 'aprobada', '2026-06-10 12:27:01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `direcciones`
--

CREATE TABLE `direcciones` (
  `id_direccion` bigint(20) NOT NULL,
  `id_usuario` int(11) DEFAULT NULL,
  `id_refugio` int(11) DEFAULT NULL,
  `ciudad` varchar(100) DEFAULT NULL,
  `direccion` varchar(200) DEFAULT NULL,
  `codigo_postal` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `favoritos`
--

CREATE TABLE `favoritos` (
  `id` bigint(20) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_mascota` int(11) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_creacion` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `favoritos`
--

INSERT INTO `favoritos` (`id`, `id_usuario`, `id_mascota`, `fecha`, `fecha_creacion`) VALUES
(4, 24, 1, '2025-11-25 15:07:18', NULL),
(6, 24, 16, '2026-03-20 16:03:40', NULL),
(7, 24, 15, '2026-03-20 16:03:41', NULL),
(9, 13, 10, '2026-04-20 01:39:18', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_medico`
--

CREATE TABLE `historial_medico` (
  `id_historial` int(11) NOT NULL,
  `id_mascota` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `descripcion` text NOT NULL,
  `vacuna` tinyint(1) DEFAULT 0,
  `desparasitacion` tinyint(1) DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mascotas`
--

CREATE TABLE `mascotas` (
  `id` int(11) NOT NULL,
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
  `galeria` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mascotas`
--

INSERT INTO `mascotas` (`id`, `id_refugio`, `nombre`, `tipo`, `raza`, `edad`, `ubicacion`, `descripcion`, `foto`, `fecha_publicacion`, `peso`, `tamano`, `energia`, `con_ninos`, `personalidad`, `origen`, `estado`, `disponible`, `galeria`) VALUES
(1, 7, 'Max', 'perro', 'Ladrador', '3 años', 'medellin', 'es un perro muy amigable y aja', 'pet_12_1763732517.png', '2025-11-21 13:41:57', NULL, NULL, NULL, NULL, NULL, 'refugio', 'Disponible', 1, NULL),
(6, 7, 'doqui', 'perro', 'alienigena', '100 años', 'marte', 'emmmm', 'pet_12_1764086911.png', '2025-11-25 16:08:31', '38kg', 'Pequeño', 'Bajo', 'Sí', 'Cariñoso,Juguetón,Inteligente,Sociable', 'refugio', 'Disponible', 1, NULL),
(7, 7, 'Rocky', 'perro', 'nose', '3 años', 'Medellin Catilla', 'jktrgerjkserwefer', 'pet_12_1774010115.jpg', '2026-03-20 12:35:15', '20 kg', 'Pequeño', 'Medio', 'Sí', 'Cariñoso', 'refugio', 'Disponible', 1, NULL),
(9, 1, 'Balto', 'perro', 'Husky Siberiano', '3', 'Medellín, Laureles', 'Un aventurero nato. Necesita mucho espacio para correr y una familia que ame el ejercicio.', 'pet_1_dog1.jpg', '2026-03-20 14:43:03', '28.5', 'Grande', 'Alto', 'Sí', 'Inteligente,Protector,Sociable', 'refugio', 'No disponible', 0, NULL),
(10, 1, 'Lola', 'perro', 'Poodle', '1', 'Envigado, Ant.', 'Es pequeña pero con un corazón gigante. Le encanta estar en el regazo y que la consientan.', 'pet_1_dog2.jpg', '2026-03-20 14:43:03', '4.2', 'Pequeño', 'Medio', 'Sí', 'Cariñoso,Juguetón', 'refugio', 'Disponible', 1, NULL),
(12, 1, 'Kira', 'perro', 'Mestizo', '2', 'Sabaneta', 'Rescatada de las calles, Kira es la perrita más agradecida del mundo. Aprende trucos muy rápido.', 'pet_1_dog4.jpg', '2026-03-20 14:43:03', '15', 'Mediano', 'Medio', 'Sí', 'Inteligente,Cariñoso,Sociable', 'refugio', 'Disponible', 1, NULL),
(13, 1, 'Zeus', 'perro', 'Pastor Alemán', '4', 'Bello, Niquía', 'Fuerte y disciplinado. Zeus busca un dueño con experiencia en entrenamiento básico.', 'pet_1_dog5.jpg', '2026-03-20 14:43:03', '35.8', 'Grande', 'Alto', 'No', 'Protector,Inteligente', 'refugio', 'Disponible', 1, NULL),
(14, 1, 'Michi', 'gato', 'Persa', '2', 'Medellín, El Poblado', 'El rey del sofá. Michi es extremadamente perezoso y solo quiere amor y comida premium.', 'pet_1_cat1.jpg', '2026-03-20 14:43:03', '4.5', 'Pequeño', 'Bajo', 'Sí', 'Tranquilo,Cariñoso', 'refugio', 'Disponible', 1, NULL),
(15, 1, 'Salem', 'gato', 'Bombay (Negro)', '1', 'Medellín, Aranjuez', 'Como un pequeño pantera. Es muy curioso y le gusta esconderse en cajas de cartón.', 'pet_1_cat2.jpg', '2026-03-20 14:43:03', '3.8', 'Pequeño', 'Alto', 'No', 'Juguetón,Inteligente', 'refugio', 'Disponible', 1, NULL),
(16, 1, 'Nala', 'gato', 'Calicó', '3', 'Copacabana', 'Independiente pero vocal. Te avisará cuando necesite su ración de caricias.', 'pet_1_cat3.jpg', '2026-03-20 14:43:03', '4.1', 'Mediano', 'Medio', 'Sí', 'Tranquilo,Sociable', 'refugio', 'Disponible', 1, NULL),
(21, 5, 'robloxyamigoserre', 'gato', 'ererer', '6', 'rerere', 'reretretert', 'pet_5_1781094341_cover.png', '2026-06-10 12:25:41', '4.1', 'Mediano', 'Alto', 'Sí', 'Cariñoso,Juguetón,Curioso,Leal', 'refugio', 'Disponible', 1, NULL),
(23, 1, 'sara', 'Perro', 'alienigena', '2', 'Medellin Catilla', 'efewfewewfewffewf ef wefef  wfef ewf r', '29c2dce9-f645-4c3f-a0da-e3dec3a8e19c.jpg', '2026-06-30 05:50:51', '3.5', 'Pequeño', 'Bajo', 'Sí', 'Inteligente,Obediente', 'refugio', 'Disponible', 1, NULL),
(24, 1, 'sara', 'Perro', 'alienigena', '2', 'Medellin Catilla', 'rgergeregregerg re grg rg erg erg erg ergr greg ge g er gergerg erg ergre reg re ger', '765b9f2f-51b7-4b8e-b9e4-ff89037629ee.jpg', '2026-06-30 06:37:52', '3.5', 'Pequeño', 'Bajo', 'Sí', 'Noble,Adaptable,Dormilón,Activo,Inteligente,Obediente,Juguetón,Leal,Energético,Paciente,Valiente,Compañero', 'refugio', 'Disponible', 1, '6d26e5e7-4363-42f5-a0fe-6acbe17d97f5.png,821648e8-0874-4f85-b863-8e235a6b0b7a.png,f428f927-f599-4b84-8d20-32584951d561.png'),
(25, 17, 'sararefre', 'Perro', 'sef', '2', 'Medellin Catilla', 'rgegre rge re erer gergergergre grg', '5c6155c5-8f40-4318-ba5c-7fec810f4bc1.jpg', '2026-06-30 10:00:49', '3.5', 'Mediano', 'Bajo', 'No', 'Inteligente,Obediente,Activo,Tranquilo,Dulce,Independiente,Alegre,Valiente', 'refugio', 'En_proceso', 1, '4099af9b-8f4c-443e-803c-ba777cf6ca09.png,8f678245-90f9-4ad6-89e8-ae2e89c799d3.png,dfa522d7-0a10-4505-8e06-f0248ce3b33e.png,18339b7a-0def-4a8b-904a-5e73d7c52709.png,a5a4a1ae-13ea-4556-9712-bf8b336f6de3.png,c9b295fd-f462-4cc4-9d2f-7159d1fba415.png'),
(26, 17, 'rgreg', 'Perro', 'sef', '2', 'Medellin Catilla', 'rgre', 'b92f16e4-fbe0-4349-9cf3-e6346402dd81.jpg', '2026-06-30 10:02:16', '3.5', 'Grande', 'Medio', 'Sí', 'Tranquilo,Dulce,Activo,Dormilón,Compañero', 'refugio', 'Disponible', 1, '228630bf-3e30-42fe-b0f1-f6486cefbe61.png,5547783e-510f-46a7-b2ad-a3c261120cb8.png,8d11f9bf-ac49-49bf-94bc-ed782acd3278.png,bcfcc3b1-e5c1-43f9-b11e-13ec8c2926ee.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mascotas_categorias`
--

CREATE TABLE `mascotas_categorias` (
  `id_mascota` int(11) NOT NULL,
  `id_categoria` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mascota_imagenes`
--

CREATE TABLE `mascota_imagenes` (
  `id_imagen` int(11) NOT NULL,
  `id_mascota` int(11) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `orden_img` int(11) DEFAULT 0,
  `fecha_subida` timestamp NOT NULL DEFAULT current_timestamp(),
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mensajes`
--

CREATE TABLE `mensajes` (
  `id` bigint(20) NOT NULL,
  `id_remitente` int(11) NOT NULL,
  `id_destinatario` int(11) NOT NULL,
  `mensaje` text NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp(),
  `leido` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `mensajes`
--

INSERT INTO `mensajes` (`id`, `id_remitente`, `id_destinatario`, `mensaje`, `fecha`, `leido`) VALUES
(1, 12, 24, 'aprobamos jejejej ven por tu perro', '2025-11-25 16:29:29', 0),
(2, 29, 24, 'holaaaaaaaaa', '2026-03-20 16:00:39', 0);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `refugios`
--

CREATE TABLE `refugios` (
  `id_refugio` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `telefono` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `id_usuario` bigint(20) DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `redes_sociales` varchar(255) DEFAULT NULL,
  `horario` varchar(255) DEFAULT NULL,
  `certificado_url` varchar(255) DEFAULT NULL,
  `documento_representante_url` varchar(255) DEFAULT NULL,
  `fotos_lugar_url` text DEFAULT NULL,
  `estado_verificacion` varchar(255) DEFAULT NULL,
  `logo_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `refugios`
--

INSERT INTO `refugios` (`id_refugio`, `nombre`, `direccion`, `telefono`, `email`, `id_usuario`, `descripcion`, `redes_sociales`, `horario`, `certificado_url`, `documento_representante_url`, `fotos_lugar_url`, `estado_verificacion`, `logo_url`) VALUES
(1, 'refugio algodoncitos algodoncitos', 'calle 82 #500 32 15', '23232323', 'algodoncitos12@gmail.com', 29, NULL, NULL, NULL, NULL, NULL, NULL, 'Pendiente', NULL),
(3, 'refugio algodoncitosd', 'calle 82 #500 32 154', '89348349', 'algodoncitos1e2@gmail.com', 9, NULL, NULL, NULL, NULL, NULL, NULL, 'Pendiente', NULL),
(5, 'perritos happy', '', NULL, 'perris@gmail.com', 31, NULL, NULL, NULL, NULL, NULL, NULL, 'Pendiente', NULL),
(6, 'perritos felices', '', NULL, 'perritos132@gmail.com', 30, NULL, NULL, NULL, NULL, NULL, NULL, 'Pendiente', NULL),
(7, 'Refugio Alegria', '', NULL, '2323@gmail.com', 12, NULL, NULL, NULL, NULL, NULL, NULL, 'Pendiente', NULL),
(8, 'sofia', '', NULL, 'ttt@gmail.com', 27, NULL, NULL, NULL, NULL, NULL, NULL, 'Pendiente', NULL),
(9, 'Kevin', 'calle 104aa', '2121212', 'ka1005918@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pendiente', NULL),
(11, 'Kevin', 'calle 105aa', '434334', 'ka1005918@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pendiente', NULL),
(12, 'em', 'calle 104aa', '13862779317', 'ka1005918@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pendiente', NULL),
(14, 'pegui familia', 'calle 104aa', '3454353455344', 'ka1005918@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pendiente', NULL),
(15, 'em', 'calle 104aa', '+13862779317', 'ka1005918@gmail.com', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Pendiente', NULL),
(16, 'Patitas Rescate', '123 Fake St', '555-0000', 'refugio@pawtok.com', 39, 'Un lugar feliz', NULL, NULL, NULL, NULL, NULL, 'Aprobado', NULL),
(17, 'Patitas Rescate - Sede Central', 'Calle 123, Bogotá', '555-1234', 'contacto@patitasrescate.com', 44, 'Refugio dedicado al rescate y adopción de animales.', NULL, NULL, NULL, NULL, NULL, 'Aprobado', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `registros_actividad`
--

CREATE TABLE `registros_actividad` (
  `id_registro` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `accion` varchar(100) NOT NULL,
  `detalles` text DEFAULT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `registros_actividad`
--

INSERT INTO `registros_actividad` (`id_registro`, `id_usuario`, `accion`, `detalles`, `fecha`) VALUES
(1, 29, 'Adopción Aprobada', 'Mascota ID: 12 adoptada por Usuario ID: 24', '2026-05-22 01:22:27'),
(2, 13, 'Inactivación de Historial de Adopción', '{\"id_adopcion\":1,\"adoptante\":\"mincho\",\"mascota\":\"Kira\",\"fecha_adopcion\":\"2026-05-21 20:22:27\",\"estado_previo\":\"aprobada\",\"motivo\":\"\"}', '2026-05-22 01:41:16'),
(3, 29, 'Adopción Aprobada', 'Mascota ID: 13 adoptada por Usuario ID: 22', '2026-05-22 01:42:50'),
(4, 29, 'Adopción Aprobada', 'Mascota ID: 9 adoptada por Usuario ID: 1', '2026-06-10 12:28:36');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--

CREATE TABLE `roles` (
  `id_rol` int(11) NOT NULL,
  `nombre_rol` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `roles`
--

INSERT INTO `roles` (`id_rol`, `nombre_rol`) VALUES
(1, 'usuario'),
(2, 'administrador'),
(3, 'refugio');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `seguimiento`
--

CREATE TABLE `seguimiento` (
  `id_seguimiento` int(11) NOT NULL,
  `id_adopcion` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `comentario` text DEFAULT NULL,
  `foto_opcional` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id_usuario` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `id_rol` int(11) NOT NULL,
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp(),
  `bio` text DEFAULT NULL,
  `foto` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id_usuario`, `nombre`, `email`, `password`, `id_rol`, `fecha_registro`, `bio`, `foto`, `telefono`) VALUES
(1, 'Juan Pérez', 'juan@gmail.com', '123456', 1, '2025-11-14 15:28:18', NULL, NULL, NULL),
(12, 'Refugio Alegria', '2323@gmail.com', '123', 3, '2025-11-18 03:19:11', '', 'perfil_12_1763734931.jpg', NULL),
(13, 'kevin', 'admin@pawtok.com', '123', 2, '2025-11-18 03:23:18', NULL, NULL, NULL),
(22, 'cate', 'catedunlap@gmail.com', '12', 1, '2025-11-21 00:54:55', 'Me gustan los perros jeje', 'perfil_22_1764080773.png', NULL),
(24, 'mincho', 'bicho123@gmail.com', '2007', 1, '2025-11-21 12:04:08', '', 'perfil_24_1764083289.png', NULL),
(25, 'sofia', 'svargasagu@gmail.com', '101792sv', 1, '2025-11-21 12:12:35', NULL, NULL, NULL),
(26, 'Hector', 'hector@gmail.com', 'q1w2e3r4', 1, '2025-11-21 12:14:04', NULL, NULL, NULL),
(27, 'sofia', 'ttt@gmail.com', '12', 3, '2025-11-21 12:15:09', NULL, NULL, NULL),
(28, 'Samuelito', 'Pussymaster@gmail.com', '12345', 1, '2025-11-21 12:18:37', 'Tin', 'perfil_28_1763727569.png', NULL),
(29, 'refugio algodoncitos algodoncitos', 'algodoncitos12@gmail.com', '1234', 3, '2026-03-20 15:22:19', NULL, NULL, NULL),
(30, 'perritos felices', 'perritos132@gmail.com', '123', 3, '2026-04-20 00:01:57', NULL, 'refugio_30_1776644391.jpg', NULL),
(31, 'perritos happy', 'perris@gmail.com', '123', 3, '2026-04-20 00:05:48', NULL, NULL, NULL),
(32, 'sAMU', 'bicho1234@gmail.com', '$2a$10$t1ghzUIR6Ksi3PWsb1wIpe89ZpGm/7unkL8T/UIFxrg0Ar5G6UQfC', 1, '2026-06-29 23:20:36', NULL, NULL, NULL),
(33, 'nose', 'kevxmzx@gmail.com', '$2a$10$Ry0plr2RIvnzStGc/FCJnORH3oeqDm47B08WFASYi4svuD2CHeCZW', 1, '2026-06-29 23:38:52', NULL, NULL, NULL),
(34, 'pawtok', 'paktok@gmail.com', '$2a$10$8Um107ZCDxDLjye0sGMW3eRLqcUzSo4vcXmPJDa3TE5rO7KwJoTme', 1, '2026-06-29 23:59:08', NULL, NULL, NULL),
(35, 'juan', 'kev@gmail.com', '$2a$10$DebpmpSgh8Oowfw5XO6fPORAPGKYY6zPDfhChNjinfv5fd6VmS.Vy', 1, '2026-06-30 00:11:42', NULL, NULL, NULL),
(36, 'uma', 'uma@gmail.com', '$2a$10$9/Qg5LszpqEWcGvNCx9F4ON5lFPjQEEhObqQPMQxISqz8UtqWFycm', 1, '2026-06-30 00:23:01', NULL, NULL, NULL),
(37, 'mal', 'mal@gmail.com', '$2a$10$RwFHqMW7hZGIfEFTWn2RL.unFfDC48xa76H8JEYfJfRAbZuhZ99hW', 1, '2026-06-30 00:30:13', 'rrgrgrr', '/uploads/6d6ae83f-4959-4961-b5d4-be9a083be440.png', '340939034'),
(38, 'mal', 'malmal@gmail.com', '$2a$10$cJ1kKcA3pb2lE71FZl.6B.yLP9u3/9u8E/8s5Lh4SapvDQ8JmLjRy', 1, '2026-06-30 00:30:54', NULL, NULL, NULL),
(39, 'Refugio Patitas', 'refugio@pawto', '$2b$10$e4BvHKSEbB4tuxS/xJy1.eL.34k1DNYagXxEs5Hsy/Ah2ctTd0cFW', 3, '2026-06-29 23:14:53', '', '/uploads/912d792c-4c52-4092-be14-5a67a87a0e3d.png', NULL),
(40, 'Patitas', 'Patitas@gmail.com', '$2a$10$0EUpdCtvRAImOLFjZZ4XLOjS.Blqp0FonAGIJu525On9QyXKOWqzK', 1, '2026-06-30 07:02:52', NULL, NULL, NULL),
(41, 'juancito', 'kevi@gmail.com', '$2a$10$jAGnN0hrZ8GPWy9A3RrH/eU98Ql1/yaIEsdfPxiaq0AIDPGJZVE9W', 1, '2026-06-30 07:10:41', NULL, NULL, NULL),
(42, 'htrh', 'kevrere@gmail.com', '$2a$10$R/UxjmXr0w8.RgNYFXu/Iu4A3GivxPUsavoofJqoe0iuMafe8JvEe', 1, '2026-06-30 07:13:48', 'rgegreregg', '/uploads/b5f50ee6-b435-4095-8961-d3fb4c5ddfa7.png', ''),
(43, 'feewf', 'kevrere5@gmail.com', '$2a$10$/85QLRZJHcklbjG9UxKZF.m8ZnLRWzeXYFS30PGfbZflN/gVLpRPW', 1, '2026-06-30 07:21:45', 'rhr', '/uploads/e0e40a70-387c-4840-bf3b-f6550887dc7d.png', ''),
(44, 'Patitas Rescate', 'refugio@pawtok', '$2a$10$hFPAWAupSSZkqf3ipBvM7eW.aubUSHwkoNZJtrMJdl54qaireW0tK', 3, '2026-06-30 09:58:47', NULL, '/uploads/aa17c526-f931-4803-84f5-33c5b4da33fb.png', NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `adopciones`
--
ALTER TABLE `adopciones`
  ADD PRIMARY KEY (`id_adopcion`),
  ADD KEY `fk_adopciones_usuarios` (`id_usuario`),
  ADD KEY `fk_adopciones_mascotas` (`id_mascota`);

--
-- Indices de la tabla `auditoria_historial`
--
ALTER TABLE `auditoria_historial`
  ADD PRIMARY KEY (`id_auditoria`);

--
-- Indices de la tabla `auditoria_mascotas_eliminadas`
--
ALTER TABLE `auditoria_mascotas_eliminadas`
  ADD PRIMARY KEY (`id_auditoria`);

--
-- Indices de la tabla `categorias_mascotas`
--
ALTER TABLE `categorias_mascotas`
  ADD PRIMARY KEY (`id_categoria`);

--
-- Indices de la tabla `citas_visita`
--
ALTER TABLE `citas_visita`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_usuario` (`id_usuario`),
  ADD KEY `id_mascota` (`id_mascota`);

--
-- Indices de la tabla `direcciones`
--
ALTER TABLE `direcciones`
  ADD PRIMARY KEY (`id_direccion`),
  ADD KEY `fk_direcciones_usuarios` (`id_usuario`),
  ADD KEY `fk_direcciones_refugios` (`id_refugio`);

--
-- Indices de la tabla `favoritos`
--
ALTER TABLE `favoritos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id_usuario` (`id_usuario`,`id_mascota`),
  ADD KEY `id_mascota` (`id_mascota`);

--
-- Indices de la tabla `historial_medico`
--
ALTER TABLE `historial_medico`
  ADD PRIMARY KEY (`id_historial`),
  ADD KEY `fk_historial_mascotas` (`id_mascota`);

--
-- Indices de la tabla `mascotas`
--
ALTER TABLE `mascotas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_refugio` (`id_refugio`);

--
-- Indices de la tabla `mascotas_categorias`
--
ALTER TABLE `mascotas_categorias`
  ADD PRIMARY KEY (`id_mascota`,`id_categoria`),
  ADD KEY `fk_mc_categorias` (`id_categoria`);

--
-- Indices de la tabla `mascota_imagenes`
--
ALTER TABLE `mascota_imagenes`
  ADD PRIMARY KEY (`id_imagen`),
  ADD KEY `id_mascota` (`id_mascota`);

--
-- Indices de la tabla `mensajes`
--
ALTER TABLE `mensajes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `id_remitente` (`id_remitente`),
  ADD KEY `id_destinatario` (`id_destinatario`);

--
-- Indices de la tabla `refugios`
--
ALTER TABLE `refugios`
  ADD PRIMARY KEY (`id_refugio`);

--
-- Indices de la tabla `registros_actividad`
--
ALTER TABLE `registros_actividad`
  ADD PRIMARY KEY (`id_registro`);

--
-- Indices de la tabla `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id_rol`);

--
-- Indices de la tabla `seguimiento`
--
ALTER TABLE `seguimiento`
  ADD PRIMARY KEY (`id_seguimiento`),
  ADD KEY `fk_seguimiento_adopciones` (`id_adopcion`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id_usuario`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `fk_usuarios_roles` (`id_rol`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `adopciones`
--
ALTER TABLE `adopciones`
  MODIFY `id_adopcion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `auditoria_historial`
--
ALTER TABLE `auditoria_historial`
  MODIFY `id_auditoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `auditoria_mascotas_eliminadas`
--
ALTER TABLE `auditoria_mascotas_eliminadas`
  MODIFY `id_auditoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `categorias_mascotas`
--
ALTER TABLE `categorias_mascotas`
  MODIFY `id_categoria` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `citas_visita`
--
ALTER TABLE `citas_visita`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `direcciones`
--
ALTER TABLE `direcciones`
  MODIFY `id_direccion` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `favoritos`
--
ALTER TABLE `favoritos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `historial_medico`
--
ALTER TABLE `historial_medico`
  MODIFY `id_historial` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `mascotas`
--
ALTER TABLE `mascotas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `mascota_imagenes`
--
ALTER TABLE `mascota_imagenes`
  MODIFY `id_imagen` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `mensajes`
--
ALTER TABLE `mensajes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `refugios`
--
ALTER TABLE `refugios`
  MODIFY `id_refugio` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT de la tabla `registros_actividad`
--
ALTER TABLE `registros_actividad`
  MODIFY `id_registro` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `roles`
--
ALTER TABLE `roles`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `seguimiento`
--
ALTER TABLE `seguimiento`
  MODIFY `id_seguimiento` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `adopciones`
--
ALTER TABLE `adopciones`
  ADD CONSTRAINT `fk_adopciones_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `citas_visita`
--
ALTER TABLE `citas_visita`
  ADD CONSTRAINT `citas_visita_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `citas_visita_ibfk_2` FOREIGN KEY (`id_mascota`) REFERENCES `mascotas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `direcciones`
--
ALTER TABLE `direcciones`
  ADD CONSTRAINT `fk_direcciones_refugios` FOREIGN KEY (`id_refugio`) REFERENCES `refugios` (`id_refugio`),
  ADD CONSTRAINT `fk_direcciones_usuarios` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`);

--
-- Filtros para la tabla `favoritos`
--
ALTER TABLE `favoritos`
  ADD CONSTRAINT `favoritos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `favoritos_ibfk_2` FOREIGN KEY (`id_mascota`) REFERENCES `mascotas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `mascotas`
--
ALTER TABLE `mascotas`
  ADD CONSTRAINT `mascotas_refugio_fk` FOREIGN KEY (`id_refugio`) REFERENCES `refugios` (`id_refugio`) ON DELETE CASCADE;

--
-- Filtros para la tabla `mascotas_categorias`
--
ALTER TABLE `mascotas_categorias`
  ADD CONSTRAINT `fk_mc_categorias` FOREIGN KEY (`id_categoria`) REFERENCES `categorias_mascotas` (`id_categoria`);

--
-- Filtros para la tabla `mascota_imagenes`
--
ALTER TABLE `mascota_imagenes`
  ADD CONSTRAINT `mascota_imagenes_ibfk_1` FOREIGN KEY (`id_mascota`) REFERENCES `mascotas` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `mensajes`
--
ALTER TABLE `mensajes`
  ADD CONSTRAINT `mensajes_ibfk_1` FOREIGN KEY (`id_remitente`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE,
  ADD CONSTRAINT `mensajes_ibfk_2` FOREIGN KEY (`id_destinatario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE;

--
-- Filtros para la tabla `seguimiento`
--
ALTER TABLE `seguimiento`
  ADD CONSTRAINT `fk_seguimiento_adopciones` FOREIGN KEY (`id_adopcion`) REFERENCES `adopciones` (`id_adopcion`);

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `fk_usuarios_roles` FOREIGN KEY (`id_rol`) REFERENCES `roles` (`id_rol`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
