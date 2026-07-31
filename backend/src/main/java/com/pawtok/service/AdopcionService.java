package com.pawtok.service;

import com.pawtok.dto.AdopcionDTO;
import com.pawtok.model.Adopcion;
import com.pawtok.model.enums.EstadoAdopcion;
import com.pawtok.model.enums.EstadoMascota;
import com.pawtok.model.Mascota;
import com.pawtok.model.enums.Rol;
import com.pawtok.model.Usuario;
import com.pawtok.repository.AdopcionRepository;
import com.pawtok.repository.MascotaRepository;
import com.pawtok.repository.UsuarioRepository;
import com.pawtok.repository.RefugioRepository;
import com.pawtok.model.Refugio;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.pawtok.model.CitaVisita;
import com.pawtok.model.AuditoriaHistorial;
import com.pawtok.repository.AuditoriaHistorialRepository;
import com.pawtok.repository.CitaVisitaRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdopcionService {

    private final AdopcionRepository adopcionRepository;
    private final MascotaRepository mascotaRepository;
    private final UsuarioRepository usuarioRepository;
    private final RefugioRepository refugioRepository;
    private final RegistroActividadService registroActividadService;
    private final NotificacionService notificacionService;
    private final CitaVisitaRepository citaVisitaRepository;
    private final AuditoriaHistorialRepository auditoriaHistorialRepository;

    public AdopcionDTO solicitarAdopcion(AdopcionDTO adopcionDto, String usuarioEmail) {
        Usuario usuario = usuarioRepository.findByEmail(usuarioEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        // Seguridad: Solo cuentas particulares de adoptantes (Rol.USUARIO) pueden adoptar
        if (usuario.getRol() != Rol.USUARIO) {
            throw new ResponseStatusException(
                HttpStatus.FORBIDDEN, 
                "Los refugios y administradores no pueden postularse a adopciones. Las solicitudes son exclusivas para cuentas de adoptantes particulares."
            );
        }

        Mascota mascota = mascotaRepository.findById(adopcionDto.getMascotaId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mascota no encontrada"));

        if (mascota.getEstado() != EstadoMascota.DISPONIBLE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La mascota no está disponible para adopción");
        }

        // Evitar autoadopción o conflicto de intereses con el refugio dueño
        Refugio userRefugio = refugioRepository.findByIdUsuario(usuario.getId()).orElse(null);
        if (userRefugio != null && mascota.getIdRefugio() != null && mascota.getIdRefugio().equals(userRefugio.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puedes adoptar una mascota de tu propio refugio");
        }

        // Evitar solicitudes duplicadas para la misma mascota (si ya tiene una solicitud enviada no rechazada)
        boolean yaSolicitada = adopcionRepository.findByUsuarioId(usuario.getId()).stream()
                .anyMatch(a -> a.getMascota() != null && a.getMascota().getId().equals(mascota.getId()) && a.getEstado() != EstadoAdopcion.RECHAZADA);
        if (yaSolicitada) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ya has enviado una solicitud de adopción para esta mascota. Puedes consultar su estado en tu cuenta.");
        }

        Adopcion adopcion = Adopcion.builder()
                .usuario(usuario)
                .mascota(mascota)
                .estado(EstadoAdopcion.PENDIENTE)
                .mensaje(adopcionDto.getMensaje())
                .direccion(adopcionDto.getDireccion())
                .fechaVisita(adopcionDto.getFechaVisita())
                .horaVisita(adopcionDto.getHoraVisita())
                .ingresosAprox(adopcionDto.getIngresosAprox())
                .ocupacion(adopcionDto.getOcupacion())
                .telefono(adopcionDto.getTelefono())
                .tieneMascotas(adopcionDto.getTieneMascotas())
                .tipoVivienda(adopcionDto.getTipoVivienda())
                .build();

        mascotaRepository.save(mascota);

        Adopcion saved = adopcionRepository.save(adopcion);
        registroActividadService.registrar(usuario.getId(), "SOLICITAR_ADOPCION", "Solicitud de adopción para mascota: " + mascota.getNombre());

        // Notificar al refugio dueño de la mascota
        if (mascota.getIdRefugio() != null) {
            refugioRepository.findById(mascota.getIdRefugio()).ifPresent(ref -> {
                if (ref.getIdUsuario() != null) {
                    notificacionService.crearNotificacion(
                        ref.getIdUsuario(),
                        "Nueva solicitud de adopción",
                        usuario.getNombre() + " ha enviado una solicitud para adoptar a " + mascota.getNombre() + ".",
                        "SOLICITUD_NUEVA",
                        "/refugio"
                    );
                }
            });
        }

        return mapToDto(saved);
    }

    public List<AdopcionDTO> getAdopcionesByUsuario(String usuarioEmail) {
        Usuario usuario = usuarioRepository.findByEmail(usuarioEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        return adopcionRepository.findByUsuarioId(usuario.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AdopcionDTO> getAdopcionesByRefugio(String refugioEmail) {
        Usuario refugioUser = usuarioRepository.findByEmail(refugioEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        if (refugioUser.getRol() != Rol.REFUGIO && refugioUser.getRol() != Rol.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo los refugios autorizados pueden consultar solicitudes recibidas");
        }
        Refugio refugio = refugioRepository.findByIdUsuario(refugioUser.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Refugio no encontrado"));
        return adopcionRepository.findByMascotaIdRefugio(refugio.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AdopcionDTO resolverAdopcion(Long id, EstadoAdopcion nuevoEstado, String refugioEmail) {
        Adopcion adopcion = adopcionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Adopción no encontrada"));

        Usuario refugioUser = usuarioRepository.findByEmail(refugioEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        Refugio refugio = refugioRepository.findByIdUsuario(refugioUser.getId()).orElse(null);

        if ((refugio == null || !refugio.getId().equals(adopcion.getMascota().getIdRefugio())) && refugioUser.getRol() != Rol.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado para resolver esta adopción");
        }

        // Evitar que un usuario resuelva una adopción donde él mismo es el adoptante
        if (adopcion.getUsuario().getId().equals(refugioUser.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Un usuario no puede resolver una adopción sobre sí mismo");
        }

        EstadoAdopcion estadoPrevio = adopcion.getEstado();
        adopcion.setEstado(nuevoEstado);
        adopcion.setResueltoEn(LocalDateTime.now());

        Mascota mascota = adopcion.getMascota();

        // Registrar en auditoria_historial
        try {
            AuditoriaHistorial aud = AuditoriaHistorial.builder()
                    .idAdopcion(adopcion.getId())
                    .idUsuario(adopcion.getUsuario() != null ? adopcion.getUsuario().getId() : null)
                    .idMascota(mascota != null ? mascota.getId() : null)
                    .nombreAdoptante(adopcion.getUsuario() != null ? adopcion.getUsuario().getNombre() : "Adoptante")
                    .nombreMascota(mascota != null ? mascota.getNombre() : "Mascota")
                    .fechaAdopcion(adopcion.getSolicitadoEn())
                    .estadoPrevio(estadoPrevio != null ? estadoPrevio.name() : "PENDIENTE")
                    .accion(nuevoEstado == EstadoAdopcion.APROBADA ? "adopcion_aprobada" : "adopcion_rechazada")
                    .idAdmin(refugioUser.getId())
                    .fechaAccion(LocalDateTime.now())
                    .motivo("Resolución de solicitud de adopción a " + nuevoEstado.name() + " por " + refugioUser.getNombre())
                    .build();
            auditoriaHistorialRepository.save(aud);
        } catch (Exception ignored) {}

        if (nuevoEstado == EstadoAdopcion.APROBADA) {
            mascota.setEstado(EstadoMascota.ADOPTADO);

            // Auto-crear la cita de visita para el adoptante y el refugio
            LocalDate fechaCita = null;
            LocalTime horaCita = null;
            try {
                if (adopcion.getFechaVisita() != null && !adopcion.getFechaVisita().isBlank()) {
                    fechaCita = LocalDate.parse(adopcion.getFechaVisita().trim());
                }
            } catch (Exception ignored) {}
            if (fechaCita == null) fechaCita = LocalDate.now().plusDays(3);

            try {
                if (adopcion.getHoraVisita() != null && !adopcion.getHoraVisita().isBlank()) {
                    horaCita = LocalTime.parse(adopcion.getHoraVisita().trim());
                }
            } catch (Exception ignored) {}
            if (horaCita == null) horaCita = LocalTime.of(10, 0);

            CitaVisita cita = CitaVisita.builder()
                    .idUsuario(adopcion.getUsuario().getId())
                    .idMascota(mascota.getId())
                    .fecha(fechaCita)
                    .hora(horaCita)
                    .telefono(adopcion.getTelefono())
                    .direccion(adopcion.getDireccion())
                    .tipoVivienda(adopcion.getTipoVivienda())
                    .tieneMascotas(adopcion.getTieneMascotas())
                    .ocupacion(adopcion.getOcupacion())
                    .ingresosAprox(adopcion.getIngresosAprox())
                    .mensaje(adopcion.getMensaje())
                    .estado("confirmada")
                    .fechaCreacion(LocalDateTime.now())
                    .build();
            citaVisitaRepository.save(cita);

            // Notificar al adoptante que su solicitud fue aprobada y se agendó la cita
            notificacionService.crearNotificacion(
                adopcion.getUsuario().getId(),
                "¡Solicitud aprobada!",
                "El refugio ha aprobado tu solicitud para " + mascota.getNombre() + 
                ". Tu cita de visita está agendada para el " + fechaCita + " a las " + horaCita + ". Puedes verla en tus detalles de adopción.",
                "SOLICITUD_APROBADA",
                "/cuenta"
            );
        } else if (nuevoEstado == EstadoAdopcion.RECHAZADA) {
            mascota.setEstado(EstadoMascota.DISPONIBLE);

            // Cancelar citas existentes asociadas si las hubiera
            citaVisitaRepository.findAll().stream()
                .filter(c -> c.getIdUsuario().equals(adopcion.getUsuario().getId()) && c.getIdMascota().equals(mascota.getId()))
                .forEach(c -> {
                    c.setEstado("cancelada");
                    citaVisitaRepository.save(c);
                });

            // Notificar al adoptante que su solicitud no fue aprobada
            notificacionService.crearNotificacion(
                adopcion.getUsuario().getId(),
                "Solicitud no aprobada",
                "El refugio no ha podido aprobar tu solicitud de adopción para " + mascota.getNombre() + ".",
                "SOLICITUD_RECHAZADA",
                "/cuenta"
            );
        }
        mascotaRepository.save(mascota);

        Adopcion saved = adopcionRepository.save(adopcion);
        registroActividadService.registrar(refugioUser.getId(), "RESOLVER_ADOPCION", "Adopción " + nuevoEstado + " para mascota ID: " + saved.getMascota().getId());
        return mapToDto(saved);
    }

    public void eliminarAdopcion(Long id, String usuarioEmail) {
        Adopcion adopcion = adopcionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adopción no encontrada"));
        
        Usuario user = usuarioRepository.findByEmail(usuarioEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
        // Only allow if the user is the one who made the request, or if they are the shelter, or if admin.
        boolean isOwner = adopcion.getUsuario().getId().equals(user.getId());
        boolean isRefugio = false;
        
        Refugio refugio = refugioRepository.findByIdUsuario(user.getId()).orElse(null);
        if (refugio != null && refugio.getId().equals(adopcion.getMascota().getIdRefugio())) {
            isRefugio = true;
        }
        
        if (!isOwner && !isRefugio && user.getRol() != Rol.ADMIN) {
            throw new RuntimeException("No autorizado para eliminar este registro");
        }

        // Guardar registro de auditoría en auditoria_historial
        try {
            AuditoriaHistorial aud = AuditoriaHistorial.builder()
                    .idAdopcion(adopcion.getId())
                    .idUsuario(adopcion.getUsuario() != null ? adopcion.getUsuario().getId() : null)
                    .idMascota(adopcion.getMascota() != null ? adopcion.getMascota().getId() : null)
                    .nombreAdoptante(adopcion.getUsuario() != null ? adopcion.getUsuario().getNombre() : "Usuario Desconocido")
                    .nombreMascota(adopcion.getMascota() != null ? adopcion.getMascota().getNombre() : "Mascota")
                    .fechaAdopcion(adopcion.getSolicitadoEn())
                    .estadoPrevio(adopcion.getEstado() != null ? adopcion.getEstado().name() : null)
                    .accion(user.getRol() == Rol.ADMIN ? "eliminado_por_admin" : "inactivado_usuario")
                    .idAdmin(user.getId())
                    .fechaAccion(LocalDateTime.now())
                    .motivo("Eliminación de solicitud de adopción del historial por " + user.getNombre())
                    .build();
            auditoriaHistorialRepository.save(aud);
        } catch (Exception ignored) {}
        
        adopcionRepository.delete(adopcion);
    }

    private AdopcionDTO mapToDto(Adopcion adopcion) {
        return AdopcionDTO.builder()
                .id(adopcion.getId())
                .usuarioId(adopcion.getUsuario().getId())
                .usuarioNombre(adopcion.getUsuario().getNombre())
                .mascotaId(adopcion.getMascota().getId())
                .mascotaNombre(adopcion.getMascota().getNombre())
                .mascotaTipo(adopcion.getMascota().getCategoria() != null ? adopcion.getMascota().getCategoria().name() : "")
                .mascotaRaza(adopcion.getMascota().getRaza())
                .estado(adopcion.getEstado())
                .mensaje(adopcion.getMensaje())
                .solicitadoEn(adopcion.getSolicitadoEn())
                .resueltoEn(adopcion.getResueltoEn())
                .direccion(adopcion.getDireccion())
                .fechaVisita(adopcion.getFechaVisita())
                .horaVisita(adopcion.getHoraVisita())
                .ingresosAprox(adopcion.getIngresosAprox())
                .ocupacion(adopcion.getOcupacion())
                .telefono(adopcion.getTelefono())
                .tieneMascotas(adopcion.getTieneMascotas())
                .tipoVivienda(adopcion.getTipoVivienda())
                .build();
    }
}
