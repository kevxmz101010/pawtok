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
    public ResponseEntity<List<ContactoDTO>> getMensajes() {
        return ResponseEntity.ok(contactoRepository.findAllByOrderByFechaEnvioDesc()
                .stream().map(this::mapToDto).collect(Collectors.toList()));
    }

    @PutMapping("/{id}/leido")
    public ResponseEntity<ContactoDTO> marcarLeido(@PathVariable Long id) {
        ContactoMensaje mensaje = contactoRepository.findById(id).orElseThrow();
        mensaje.setLeido(true);
        return ResponseEntity.ok(mapToDto(contactoRepository.save(mensaje)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarMensaje(@PathVariable Long id) {
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
