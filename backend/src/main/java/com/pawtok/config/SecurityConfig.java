package com.pawtok.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuración de Seguridad (Spring Security)
 * Este es el "Guardián" o "Bouncer" de la aplicación.
 * Decide qué rutas son públicas (como ver perritos) y qué rutas requieren inicio de sesión (como adoptar).
 */
@Configuration
@EnableWebSecurity // Activa la seguridad en toda la app web
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;

    /**
     * Proveedor de Autenticación.
     * Le dice a Spring Security cómo buscar a un usuario (usando userDetailsService) 
     * y cómo verificar su contraseña (usando passwordEncoder).
     */
    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    /**
     * Encriptador de contraseñas.
     * Usa BCrypt, un algoritmo muy fuerte. Convierte "123456" en algo como "$2a$10$xyz...".
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * La Cadena de Filtros (Filtro de Seguridad Principal).
     * Aquí definimos literalmente quién puede entrar a dónde.
     */
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configure(http)) // Permite que el Frontend (React) se comunique con este Backend
            .csrf(csrf -> csrf.disable()) // Desactiva protección CSRF (no es necesaria en nuestro diseño)
            .securityContext(context -> context.requireExplicitSave(false)) // Guarda la sesión automáticamente (Cookies)
            .authorizeHttpRequests(auth -> auth
                // Estas rutas son PÚBLICAS (permitAll). Cualquiera puede entrar sin iniciar sesión.
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/mascotas", "/api/mascotas/**", "/uploads/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/contacto").permitAll()
                .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/logout", "/dev/seed", "/api/testdb", "/api/testpet", "/api/fixpets").permitAll()
                
                // CUALQUIER OTRA RUTA que no esté en la lista anterior, REQUIERE que inicies sesión.
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider());
        
        return http.build();
    }
}
