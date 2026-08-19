package com.pawtok.service;

import com.pawtok.dto.MensajeDTO;
import com.pawtok.model.Adopcion;
import com.pawtok.model.Mensaje;
import com.pawtok.model.Usuario;
import com.pawtok.repository.AdopcionRepository;
import com.pawtok.repository.MensajeRepository;
import com.pawtok.repository.RefugioRepository;
import com.pawtok.repository.UsuarioRepository;
import com.pawtok.model.Refugio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MensajeService {

    private final MensajeRepository mensajeRepository;
    private final AdopcionRepository adopcionRepository;
    private final UsuarioRepository usuarioRepository;
    private final RefugioRepository refugioRepository;
    private final FileStorageService fileStorageService;
    private final NotificacionService notificacionService;

    public List<MensajeDTO> getMensajesPorAdopcion(Long adopcionId, String emailUser) {
        Adopcion adopcion = adopcionRepository.findById(adopcionId)
                .orElseThrow(() -> new RuntimeException("Adopción no encontrada"));
        
        Usuario usuario = usuarioRepository.findByEmail(emailUser)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
        // Validar permisos (debe ser el adoptante o el refugio)
        Long idRefugio = adopcion.getMascota().getIdRefugio();
        Long idUsuarioRefugio = -1L;
        if (idRefugio != null) {
            Refugio refugio = refugioRepository.findById(idRefugio).orElse(null);
            if (refugio != null) {
                idUsuarioRefugio = refugio.getIdUsuario();
            }
        }

        if (!adopcion.getUsuario().getId().equals(usuario.getId()) &&
            !idUsuarioRefugio.equals(usuario.getId()) &&
            !usuario.getRol().name().equals("ADMIN")) {
            throw new RuntimeException("No tienes permiso para ver estos mensajes");
        }

        return mensajeRepository.findByAdopcionIdOrderByFechaEnvioAsc(adopcionId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public MensajeDTO enviarMensaje(Long adopcionId, String emailRemitente, String contenido, MultipartFile archivo) throws IOException {
        Adopcion adopcion = adopcionRepository.findById(adopcionId)
                .orElseThrow(() -> new RuntimeException("Adopción no encontrada"));
        
        Usuario remitente = usuarioRepository.findByEmail(emailRemitente)
                .orElseThrow(() -> new RuntimeException("Remitente no encontrado"));
                
        Usuario receptor;
        Long idRefugio = adopcion.getMascota().getIdRefugio();
        Refugio refugio = idRefugio != null ? refugioRepository.findById(idRefugio).orElse(null) : null;
        Long idUsuarioRefugio = (refugio != null) ? refugio.getIdUsuario() : -1L;

        if (adopcion.getUsuario().getId().equals(remitente.getId())) {
            // El remitente es el adoptante, el receptor es el refugio
            if (refugio == null) {
                throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND, "Refugio no encontrado"
                );
            }
            receptor = usuarioRepository.findById(refugio.getIdUsuario())
                    .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Usuario dueño del refugio no encontrado"
                    ));
        } else if (idUsuarioRefugio.equals(remitente.getId()) || remitente.getRol() == com.pawtok.model.enums.Rol.ADMIN) {
            // El remitente es el refugio autorizado o un administrador, el receptor es el adoptante
            receptor = adopcion.getUsuario();
        } else {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN, 
                "No tienes permiso para enviar mensajes en esta adopción"
            );
        }

        Mensaje mensaje = new Mensaje();
        mensaje.setAdopcion(adopcion);
        mensaje.setRemitente(remitente);
        mensaje.setReceptor(receptor);
        mensaje.setContenido(contenido);
        mensaje.setFechaEnvio(LocalDateTime.now());
        mensaje.setLeido(false);

        if (archivo != null && !archivo.isEmpty()) {
            String archivoUrl = fileStorageService.storeFile(archivo);
            mensaje.setArchivoUrl(archivoUrl);
        }

        Mensaje guardado = mensajeRepository.save(mensaje);

        try {
            String nombreMascota = (adopcion.getMascota() != null && adopcion.getMascota().getNombre() != null)
                    ? adopcion.getMascota().getNombre()
                    : "la mascota";
            String titulo = "Nuevo mensaje de " + remitente.getNombre();
            String snippet = (contenido != null && !contenido.trim().isEmpty())
                    ? (contenido.trim().length() > 60 ? contenido.trim().substring(0, 57) + "..." : contenido.trim())
                    : "Te ha enviado un archivo adjunto.";
            String mensajeTexto = snippet + " (Sobre " + nombreMascota + ")";
            String enlace = (receptor.getRol() == com.pawtok.model.enums.Rol.REFUGIO)
                    ? "/refugio?chat=" + adopcion.getId()
                    : "/cuenta?chat=" + adopcion.getId();

            notificacionService.crearNotificacion(
                    receptor.getId(),
                    titulo,
                    mensajeTexto,
                    "MENSAJE_NUEVO",
                    enlace
            );
        } catch (Exception e) {
            System.err.println("Error al generar notificación para nuevo mensaje: " + e.getMessage());
        }

        return mapToDto(guardado);
    }

    private MensajeDTO mapToDto(Mensaje mensaje) {
        return MensajeDTO.builder()
                .id(mensaje.getId())
                .remitenteId(mensaje.getRemitente().getId())
                .remitenteNombre(mensaje.getRemitente().getNombre())
                .adopcionId(mensaje.getAdopcion() != null ? mensaje.getAdopcion().getId() : null)
                .contenido(mensaje.getContenido())
                .archivoUrl(mensaje.getArchivoUrl())
                .fechaEnvio(mensaje.getFechaEnvio())
                .leido(mensaje.getLeido())
                .build();
    }
}
