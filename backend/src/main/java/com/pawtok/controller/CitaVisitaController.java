package com.pawtok.controller;

import com.pawtok.dto.CitaVisitaDTO;
import com.pawtok.service.CitaVisitaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/citas")
@RequiredArgsConstructor
public class CitaVisitaController {

    private final CitaVisitaService citaVisitaService;

    @PostMapping
    public ResponseEntity<CitaVisitaDTO> agendarCita(@RequestBody CitaVisitaDTO body, Authentication auth) {
        return ResponseEntity.ok(citaVisitaService.agendarCita(body, auth.getName()));
    }

    @GetMapping("/mis-citas")
    public ResponseEntity<List<CitaVisitaDTO>> getMisCitas(Authentication auth) {
        return ResponseEntity.ok(citaVisitaService.getCitasByUsuario(auth.getName()));
    }

    @GetMapping("/mascota/{mascotaId}")
    public ResponseEntity<List<CitaVisitaDTO>> getCitasByMascota(@PathVariable Long mascotaId) {
        return ResponseEntity.ok(citaVisitaService.getCitasByMascota(mascotaId));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<CitaVisitaDTO> updateEstado(
            @PathVariable Long id, 
            @RequestParam String estado, 
            Authentication auth) {
        return ResponseEntity.ok(citaVisitaService.updateEstado(id, estado));
    }
}
