package com.pawtok.controller;

import com.pawtok.dto.ContactoDTO;
import com.pawtok.model.ContactoMensaje;
import com.pawtok.repository.ContactoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/contacto")
@RequiredArgsConstructor
public class ContactoController {

    private final ContactoRepository contactoRepository;
    private final com.pawtok.repository.UsuarioRepository usuarioRepository;

    private void checkAdmin(org.springframework.security.core.Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.UNAUTHORIZED, "No autenticado");
        }
        com.pawtok.model.Usuario u = usuarioRepository.findByEmail(auth.getName()).orElse(null);
        if (u == null || u.getRol() != com.pawtok.model.enums.Rol.ADMIN) {
            throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN, "Solo administradores pueden acceder a los mensajes de contacto");
        }
    }

    @PostMapping
    public ResponseEntity<ContactoDTO> enviarMensaje(@RequestBody ContactoDTO dto) {
        ContactoMensaje mensaje = ContactoMensaje.builder()
                .nombre(dto.getNombre())
                .email(dto.getEmail())
                .mensaje(dto.getMensaje())
                .build();
        
        ContactoMensaje saved = contactoRepository.save(mensaje);
        return ResponseEntity.ok(mapToDto(saved));
    }

    @GetMapping
    public ResponseEntity<List<ContactoDTO>> getMensajes(org.springframework.security.core.Authentication auth) {
        checkAdmin(auth);
        return ResponseEntity.ok(contactoRepository.findAllByOrderByFechaEnvioDesc()
                .stream().map(this::mapToDto).collect(Collectors.toList()));
    }

    @PutMapping("/{id}/leido")
    public ResponseEntity<ContactoDTO> marcarLeido(@PathVariable Long id, org.springframework.security.core.Authentication auth) {
        checkAdmin(auth);
        ContactoMensaje mensaje = contactoRepository.findById(id).orElseThrow();
        mensaje.setLeido(true);
        return ResponseEntity.ok(mapToDto(contactoRepository.save(mensaje)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarMensaje(@PathVariable Long id, org.springframework.security.core.Authentication auth) {
        checkAdmin(auth);
        contactoRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private ContactoDTO mapToDto(ContactoMensaje entity) {
        return ContactoDTO.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .email(entity.getEmail())
                .mensaje(entity.getMensaje())
                .fechaEnvio(entity.getFechaEnvio())
                .leido(entity.isLeido())
                .build();
    }
}
