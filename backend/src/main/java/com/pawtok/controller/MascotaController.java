package com.pawtok.controller;

import com.pawtok.dto.MascotaDTO;
import com.pawtok.model.enums.EstadoMascota;
import com.pawtok.service.MascotaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador de Mascotas
 * Esta clase es la "puerta de entrada" para todo lo relacionado con las mascotas.
 * Recibe las peticiones de internet (ej. GET /api/mascotas) y se las pasa al servicio (MascotaService).
 */
@RestController // Indica que esta clase responde a peticiones web devolviendo datos (normalmente JSON).
@RequestMapping("/api/mascotas") // Todas las rutas aquí empezarán por /api/mascotas
@RequiredArgsConstructor // Crea el constructor automáticamente para inyectar mascotaService
public class MascotaController {

    // Se inyecta el servicio que contiene la verdadera lógica (guardar, buscar, borrar).
    private final MascotaService mascotaService;

    /**
     * Endpoint para obtener todas las mascotas.
     * @return Una lista de MascotaDTO.
     */
    @GetMapping // Responde a peticiones GET en /api/mascotas
    public ResponseEntity<List<MascotaDTO>> getAllMascotas() {
        return ResponseEntity.ok(mascotaService.getAllMascotas()); // ok() devuelve un estado HTTP 200 (Éxito)
    }

    /**
     * Endpoint para obtener una mascota específica por su ID.
     */
    @GetMapping("/{id}") // El {id} es una variable en la URL, ej. /api/mascotas/5
    public ResponseEntity<MascotaDTO> getMascotaById(@PathVariable Long id) {
        return ResponseEntity.ok(mascotaService.getMascotaById(id));
    }

    /**
     * Endpoint para crear una nueva mascota.
     * @param mascotaDto Los datos enviados por React en el cuerpo de la petición.
     * @param authentication Contiene el email del usuario que hizo la petición.
     */
    @PostMapping // Responde a peticiones POST (para crear)
    public ResponseEntity<MascotaDTO> createMascota(@RequestBody MascotaDTO mascotaDto, Authentication authentication) {
        return ResponseEntity.ok(mascotaService.createMascota(mascotaDto, authentication.getName()));
    }

    /**
     * Endpoint para actualizar los datos de una mascota.
     */
    @PutMapping("/{id}") // Responde a peticiones PUT (para actualizar todo el objeto)
    public ResponseEntity<MascotaDTO> updateMascota(@PathVariable Long id, @RequestBody MascotaDTO mascotaDto, Authentication authentication) {
        return ResponseEntity.ok(mascotaService.updateMascota(id, mascotaDto, authentication.getName()));
    }
    
    /**
     * Cambiar el estado de una mascota (ej. de DISPONIBLE a ADOPTADA).
     */
    @PutMapping("/{id}/estado")
    public ResponseEntity<MascotaDTO> updateEstadoMascota(@PathVariable Long id, @RequestParam String estado, Authentication authentication) {
        EstadoMascota estadoEnum = EstadoMascota.valueOf(estado);
        return ResponseEntity.ok(mascotaService.updateEstado(id, estadoEnum, authentication.getName()));
    }

    /**
     * Eliminar una mascota.
     */
    @DeleteMapping("/{id}") // Responde a DELETE (borrar)
    public ResponseEntity<Void> deleteMascota(@PathVariable Long id, Authentication authentication) {
        mascotaService.deleteMascota(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Obtener los perritos que un refugio específico ha subido (paginados).
     */
    @GetMapping("/mis-publicaciones")
    public ResponseEntity<org.springframework.data.domain.Page<MascotaDTO>> getMisPublicaciones(
            @RequestParam(defaultValue = "0") int page, // Número de página (empieza en 0)
            @RequestParam(defaultValue = "10") int size, // Cuántos elementos por página
            Authentication authentication) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(mascotaService.getMascotasByUsuarioEmail(authentication.getName(), pageable));
    }
}
