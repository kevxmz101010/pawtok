package com.pawtok.service;

import com.pawtok.dto.HistorialMedicoDTO;
import com.pawtok.model.AuditoriaHistorial;
import com.pawtok.model.HistorialMedico;
import com.pawtok.repository.AuditoriaHistorialRepository;
import com.pawtok.repository.HistorialMedicoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HistorialMedicoService {
    private final HistorialMedicoRepository historialMedicoRepository;
    private final AuditoriaHistorialRepository auditoriaHistorialRepository;

    public List<HistorialMedicoDTO> getHistorialByMascota(Long idMascota) {
        return historialMedicoRepository.findAll().stream()
                .filter(h -> h.getIdMascota().equals(idMascota) && h.isActivo())
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public HistorialMedicoDTO addRegistro(HistorialMedicoDTO dto) {
        HistorialMedico entity = mapToEntity(dto);
        entity.setActivo(true);
        if (dto.getFecha() != null) {
            entity.setFecha(Date.from(dto.getFecha().atStartOfDay(ZoneId.systemDefault()).toInstant()));
        } else {
            entity.setFecha(new Date());
        }
        return mapToDTO(historialMedicoRepository.save(entity));
    }

    public HistorialMedicoDTO updateRegistro(Long id, HistorialMedicoDTO dto) {
        HistorialMedico existing = historialMedicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Historial no encontrado"));
        
        AuditoriaHistorial auditoria = new AuditoriaHistorial();
        auditoria.setIdMascota(existing.getIdMascota());
        auditoria.setMotivo("Actualización de historial médico");
        auditoria.setEstadoPrevio(existing.getDescripcion());
        auditoria.setFechaAccion(LocalDateTime.now());
        auditoriaHistorialRepository.save(auditoria);

        existing.setDescripcion(dto.getDescripcion());
        existing.setVacuna(dto.isVacuna());
        existing.setDesparasitacion(dto.isDesparasitacion());
        if (dto.getFecha() != null) {
            existing.setFecha(Date.from(dto.getFecha().atStartOfDay(ZoneId.systemDefault()).toInstant()));
        }
        
        return mapToDTO(historialMedicoRepository.save(existing));
    }

    public void deleteRegistro(Long id) {
        HistorialMedico existing = historialMedicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Historial no encontrado"));
        existing.setActivo(false);
        historialMedicoRepository.save(existing);
    }

    private HistorialMedicoDTO mapToDTO(HistorialMedico entity) {
        return HistorialMedicoDTO.builder()
                .id(entity.getIdHistorial())
                .idMascota(entity.getIdMascota())
                .fecha(entity.getFecha() != null ? entity.getFecha().toInstant().atZone(ZoneId.systemDefault()).toLocalDate() : null)
                .descripcion(entity.getDescripcion())
                .vacuna(entity.isVacuna())
                .desparasitacion(entity.isDesparasitacion())
                .activo(entity.isActivo())
                .build();
    }

    private HistorialMedico mapToEntity(HistorialMedicoDTO dto) {
        HistorialMedico entity = new HistorialMedico();
        entity.setIdMascota(dto.getIdMascota());
        if (dto.getFecha() != null) {
            entity.setFecha(Date.from(dto.getFecha().atStartOfDay(ZoneId.systemDefault()).toInstant()));
        }
        entity.setDescripcion(dto.getDescripcion());
        entity.setVacuna(dto.isVacuna());
        entity.setDesparasitacion(dto.isDesparasitacion());
        entity.setActivo(dto.isActivo());
        return entity;
    }
}
