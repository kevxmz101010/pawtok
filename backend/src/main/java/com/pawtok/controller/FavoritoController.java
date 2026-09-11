package com.pawtok.controller;

import com.pawtok.dto.MascotaDTO;
import com.pawtok.model.Favorito;
import com.pawtok.model.Mascota;
import com.pawtok.model.Usuario;
import com.pawtok.repository.FavoritoRepository;
import com.pawtok.repository.MascotaRepository;
import com.pawtok.repository.UsuarioRepository;
import com.pawtok.service.MascotaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/favoritos")
public class FavoritoController {

    private final FavoritoRepository favoritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final MascotaRepository mascotaRepository;
    private final MascotaService mascotaService;

    public FavoritoController(FavoritoRepository favoritoRepository, UsuarioRepository usuarioRepository, MascotaRepository mascotaRepository, MascotaService mascotaService) {
        this.favoritoRepository = favoritoRepository;
        this.usuarioRepository = usuarioRepository;
        this.mascotaRepository = mascotaRepository;
        this.mascotaService = mascotaService;
    }

    @PostMapping("/{mascotaId}")
    public ResponseEntity<Map<String, Object>> toggleFavorito(@PathVariable Long mascotaId, Authentication authentication) {
        Usuario usuario = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Optional<Favorito> existing = favoritoRepository.findByUsuarioIdAndMascotaId(usuario.getId(), mascotaId);

        if (existing.isPresent()) {
            favoritoRepository.delete(existing.get());
            return ResponseEntity.ok(Map.of("favorito", false, "message", "Eliminado de favoritos"));
        } else {
            Mascota mascota = mascotaRepository.findById(mascotaId)
                    .orElseThrow(() -> new RuntimeException("Mascota no encontrada"));
            Favorito fav = new Favorito();
            fav.setUsuario(usuario);
            fav.setMascota(mascota);
            fav.setFechaCreacion(LocalDateTime.now());
            favoritoRepository.save(fav);
            return ResponseEntity.ok(Map.of("favorito", true, "message", "Agregado a favoritos"));
        }
    }

    @GetMapping
    public ResponseEntity<List<MascotaDTO>> getFavoritos(Authentication authentication) {
        Usuario usuario = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<MascotaDTO> mascotas = favoritoRepository.findByUsuarioId(usuario.getId()).stream()
                .map(fav -> mascotaService.getMascotaById(fav.getMascota().getId()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(mascotas);
    }

    @GetMapping("/ids")
    public ResponseEntity<List<Long>> getFavoritoIds(Authentication authentication) {
        Usuario usuario = usuarioRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<Long> ids = favoritoRepository.findByUsuarioId(usuario.getId()).stream()
                .map(fav -> fav.getMascota().getId())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ids);
    }
}
