package com.pawtok.service;

import com.pawtok.dto.RegistroActividadDTO;
import com.pawtok.model.RegistroActividad;
import com.pawtok.model.Usuario;
import com.pawtok.repository.RegistroActividadRepository;
import com.pawtok.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RegistroActividadService {
    private final RegistroActividadRepository registroActividadRepository;
    private final UsuarioRepository usuarioRepository;

    public void registrar(Long idUsuario, String accion, String detalles) {
        RegistroActividad registro = new RegistroActividad();
        registro.setIdUsuario(idUsuario);
        registro.setAccion(accion);
        registro.setDetalles(detalles);
        registro.setFecha(LocalDateTime.now());
        registroActividadRepository.save(registro);
    }

    public List<RegistroActividadDTO> getUltimosRegistros() {
        return registroActividadRepository.findAll().stream()
                .sorted(Comparator.comparing(RegistroActividad::getFecha).reversed())
                .limit(50)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<RegistroActividadDTO> getRegistrosByUsuario(Long idUsuario) {
        return registroActividadRepository.findAll().stream()
                .filter(r -> r.getIdUsuario().equals(idUsuario))
                .sorted(Comparator.comparing(RegistroActividad::getFecha).reversed())
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private RegistroActividadDTO mapToDTO(RegistroActividad entity) {
        String nombreUsuario = usuarioRepository.findById(entity.getIdUsuario())
                .map(Usuario::getNombre)
                .orElse("Desconocido");
                
        return RegistroActividadDTO.builder()
                .id(entity.getIdRegistro())
                .idUsuario(entity.getIdUsuario())
                .accion(entity.getAccion())
                .detalles(entity.getDetalles())
                .fecha(entity.getFecha())
                .nombreUsuario(nombreUsuario)
                .build();
    }
}
