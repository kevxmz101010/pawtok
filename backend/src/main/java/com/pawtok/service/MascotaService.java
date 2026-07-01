package com.pawtok.service;

import com.pawtok.dto.MascotaDTO;
import com.pawtok.model.enums.EstadoMascota;
import com.pawtok.model.Mascota;
import com.pawtok.model.enums.Rol;
import com.pawtok.model.Usuario;
import com.pawtok.repository.MascotaRepository;
import com.pawtok.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MascotaService {

    private final MascotaRepository mascotaRepository;
    private final UsuarioRepository usuarioRepository;
    private final com.pawtok.repository.RefugioRepository refugioRepository;
    private final FileStorageService fileStorageService;

    public List<MascotaDTO> getAllMascotas() {
        return mascotaRepository.findAll(org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "id")).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public MascotaDTO getMascotaById(Long id) {
        Mascota mascota = mascotaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));
        return mapToDto(mascota);
    }
    
    public List<MascotaDTO> getMascotasByRefugio(Long refugioId) {
        return mascotaRepository.findByIdRefugio(refugioId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public org.springframework.data.domain.Page<MascotaDTO> getMascotasByUsuarioEmail(String email, org.springframework.data.domain.Pageable pageable) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        com.pawtok.model.Refugio refugio = refugioRepository.findByIdUsuario(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Refugio no encontrado"));
        return mascotaRepository.findByIdRefugio(refugio.getId(), pageable)
                .map(this::mapToDto);
    }

    public MascotaDTO createMascota(MascotaDTO mascotaDto, String refugioEmail) {
        Usuario usuario = usuarioRepository.findByEmail(refugioEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        com.pawtok.model.Refugio refugio = refugioRepository.findByIdUsuario(usuario.getId())
                .orElseThrow(() -> new RuntimeException("Refugio no encontrado"));

        String imagenUrl = mascotaDto.getImagenUrl();
        if (imagenUrl != null && imagenUrl.startsWith("data:image/")) {
            imagenUrl = fileStorageService.storeBase64File(imagenUrl);
        }

        String galeriaStr = null;
        if (mascotaDto.getGaleria() != null) {
            List<String> storedGallery = mascotaDto.getGaleria().stream()
                .map(img -> {
                    if (img != null && img.startsWith("data:image/")) {
                        return fileStorageService.storeBase64File(img);
                    }
                    return img;
                })
                .collect(Collectors.toList());
            galeriaStr = String.join(",", storedGallery);
        }

        Mascota mascota = Mascota.builder()
                .nombre(mascotaDto.getNombre())
                .raza(mascotaDto.getRaza())
                .edad(mascotaDto.getEdad())
                .descripcion(mascotaDto.getDescripcion())
                .imagenUrl(imagenUrl)
                .categoria(mascotaDto.getCategoria())
                .estado(EstadoMascota.DISPONIBLE)
                .disponible(true)
                .refugio(String.valueOf(refugio.getId()))
                .peso(mascotaDto.getPeso())
                .tamano(mascotaDto.getTamano())
                .energia(mascotaDto.getEnergia())
                .conNinos(mascotaDto.getConNinos())
                .personalidad(mascotaDto.getPersonalidad())
                .origen(mascotaDto.getOrigen() != null ? mascotaDto.getOrigen() : "refugio")
                .galeria(galeriaStr)
                .ubicacion(mascotaDto.getUbicacion())
                .build();

        return mapToDto(mascotaRepository.save(mascota));
    }

    public MascotaDTO updateMascota(Long id, MascotaDTO mascotaDto, String usuarioEmail) {
        Mascota mascota = mascotaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));

        Usuario usuario = usuarioRepository.findByEmail(usuarioEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        com.pawtok.model.Refugio refugio = refugioRepository.findByIdUsuario(usuario.getId()).orElse(null);
        boolean isOwner = refugio != null && mascota.getRefugio() != null && mascota.getRefugio().equals(String.valueOf(refugio.getId()));

        if (!isOwner && usuario.getRol() != Rol.ADMIN) {
            throw new RuntimeException("No autorizado para actualizar esta mascota");
        }

        String imagenUrl = mascotaDto.getImagenUrl();
        if (imagenUrl != null && imagenUrl.startsWith("data:image/")) {
            imagenUrl = fileStorageService.storeBase64File(imagenUrl);
        }

        String galeriaStr = null;
        if (mascotaDto.getGaleria() != null) {
            List<String> storedGallery = mascotaDto.getGaleria().stream()
                .map(img -> {
                    if (img != null && img.startsWith("data:image/")) {
                        return fileStorageService.storeBase64File(img);
                    }
                    return img;
                })
                .collect(Collectors.toList());
            galeriaStr = String.join(",", storedGallery);
        } else {
            galeriaStr = mascota.getGaleria();
        }

        mascota.setNombre(mascotaDto.getNombre());
        mascota.setRaza(mascotaDto.getRaza());
        mascota.setEdad(mascotaDto.getEdad());
        mascota.setDescripcion(mascotaDto.getDescripcion());
        if (imagenUrl != null) {
            mascota.setImagenUrl(imagenUrl);
        }
        mascota.setCategoria(mascotaDto.getCategoria());
        if (mascotaDto.getEstado() != null) {
            mascota.setEstado(mascotaDto.getEstado());
        }
        mascota.setPeso(mascotaDto.getPeso());
        mascota.setTamano(mascotaDto.getTamano());
        mascota.setEnergia(mascotaDto.getEnergia());
        mascota.setConNinos(mascotaDto.getConNinos());
        mascota.setPersonalidad(mascotaDto.getPersonalidad());
        if (mascotaDto.getOrigen() != null) {
            mascota.setOrigen(mascotaDto.getOrigen());
        }
        mascota.setGaleria(galeriaStr);
        mascota.setUbicacion(mascotaDto.getUbicacion());

        return mapToDto(mascotaRepository.save(mascota));
    }

    public MascotaDTO updateEstado(Long id, EstadoMascota estado, String usuarioEmail) {
        Mascota mascota = mascotaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));

        Usuario usuario = usuarioRepository.findByEmail(usuarioEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        com.pawtok.model.Refugio refugio = refugioRepository.findByIdUsuario(usuario.getId()).orElse(null);
        boolean isOwner = refugio != null && mascota.getRefugio() != null && mascota.getRefugio().equals(String.valueOf(refugio.getId()));

        if (!isOwner && usuario.getRol() != Rol.ADMIN) {
            throw new RuntimeException("No autorizado para actualizar el estado");
        }

        mascota.setEstado(estado);
        return mapToDto(mascotaRepository.save(mascota));
    }

    public void deleteMascota(Long id, String usuarioEmail) {
        Mascota mascota = mascotaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));

        Usuario usuario = usuarioRepository.findByEmail(usuarioEmail)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        com.pawtok.model.Refugio refugio = refugioRepository.findByIdUsuario(usuario.getId()).orElse(null);
        boolean isOwner = refugio != null && mascota.getRefugio() != null && mascota.getRefugio().equals(String.valueOf(refugio.getId()));

        if (!isOwner && usuario.getRol() != Rol.ADMIN) {
            throw new RuntimeException("No autorizado para eliminar esta mascota");
        }

        mascotaRepository.delete(mascota);
    }

    private MascotaDTO mapToDto(Mascota mascota) {
        List<String> galeriaList = null;
        if (mascota.getGaleria() != null && !mascota.getGaleria().isEmpty()) {
            galeriaList = java.util.Arrays.asList(mascota.getGaleria().split(","));
        }

        String refugioNombre = "Refugio Pawtok";
        if (mascota.getRefugio() != null && !mascota.getRefugio().isEmpty()) {
            try {
                Long rId = Long.parseLong(mascota.getRefugio());
                refugioNombre = refugioRepository.findById(rId)
                        .map(com.pawtok.model.Refugio::getNombre)
                        .orElse("Refugio Desconocido");
            } catch (Exception e) {
                refugioNombre = mascota.getRefugio();
            }
        }

        return MascotaDTO.builder()
                .id(mascota.getId())
                .nombre(mascota.getNombre())
                .raza(mascota.getRaza())
                .edad(mascota.getEdad())
                .descripcion(mascota.getDescripcion())
                .imagenUrl(mascota.getImagenUrl())
                .categoria(mascota.getCategoria())
                .estado(mascota.getEstado())
                .refugio(mascota.getRefugio())
                .refugioNombre(refugioNombre)
                .creadoEn(mascota.getCreadoEn())
                .peso(mascota.getPeso())
                .tamano(mascota.getTamano())
                .energia(mascota.getEnergia())
                .conNinos(mascota.getConNinos())
                .personalidad(mascota.getPersonalidad())
                .origen(mascota.getOrigen())
                .galeria(galeriaList)
                .ubicacion(mascota.getUbicacion())
                .build();
    }
}
