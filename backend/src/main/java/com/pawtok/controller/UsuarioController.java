package com.pawtok.controller;

import com.pawtok.dto.UsuarioDTO;
import com.pawtok.model.Usuario;
import com.pawtok.repository.UsuarioRepository;
import com.pawtok.service.FileStorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final FileStorageService fileStorageService;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioRepository usuarioRepository, FileStorageService fileStorageService, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.fileStorageService = fileStorageService;
        this.passwordEncoder = passwordEncoder;
    }


    @PutMapping("/me/perfil")
    public ResponseEntity<UsuarioDTO> updatePerfil(
            @RequestParam("nombre") String nombre,
            @RequestParam("email") String email,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "foto", required = false) MultipartFile foto) {

        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuario.setNombre(nombre);
        
        // Only update email if it doesn't exist for another user
        if (!currentEmail.equals(email)) {
            if (usuarioRepository.existsByEmail(email)) {
                throw new RuntimeException("El correo ya está en uso");
            }
            usuario.setEmail(email);
        }

        if (bio != null) {
            usuario.setBio(bio);
        }

        if (foto != null && !foto.isEmpty()) {
            usuario.setFoto(fileStorageService.storeFile(foto));
        }

        usuario = usuarioRepository.save(usuario);

        UsuarioDTO dto = UsuarioDTO.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .creadoEn(usuario.getCreadoEn())
                .foto(usuario.getFoto())
                .telefono(usuario.getTelefono())
                .bio(usuario.getBio())
                .build();

        return ResponseEntity.ok(dto);
    }

    @PutMapping("/me/password")
    public ResponseEntity<Map<String, String>> updatePassword(@RequestBody Map<String, String> body) {
        String currentPassword = body.get("current_password");
        String newPassword = body.get("new_password");
        
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(currentPassword, usuario.getContrasena())) {
            return ResponseEntity.badRequest().body(Map.of("message", "La contraseña actual no es correcta."));
        }

        usuario.setContrasena(passwordEncoder.encode(newPassword));
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of("message", "¡Contraseña cambiada exitosamente!"));
    }
}
