
# 🐾 PawTok - Plataforma de Adopción y Bienestar Animal

PawTok es una plataforma web moderna diseñada para conectar refugios de animales con personas dispuestas a brindar un hogar responsable a mascotas rescatadas. Proporciona una experiencia intuitiva, interactiva y segura tanto para adoptantes particulares como para administradores y organizaciones protectoras de animales.

---

## 🚀 Tecnologías Utilizadas

### Frontend
- **Framework:** React 19 con TypeScript
- **Bundler:** Vite
- **Estilos y Animaciones:** Tailwind CSS, Framer Motion, Lucide Icons
- **Enrutamiento:** React Router DOM (v7)
- **Componentes UI:** Headless UI, Radix UI, Embla Carousel

### Backend
- **Lenguaje:** Java 17
- **Framework:** Spring Boot 3.2 (Spring Data JPA, Spring Security, Spring Web)
- **Persistencia:** Hibernate / MySQL (Compatible con Aiven Cloud)
- **Almacenamiento de Multimedia:** Cloudinary (almacenamiento en la nube de fotos y documentos)
- **Autenticación y Sesión:** Autenticación basada en sesiones y cookies HTTP-only con encriptación BCrypt

---

## 👥 Cuentas de Acceso y Credenciales

El sistema cuenta con roles bien definidos y usuarios preconfigurados en el arranque automático del servidor:

| Rol | Correo Electrónico | Contraseña | Descripción |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@pawtok.com` | `admin123` | Control total del sistema, aprobación de refugios, gestión de usuarios y analíticas. |
| **Refugio 1 (Principal)** | `refugio@pawtok.com` | `admin123` | Refugio *Huellas de Amor*. Gestión de mascotas, solicitudes de adopción y citas. |
| **Refugio 2 (Secundario)** | `refugio2@pawtok.com` | `admin123` | Refugio *Esperanza Animal*. Gestión de mascotas, solicitudes de adopción y citas. |
| **Adoptante** | `adoptante@pawtok.com` | `admin123` | Perfil particular para postular a adopciones, agendar visitas y marcar favoritos. |

---

## 📁 Estructura del Proyecto

```text
pawtok/
├── backend/                  # Servidor API Spring Boot (Java 17)
│   ├── src/main/java/        # Controladores, Servicios, Repositorios, Modelos y DTOs
│   ├── src/main/resources/   # application.properties, schema.sql, data.sql
│   ├── Dockerfile            # Configuración para despliegue en contenedores (Render/Cloud)
│   ├── mvnw.cmd / pom.xml    # Maven Wrapper y dependencias
│   └── uploads/              # Carpeta de almacenamiento local temporal
├── frontend/                 # Aplicación Cliente React + Vite + TypeScript
│   ├── src/                  # Componentes, Páginas, Contextos y Tipos
│   ├── public/               # Recursos estáticos (logos, huellas, imágenes)
│   ├── package.json          # Dependencias y scripts de Node.js
│   └── vite.config.ts        # Configuración de compilación y proxy
├── iniciar_proyecto.bat      # Script automatizado para iniciar MySQL, Backend y Frontend
├── .env.example              # Plantilla de variables de entorno
├── .gitignore                # Reglas de exclusión para Git
└── README.md                 # Documentación del proyecto
```

---

## 💻 Instalación y Ejecución Local

### Prerrequisitos
- **Java Development Kit (JDK) 17** o superior
- **Node.js 18+** y npm
- **MySQL** (ej. mediante XAMPP o servicio local de MySQL en el puerto 3306)

### Paso 1: Base de Datos
1. Inicia el servicio MySQL en tu máquina (puerto 3306).
2. Crea la base de datos `pawtok`:
   ```sql
   CREATE DATABASE pawtok CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### Paso 2: Ejecución Rápida (Windows)
Puedes hacer doble clic en el archivo `iniciar_proyecto.bat` en la raíz del proyecto. Este script:
1. Comprueba y levanta MySQL (si usas XAMPP).
2. Arranca el backend en `http://localhost:8080`.
3. Arranca el frontend en `http://localhost:3000`.

### Paso 3: Ejecución Manual

**Backend:**
```bash
cd backend
mvnw.cmd spring-boot:run
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Despliegue en la Nube (Render + Aiven)

### Base de Datos en Aiven Cloud (MySQL)
1. Crea un servicio MySQL en [Aiven](https://aiven.io/).
2. Copia la URL de conexión JDBC, usuario y contraseña.
3. Asegúrate de incluir el parámetro `?sslmode=require` en la cadena de conexión.

### Backend en Render
1. En el panel de Render, crea un **Web Service** conectado a tu repositorio de GitHub.
2. Selecciona **Docker** como entorno (el proyecto incluye `backend/Dockerfile`), o configura:
   - **Root Directory:** `backend`
   - **Build Command:** `./mvnw clean package -DskipTests`
   - **Start Command:** `java -jar target/backend-0.0.1-SNAPSHOT.jar`
3. Agrega las Variables de Entorno en Render:
   - `DB_URL`: Cadena JDBC de Aiven
   - `DB_USER`: Usuario de Aiven
   - `DB_PASSWORD`: Contraseña de Aiven
   - `CLOUDINARY_URL`: URL de tu cuenta de Cloudinary para fotos de mascotas
   - `CORS_ORIGINS`: URL del frontend desplegado

### Frontend en Render / Vercel
1. Crea un **Static Site** vinculado a la carpeta `frontend`.
2. **Build Command:** `npm run build`
3. **Publish Directory:** `dist`
4. **Environment Variables:** `VITE_API_URL` apuntando a la URL pública del backend en Render.

---

## 🛡️ Licencia
Este proyecto es de código abierto con fines educativos y de impacto social para fomentar la adopción responsable de mascotas.
