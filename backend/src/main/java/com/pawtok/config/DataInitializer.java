package com.pawtok.config;

import com.pawtok.model.Usuario;
import com.pawtok.model.Refugio;
import com.pawtok.model.enums.Rol;
import com.pawtok.repository.UsuarioRepository;
import com.pawtok.repository.RefugioRepository;
import com.pawtok.repository.DireccionRepository;
import com.pawtok.model.Direccion;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final RefugioRepository refugioRepository;
    private final DireccionRepository direccionRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // 1. Administrador Principal
        Usuario admin = usuarioRepository.findByEmail("admin@pawtok.com").orElse(null);
        if (admin == null) {
            admin = Usuario.builder()
                    .nombre("Administrador Principal")
                    .email("admin@pawtok.com")
                    .contrasena(passwordEncoder.encode("admin123"))
                    .rol(Rol.ADMIN)
                    .bio("Administrador general del ecosistema Pawtok.")
                    .telefono("3001234567")
                    .creadoEn(LocalDateTime.now())
                    .build();
            usuarioRepository.save(admin);
        } else {
            admin.setContrasena(passwordEncoder.encode("admin123"));
            admin.setRol(Rol.ADMIN);
            usuarioRepository.save(admin);
        }

        // 2. Refugio 1 (Principal)
        Usuario refugioUser = usuarioRepository.findByEmail("refugio@pawtok.com").orElse(null);
        if (refugioUser == null) {
            refugioUser = Usuario.builder()
                    .nombre("Refugio Huellas de Amor")
                    .email("refugio@pawtok.com")
                    .contrasena(passwordEncoder.encode("admin123"))
                    .rol(Rol.REFUGIO)
                    .bio("Refugio dedicado al rescate y bienestar animal.")
                    .telefono("3101234567")
                    .creadoEn(LocalDateTime.now())
                    .build();
            refugioUser = usuarioRepository.save(refugioUser);
        } else {
            refugioUser.setContrasena(passwordEncoder.encode("admin123"));
            refugioUser.setRol(Rol.REFUGIO);
            usuarioRepository.save(refugioUser);
        }

        Refugio ref1 = refugioRepository.findByIdUsuario(refugioUser.getId()).orElse(null);
        if (ref1 == null) {
            ref1 = new Refugio();
            ref1.setIdUsuario(refugioUser.getId());
            ref1.setNombre(refugioUser.getNombre());
            ref1.setEmail(refugioUser.getEmail());
            ref1.setTelefono(refugioUser.getTelefono());
            ref1.setDireccion("Calle 10 # 43E-20, El Poblado, Medellín");
            ref1.setDescripcion(refugioUser.getBio());
            ref1.setEstadoVerificacion("Aprobado");
            refugioRepository.save(ref1);
        } else {
            ref1.setEstadoVerificacion("Aprobado");
            refugioRepository.save(ref1);
        }

        // 3. Refugio 2 (Secundario)
        Usuario refugio2User = usuarioRepository.findByEmail("refugio2@pawtok.com").orElse(null);
        if (refugio2User == null) {
            refugio2User = Usuario.builder()
                    .nombre("Refugio Esperanza Animal")
                    .email("refugio2@pawtok.com")
                    .contrasena(passwordEncoder.encode("admin123"))
                    .rol(Rol.REFUGIO)
                    .bio("Comprometidos con encontrar un hogar digno para cada mascota.")
                    .telefono("3201234567")
                    .creadoEn(LocalDateTime.now())
                    .build();
            refugio2User = usuarioRepository.save(refugio2User);
        } else {
            refugio2User.setContrasena(passwordEncoder.encode("admin123"));
            refugio2User.setRol(Rol.REFUGIO);
            usuarioRepository.save(refugio2User);
        }

        Refugio ref2 = refugioRepository.findByIdUsuario(refugio2User.getId()).orElse(null);
        if (ref2 == null) {
            ref2 = new Refugio();
            ref2.setIdUsuario(refugio2User.getId());
            ref2.setNombre(refugio2User.getNombre());
            ref2.setEmail(refugio2User.getEmail());
            ref2.setTelefono(refugio2User.getTelefono());
            ref2.setDireccion("Carrera 65 # 34A-12, Laureles, Medellín");
            ref2.setDescripcion(refugio2User.getBio());
            ref2.setEstadoVerificacion("Aprobado");
            refugioRepository.save(ref2);
        } else {
            ref2.setEstadoVerificacion("Aprobado");
            refugioRepository.save(ref2);
        }

        // 4. Adoptante
        Usuario adoptanteUser = usuarioRepository.findByEmail("adoptante@pawtok.com").orElse(null);
        if (adoptanteUser == null) {
            adoptanteUser = Usuario.builder()
                    .nombre("Juan Adoptante")
                    .email("adoptante@pawtok.com")
                    .contrasena(passwordEncoder.encode("admin123"))
                    .rol(Rol.USUARIO)
                    .bio("Amante de los animales en busca de adoptar responsablemente.")
                    .telefono("3009876543")
                    .creadoEn(LocalDateTime.now())
                    .build();
            usuarioRepository.save(adoptanteUser);
        } else {
            adoptanteUser.setContrasena(passwordEncoder.encode("admin123"));
            adoptanteUser.setRol(Rol.USUARIO);
            usuarioRepository.save(adoptanteUser);
        }

        // Normalizar direcciones huérfanas
        try {
            List<Direccion> orphanDirs = direccionRepository.findAll();
            for (Direccion d : orphanDirs) {
                if (d.getIdUsuario() == null && d.getIdRefugio() != null) {
                    refugioRepository.findById(d.getIdRefugio()).ifPresent(ref -> {
                        if (ref.getIdUsuario() != null) {
                            d.setIdUsuario(ref.getIdUsuario());
                            direccionRepository.save(d);
                        }
                    });
                }
            }
        } catch (Exception ignored) {}
    }
}
