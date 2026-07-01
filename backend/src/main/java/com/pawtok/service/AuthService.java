package com.pawtok.service;

import com.pawtok.config.CustomUserDetails;
import com.pawtok.dto.LoginDto;
import com.pawtok.dto.RegistroDto;
import com.pawtok.dto.UsuarioDTO;
import com.pawtok.model.Usuario;
import com.pawtok.repository.UsuarioRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public UsuarioDTO register(RegistroDto registroDto) {
        if (usuarioRepository.findByEmail(registroDto.getEmail()).isPresent()) {
            throw new RuntimeException("El email ya está en uso");
        }

        Usuario usuario = Usuario.builder()
                .nombre(registroDto.getNombre())
                .email(registroDto.getEmail())
                .contrasena(passwordEncoder.encode(registroDto.getContrasena()))
                .rol(registroDto.getRol() != null ? registroDto.getRol() : com.pawtok.model.enums.Rol.USUARIO)
                .build();

        usuarioRepository.save(usuario);

        return mapToDto(usuario);
    }

    public UsuarioDTO login(LoginDto loginDto, HttpServletRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDto.getEmail(), loginDto.getContrasena())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        HttpSession session = request.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, SecurityContextHolder.getContext());

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return mapToDto(userDetails.getUsuario());
    }

    public void logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
    }

    public UsuarioDTO getMe() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }

        String email = authentication.getName();
        Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);
        return usuario != null ? mapToDto(usuario) : null;
    }

    private UsuarioDTO mapToDto(Usuario usuario) {
        return UsuarioDTO.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .creadoEn(usuario.getCreadoEn())
                .foto(usuario.getFoto())
                .bio(usuario.getBio())
                .telefono(usuario.getTelefono())
                .build();
    }
}
