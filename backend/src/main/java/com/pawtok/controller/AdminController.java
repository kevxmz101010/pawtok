package com.pawtok.controller;

import com.pawtok.dto.DashboardDTO;
import com.pawtok.dto.UsuarioDTO;
import com.pawtok.model.Usuario;
import com.pawtok.model.Refugio;
import com.pawtok.model.enums.EstadoMascota;
import com.pawtok.model.enums.Rol;
import com.pawtok.repository.UsuarioRepository;
import com.pawtok.repository.MascotaRepository;
import com.pawtok.repository.RefugioRepository;
import com.pawtok.repository.AdopcionRepository;
import com.pawtok.service.UsuarioService;
import com.pawtok.service.MascotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UsuarioRepository usuarioRepository;
    private final MascotaRepository mascotaRepository;
    private final RefugioRepository refugioRepository;
    private final AdopcionRepository adopcionRepository;
    private final UsuarioService usuarioService;
    private final MascotaService mascotaService;

    private boolean isAdmin(Authentication authentication) {
        Usuario usuario = usuarioRepository.findByEmail(authentication.getName()).orElse(null);
        return usuario != null && usuario.getRol() == Rol.ADMIN;
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(Authentication authentication) {
        if (!isAdmin(authentication)) return ResponseEntity.status(403).build();

        long totalUsuarios = usuarioRepository.count();
        long totalAdoptantes = usuarioRepository.findAll().stream().filter(u -> u.getRol() == Rol.USUARIO).count();
        long totalRefugios = refugioRepository.count();
        long totalMascotas = mascotaRepository.count();
        long totalDisponibles = mascotaRepository.findAll().stream().filter(m -> m.getEstado() == EstadoMascota.DISPONIBLE).count();
        long totalSolicitudes = adopcionRepository.count();

        return ResponseEntity.ok(Map.of(
            "usuarios", totalUsuarios,
            "adoptantes", totalAdoptantes,
            "refugios", totalRefugios,
            "mascotas", totalMascotas,
            "disponibles", totalDisponibles,
            "solicitudes", totalSolicitudes
        ));
    }

    @GetMapping("/usuarios")
    public ResponseEntity<List<UsuarioDTO>> getUsuarios(Authentication authentication) {
        if (!isAdmin(authentication)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(usuarioRepository.findAll().stream()
                .map(u -> UsuarioDTO.builder()
                        .id(u.getId())
                        .nombre(u.getNombre())
                        .email(u.getEmail())
                        .rol(u.getRol() != null ? u.getRol() : com.pawtok.model.enums.Rol.USUARIO)
                        .telefono(u.getTelefono())
                        .creadoEn(u.getCreadoEn())
                        .build())
                .collect(Collectors.toList()));
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<Void> deleteUsuario(@PathVariable Long id, Authentication authentication) {
        if (!isAdmin(authentication)) return ResponseEntity.status(403).build();
        usuarioRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/refugios")
    public ResponseEntity<List<Refugio>> getRefugios(Authentication authentication) {
        if (!isAdmin(authentication)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(refugioRepository.findAll());
    }

    @DeleteMapping("/refugios/{id}")
    public ResponseEntity<Void> deleteRefugio(@PathVariable Long id, Authentication authentication) {
        if (!isAdmin(authentication)) return ResponseEntity.status(403).build();
        refugioRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/solicitudes-refugio")
    public ResponseEntity<List<Refugio>> getSolicitudesRefugio(Authentication authentication) {
        if (!isAdmin(authentication)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(refugioRepository.findAll().stream()
                .filter(r -> "Pendiente".equalsIgnoreCase(r.getEstadoVerificacion()))
                .collect(Collectors.toList()));
    }

    @PutMapping("/solicitudes-refugio/{id}/aprobar")
    public ResponseEntity<Refugio> aprobarRefugio(@PathVariable Long id, Authentication authentication) {
        if (!isAdmin(authentication)) return ResponseEntity.status(403).build();
        Refugio refugio = refugioRepository.findById(id).orElseThrow();
        refugio.setEstadoVerificacion("Aprobado");
        refugio = refugioRepository.save(refugio);
        
        Usuario usuario = usuarioRepository.findById(refugio.getIdUsuario()).orElseThrow();
        usuario.setRol(Rol.REFUGIO);
        usuarioRepository.save(usuario);
        
        return ResponseEntity.ok(refugio);
    }

    @PutMapping("/solicitudes-refugio/{id}/rechazar")
    public ResponseEntity<Refugio> rechazarRefugio(@PathVariable Long id, Authentication authentication) {
        if (!isAdmin(authentication)) return ResponseEntity.status(403).build();
        Refugio refugio = refugioRepository.findById(id).orElseThrow();
        refugio.setEstadoVerificacion("Rechazado");
        refugio = refugioRepository.save(refugio);
        return ResponseEntity.ok(refugio);
    }
}
