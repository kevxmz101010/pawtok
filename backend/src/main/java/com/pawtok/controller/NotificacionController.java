package com.pawtok.controller;

import com.pawtok.dto.NotificacionDTO;
import com.pawtok.service.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;

    @GetMapping
    public ResponseEntity<List<NotificacionDTO>> getNotificaciones(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(notificacionService.obtenerNotificaciones(auth.getName()));
    }

    @GetMapping("/no-leidas/count")
    public ResponseEntity<Map<String, Long>> getCountNoLeidas(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.ok(Map.of("count", 0L));
        }
        long count = notificacionService.contarNoLeidas(auth.getName());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/leer")
    public ResponseEntity<NotificacionDTO> marcarComoLeida(@PathVariable Long id, Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(notificacionService.marcarComoLeida(id, auth.getName()));
    }

    @PutMapping("/marcar-todas")
    public ResponseEntity<Map<String, String>> marcarTodasComoLeidas(Authentication auth) {
        if (auth == null || !auth.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        notificacionService.marcarTodasComoLeidas(auth.getName());
        return ResponseEntity.ok(Map.of("message", "Todas marcadas como leídas"));
    }
}
