package com.pawtok.controller;

import com.pawtok.dto.RefugioDTO;
import com.pawtok.model.Refugio;
import com.pawtok.model.Usuario;
import com.pawtok.repository.RefugioRepository;
import com.pawtok.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/refugios")
public class RefugioController {

    private final RefugioRepository refugioRepository;
    private final UsuarioRepository usuarioRepository;

    public RefugioController(RefugioRepository refugioRepository, UsuarioRepository usuarioRepository) {
        this.refugioRepository = refugioRepository;
        this.usuarioRepository = usuarioRepository;
    }


    @GetMapping
    public ResponseEntity<List<RefugioDTO>> getAllRefugios() {
        List<RefugioDTO> list = refugioRepository.findAll().stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PutMapping("/{id}/aprobar")
    public ResponseEntity<Map<String, String>> aprobarRefugio(@PathVariable Long id) {
        Refugio refugio = refugioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Refugio no encontrado"));

        refugio.setEstadoVerificacion("Aprobado");
        refugioRepository.save(refugio);

        // Update user role to REFUGIO (3)
        Usuario usuario = usuarioRepository.findById(refugio.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuario asociado no encontrado"));
        usuario.setIdRol(3); // 3 = REFUGIO
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of("message", "Refugio aprobado exitosamente"));
    }

    @PutMapping("/{id}/rechazar")
    public ResponseEntity<Map<String, String>> rechazarRefugio(@PathVariable Long id) {
        Refugio refugio = refugioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Refugio no encontrado"));

        refugio.setEstadoVerificacion("Rechazado");
        refugioRepository.save(refugio);

        return ResponseEntity.ok(Map.of("message", "Refugio rechazado exitosamente"));
    }

    private RefugioDTO toDTO(Refugio r) {
        return RefugioDTO.builder()
                .id(r.getId())
                .nombre(r.getNombre())
                .direccion(r.getDireccion())
                .telefono(r.getTelefono())
                .email(r.getEmail())
                .idUsuario(r.getIdUsuario())
                .descripcion(r.getDescripcion())
                .redesSociales(r.getRedesSociales())
                .horario(r.getHorario())
                .certificadoUrl(r.getCertificadoUrl())
                .documentoRepresentanteUrl(r.getDocumentoRepresentanteUrl())
                .fotosLugarUrl(r.getFotosLugarUrl())
                .estadoVerificacion(r.getEstadoVerificacion())
                .logoUrl(r.getLogoUrl())
                .build();
    }
}
