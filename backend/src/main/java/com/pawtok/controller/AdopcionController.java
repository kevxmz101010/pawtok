package com.pawtok.controller;

import com.pawtok.dto.AdopcionDTO;
import com.pawtok.model.enums.EstadoAdopcion;
import com.pawtok.service.AdopcionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controlador de Adopciones
 * Gestiona el proceso cuando un usuario dice "Quiero adoptar este perrito".
 * Permite crear solicitudes, ver las solicitudes enviadas (adoptantes) y recibidas (refugios).
 */
@RestController
@RequestMapping("/api/adopciones")
@RequiredArgsConstructor
public class AdopcionController {

    private final AdopcionService adopcionService;

    /**
     * Crear una nueva solicitud de adopción.
     */
    @PostMapping
    public ResponseEntity<AdopcionDTO> solicitarAdopcion(@RequestBody AdopcionDTO adopcionDto, Authentication authentication) {
        return ResponseEntity.ok(adopcionService.solicitarAdopcion(adopcionDto, authentication.getName()));
    }

    /**
     * Obtener todas las solicitudes que YO he enviado (como adoptante).
     */
    @GetMapping("/mis-adopciones")
    public ResponseEntity<List<AdopcionDTO>> getMisAdopciones(Authentication authentication) {
        return ResponseEntity.ok(adopcionService.getAdopcionesByUsuario(authentication.getName()));
    }

    /**
     * Obtener todas las solicitudes que ME han enviado (como refugio).
     */
    @GetMapping("/solicitudes")
    public ResponseEntity<List<AdopcionDTO>> getSolicitudes(Authentication authentication) {
        return ResponseEntity.ok(adopcionService.getAdopcionesByRefugio(authentication.getName()));
    }

    /**
     * El refugio aprueba o rechaza una solicitud.
     */
    @PutMapping("/{id}/resolver")
    public ResponseEntity<AdopcionDTO> resolverAdopcion(
            @PathVariable Long id,
            @RequestParam EstadoAdopcion estado,
            Authentication authentication) {
        return ResponseEntity.ok(adopcionService.resolverAdopcion(id, estado, authentication.getName()));
    }

    /**
     * Cancelar/Eliminar una solicitud de adopción.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarAdopcion(@PathVariable Long id, Authentication authentication) {
        adopcionService.eliminarAdopcion(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
