package com.pawtok.service;

import com.pawtok.dto.AdopcionDTO;
import com.pawtok.model.Adopcion;
import com.pawtok.model.enums.EstadoAdopcion;
import com.pawtok.model.enums.EstadoMascota;
import com.pawtok.model.Mascota;
import com.pawtok.model.enums.Rol;
import com.pawtok.model.Usuario;
import com.pawtok.repository.AdopcionRepository;
import com.pawtok.repository.MascotaRepository;
import com.pawtok.repository.UsuarioRepository;
import com.pawtok.repository.RefugioRepository;
import com.pawtok.model.Refugio;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdopcionService {

    private final AdopcionRepository adopcionRepository;
    private final MascotaRepository mascotaRepository;
    private final UsuarioRepository usuarioRepository;
    private final RefugioRepository refugioRepository;

    public AdopcionDTO solicitarAdopcion(AdopcionDTO adopcionDto, String usuarioEmail) {
        Usuario usuario = usuarioRepository.findByEmail(usuarioEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Mascota mascota = mascotaRepository.findById(adopcionDto.getMascotaId())
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));

        if (mascota.getEstado() != EstadoMascota.DISPONIBLE) {
            throw new RuntimeException("La mascota no está disponible para adopción");
        }

        Adopcion adopcion = Adopcion.builder()
                .usuario(usuario)
                .mascota(mascota)
                .estado(EstadoAdopcion.PENDIENTE)
                .mensaje(adopcionDto.getMensaje())
                .direccion(adopcionDto.getDireccion())
                .fechaVisita(adopcionDto.getFechaVisita())
                .horaVisita(adopcionDto.getHoraVisita())
                .ingresosAprox(adopcionDto.getIngresosAprox())
                .ocupacion(adopcionDto.getOcupacion())
                .telefono(adopcionDto.getTelefono())
                .tieneMascotas(adopcionDto.getTieneMascotas())
                .tipoVivienda(adopcionDto.getTipoVivienda())
                .build();

        // No longer changing pet status to EN_PROCESO. It stays DISPONIBLE until approved.
        mascotaRepository.save(mascota);

        return mapToDto(adopcionRepository.save(adopcion));
    }

    public List<AdopcionDTO> getAdopcionesByUsuario(String usuarioEmail) {
        Usuario usuario = usuarioRepository.findByEmail(usuarioEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return adopcionRepository.findByUsuarioId(usuario.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<AdopcionDTO> getAdopcionesByRefugio(String refugioEmail) {
        Usuario refugioUser = usuarioRepository.findByEmail(refugioEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        Refugio refugio = refugioRepository.findByIdUsuario(refugioUser.getId())
                .orElseThrow(() -> new RuntimeException("Refugio no encontrado"));
        return adopcionRepository.findByMascotaIdRefugio(refugio.getId()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public AdopcionDTO resolverAdopcion(Long id, EstadoAdopcion nuevoEstado, String refugioEmail) {
        Adopcion adopcion = adopcionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adopcin no encontrada"));

        Usuario refugioUser = usuarioRepository.findByEmail(refugioEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Refugio refugio = refugioRepository.findByIdUsuario(refugioUser.getId()).orElse(null);

        if ((refugio == null || !refugio.getId().equals(adopcion.getMascota().getIdRefugio())) && refugioUser.getRol() != Rol.ADMIN) {
            throw new RuntimeException("No autorizado para resolver esta adopcion");
        }

        adopcion.setEstado(nuevoEstado);
        adopcion.setResueltoEn(LocalDateTime.now());

        Mascota mascota = adopcion.getMascota();
        if (nuevoEstado == EstadoAdopcion.APROBADA) {
            mascota.setEstado(EstadoMascota.ADOPTADO);
        } else if (nuevoEstado == EstadoAdopcion.RECHAZADA) {
            mascota.setEstado(EstadoMascota.DISPONIBLE);
        }
        mascotaRepository.save(mascota);

        return mapToDto(adopcionRepository.save(adopcion));
    }

    public void eliminarAdopcion(Long id, String usuarioEmail) {
        Adopcion adopcion = adopcionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Adopción no encontrada"));
        
        Usuario user = usuarioRepository.findByEmail(usuarioEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
                
        // Only allow if the user is the one who made the request, or if they are the shelter, or if admin.
        boolean isOwner = adopcion.getUsuario().getId().equals(user.getId());
        boolean isRefugio = false;
        
        Refugio refugio = refugioRepository.findByIdUsuario(user.getId()).orElse(null);
        if (refugio != null && refugio.getId().equals(adopcion.getMascota().getIdRefugio())) {
            isRefugio = true;
        }
        
        if (!isOwner && !isRefugio && user.getRol() != Rol.ADMIN) {
            throw new RuntimeException("No autorizado para eliminar este registro");
        }
        
        adopcionRepository.delete(adopcion);
    }

    private AdopcionDTO mapToDto(Adopcion adopcion) {
        return AdopcionDTO.builder()
                .id(adopcion.getId())
                .usuarioId(adopcion.getUsuario().getId())
                .usuarioNombre(adopcion.getUsuario().getNombre())
                .mascotaId(adopcion.getMascota().getId())
                .mascotaNombre(adopcion.getMascota().getNombre())
                .mascotaTipo(adopcion.getMascota().getCategoria() != null ? adopcion.getMascota().getCategoria().name() : "")
                .mascotaRaza(adopcion.getMascota().getRaza())
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
}
