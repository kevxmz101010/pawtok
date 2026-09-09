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

import org.springframework.security.crypto.password.PasswordEncoder;

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
    private final com.pawtok.repository.AuditoriaHistorialRepository auditoriaHistorialRepository;
    private final PasswordEncoder passwordEncoder;

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
                        .bio(u.getBio())
                        .foto(u.getFoto())
                        .creadoEn(u.getCreadoEn())
                        .build())
                .collect(Collectors.toList()));
    }

    @PostMapping("/usuarios")
    public ResponseEntity<?> createUsuario(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        if (!isAdmin(authentication)) return ResponseEntity.status(403).build();

        String nombre = body.get("nombre");
        String email = body.get("email");
        String password = body.get("password") != null ? body.get("password") : body.get("contrasena");
        String rolStr = body.get("rol");
        String telefono = body.get("telefono");
        String bio = body.get("bio");

        if (nombre == null || nombre.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El nombre completo es obligatorio"));
        }
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El correo electrónico es obligatorio"));
        }
        if (password == null || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "La contraseña es obligatoria"));
        }

        String cleanEmail = email.trim().toLowerCase();
        if (usuarioRepository.findByEmail(cleanEmail).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Ya existe un usuario con este correo electrónico"));
        }

        Rol rol = Rol.USUARIO;
        int idRol = 2;
        if (rolStr != null) {
            String cleanRol = rolStr.trim().toUpperCase();
            if ("ADMIN".equals(cleanRol)) {
                rol = Rol.ADMIN;
                idRol = 1;
            } else if ("REFUGIO".equals(cleanRol)) {
                rol = Rol.REFUGIO;
                idRol = 3;
            }
        }

        Usuario nuevo = Usuario.builder()
                .nombre(nombre.trim())
                .email(cleanEmail)
                .contrasena(passwordEncoder.encode(password))
                .rol(rol)
                .idRol(idRol)
                .telefono(telefono != null ? telefono.trim() : null)
                .bio(bio != null ? bio.trim() : (rol == Rol.REFUGIO ? "Refugio registrado en Pawtok" : "Usuario registrado en Pawtok"))
                .creadoEn(java.time.LocalDateTime.now())
                .build();

        Usuario savedUser = usuarioRepository.save(nuevo);

        // Si el rol es REFUGIO, crear automáticamente la entidad Refugio vinculada
        if (rol == Rol.REFUGIO) {
            Refugio r = new Refugio();
            r.setIdUsuario(savedUser.getId());
            r.setNombre(body.get("refugioNombre") != null && !body.get("refugioNombre").isBlank() ? body.get("refugioNombre").trim() : savedUser.getNombre());
            r.setEmail(savedUser.getEmail());
            r.setTelefono(savedUser.getTelefono());
            r.setDireccion(body.get("direccion") != null ? body.get("direccion").trim() : "Colombia");
            r.setDescripcion(body.get("descripcion") != null ? body.get("descripcion").trim() : savedUser.getBio());
            r.setHorario(body.get("horario") != null ? body.get("horario").trim() : "Lunes a Sábado: 8:00 AM - 5:00 PM");
            r.setEstadoVerificacion("Aprobado");
            refugioRepository.save(r);
        }

        return ResponseEntity.ok(UsuarioDTO.builder()
                .id(savedUser.getId())
                .nombre(savedUser.getNombre())
                .email(savedUser.getEmail())
                .rol(savedUser.getRol())
                .telefono(savedUser.getTelefono())
                .bio(savedUser.getBio())
                .foto(savedUser.getFoto())
                .creadoEn(savedUser.getCreadoEn())
                .build());
    }

    @PutMapping("/usuarios/{id}")
    public ResponseEntity<?> updateUsuario(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        if (!isAdmin(authentication)) return ResponseEntity.status(403).build();
        Usuario usuario = usuarioRepository.findById(id).orElse(null);
        if (usuario == null) {
            return ResponseEntity.notFound().build();
        }

        if (body.containsKey("nombre") && body.get("nombre") != null && !body.get("nombre").isBlank()) {
            usuario.setNombre(body.get("nombre").trim());
        }
        if (body.containsKey("email") && body.get("email") != null && !body.get("email").isBlank()) {
            String nuevoEmail = body.get("email").trim();
            if (!nuevoEmail.equalsIgnoreCase(usuario.getEmail())) {
                boolean existe = usuarioRepository.findByEmail(nuevoEmail).isPresent();
                if (existe) {
                    return ResponseEntity.badRequest().body(Map.of("message", "El correo ya está registrado por otro usuario"));
                }
                usuario.setEmail(nuevoEmail);
            }
        }
        if (body.containsKey("telefono")) {
            usuario.setTelefono(body.get("telefono") != null ? body.get("telefono").trim() : null);
        }
        if (body.containsKey("bio")) {
            usuario.setBio(body.get("bio") != null ? body.get("bio").trim() : null);
        }

        Usuario saved = usuarioRepository.save(usuario);
        return ResponseEntity.ok(UsuarioDTO.builder()
                .id(saved.getId())
                .nombre(saved.getNombre())
                .email(saved.getEmail())
                .rol(saved.getRol())
                .telefono(saved.getTelefono())
                .bio(saved.getBio())
                .foto(saved.getFoto())
                .creadoEn(saved.getCreadoEn())
                .build());
    }

    @GetMapping("/usuarios/{id}/adopciones")
    public ResponseEntity<List<com.pawtok.dto.AdopcionDTO>> getUsuarioAdopciones(
            @PathVariable Long id,
            Authentication authentication) {
        if (!isAdmin(authentication)) return ResponseEntity.status(403).build();
        List<com.pawtok.model.Adopcion> adopciones = adopcionRepository.findByUsuarioIdOrderBySolicitadoEnDesc(id);
        return ResponseEntity.ok(adopciones.stream().map(this::mapAdopcionToDto).collect(Collectors.toList()));
    }

    @DeleteMapping("/usuarios/{id}")
    public ResponseEntity<?> deleteUsuario(@PathVariable Long id, Authentication authentication) {
        if (!isAdmin(authentication)) return ResponseEntity.status(403).build();
        Usuario target = usuarioRepository.findById(id).orElse(null);
        if (target != null && target.getRol() == Rol.ADMIN) {
            return ResponseEntity.badRequest().body(Map.of("message", "No se puede eliminar un usuario con rol de Administrador"));
        }
        usuarioRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/refugios")
    public ResponseEntity<List<Map<String, Object>>> getRefugios(Authentication authentication) {
        if (!isAdmin(authentication)) return ResponseEntity.status(403).build();
        List<Refugio> refugios = refugioRepository.findAll();
        List<Map<String, Object>> result = refugios.stream().map(r -> {
            Map<String, Object> map = new java.util.HashMap<>();
            map.put("id", r.getId());
            map.put("idUsuario", r.getIdUsuario());
            map.put("nombre", r.getNombre());
            map.put("email", r.getEmail());
            map.put("telefono", r.getTelefono());
            map.put("direccion", r.getDireccion());
            map.put("descripcion", r.getDescripcion());
            map.put("horario", r.getHorario());
            map.put("redesSociales", r.getRedesSociales());
            map.put("estadoVerificacion", r.getEstadoVerificacion());
            map.put("logoUrl", r.getLogoUrl());
            map.put("certificadoUrl", r.getCertificadoUrl());
            map.put("documentoRepresentanteUrl", r.getDocumentoRepresentanteUrl());
            map.put("fotosLugarUrl", r.getFotosLugarUrl());
            map.put("motivoRechazo", r.getMotivoRechazo());

            java.time.LocalDateTime creadoEn = null;
            if (r.getIdUsuario() != null) {
                creadoEn = usuarioRepository.findById(r.getIdUsuario()).map(Usuario::getCreadoEn).orElse(null);
            }
            map.put("creadoEn", creadoEn);
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @PutMapping("/refugios/{id}")
    public ResponseEntity<?> updateRefugio(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        if (!isAdmin(authentication)) return ResponseEntity.status(403).build();
        Refugio refugio = refugioRepository.findById(id).orElse(null);
        if (refugio == null) {
            return ResponseEntity.notFound().build();
        }

        if (body.containsKey("nombre") && body.get("nombre") != null && !body.get("nombre").isBlank()) {
            refugio.setNombre(body.get("nombre").trim());
        }
        if (body.containsKey("telefono")) {
            refugio.setTelefono(body.get("telefono") != null ? body.get("telefono").trim() : null);
        }
        if (body.containsKey("email")) {
            refugio.setEmail(body.get("email") != null ? body.get("email").trim() : null);
        }
        if (body.containsKey("direccion")) {
            refugio.setDireccion(body.get("direccion") != null ? body.get("direccion").trim() : null);
        }
        if (body.containsKey("horario")) {
            refugio.setHorario(body.get("horario") != null ? body.get("horario").trim() : null);
        }
        if (body.containsKey("redesSociales")) {
            refugio.setRedesSociales(body.get("redesSociales") != null ? body.get("redesSociales").trim() : null);
        }
        if (body.containsKey("descripcion")) {
            refugio.setDescripcion(body.get("descripcion") != null ? body.get("descripcion").trim() : null);
        }

        Refugio saved = refugioRepository.save(refugio);

        // Sincronizar con el usuario asociado al refugio si existe
        if (saved.getIdUsuario() != null) {
            usuarioRepository.findById(saved.getIdUsuario()).ifPresent(u -> {
                if (saved.getNombre() != null) u.setNombre(saved.getNombre());
                if (saved.getTelefono() != null) u.setTelefono(saved.getTelefono());
                usuarioRepository.save(u);
            });
        }

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/refugios/{id}/adopciones")
    public ResponseEntity<List<com.pawtok.dto.AdopcionDTO>> getRefugioAdopciones(
            @PathVariable Long id,
            Authentication authentication) {
        if (!isAdmin(authentication)) return ResponseEntity.status(403).build();
        List<com.pawtok.model.Adopcion> adopciones = adopcionRepository.findByMascotaIdRefugio(id);
        return ResponseEntity.ok(adopciones.stream().map(this::mapAdopcionToDto).collect(Collectors.toList()));
    }

    @GetMapping("/refugios/{id}/mascotas")
    public ResponseEntity<List<com.pawtok.model.Mascota>> getRefugioMascotas(
            @PathVariable Long id,
            Authentication authentication) {
        if (!isAdmin(authentication)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(mascotaRepository.findByIdRefugio(id));
    }

    @DeleteMapping("/refugios/{id}")
    public ResponseEntity<Void> deleteRefugio(@PathVariable Long id, Authentication authentication) {
        if (!isAdmin(authentication)) return ResponseEntity.status(403).build();
        refugioRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private com.pawtok.dto.AdopcionDTO mapAdopcionToDto(com.pawtok.model.Adopcion adopcion) {
        return com.pawtok.dto.AdopcionDTO.builder()
                .id(adopcion.getId())
                .usuarioId(adopcion.getUsuario() != null ? adopcion.getUsuario().getId() : null)
                .usuarioNombre(adopcion.getUsuario() != null ? adopcion.getUsuario().getNombre() : "")
                .mascotaId(adopcion.getMascota() != null ? adopcion.getMascota().getId() : null)
                .mascotaNombre(adopcion.getMascota() != null ? adopcion.getMascota().getNombre() : "")
                .mascotaTipo(adopcion.getMascota() != null && adopcion.getMascota().getCategoria() != null ? adopcion.getMascota().getCategoria().name() : "")
                .mascotaRaza(adopcion.getMascota() != null ? adopcion.getMascota().getRaza() : "")
                .estado(adopcion.getEstado())
                .mensaje(adopcion.getMensaje())
                .solicitadoEn(adopcion.getSolicitadoEn())
                .resueltoEn(adopcion.getResueltoEn())
                .direccion(adopcion.getDireccion())
                .fechaVisita(adopcion.getFechaVisita())
                .horaVisita(adopcion.getHoraVisita())
                .ingresosAprox(adopcion.getIngresosAprox())
                .ocupacion(adopcion.getOcupacion())
                .telefono(adopcion.getTelefono())
                .tieneMascotas(adopcion.getTieneMascotas())
                .tipoVivienda(adopcion.getTipoVivienda())
                .build();
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
        refugio.setMotivoRechazo(null);
        refugio = refugioRepository.save(refugio);
        
        Usuario usuario = usuarioRepository.findById(refugio.getIdUsuario()).orElseThrow();
        usuario.setRol(Rol.REFUGIO);
        usuario.setIdRol(3);
        usuarioRepository.save(usuario);
        
        return ResponseEntity.ok(refugio);
    }

    @PutMapping("/solicitudes-refugio/{id}/rechazar")
    public ResponseEntity<Refugio> rechazarRefugio(
            @PathVariable Long id, 
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {
        if (!isAdmin(authentication)) return ResponseEntity.status(403).build();
        Refugio refugio = refugioRepository.findById(id).orElseThrow();
        refugio.setEstadoVerificacion("Rechazado");
        if (body != null && body.containsKey("motivo")) {
            refugio.setMotivoRechazo(body.get("motivo"));
        }
        refugio = refugioRepository.save(refugio);
        return ResponseEntity.ok(refugio);
    }

    @GetMapping("/auditoria-historial")
    public ResponseEntity<List<com.pawtok.model.AuditoriaHistorial>> getAuditoriaHistorial(Authentication authentication) {
        if (!isAdmin(authentication)) return ResponseEntity.status(403).build();
        return ResponseEntity.ok(auditoriaHistorialRepository.findAll());
    }
}
