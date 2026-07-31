package com.pawtok.service;

import com.pawtok.dto.CitaVisitaDTO;
import com.pawtok.model.CitaVisita;
import com.pawtok.model.Mascota;
import com.pawtok.model.Usuario;
import com.pawtok.repository.CitaVisitaRepository;
import com.pawtok.repository.MascotaRepository;
import com.pawtok.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CitaVisitaService {
    private final CitaVisitaRepository citaVisitaRepository;
    private final UsuarioRepository usuarioRepository;
    private final MascotaRepository mascotaRepository;
    private final com.pawtok.repository.RefugioRepository refugioRepository;
    private final NotificacionService notificacionService;

    public CitaVisitaDTO agendarCita(CitaVisitaDTO dto, String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND, "Usuario no encontrado"
                ));
        
        if (usuario.getRol() != com.pawtok.model.enums.Rol.USUARIO) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN, 
                "Solo los adoptantes particulares pueden agendar citas de visita para adopción"
            );
        }
        
        CitaVisita entity = new CitaVisita();
        entity.setIdUsuario(usuario.getId());
        entity.setIdMascota(dto.getIdMascota());
        entity.setFecha(dto.getFecha());
        entity.setHora(dto.getHora());
        entity.setTelefono(dto.getTelefono());
        entity.setDireccion(dto.getDireccion());
        entity.setTipoVivienda(dto.getTipoVivienda());
        entity.setTieneMascotas(dto.getTieneMascotas());
        entity.setOcupacion(dto.getOcupacion());
        entity.setIngresosAprox(dto.getIngresosAprox());
        entity.setMensaje(dto.getMensaje());
        entity.setEstado("PENDIENTE");
        entity.setFechaCreacion(LocalDateTime.now());
        
        return mapToDTO(citaVisitaRepository.save(entity));
    }

    public List<CitaVisitaDTO> getCitasByUsuario(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
        return citaVisitaRepository.findAll().stream()
                .filter(c -> c.getIdUsuario().equals(usuario.getId()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<CitaVisitaDTO> getCitasByMascota(Long idMascota, String userEmail) {
        if (userEmail == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED, "No autenticado"
            );
        }
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "Usuario no encontrado"
                ));
        Mascota mascota = mascotaRepository.findById(idMascota)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND, "Mascota no encontrada"
                ));
        if (usuario.getRol() != com.pawtok.model.enums.Rol.ADMIN) {
            com.pawtok.model.Refugio refugio = refugioRepository.findByIdUsuario(usuario.getId()).orElse(null);
            boolean isOwner = refugio != null && mascota.getRefugio() != null && mascota.getRefugio().equals(String.valueOf(refugio.getId()));
            if (!isOwner) {
                throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "No autorizado para ver las citas de esta mascota"
                );
            }
        }
        return citaVisitaRepository.findAll().stream()
                .filter(c -> c.getIdMascota().equals(idMascota))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CitaVisitaDTO updateEstado(Long id, String estado, String userEmail) {
        if (userEmail == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED, "No autenticado"
            );
        }
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "Usuario no encontrado"
                ));
        CitaVisita entity = citaVisitaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
        Mascota mascota = mascotaRepository.findById(entity.getIdMascota())
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));
        
        if (usuario.getRol() != com.pawtok.model.enums.Rol.ADMIN) {
            com.pawtok.model.Refugio refugio = refugioRepository.findByIdUsuario(usuario.getId()).orElse(null);
            boolean isOwner = refugio != null && mascota.getRefugio() != null && mascota.getRefugio().equals(String.valueOf(refugio.getId()));
            boolean isAdopter = entity.getIdUsuario().equals(usuario.getId());
            if (!isOwner && !(isAdopter && "CANCELADA".equalsIgnoreCase(estado))) {
                throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "No autorizado para actualizar esta cita"
                );
            }
        }
        entity.setEstado(estado);
        return mapToDTO(citaVisitaRepository.save(entity));
    }

    public CitaVisitaDTO updateCita(Long id, CitaVisitaDTO updateDto, String userEmail) {
        if (userEmail == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED, "No autenticado"
            );
        }
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "Usuario no encontrado"
                ));
        CitaVisita entity = citaVisitaRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND, "Cita no encontrada"
                ));
        Mascota mascota = mascotaRepository.findById(entity.getIdMascota())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND, "Mascota no encontrada"
                ));

        boolean isShelterOwner = false;
        if (usuario.getRol() != com.pawtok.model.enums.Rol.ADMIN) {
            com.pawtok.model.Refugio refugio = refugioRepository.findByIdUsuario(usuario.getId()).orElse(null);
            isShelterOwner = refugio != null && (
                (mascota.getIdRefugio() != null && mascota.getIdRefugio().equals(refugio.getId())) ||
                (mascota.getRefugio() != null && mascota.getRefugio().equals(String.valueOf(refugio.getId())))
            );
            if (!isShelterOwner) {
                throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "Solo el refugio o administrador puede modificar la fecha y detalles de la cita"
                );
            }
        } else {
            isShelterOwner = true;
        }

        if (updateDto.getFecha() != null) entity.setFecha(updateDto.getFecha());
        if (updateDto.getHora() != null) entity.setHora(updateDto.getHora());
        if (updateDto.getEstado() != null && !updateDto.getEstado().isBlank()) entity.setEstado(updateDto.getEstado());
        if (updateDto.getTelefono() != null) entity.setTelefono(updateDto.getTelefono());
        if (updateDto.getDireccion() != null) entity.setDireccion(updateDto.getDireccion());
        if (updateDto.getMensaje() != null) entity.setMensaje(updateDto.getMensaje());
        if (updateDto.getNovedad() != null) entity.setNovedad(updateDto.getNovedad());

        CitaVisita saved = citaVisitaRepository.save(entity);

        // Notificar al adoptante si el refugio hizo cambios en la cita
        if (isShelterOwner && !entity.getIdUsuario().equals(usuario.getId())) {
            notificacionService.crearNotificacion(
                entity.getIdUsuario(),
                "Cita de visita actualizada",
                "El refugio ha actualizado los detalles de tu cita para visitar a " + mascota.getNombre() + 
                ". Fecha: " + entity.getFecha() + " a las " + entity.getHora() + ". Estado: " + entity.getEstado() + ".",
                "CITA_ACTUALIZADA",
                "/cuenta"
            );
        }

        return mapToDTO(saved);
    }

    public CitaVisitaDTO reportarNovedad(Long id, String novedadTexto, String userEmail) {
        if (userEmail == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED, "No autenticado"
            );
        }
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "Usuario no encontrado"
                ));
        CitaVisita entity = citaVisitaRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND, "Cita no encontrada"
                ));
        Mascota mascota = mascotaRepository.findById(entity.getIdMascota())
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND, "Mascota no encontrada"
                ));

        if (!entity.getIdUsuario().equals(usuario.getId()) && usuario.getRol() != com.pawtok.model.enums.Rol.ADMIN) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN, "Solo el adoptante de esta cita puede reportar novedades"
            );
        }

        entity.setNovedad(novedadTexto);
        CitaVisita saved = citaVisitaRepository.save(entity);

        // Notificar al refugio encargado de la mascota
        Long idRefugio = mascota.getIdRefugio();
        if (idRefugio == null && mascota.getRefugio() != null) {
            try { idRefugio = Long.parseLong(mascota.getRefugio()); } catch (Exception ignored) {}
        }

        if (idRefugio != null) {
            refugioRepository.findById(idRefugio).ifPresent(ref -> {
                if (ref.getIdUsuario() != null) {
                    notificacionService.crearNotificacion(
                        ref.getIdUsuario(),
                        "Novedad en cita de visita",
                        usuario.getNombre() + " reportó una novedad para la cita con " + mascota.getNombre() + ": \"" + novedadTexto + "\"",
                        "NOVEDAD_CITA",
                        "/refugio"
                    );
                }
            });
        }

        return mapToDTO(saved);
    }

    public void eliminarCita(Long id, String userEmail) {
        if (userEmail == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED, "No autenticado"
            );
        }
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "Usuario no encontrado"
                ));
        CitaVisita entity = citaVisitaRepository.findById(id)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND, "Cita no encontrada"
                ));
        Mascota mascota = mascotaRepository.findById(entity.getIdMascota()).orElse(null);

        if (usuario.getRol() != com.pawtok.model.enums.Rol.ADMIN) {
            com.pawtok.model.Refugio refugio = refugioRepository.findByIdUsuario(usuario.getId()).orElse(null);
            boolean isShelterOwner = refugio != null && (
                (mascota != null && mascota.getIdRefugio() != null && mascota.getIdRefugio().equals(refugio.getId())) ||
                (mascota != null && mascota.getRefugio() != null && mascota.getRefugio().equals(String.valueOf(refugio.getId())))
            );
            boolean isAdopter = entity.getIdUsuario().equals(usuario.getId());
            if (!isShelterOwner && !isAdopter) {
                throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.FORBIDDEN, "No autorizado para eliminar esta cita"
                );
            }
            // Notificar al refugio si el adoptante canceló su cita
            if (isAdopter && !isShelterOwner && mascota != null) {
                Long idRefugio = mascota.getIdRefugio();
                if (idRefugio == null && mascota.getRefugio() != null) {
                    try { idRefugio = Long.parseLong(mascota.getRefugio()); } catch (Exception ignored) {}
                }
                if (idRefugio != null) {
                    refugioRepository.findById(idRefugio).ifPresent(ref -> {
                        if (ref.getIdUsuario() != null) {
                            notificacionService.crearNotificacion(
                                ref.getIdUsuario(),
                                "Cita de visita cancelada",
                                usuario.getNombre() + " ha cancelado su cita de visita programada para " + mascota.getNombre() + ".",
                                "CITA_CANCELADA",
                                "/refugio"
                            );
                        }
                    });
                }
            }
        }

        citaVisitaRepository.delete(entity);
    }

    private CitaVisitaDTO mapToDTO(CitaVisita entity) {
        String nombreUsuario = usuarioRepository.findById(entity.getIdUsuario())
                .map(Usuario::getNombre)
                .orElse("Desconocido");
                
        Mascota mascota = mascotaRepository.findById(entity.getIdMascota()).orElse(null);
        String nombreMascota = mascota != null ? mascota.getNombre() : "Desconocida";
        String fotoMascota = mascota != null ? mascota.getImagenUrl() : null;

        String nombreRefugio = "Refugio Asociado";
        if (mascota != null) {
            Long idRefugio = mascota.getIdRefugio();
            if (idRefugio == null && mascota.getRefugio() != null) {
                try { idRefugio = Long.parseLong(mascota.getRefugio()); } catch (Exception ignored) {}
            }
            if (idRefugio != null) {
                nombreRefugio = refugioRepository.findById(idRefugio)
                        .map(com.pawtok.model.Refugio::getNombre)
                        .orElse("Refugio Asociado");
            }
        }

        return CitaVisitaDTO.builder()
                .id(entity.getId())
                .idUsuario(entity.getIdUsuario())
                .idMascota(entity.getIdMascota())
                .nombreUsuario(nombreUsuario)
                .nombreMascota(nombreMascota)
                .fotoMascota(fotoMascota)
                .nombreRefugio(nombreRefugio)
                .fecha(entity.getFecha())
                .hora(entity.getHora())
                .telefono(entity.getTelefono())
                .direccion(entity.getDireccion())
                .tipoVivienda(entity.getTipoVivienda())
                .tieneMascotas(entity.getTieneMascotas())
                .ocupacion(entity.getOcupacion())
                .ingresosAprox(entity.getIngresosAprox())
                .mensaje(entity.getMensaje())
                .novedad(entity.getNovedad())
                .estado(entity.getEstado())
                .fechaCreacion(entity.getFechaCreacion())
                .build();
    }
}
