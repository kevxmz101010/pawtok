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
        org.springframework.web.filter.CharacterEncodingFilter encodingFilter = new org.springframework.web.filter.CharacterEncodingFilter();
        encodingFilter.setEncoding("UTF-8");
        encodingFilter.setForceEncoding(true);
        http.addFilterBefore(encodingFilter, org.springframework.security.web.session.DisableEncodeUrlFilter.class);

        http
            .cors(cors -> cors.configure(http)) // Permite que el Frontend (React) se comunique con este Backend
            .csrf(csrf -> csrf.disable()) // Desactiva protección CSRF (no es necesaria en nuestro diseño)
            .headers(headers -> headers
                .frameOptions(frameOptions -> frameOptions.disable()) // Permite incrustar PDFs y vistas previas en iframes/apartados
            )
            .securityContext(context -> context.requireExplicitSave(false)) // Guarda la sesión automáticamente (Cookies)
            .authorizeHttpRequests(auth -> auth
                // Rutas PÚBLICAS (permitAll). Cualquiera puede entrar sin iniciar sesión.
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/mascotas", "/api/mascotas/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/refugios", "/api/refugios/**").permitAll()
                .requestMatchers("/uploads/**", "/api/files/**", "/api/files/uploads/**").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/mascotas/*/historial").permitAll()
                .requestMatchers(org.springframework.http.HttpMethod.POST, "/api/contacto").permitAll()
                .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/logout").permitAll()
                
                // Rutas exclusivas para Administradores
                .requestMatchers("/api/admin/**", "/dev/**", "/api/seed-shelter", "/api/fixpets", "/api/testdb", "/api/testpet").hasRole("ADMIN")
                
                // CUALQUIER OTRA RUTA requiere que inicies sesión.
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider());
        
        return http.build();
    }
}
