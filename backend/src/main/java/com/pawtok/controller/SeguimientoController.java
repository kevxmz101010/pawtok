package com.pawtok.controller;

import com.pawtok.dto.SeguimientoDTO;
import com.pawtok.service.SeguimientoService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/adopciones/{adopcionId}/seguimiento")
@RequiredArgsConstructor
public class SeguimientoController {

    private final SeguimientoService seguimientoService;

    @GetMapping
    public ResponseEntity<List<SeguimientoDTO>> getSeguimiento(@PathVariable Long adopcionId) {
        return ResponseEntity.ok(seguimientoService.getSeguimientoByAdopcion(adopcionId));
    }

    @PostMapping
    public ResponseEntity<SeguimientoDTO> addSeguimiento(
            @PathVariable Long adopcionId,
            @RequestParam String comentario,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) MultipartFile foto,
            Authentication auth) {
        
        SeguimientoDTO dto = SeguimientoDTO.builder()
                .comentario(comentario)
                .fecha(fecha)
                .build();
                
        return ResponseEntity.ok(seguimientoService.addSeguimiento(adopcionId, dto, foto));
    }
}
