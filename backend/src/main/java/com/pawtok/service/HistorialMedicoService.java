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
    private final com.pawtok.repository.MascotaRepository mascotaRepository;
    private final com.pawtok.repository.RefugioRepository refugioRepository;
    private final com.pawtok.repository.UsuarioRepository usuarioRepository;

    private void validatePermission(Long idMascota, String userEmail) {
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
        com.pawtok.model.Mascota mascota = mascotaRepository.findById(idMascota)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.NOT_FOUND, "Mascota no encontrada"
                ));
        com.pawtok.model.Refugio refugio = refugioRepository.findByIdUsuario(usuario.getId()).orElse(null);
        boolean isOwner = refugio != null && mascota.getRefugio() != null && mascota.getRefugio().equals(String.valueOf(refugio.getId()));
        if (!isOwner) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.FORBIDDEN, "No autorizado para modificar el historial médico de esta mascota"
            );
        }
    }

    public List<HistorialMedicoDTO> getHistorialByMascota(Long idMascota) {
        return historialMedicoRepository.findAll().stream()
                .filter(h -> h.getIdMascota().equals(idMascota) && h.isActivo())
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public HistorialMedicoDTO addRegistro(HistorialMedicoDTO dto, String userEmail) {
        validatePermission(dto.getIdMascota(), userEmail);
        HistorialMedico entity = mapToEntity(dto);
        entity.setActivo(true);
        if (dto.getFecha() != null) {
            entity.setFecha(Date.from(dto.getFecha().atStartOfDay(ZoneId.systemDefault()).toInstant()));
        } else {
            entity.setFecha(new Date());
        }
        return mapToDTO(historialMedicoRepository.save(entity));
    }

    public HistorialMedicoDTO updateRegistro(Long id, HistorialMedicoDTO dto, String userEmail) {
        HistorialMedico existing = historialMedicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Historial no encontrado"));
        validatePermission(existing.getIdMascota(), userEmail);
        
        AuditoriaHistorial auditoria = new AuditoriaHistorial();
        auditoria.setIdMascota(existing.getIdMascota());
        auditoria.setMotivo("Actualización de historial médico");
        auditoria.setEstadoPrevio(existing.getDescripcion());
        auditoria.setAccion("actualizado_historial_medico");
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

    public void deleteRegistro(Long id, String userEmail) {
        HistorialMedico existing = historialMedicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Historial no encontrado"));
        validatePermission(existing.getIdMascota(), userEmail);
        
        AuditoriaHistorial auditoria = new AuditoriaHistorial();
        auditoria.setIdMascota(existing.getIdMascota());
        auditoria.setMotivo("Inactivación de registro en historial médico");
        auditoria.setEstadoPrevio(existing.getDescripcion());
        auditoria.setAccion("eliminado_historial_medico");
        auditoria.setFechaAccion(LocalDateTime.now());
        auditoriaHistorialRepository.save(auditoria);

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
