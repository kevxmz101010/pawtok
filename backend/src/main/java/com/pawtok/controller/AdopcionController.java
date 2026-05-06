package com.pawtok.controller;

import com.pawtok.dto.AdopcionDTO;
import com.pawtok.model.enums.EstadoAdopcion;
import com.pawtok.service.AdopcionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adopciones")
@RequiredArgsConstructor
public class AdopcionController {

    private final AdopcionService adopcionService;

    @PostMapping
    public ResponseEntity<AdopcionDTO> solicitarAdopcion(@RequestBody AdopcionDTO adopcionDto, Authentication authentication) {
        return ResponseEntity.ok(adopcionService.solicitarAdopcion(adopcionDto, authentication.getName()));
    }

    @GetMapping("/mis-adopciones")
    public ResponseEntity<List<AdopcionDTO>> getMisAdopciones(Authentication authentication) {
        return ResponseEntity.ok(adopcionService.getAdopcionesByUsuario(authentication.getName()));
    }

    @GetMapping("/solicitudes")
    public ResponseEntity<List<AdopcionDTO>> getSolicitudes(Authentication authentication) {
        return ResponseEntity.ok(adopcionService.getAdopcionesByRefugio(authentication.getName()));
    }

    @PutMapping("/{id}/resolver")
    public ResponseEntity<AdopcionDTO> resolverAdopcion(
            @PathVariable Long id,
            @RequestParam EstadoAdopcion estado,
            Authentication authentication) {
        return ResponseEntity.ok(adopcionService.resolverAdopcion(id, estado, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarAdopcion(@PathVariable Long id, Authentication authentication) {
        adopcionService.eliminarAdopcion(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
