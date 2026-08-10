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

    public List<SeguimientoDTO> getSeguimientoByAdopcion(Long idAdopcion) {
        return seguimientoRepository.findAll().stream()
                .filter(s -> s.getIdAdopcion().equals(idAdopcion))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public SeguimientoDTO addSeguimiento(Long idAdopcion, SeguimientoDTO dto, MultipartFile foto) {
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
