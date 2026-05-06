package com.pawtok.service;

import com.pawtok.dto.MensajeDTO;
import com.pawtok.model.Adopcion;
import com.pawtok.model.Mensaje;
import com.pawtok.model.Usuario;
import com.pawtok.repository.AdopcionRepository;
import com.pawtok.repository.MensajeRepository;
import com.pawtok.repository.UsuarioRepository;
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
    private final FileStorageService fileStorageService;

    public List<MensajeDTO> getMensajesPorAdopcion(Long adopcionId, String emailUser) {
        Adopcion adopcion = adopcionRepository.findById(adopcionId)
                .orElseThrow(() -> new RuntimeException("Adopción no encontrada"));
        
        Usuario usuario = usuarioRepository.findByEmail(emailUser)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
        // Validar permisos (debe ser el adoptante o el refugio)
        if (!adopcion.getUsuario().getId().equals(usuario.getId()) &&
            !adopcion.getMascota().getIdRefugio().equals(usuario.getId()) &&
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
        if (adopcion.getUsuario().getId().equals(remitente.getId())) {
            // El remitente es el adoptante, el receptor es el refugio
            receptor = usuarioRepository.findById(adopcion.getMascota().getIdRefugio())
                    .orElseThrow(() -> new RuntimeException("Refugio no encontrado"));
        } else {
            // El remitente es el refugio, el receptor es el adoptante
            receptor = adopcion.getUsuario();
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

        return mapToDto(mensajeRepository.save(mensaje));
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
