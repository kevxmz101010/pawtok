package com.pawtok.controller;

import com.pawtok.model.Refugio;
import com.pawtok.model.Usuario;
import com.pawtok.repository.RefugioRepository;
import com.pawtok.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SeedController {

    private final UsuarioRepository usuarioRepository;
    private final RefugioRepository refugioRepository;
    private final PasswordEncoder passwordEncoder;

    public SeedController(UsuarioRepository usuarioRepository, RefugioRepository refugioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.refugioRepository = refugioRepository;
        this.passwordEncoder = passwordEncoder;
    }


    @GetMapping("/api/seed-shelter")
    public String seedShelter() {
        if (usuarioRepository.findByEmail("refugio@pawtok.com").isPresent()) {
            Usuario user = usuarioRepository.findByEmail("refugio@pawtok.com").get();
            user.setContrasena(passwordEncoder.encode("123456"));
            usuarioRepository.save(user);
            return "El refugio ya existe. Contraseña actualizada a 123456.";
        }

        Usuario user = new Usuario();
        user.setNombre("Patitas Rescate");
        user.setEmail("refugio@pawtok.com");
        user.setContrasena(passwordEncoder.encode("123456"));
        user.setIdRol(3); // 3 = REFUGIO
        user = usuarioRepository.save(user);

        Refugio refugio = new Refugio();
        refugio.setIdUsuario(user.getId());
        refugio.setNombre("Patitas Rescate - Sede Central");
        refugio.setDireccion("Calle 123, Bogotá");
        refugio.setTelefono("555-1234");
        refugio.setEmail("contacto@patitasrescate.com");
        refugio.setDescripcion("Refugio dedicado al rescate y adopción de animales.");
        refugio.setEstadoVerificacion("Aprobado");
        refugioRepository.save(refugio);

        return "Refugio creado con éxito. Login: refugio@pawtok.com / 123456";
    }
}
