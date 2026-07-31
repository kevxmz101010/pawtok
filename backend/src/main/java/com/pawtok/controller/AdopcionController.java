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
    private final com.pawtok.repository.UsuarioRepository usuarioRepository;

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
     * Obtener solicitudes de un usuario específico por ID (Control de Aislamiento CP-HU-11).
     * Devuelve HTTP 403 Forbidden si un usuario intenta consultar el historial de otro.
     */
    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<AdopcionDTO>> getAdopcionesPorUsuarioId(
            @PathVariable Long usuarioId,
            Authentication authentication) {
        String authEmail = authentication.getName();
        com.pawtok.model.Usuario authUser = usuarioRepository.findByEmail(authEmail)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "Usuario no autenticado"));

        if (!authUser.getId().equals(usuarioId) && authUser.getRol() != com.pawtok.model.enums.Rol.ADMIN) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "No autorizado para consultar el historial de otro usuario");
        }

        return ResponseEntity.ok(adopcionService.getAdopcionesByUsuario(authUser.getEmail()));
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
