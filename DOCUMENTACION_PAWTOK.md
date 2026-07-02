# 🐾 Manual y Documentación del Proyecto Pawtok

¡Bienvenido al manual oficial de Pawtok! Este documento está diseñado para ayudarte a entender exactamente cómo funciona el proyecto, desde su arquitectura hasta los flujos de datos. Está escrito de manera sencilla para que puedas estudiarlo y comprender cada pieza del rompecabezas.

---

## 1. 🏗️ Arquitectura General: ¿Cómo se conectan las piezas?

El proyecto Pawtok está construido usando una arquitectura moderna separada en tres grandes bloques (Frontend, Backend y Base de Datos/Almacenamiento).

1. **Frontend (React + Vite + TypeScript + Tailwind CSS)**
   - Es la "Cara" de la aplicación. Lo que el usuario ve y donde hace clic.
   - Corre en tu navegador y se comunica con el Backend a través de "Peticiones HTTP" usando `fetch`.
   - Utilizamos React Router para navegar sin recargar la página.

2. **Backend (Spring Boot + Java)**
   - Es el "Cerebro" y el "Guardia de Seguridad".
   - Recibe las peticiones de React, procesa la "lógica de negocio" (ej. "Este usuario quiere adoptar a Max"), verifica los permisos (Spring Security) y luego habla con la Base de Datos.

3. **Base de Datos y Almacenamiento**
   - **Aiven Cloud (MySQL):** Aquí se guarda todo el texto: usuarios, contraseñas encriptadas, información de las mascotas, chats y solicitudes de adopción.
   - **Cloudinary (Imágenes):** La base de datos es mala guardando fotos. Por eso, cuando alguien sube la foto de un perrito, el Backend la envía a Cloudinary, Cloudinary devuelve una URL web segura (`https://...`), y nosotros guardamos *solo esa URL* en MySQL.

---

## 2. 📂 Estructura de Carpetas

### El Backend (`backend/src/main/java/com/pawtok/`)
El Backend usa una arquitectura llamada **MVC Modificada (Modelo - Repositorio - Servicio - Controlador)**.

*   `config/`: Archivos de configuración. Aquí está `SecurityConfig.java` que dicta quién puede entrar a qué ruta.
*   `model/`: Entidades. Son el "molde" de la base de datos. Una clase aquí (ej. `Mascota.java`) se convierte directamente en una tabla en MySQL gracias a Hibernate/JPA.
*   `repository/`: Interfaces mágicas. Archivos como `MascotaRepository.java` que extienden `JpaRepository` y nos permiten buscar en la base de datos sin escribir SQL.
*   `service/`: Lógica de Negocio. Aquí (ej. `MascotaService.java`) es donde ocurre la magia pesada. Aquí se calcula, se suben las imágenes a Cloudinary, y se aplican las reglas.
*   `controller/`: Puertas de entrada. Clases como `MascotaController.java` definen las URLs (`/api/mascotas`). Su único trabajo es recibir la petición del Frontend y pasársela al `Service`.
*   `dto/`: "Data Transfer Objects". Son objetos simples que usamos para enviar datos por internet entre React y Spring Boot sin enviar información sensible que pueda estar en el `Model`.

### El Frontend (`frontend/src/`)
*   `components/`: Pedazos reutilizables de la interfaz gráfica (Botones, el Header, la sección de mascotas `PetsSection.tsx`).
*   `pages/`: Pantallas completas (La página de inicio, el Dashboard del Refugio, el formulario de adopción).
*   `context/`: La "memoria global". Aquí está `AuthContext.tsx`, que recuerda en toda la página web quién ha iniciado sesión para no estar preguntándole al Backend a cada rato.
*   `types/`: Definiciones de TypeScript para que el código sepa qué forma tiene una "Mascota" o un "Usuario".

---

## 3. 🌊 Flujo de Datos (Casos de Uso)

### ¿Qué pasa cuando haces clic en "Adoptar" en la app?
1. **React (AdoptPet.tsx):** Llenas el formulario de adopción con tu dirección e ingresos. Haces clic en enviar.
2. **React:** Hace una petición `POST` hacia la URL `/api/adopciones`.
3. **Backend (AdopcionController.java):** Intercepta la petición POST. Extrae quién eres (mirando tu Cookie de sesión) y le dice al `AdopcionService`: "Oye, este usuario quiere adoptar a este perrito, toma los datos".
4. **Backend (AdopcionService.java):**
   - Verifica que el perrito exista.
   - Crea un objeto `Adopcion` (estado: PENDIENTE).
   - Lo guarda en MySQL a través del `AdopcionRepository`.
