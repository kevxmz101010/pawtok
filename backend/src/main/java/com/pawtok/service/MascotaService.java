package com.pawtok.service;

import com.pawtok.dto.MascotaDTO;
import com.pawtok.model.enums.EstadoMascota;
import com.pawtok.model.Mascota;
import com.pawtok.model.enums.Rol;
import com.pawtok.model.Usuario;
import com.pawtok.repository.MascotaRepository;
import com.pawtok.repository.UsuarioRepository;
import com.pawtok.model.AuditoriaMascotaEliminada;
import com.pawtok.repository.AuditoriaMascotaEliminadaRepository;
import com.pawtok.repository.MascotaImagenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio de Mascotas (MascotaService)
 * Aquí vive la "Lógica de Negocios". El controlador recibe la petición web y se la pasa a este servicio.
 * Este servicio se encarga de hablar con la Base de Datos (a través de los Repositorios) y con 
 * Cloudinary (a través de FileStorageService) para hacer el trabajo pesado.
 */
@Service
@RequiredArgsConstructor
public class MascotaService {

    // Dependencias inyectadas para interactuar con la Base de Datos y archivos
    private final MascotaRepository mascotaRepository;
    private final UsuarioRepository usuarioRepository;
    private final com.pawtok.repository.RefugioRepository refugioRepository;
    private final com.pawtok.repository.AdopcionRepository adopcionRepository;
    private final com.pawtok.repository.HistorialMedicoRepository historialMedicoRepository;
    private final com.pawtok.repository.CitaVisitaRepository citaVisitaRepository;
    private final com.pawtok.repository.FavoritoRepository favoritoRepository;
    private final com.pawtok.repository.SeguimientoRepository seguimientoRepository;
    private final FileStorageService fileStorageService;
    private final AuditoriaMascotaEliminadaRepository auditoriaMascotaEliminadaRepository;
    private final MascotaImagenRepository mascotaImagenRepository;
    private final RegistroActividadService registroActividadService;

