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
    public ResponseEntity<List<CitaVisitaDTO>> getCitasByMascota(@PathVariable Long mascotaId, Authentication auth) {
        return ResponseEntity.ok(citaVisitaService.getCitasByMascota(mascotaId, auth.getName()));
    }

    @PutMapping("/{id}/estado")
    public ResponseEntity<CitaVisitaDTO> updateEstado(
            @PathVariable Long id, 
            @RequestParam String estado, 
            Authentication auth) {
        return ResponseEntity.ok(citaVisitaService.updateEstado(id, estado, auth.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CitaVisitaDTO> updateCita(
            @PathVariable Long id,
            @RequestBody CitaVisitaDTO body,
            Authentication auth) {
        return ResponseEntity.ok(citaVisitaService.updateCita(id, body, auth.getName()));
    }

    @PostMapping("/{id}/novedad")
    public ResponseEntity<CitaVisitaDTO> reportarNovedad(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body,
            Authentication auth) {
        String novedad = body != null ? body.get("novedad") : "";
        return ResponseEntity.ok(citaVisitaService.reportarNovedad(id, novedad, auth.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCita(
            @PathVariable Long id,
            Authentication auth) {
        citaVisitaService.eliminarCita(id, auth.getName());
        return ResponseEntity.noContent().build();
    }
}
