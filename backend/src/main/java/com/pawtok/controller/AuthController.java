package com.pawtok.controller;

import com.pawtok.dto.LoginDto;
import com.pawtok.dto.RegistroDto;
import com.pawtok.dto.UsuarioDTO;
import com.pawtok.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UsuarioDTO> register(@RequestBody RegistroDto registroDto) {
        return ResponseEntity.ok(authService.register(registroDto));
    }

    @PostMapping("/login")
    public ResponseEntity<UsuarioDTO> login(@RequestBody LoginDto loginDto, HttpServletRequest request) {
        return ResponseEntity.ok(authService.login(loginDto, request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        authService.logout(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioDTO> getMe() {
        UsuarioDTO usuario = authService.getMe();
        if (usuario != null) {
            return ResponseEntity.ok(usuario);
        }
        return ResponseEntity.status(401).build();
    }
}
