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

/**
 * Servicio de Autenticación (AuthService)
 * Se encarga del registro, inicio de sesión (login) y cierre de sesión (logout).
 * Trabaja de la mano con Spring Security para recordar quién es el usuario mediante "Cookies de Sesión".
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder; // Herramienta para encriptar las contraseñas
    private final AuthenticationManager authenticationManager; // Revisa si el email y la contraseña coinciden

    /**
     * Registra un nuevo usuario en la base de datos.
     * Encripta su contraseña para que, si alguien roba la base de datos, no pueda leerla.
     */
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

    /**
     * Inicia la sesión del usuario.
     * Si la contraseña es correcta, Spring Security guarda al usuario en el "SecurityContext".
     * Luego, este método guarda ese contexto en la Cookie (HttpSession) que viajará al Frontend.
     */
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

    /**
     * Cierra la sesión, destruyendo la Cookie y limpiando la memoria del servidor.
     */
    public void logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
    }

    /**
     * Verifica quién es el usuario que tiene la sesión activa actualmente.
     * Es muy usado por React cuando recargas la página para preguntar: "¿Sigo logueado? ¿Quién soy?".
     */
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
