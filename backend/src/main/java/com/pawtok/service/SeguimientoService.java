package com.pawtok.service;

import com.pawtok.dto.SeguimientoDTO;
import com.pawtok.model.Seguimiento;
import com.pawtok.repository.SeguimientoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeguimientoService {
    private final SeguimientoRepository seguimientoRepository;
    private final FileStorageService fileStorageService;
    private final com.pawtok.repository.AdopcionRepository adopcionRepository;
    private final com.pawtok.repository.UsuarioRepository usuarioRepository;
    private final com.pawtok.repository.RefugioRepository refugioRepository;

    private void validateAdopcionAccess(Long idAdopcion, String userEmail) {
        if (userEmail == null) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED, "No autenticado"
            );
        }
        com.pawtok.model.Usuario usuario = usuarioRepository.findByEmail(userEmail)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.UNAUTHORIZED, "Usuario no encontrado"
                ));
        if (usuario.getRol() == com.pawtok.model.enums.Rol.ADMIN) {
            return;
        }
        com.pawtok.model.Adopcion adopcion = adopcionRepository.findById(idAdopcion)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND, "Adopción no encontrada"
                ));
        boolean isAdopter = adopcion.getUsuario() != null && adopcion.getUsuario().getId().equals(usuario.getId());
        Long idRefugio = adopcion.getMascota() != null ? adopcion.getMascota().getIdRefugio() : null;
        boolean isShelterOwner = false;
        if (idRefugio != null) {
            com.pawtok.model.Refugio refugio = refugioRepository.findById(idRefugio).orElse(null);
            if (refugio != null && refugio.getIdUsuario() != null && refugio.getIdUsuario().equals(usuario.getId())) {
                isShelterOwner = true;
            }
        }
        if (!isAdopter && !isShelterOwner) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN, "No autorizado para ver o modificar el seguimiento de esta adopción"
            );
        }
    }

    public List<SeguimientoDTO> getSeguimientoByAdopcion(Long idAdopcion, String userEmail) {
        validateAdopcionAccess(idAdopcion, userEmail);
        return seguimientoRepository.findAll().stream()
                .filter(s -> s.getIdAdopcion().equals(idAdopcion))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public SeguimientoDTO addSeguimiento(Long idAdopcion, SeguimientoDTO dto, MultipartFile foto, String userEmail) {
        validateAdopcionAccess(idAdopcion, userEmail);
        Seguimiento entity = new Seguimiento();
        entity.setIdAdopcion(idAdopcion);
        entity.setComentario(dto.getComentario());
        if (dto.getFecha() != null) {
            entity.setFecha(Date.from(dto.getFecha().atStartOfDay(ZoneId.systemDefault()).toInstant()));
        } else {
            entity.setFecha(new Date());
        }
        
        if (foto != null && !foto.isEmpty()) {
            String fotoUrl = fileStorageService.storeFile(foto);
            entity.setFotoOpcional(fotoUrl);
        } else {
            entity.setFotoOpcional(dto.getFotoOpcional());
        }
        
        return mapToDTO(seguimientoRepository.save(entity));
    }

    private SeguimientoDTO mapToDTO(Seguimiento entity) {
        return SeguimientoDTO.builder()
                .id(entity.getIdSeguimiento())
                .idAdopcion(entity.getIdAdopcion())
                .fecha(entity.getFecha() != null ? entity.getFecha().toInstant().atZone(ZoneId.systemDefault()).toLocalDate() : null)
                .comentario(entity.getComentario())
                .fotoOpcional(entity.getFotoOpcional())
                .build();
    }
}
