package com.pawtok.controller;

import com.pawtok.dto.MensajeDTO;
import com.pawtok.service.MensajeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/mensajes")
@RequiredArgsConstructor
public class MensajeController {

    private final MensajeService mensajeService;

    @GetMapping("/adopcion/{adopcionId}")
    public ResponseEntity<List<MensajeDTO>> getMensajesAdopcion(
            @PathVariable Long adopcionId,
            Authentication authentication) {
        return ResponseEntity.ok(mensajeService.getMensajesPorAdopcion(adopcionId, authentication.getName()));
    }

    @PostMapping("/adopcion/{adopcionId}")
    public ResponseEntity<MensajeDTO> enviarMensaje(
            @PathVariable Long adopcionId,
            @RequestParam(required = false) String contenido,
            @RequestParam(required = false) MultipartFile archivo,
            Authentication authentication) throws IOException {
        return ResponseEntity.ok(mensajeService.enviarMensaje(adopcionId, authentication.getName(), contenido, archivo));
    }
}
