package com.pawtok.service;

import com.pawtok.dto.NotificacionDTO;
import com.pawtok.model.Notificacion;
import com.pawtok.model.Usuario;
import com.pawtok.repository.NotificacionRepository;
import com.pawtok.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;

    public Notificacion crearNotificacion(Long idUsuario, String titulo, String mensaje, String tipo, String enlace) {
        if (idUsuario == null) return null;
        Notificacion notif = Notificacion.builder()
                .idUsuario(idUsuario)
                .titulo(titulo)
                .mensaje(mensaje)
                .tipo(tipo)
                .enlace(enlace)
                .leida(false)
                .fechaCreacion(LocalDateTime.now())
                .build();
        return notificacionRepository.save(notif);
    }

    public List<NotificacionDTO> obtenerNotificaciones(String userEmail) {
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        return notificacionRepository.findByIdUsuarioOrderByFechaCreacionDesc(usuario.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public long contarNoLeidas(String userEmail) {
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        return notificacionRepository.countByIdUsuarioAndLeidaFalse(usuario.getId());
    }

    public NotificacionDTO marcarComoLeida(Long notificacionId, String userEmail) {
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        Notificacion notif = notificacionRepository.findById(notificacionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificación no encontrada"));

        if (!notif.getIdUsuario().equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado");
        }

        notif.setLeida(true);
        return mapToDto(notificacionRepository.save(notif));
    }

    public void marcarTodasComoLeidas(String userEmail) {
        Usuario usuario = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        List<Notificacion> lista = notificacionRepository.findByIdUsuarioOrderByFechaCreacionDesc(usuario.getId());
        for (Notificacion n : lista) {
            if (!n.isLeida()) {
                n.setLeida(true);
            }
        }
        notificacionRepository.saveAll(lista);
    }

    private NotificacionDTO mapToDto(Notificacion n) {
        return NotificacionDTO.builder()
                .id(n.getId())
                .idUsuario(n.getIdUsuario())
                .titulo(n.getTitulo())
                .mensaje(n.getMensaje())
                .tipo(n.getTipo())
                .enlace(n.getEnlace())
                .leida(n.isLeida())
                .fechaCreacion(n.getFechaCreacion())
                .build();
    }
}
