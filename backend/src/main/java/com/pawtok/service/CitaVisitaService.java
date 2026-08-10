package com.pawtok.service;

import com.pawtok.dto.CitaVisitaDTO;
import com.pawtok.model.CitaVisita;
import com.pawtok.model.Mascota;
import com.pawtok.model.Usuario;
import com.pawtok.repository.CitaVisitaRepository;
import com.pawtok.repository.MascotaRepository;
import com.pawtok.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CitaVisitaService {
    private final CitaVisitaRepository citaVisitaRepository;
    private final UsuarioRepository usuarioRepository;
    private final MascotaRepository mascotaRepository;

    public CitaVisitaDTO agendarCita(CitaVisitaDTO dto, String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        CitaVisita entity = new CitaVisita();
        entity.setIdUsuario(usuario.getId());
        entity.setIdMascota(dto.getIdMascota());
        entity.setFecha(dto.getFecha());
        entity.setHora(dto.getHora());
        entity.setTelefono(dto.getTelefono());
        entity.setDireccion(dto.getDireccion());
        entity.setTipoVivienda(dto.getTipoVivienda());
        entity.setTieneMascotas(dto.getTieneMascotas());
        entity.setOcupacion(dto.getOcupacion());
        entity.setIngresosAprox(dto.getIngresosAprox());
        entity.setMensaje(dto.getMensaje());
        entity.setEstado("PENDIENTE");
        entity.setFechaCreacion(LocalDateTime.now());
        
        return mapToDTO(citaVisitaRepository.save(entity));
    }

    public List<CitaVisitaDTO> getCitasByUsuario(String email) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
        return citaVisitaRepository.findAll().stream()
                .filter(c -> c.getIdUsuario().equals(usuario.getId()))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<CitaVisitaDTO> getCitasByMascota(Long idMascota) {
        return citaVisitaRepository.findAll().stream()
                .filter(c -> c.getIdMascota().equals(idMascota))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public CitaVisitaDTO updateEstado(Long id, String estado) {
        CitaVisita entity = citaVisitaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cita no encontrada"));
        entity.setEstado(estado);
        return mapToDTO(citaVisitaRepository.save(entity));
    }

    private CitaVisitaDTO mapToDTO(CitaVisita entity) {
        String nombreUsuario = usuarioRepository.findById(entity.getIdUsuario())
                .map(Usuario::getNombre)
                .orElse("Desconocido");
                
        String nombreMascota = mascotaRepository.findById(entity.getIdMascota())
                .map(Mascota::getNombre)
                .orElse("Desconocida");

        return CitaVisitaDTO.builder()
                .id(entity.getId())
                .idUsuario(entity.getIdUsuario())
                .idMascota(entity.getIdMascota())
                .nombreUsuario(nombreUsuario)
                .nombreMascota(nombreMascota)
                .fecha(entity.getFecha())
                .hora(entity.getHora())
                .telefono(entity.getTelefono())
                .direccion(entity.getDireccion())
                .tipoVivienda(entity.getTipoVivienda())
                .tieneMascotas(entity.getTieneMascotas())
                .ocupacion(entity.getOcupacion())
                .ingresosAprox(entity.getIngresosAprox())
                .mensaje(entity.getMensaje())
                .estado(entity.getEstado())
                .fechaCreacion(entity.getFechaCreacion())
                .build();
    }
}