5. **Backend -> React:** Le responde a React con un HTTP 200 OK y la información guardada.
6. **React (AdoptPet.tsx):** Oculta el formulario y muestra la pantalla verde de "¡Solicitud Enviada!".

### ¿Qué pasa cuando un refugio sube una mascota nueva?
1. **React (AddPet.tsx):** El refugio sube una foto. React lee esa foto y la convierte a texto largo llamado Base64. Envía los datos (nombre, raza, foto en Base64) mediante un `POST` a `/api/mascotas`.
2. **Backend (MascotaController):** Recibe los datos y llama a `MascotaService.createMascota()`.
3. **Backend (MascotaService & FileStorageService):** 
   - El servicio detecta que la imagen es Base64. Llama a `FileStorageService`.
   - `FileStorageService` se conecta a Cloudinary, le manda los bytes de la foto y Cloudinary responde con una URL pública.
   - El servicio reemplaza el texto largo en Base64 por la URL cortita de Cloudinary.
   - Guarda todo el objeto final usando `MascotaRepository.save()`.
4. **Backend -> React:** Responde que todo salió bien y React redirige al refugio a su dashboard.

---

## 4. 🧩 Explicación de Código Clave (Snippets)

### El Cerebro de Búsqueda y Filtros de Mascotas (PetsSection.tsx)
En el frontend, no le preguntamos al backend cada vez que filtras. Descargamos todos los perritos una vez y aplicamos filtros rápidos usando `useMemo`.

```typescript
// frontend/src/components/PetsSection.tsx
const filteredPets = useMemo(() => {
  // 1. Filtra por nombre, raza o si presionaste el botón de "Perro/Gato"
  let result = pets.filter(pet => {
    const textMatch = !searchText || pet.nombre.includes(searchText);
    const typeMatch = selectedType === 'all' || (pet.categoria === selectedType);
    return textMatch && typeMatch;
  });

  // 2. Si el usuario viene de la Encuesta, calculamos un puntaje de compatibilidad.
  if (surveyAnswers) {
    result = result.map(pet => {
      let score = 50; // Inician con 50 puntos
      
      // Si el perrito es muy grande y el usuario vive en apartamento, restamos puntos.
      if (surveyAnswers.vivienda === 'apartamento' && pet.tamano === 'grande') score -= 25;
      
      return { ...pet, matchScore: score };
    });

    // Ordenamos de mayor compatibilidad a menor
    result.sort((a, b) => b.matchScore - a.matchScore);
  }
  return result;
}, [pets, searchText, selectedType, surveyAnswers]);
```

### Seguridad y Rutas (SecurityConfig.java)
Aquí es donde le decimos a Spring Boot qué partes del sitio son públicas y cuáles son privadas.

```java
// backend/src/main/java/com/pawtok/config/SecurityConfig.java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            // Rutas PÚBLICAS: Ver mascotas, ver la carpeta de subidas, login y registro.
            .requestMatchers(HttpMethod.GET, "/api/mascotas", "/uploads/**").permitAll()
            .requestMatchers("/api/auth/register", "/api/auth/login").permitAll()
            
            // CUALQUIER OTRA RUTA (como adoptar, editar perfil, ver dashboard) REQUIERE LOGIN.
            .anyRequest().authenticated()
        );
    return http.build();
}
```

### Guardando Entidades sin escribir SQL (MascotaRepository.java)
Spring Data JPA hace el trabajo duro por nosotros. Solo declarando la interfaz, obtenemos métodos como `save`, `findById`, `findAll`.

```java
// backend/src/main/java/com/pawtok/repository/MascotaRepository.java
public interface MascotaRepository extends JpaRepository<Mascota, Long> {
    // Magia de Spring: Solo por llamar a este método "findByIdRefugio", 
    // Spring genera la consulta "SELECT * FROM mascotas WHERE id_refugio = ?"
    List<Mascota> findByIdRefugio(Long idRefugio);
}
```

---

Con esto, tienes una visión 360° de Pawtok. El código está altamente comentado línea por línea en los controladores, servicios, modelos y el frontend (como `PetsSection` y `AuthContext`), así que puedes explorar los archivos directamente en tu editor para aprender más detalles específicos. ¡Disfruta explorando el código! 🚀
