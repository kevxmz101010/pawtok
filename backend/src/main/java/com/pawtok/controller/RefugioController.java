package com.pawtok.controller;

import com.pawtok.dto.RefugioDTO;
import com.pawtok.model.Refugio;
import com.pawtok.model.Usuario;
import com.pawtok.repository.RefugioRepository;
import com.pawtok.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import com.pawtok.model.enums.Rol;

import com.pawtok.dto.MascotaDTO;
import com.pawtok.service.MascotaService;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/refugios")
public class RefugioController {

    private final RefugioRepository refugioRepository;
    private final UsuarioRepository usuarioRepository;
    private final MascotaService mascotaService;
    private final com.pawtok.repository.DireccionRepository direccionRepository;

    public RefugioController(RefugioRepository refugioRepository, UsuarioRepository usuarioRepository, MascotaService mascotaService, com.pawtok.repository.DireccionRepository direccionRepository) {
        this.refugioRepository = refugioRepository;
        this.usuarioRepository = usuarioRepository;
        this.mascotaService = mascotaService;
        this.direccionRepository = direccionRepository;
    }

    private void checkAdmin(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }
        Usuario u = usuarioRepository.findByEmail(auth.getName()).orElse(null);
        if (u == null || u.getRol() != Rol.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo administradores pueden realizar esta acción");
        }
    }


    @GetMapping
    public ResponseEntity<List<RefugioDTO>> getAllRefugios(Authentication auth) {
        boolean isAdmin = false;
        Long currentUserId = -1L;
        if (auth != null && auth.getName() != null) {
            Usuario u = usuarioRepository.findByEmail(auth.getName()).orElse(null);
            if (u != null) {
                isAdmin = (u.getRol() == Rol.ADMIN);
                currentUserId = u.getId();
            }
        }
        final boolean adminFlag = isAdmin;
        final Long authUserId = currentUserId;

        List<RefugioDTO> list = refugioRepository.findAll().stream()
                .map(r -> toDTO(r, adminFlag || (r.getIdUsuario() != null && r.getIdUsuario().equals(authUserId))))
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/me")
    public ResponseEntity<RefugioDTO> getMyRefugio(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }
        Usuario u = usuarioRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        Refugio r = refugioRepository.findByIdUsuario(u.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No tienes un refugio registrado"));
        return ResponseEntity.ok(toDTO(r, true));
    }

    @PutMapping("/me")
    public ResponseEntity<RefugioDTO> updateMyRefugio(@RequestBody Map<String, Object> body, Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }
        Usuario u = usuarioRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        Refugio r = refugioRepository.findByIdUsuario(u.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No tienes un refugio registrado"));

        if (body.containsKey("nombre") && body.get("nombre") != null) {
            String val = body.get("nombre").toString().trim();
            if (!val.isEmpty()) {
                r.setNombre(val);
                u.setNombre(val);
            }
        }
        if (body.containsKey("telefono")) {
            String val = body.get("telefono") != null ? body.get("telefono").toString().trim() : null;
            r.setTelefono(val);
            u.setTelefono(val);
        }
        if (body.containsKey("direccion")) {
            String val = body.get("direccion") != null ? body.get("direccion").toString().trim() : null;
            r.setDireccion(val);
            if (val != null && !val.isEmpty()) {
                com.pawtok.model.Direccion dir = direccionRepository.findByIdRefugio(r.getId()).orElseGet(com.pawtok.model.Direccion::new);
                dir.setIdRefugio(r.getId());
                dir.setIdUsuario(u.getId());
                dir.setDireccion(val);
                if (body.containsKey("ciudad") && body.get("ciudad") != null) {
                    dir.setCiudad(body.get("ciudad").toString().trim());
                }
                direccionRepository.save(dir);
            }
        }
        if (body.containsKey("descripcion")) {
            String val = body.get("descripcion") != null ? body.get("descripcion").toString().trim() : null;
            r.setDescripcion(val);
            u.setBio(val);
        }
        if (body.containsKey("redesSociales")) {
            String val = body.get("redesSociales") != null ? body.get("redesSociales").toString().trim() : null;
            r.setRedesSociales(val);
        }
        if (body.containsKey("horario")) {
            String val = body.get("horario") != null ? body.get("horario").toString().trim() : null;
            r.setHorario(val);
        }

        usuarioRepository.save(u);
        Refugio saved = refugioRepository.save(r);
        return ResponseEntity.ok(toDTO(saved, true));
    }

    /**
     * Endpoint PÚBLICO para consultar la información de un refugio (por su ID o por su nombre).
     */
    @GetMapping("/{identifier}")
    public ResponseEntity<RefugioDTO> getRefugioByIdentifier(@PathVariable String identifier) {
        Refugio r = null;
        try {
            Long id = Long.parseLong(identifier);
            r = refugioRepository.findById(id).orElse(null);
        } catch (NumberFormatException ignored) {}

        if (r == null) {
            String clean = identifier.trim().toLowerCase();
            List<Refugio> all = refugioRepository.findAll();
            for (Refugio ref : all) {
                if (ref.getNombre() != null && (ref.getNombre().equalsIgnoreCase(identifier.trim()) || ref.getNombre().toLowerCase().contains(clean))) {
                    r = ref;
                    break;
                }
            }
        }

        if (r == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Refugio no encontrado");
        }

        return ResponseEntity.ok(toDTO(r, false));
    }

    /**
     * Endpoint PÚBLICO para consultar las mascotas disponibles pertenecientes a un refugio.
     */
    @GetMapping("/{identifier}/mascotas")
    public ResponseEntity<List<MascotaDTO>> getRefugioMascotas(@PathVariable String identifier) {
        Refugio r = null;
        Long shelterId = null;
        try {
            shelterId = Long.parseLong(identifier);
            r = refugioRepository.findById(shelterId).orElse(null);
        } catch (NumberFormatException ignored) {}

        if (r == null) {
            String clean = identifier.trim().toLowerCase();
            List<Refugio> all = refugioRepository.findAll();
            for (Refugio ref : all) {
                if (ref.getNombre() != null && (ref.getNombre().equalsIgnoreCase(identifier.trim()) || ref.getNombre().toLowerCase().contains(clean))) {
                    r = ref;
                    shelterId = ref.getId();
                    break;
                }
            }
        }

        final Long finalShelterId = shelterId;
        final String shelterName = (r != null && r.getNombre() != null) ? r.getNombre().trim() : identifier.trim();

        List<MascotaDTO> list = mascotaService.getAllMascotas().stream()
                .filter(m -> {
                    if (finalShelterId != null && m.getIdRefugio() != null && m.getIdRefugio().equals(finalShelterId)) return true;
                    if (finalShelterId != null && m.getRefugio() != null && m.getRefugio().equals(String.valueOf(finalShelterId))) return true;
                    if (m.getRefugioNombre() != null && m.getRefugioNombre().equalsIgnoreCase(shelterName)) return true;
                    if (m.getRefugio() != null && m.getRefugio().equalsIgnoreCase(shelterName)) return true;
                    return false;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }

    @PutMapping("/{id}/aprobar")
    public ResponseEntity<Map<String, String>> aprobarRefugio(@PathVariable Long id, Authentication auth) {
        checkAdmin(auth);
        Refugio refugio = refugioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Refugio no encontrado"));

        refugio.setEstadoVerificacion("Aprobado");
        refugio.setMotivoRechazo(null);
        refugioRepository.save(refugio);

        // Update user role to REFUGIO (3)
        Usuario usuario = usuarioRepository.findById(refugio.getIdUsuario())
                .orElseThrow(() -> new RuntimeException("Usuario asociado no encontrado"));
        usuario.setIdRol(3); // 3 = REFUGIO
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of("message", "Refugio aprobado exitosamente"));
    }

    @PutMapping("/{id}/rechazar")
    public ResponseEntity<Map<String, String>> rechazarRefugio(
            @PathVariable Long id, 
            @RequestBody(required = false) Map<String, String> body,
            Authentication auth) {
        checkAdmin(auth);
        Refugio refugio = refugioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Refugio no encontrado"));

        refugio.setEstadoVerificacion("Rechazado");
        if (body != null && body.containsKey("motivo")) {
            refugio.setMotivoRechazo(body.get("motivo"));
        }
        refugioRepository.save(refugio);

        return ResponseEntity.ok(Map.of("message", "Refugio rechazado exitosamente"));
    }

    private RefugioDTO toDTO(Refugio r, boolean includeSensitiveDocs) {
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
                .certificadoUrl(includeSensitiveDocs ? r.getCertificadoUrl() : null)
                .documentoRepresentanteUrl(includeSensitiveDocs ? r.getDocumentoRepresentanteUrl() : null)
                .fotosLugarUrl(r.getFotosLugarUrl())
                .estadoVerificacion(r.getEstadoVerificacion())
                .motivoRechazo(r.getMotivoRechazo())
                .logoUrl(r.getLogoUrl())
                .build();
    }
}
