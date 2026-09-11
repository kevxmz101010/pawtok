package com.pawtok.controller;

import com.pawtok.dto.RegistroActividadDTO;
import com.pawtok.service.RegistroActividadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/actividad")
@RequiredArgsConstructor
public class RegistroActividadController {

    private final RegistroActividadService registroActividadService;

    @GetMapping
    public ResponseEntity<List<RegistroActividadDTO>> getActividad(Authentication auth) {
        return ResponseEntity.ok(registroActividadService.getUltimosRegistros());
    }
}
