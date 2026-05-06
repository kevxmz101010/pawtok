package com.pawtok.controller;

import com.pawtok.dto.MascotaDTO;
import com.pawtok.model.enums.EstadoMascota;
import com.pawtok.service.MascotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/mascotas")
@RequiredArgsConstructor
public class MascotaController {

    private final MascotaService mascotaService;

    @GetMapping
    public ResponseEntity<List<MascotaDTO>> getAllMascotas() {
        return ResponseEntity.ok(mascotaService.getAllMascotas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MascotaDTO> getMascotaById(@PathVariable Long id) {
        return ResponseEntity.ok(mascotaService.getMascotaById(id));
    }

    @PostMapping
    public ResponseEntity<MascotaDTO> createMascota(@RequestBody MascotaDTO mascotaDto, Authentication authentication) {
        return ResponseEntity.ok(mascotaService.createMascota(mascotaDto, authentication.getName()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MascotaDTO> updateMascota(@PathVariable Long id, @RequestBody MascotaDTO mascotaDto, Authentication authentication) {
        return ResponseEntity.ok(mascotaService.updateMascota(id, mascotaDto, authentication.getName()));
    }
    
    @PutMapping("/{id}/estado")
    public ResponseEntity<MascotaDTO> updateEstadoMascota(@PathVariable Long id, @RequestParam String estado, Authentication authentication) {
        EstadoMascota estadoEnum = EstadoMascota.valueOf(estado);
        return ResponseEntity.ok(mascotaService.updateEstado(id, estadoEnum, authentication.getName()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMascota(@PathVariable Long id, Authentication authentication) {
        mascotaService.deleteMascota(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/mis-publicaciones")
    public ResponseEntity<org.springframework.data.domain.Page<MascotaDTO>> getMisPublicaciones(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(mascotaService.getMascotasByUsuarioEmail(authentication.getName(), pageable));
    }
}
