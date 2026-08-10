package com.pawtok.controller;

import com.pawtok.dto.HistorialMedicoDTO;
import com.pawtok.service.HistorialMedicoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mascotas/{mascotaId}/historial")
@RequiredArgsConstructor
public class HistorialMedicoController {
    
    private final HistorialMedicoService historialMedicoService;

    @GetMapping
    public ResponseEntity<List<HistorialMedicoDTO>> getHistorial(@PathVariable Long mascotaId) {
        return ResponseEntity.ok(historialMedicoService.getHistorialByMascota(mascotaId));
    }

    @PostMapping
    public ResponseEntity<HistorialMedicoDTO> addRegistro(
            @PathVariable Long mascotaId, 
            @RequestBody HistorialMedicoDTO body, 
            Authentication auth) {
        body.setIdMascota(mascotaId);
        return ResponseEntity.ok(historialMedicoService.addRegistro(body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HistorialMedicoDTO> updateRegistro(
            @PathVariable Long mascotaId, 
            @PathVariable Long id, 
            @RequestBody HistorialMedicoDTO body, 
            Authentication auth) {
        return ResponseEntity.ok(historialMedicoService.updateRegistro(id, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRegistro(
            @PathVariable Long mascotaId, 
            @PathVariable Long id, 
            Authentication auth) {
        historialMedicoService.deleteRegistro(id);
        return ResponseEntity.noContent().build();
    }
}
