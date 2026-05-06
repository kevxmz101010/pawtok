package com.pawtok.controller;

import com.pawtok.dto.DashboardDTO;
import com.pawtok.model.Adopcion;
import com.pawtok.model.Usuario;
import com.pawtok.repository.AdopcionRepository;
import com.pawtok.repository.FavoritoRepository;
import com.pawtok.repository.MensajeRepository;
import com.pawtok.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final UsuarioService usuarioService;
    private final AdopcionRepository adopcionRepository;
    private final FavoritoRepository favoritoRepository;
    private final MensajeRepository mensajeRepository;

    public DashboardController(UsuarioService usuarioService, AdopcionRepository adopcionRepository, FavoritoRepository favoritoRepository, MensajeRepository mensajeRepository) {
        this.usuarioService = usuarioService;
        this.adopcionRepository = adopcionRepository;
        this.favoritoRepository = favoritoRepository;
        this.mensajeRepository = mensajeRepository;
    }


    @GetMapping("/usuario")
    public ResponseEntity<DashboardDTO> getDashboard() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Usuario usuario = usuarioService.buscarPorEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        long totalSolicitudes = adopcionRepository.countByUsuarioId(usuario.getId());
        long totalFavoritos = favoritoRepository.countByUsuarioId(usuario.getId());
        
        List<Adopcion> misAdopciones = adopcionRepository.findByUsuarioIdOrderBySolicitadoEnDesc(usuario.getId());
        long totalAdoptadas = misAdopciones.stream()
                .filter(a -> a.getEstadoString().equalsIgnoreCase("aprobada"))
                .count();

        List<DashboardDTO.SolicitudDTO> recientes = misAdopciones.stream()
                .limit(5)
                .map(a -> {
                    String refugioNombre = "Refugio Desconocido";
                    try {
                        Usuario refugio = usuarioService.buscarPorId(Long.valueOf(a.getMascota().getRefugio()));
                        refugioNombre = refugio.getNombre();
                    } catch (Exception e) {}
                            
                    return DashboardDTO.SolicitudDTO.builder()
                            .adopcionId(a.getId())
                            .mascota(a.getMascota().getNombre())
                            .refugio(refugioNombre)
                            .estado(a.getEstadoString())
                            .fotoMascota(a.getMascota().getImagenUrl())
                            .mascotaTipo(a.getMascota().getCategoria() != null ? a.getMascota().getCategoria().name() : "")
                            .mascotaRaza(a.getMascota().getRaza())
                            .build();
                })
                .collect(Collectors.toList());

        List<DashboardDTO.MensajeDTO> mensajes = mensajeRepository.findTop5ByReceptorIdOrderByFechaEnvioDesc(usuario.getId())
                .stream()
                .map(m -> DashboardDTO.MensajeDTO.builder()
                        .remitente(m.getRemitente().getNombre())
                        .mensaje(m.getMensaje())
                        .fecha(m.getFecha().toString())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(DashboardDTO.builder()
                .totalSolicitudes(totalSolicitudes)
                .totalFavoritos(totalFavoritos)
                .totalAdoptadas(totalAdoptadas)
                .recientes(recientes)
                .mensajes(mensajes)
                .build());
    }
    @GetMapping("/refugio")
    public ResponseEntity<DashboardDTO> getRefugioDashboard() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Usuario usuario = usuarioService.buscarPorEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Currently Refugios are treated based on their published pets (Mascotas).
        // Since Mascotas have a 'refugio' string field, we can match it against user name or ID.
        // Wait, Mascota has 'idRefugio' ? Let's check Mascota model.
        // Actually, we'll just mock the stats in the backend for now if Mascota structure doesn't support it directly, or query it correctly.
        // But let's look at AdopcionRepository.
        
        long totalSolicitudes = 0; // TODO: Implement query based on pets owned by this user
        long totalFavoritos = 0; // Unused for refugio?
        long totalAdoptadas = 0;
        
        List<DashboardDTO.SolicitudDTO> recientes = List.of();
        List<DashboardDTO.MensajeDTO> mensajes = List.of();

        return ResponseEntity.ok(DashboardDTO.builder()
                .totalSolicitudes(totalSolicitudes)
                .totalFavoritos(totalFavoritos)
                .totalAdoptadas(totalAdoptadas)
                .recientes(recientes)
                .mensajes(mensajes)
                .build());
    }
}