    /**
     * Trae TODAS las mascotas de la base de datos.
     * Convierte la entidad de base de datos (Mascota) a un objeto para enviar por internet (MascotaDTO).
     */
    public List<MascotaDTO> getAllMascotas() {
        return mascotaRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id")).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Busca una mascota por su ID. Si no existe, lanza un error que detiene la petición.
     */
    public MascotaDTO getMascotaById(Long id) {
        Mascota mascota = mascotaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));
        return mapToDto(mascota);
    }
    
    /**
     * Trae las mascotas que pertenecen a un refugio en específico.
     */
    public List<MascotaDTO> getMascotasByRefugio(Long refugioId) {
        return mascotaRepository.findByIdRefugio(refugioId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Método especial para paginación (traer de a 10 en 10, por ejemplo).
     * Se usa en el dashboard del refugio.
     */
    public org.springframework.data.domain.Page<MascotaDTO> getMascotasByUsuarioEmail(String email, org.springframework.data.domain.Pageable pageable) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        com.pawtok.model.Refugio refugio = refugioRepository.findByIdUsuario(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Refugio no encontrado"));
        return mascotaRepository.findByIdRefugio(refugio.getId(), pageable)
                .map(this::mapToDto);
    }

    /**
     * CREAR una mascota nueva. Aquí se guardan también las fotos en Cloudinary.
     */
    public MascotaDTO createMascota(MascotaDTO mascotaDto, String refugioEmail) {
        Usuario usuario = usuarioRepository.findByEmail(refugioEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        com.pawtok.model.Refugio refugio = refugioRepository.findByIdUsuario(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Refugio no encontrado"));

        // 1. Si la imagen principal es nueva (viene en Base64), súbela a Cloudinary.
        String imagenUrl = mascotaDto.getImagenUrl();
        if (imagenUrl != null && imagenUrl.startsWith("data:image/")) {
            imagenUrl = fileStorageService.storeBase64File(imagenUrl); // Sube y retorna la URL pública
        }

        // 2. Si hay fotos en la galería, súbelas también.
        String galeriaStr = null;
        if (mascotaDto.getGaleria() != null) {
            List<String> storedGallery = mascotaDto.getGaleria().stream()
                .map(img -> {
                    if (img != null && img.startsWith("data:image/")) {
                        return fileStorageService.storeBase64File(img);
                    }
                    return img;
                })
                .collect(Collectors.toList());
            galeriaStr = String.join(",", storedGallery); // La base de datos las guarda como un string separado por comas
        }

        // 3. Crear el objeto para la Base de Datos usando el patrón Builder
        Mascota mascota = Mascota.builder()
                .nombre(mascotaDto.getNombre())
                .raza(mascotaDto.getRaza())
                .edad(mascotaDto.getEdad())
                .descripcion(mascotaDto.getDescripcion())
                .imagenUrl(imagenUrl)
                .categoria(mascotaDto.getCategoria())
                .estado(EstadoMascota.DISPONIBLE)
                .disponible(true)
                .refugio(String.valueOf(refugio.getId()))
                .peso(mascotaDto.getPeso())
                .tamano(mascotaDto.getTamano())
                .energia(mascotaDto.getEnergia())
                .conNinos(mascotaDto.getConNinos())
                .personalidad(mascotaDto.getPersonalidad())
                .origen(mascotaDto.getOrigen() != null ? mascotaDto.getOrigen() : "refugio")
                .galeria(galeriaStr)
                .ubicacion(mascotaDto.getUbicacion())
                .build();

        // 4. Guardarlo y retornar el DTO
        Mascota saved = mascotaRepository.save(mascota);
        registroActividadService.registrar(usuario.getId(), "CREAR_MASCOTA", "Mascota creada: " + saved.getNombre());
        return mapToDto(saved);
    }

    /**
     * ACTUALIZAR una mascota.
     * Verifica que quien intente editar sea realmente el dueño del refugio (o un Admin).
     */
    public MascotaDTO updateMascota(Long id, MascotaDTO mascotaDto, String usuarioEmail) {
        Mascota mascota = mascotaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));

        Usuario usuario = usuarioRepository.findByEmail(usuarioEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        com.pawtok.model.Refugio refugio = refugioRepository.findByIdUsuario(usuario.getId()).orElse(null);
        boolean isOwner = refugio != null && mascota.getRefugio() != null && mascota.getRefugio().equals(String.valueOf(refugio.getId()));

        // ¡Seguridad! Si no es el dueño ni admin, bloquea la acción.
        if (!isOwner && usuario.getRol() != Rol.ADMIN) {
            throw new RuntimeException("No autorizado para actualizar esta mascota");
        }

        String imagenUrl = mascotaDto.getImagenUrl();
        if (imagenUrl != null && imagenUrl.startsWith("data:image/")) {
            imagenUrl = fileStorageService.storeBase64File(imagenUrl);
        }

        String galeriaStr = null;
        if (mascotaDto.getGaleria() != null) {
            List<String> storedGallery = mascotaDto.getGaleria().stream()
                .map(img -> {
                    if (img != null && img.startsWith("data:image/")) {
                        return fileStorageService.storeBase64File(img);
                    }
                    return img;
                })
                .collect(Collectors.toList());
            galeriaStr = String.join(",", storedGallery);
        } else {
            galeriaStr = mascota.getGaleria();
        }

        mascota.setNombre(mascotaDto.getNombre());
        mascota.setRaza(mascotaDto.getRaza());
        mascota.setEdad(mascotaDto.getEdad());
        mascota.setDescripcion(mascotaDto.getDescripcion());
        if (imagenUrl != null) {
            mascota.setImagenUrl(imagenUrl);
        }
        mascota.setCategoria(mascotaDto.getCategoria());
        if (mascotaDto.getEstado() != null) {
            mascota.setEstado(mascotaDto.getEstado());
        }
        mascota.setPeso(mascotaDto.getPeso());
        mascota.setTamano(mascotaDto.getTamano());
        mascota.setEnergia(mascotaDto.getEnergia());
        mascota.setConNinos(mascotaDto.getConNinos());
        mascota.setPersonalidad(mascotaDto.getPersonalidad());
        if (mascotaDto.getOrigen() != null) {
            mascota.setOrigen(mascotaDto.getOrigen());
        }
        mascota.setGaleria(galeriaStr);
        mascota.setUbicacion(mascotaDto.getUbicacion());

        Mascota saved = mascotaRepository.save(mascota);
        registroActividadService.registrar(usuario.getId(), "EDITAR_MASCOTA", "Mascota editada: " + saved.getNombre());
        return mapToDto(saved);
    }

    public MascotaDTO updateEstado(Long id, EstadoMascota estado, String usuarioEmail) {
        Mascota mascota = mascotaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));

        if (usuarioEmail == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED, 
                "Debes iniciar sesión para actualizar el estado"
            );
        }

        Usuario usuario = usuarioRepository.findByEmail(usuarioEmail).orElse(null);
        if (usuario == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED, 
                "Usuario no encontrado"
            );
        }

        com.pawtok.model.Refugio refugio = refugioRepository.findByIdUsuario(usuario.getId()).orElse(null);
        boolean isOwner = refugio != null && mascota.getRefugio() != null && mascota.getRefugio().equals(String.valueOf(refugio.getId()));

        if (!isOwner && usuario.getRol() != Rol.ADMIN) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN, 
                "No autorizado para actualizar el estado (Rol no permitido)"
            );
        }

        mascota.setEstado(estado);
        if (estado == EstadoMascota.DISPONIBLE) {
            mascota.setDisponible(true);
        } else {
            mascota.setDisponible(false);
        }
        return mapToDto(mascotaRepository.save(mascota));
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteMascota(Long id, String usuarioEmail) {
        Mascota mascota = mascotaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));

        Usuario usuario = usuarioRepository.findByEmail(usuarioEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        com.pawtok.model.Refugio refugio = refugioRepository.findByIdUsuario(usuario.getId()).orElse(null);
        boolean isOwner = refugio != null && mascota.getRefugio() != null && mascota.getRefugio().equals(String.valueOf(refugio.getId()));

        if (!isOwner && usuario.getRol() != Rol.ADMIN) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN, 
                "No autorizado para eliminar esta mascota"
            );
        }

        // RN 1.8 / RF 1.8 (CP-GM-13): Validar si la mascota tiene un proceso de adopción aprobado o en seguimiento activo
        List<com.pawtok.model.Adopcion> adopciones = adopcionRepository.findByMascotaId(mascota.getId());
        boolean tieneAdopcionAprobadaOSeguimiento = false;

        if (mascota.getEstado() == EstadoMascota.ADOPTADO) {
            tieneAdopcionAprobadaOSeguimiento = true;
        }

        if (adopciones != null) {
            for (com.pawtok.model.Adopcion ad : adopciones) {
                if (ad.getEstado() == com.pawtok.model.enums.EstadoAdopcion.APROBADA) {
                    tieneAdopcionAprobadaOSeguimiento = true;
                    break;
                }
                List<com.pawtok.model.Seguimiento> segs = seguimientoRepository.findByIdAdopcionOrderByFechaDesc(ad.getId());
                if (segs != null && !segs.isEmpty()) {
                    tieneAdopcionAprobadaOSeguimiento = true;
                    break;
                }
            }
        }

        if (tieneAdopcionAprobadaOSeguimiento) {
            throw new IllegalArgumentException("No se puede eliminar la mascota porque tiene un proceso de adopción aprobado o en seguimiento activo");
        }

        // Limpiar registros hijos que no tienen cascade en la base de datos
        List<com.pawtok.model.HistorialMedico> medList = historialMedicoRepository.findByIdMascotaOrderByFechaDesc(mascota.getId());
        if (medList != null && !medList.isEmpty()) {
            historialMedicoRepository.deleteAll(medList);
        }

        List<com.pawtok.model.CitaVisita> citasList = citaVisitaRepository.findByIdMascotaOrderByFechaDesc(mascota.getId());
        if (citasList != null && !citasList.isEmpty()) {
            citaVisitaRepository.deleteAll(citasList);
        }

        List<com.pawtok.model.Favorito> favList = favoritoRepository.findByMascotaId(mascota.getId());
        if (favList != null && !favList.isEmpty()) {
            favoritoRepository.deleteAll(favList);
        }

        if (adopciones != null && !adopciones.isEmpty()) {
            adopcionRepository.deleteAll(adopciones);
        }

        // Guardar registro de auditoría de eliminación
        auditoriaMascotaEliminadaRepository.save(AuditoriaMascotaEliminada.builder()
                .idMascotaOriginal(mascota.getId().intValue())
                .nombreMascota(mascota.getNombre())
                .idUsuarioElimina(usuario.getId().intValue())
                .fechaEliminacion(java.time.LocalDateTime.now())
                .build());

        registroActividadService.registrar(usuario.getId(), "ELIMINAR_MASCOTA", "Mascota eliminada: " + mascota.getNombre());

        mascotaRepository.delete(mascota);
    }

    /**
     * Método auxiliar (Helper).
     * Toma una "Mascota" (entidad que viene de la BD) y la convierte en un "MascotaDTO" (el JSON que lee React).
     * Esto se hace porque no siempre queremos enviar toda la info de la BD cruda por internet, 
     * a veces hay contraseñas o datos sensibles.
     */
    private MascotaDTO mapToDto(Mascota mascota) {
        List<String> galeriaList = null;
        if (mascota.getGaleria() != null && !mascota.getGaleria().isEmpty()) {
            galeriaList = java.util.Arrays.asList(mascota.getGaleria().split(","));
        }

        String refugioNombre = "Refugio Pawtok";
        if (mascota.getRefugio() != null && !mascota.getRefugio().isEmpty()) {
            try {
                Long rId = Long.parseLong(mascota.getRefugio());
                refugioNombre = refugioRepository.findById(rId)
                        .map(com.pawtok.model.Refugio::getNombre)
                        .orElse("Refugio Desconocido");
            } catch (Exception e) {
                refugioNombre = mascota.getRefugio();
            }
        }

        return MascotaDTO.builder()
                .id(mascota.getId())
                .nombre(mascota.getNombre())
                .raza(mascota.getRaza())
                .edad(mascota.getEdad())
                .descripcion(mascota.getDescripcion())
                .imagenUrl(mascota.getImagenUrl())
                .categoria(mascota.getCategoria())
                .estado(mascota.getEstado())
                .refugio(mascota.getRefugio())
                .refugioNombre(refugioNombre)
                .creadoEn(mascota.getCreadoEn())
                .peso(mascota.getPeso())
                .tamano(mascota.getTamano())
                .energia(mascota.getEnergia())
                .conNinos(mascota.getConNinos())
                .personalidad(mascota.getPersonalidad())
                .origen(mascota.getOrigen())
                .galeria(galeriaList)
                .ubicacion(mascota.getUbicacion())
                .build();
    }
}
