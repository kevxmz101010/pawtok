package com.pawtok.controller;

import com.pawtok.model.Usuario;
import com.pawtok.model.Mascota;
import com.pawtok.model.enums.Rol;
import com.pawtok.model.enums.CategoriaMascota;
import com.pawtok.model.enums.EstadoMascota;
import com.pawtok.repository.UsuarioRepository;
import com.pawtok.repository.MascotaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
public class DevController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private MascotaRepository mascotaRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/dev/seed")
    public String seed() {
        String p123456 = passwordEncoder.encode("123456");

        // Adoptantes
        Usuario a1 = usuarioRepository.findByEmail("adoptante1@pawtok.com").orElseGet(() -> {
            Usuario u = new Usuario();
            u.setNombre("Adoptante 1"); u.setEmail("adoptante1@pawtok.com");
            u.setContrasena(p123456); u.setRol(Rol.USUARIO); u.setCreadoEn(LocalDateTime.now());
            return usuarioRepository.save(u);
        });

        Usuario a2 = usuarioRepository.findByEmail("adoptante2@pawtok.com").orElseGet(() -> {
            Usuario u = new Usuario();
            u.setNombre("Adoptante 2"); u.setEmail("adoptante2@pawtok.com");
            u.setContrasena(p123456); u.setRol(Rol.USUARIO); u.setCreadoEn(LocalDateTime.now());
            return usuarioRepository.save(u);
        });

        // Refugios
        Usuario r1 = usuarioRepository.findByEmail("esperanza@pawtok.com").orElseGet(() -> {
            Usuario u = new Usuario();
            u.setNombre("Refugio Esperanza"); u.setEmail("esperanza@pawtok.com");
            u.setContrasena(p123456); u.setRol(Rol.ADMIN); u.setCreadoEn(LocalDateTime.now());
            return usuarioRepository.save(u);
        });

        Usuario r2 = usuarioRepository.findByEmail("amor@pawtok.com").orElseGet(() -> {
            Usuario u = new Usuario();
            u.setNombre("Refugio Amor"); u.setEmail("amor@pawtok.com");
            u.setContrasena(p123456); u.setRol(Rol.ADMIN); u.setCreadoEn(LocalDateTime.now());
            return usuarioRepository.save(u);
        });

        // Update existing refugio
        usuarioRepository.findByEmail("refugio@pawtok.com").ifPresent(u -> {
            u.setContrasena(p123456);
            usuarioRepository.save(u);
        });

        // Mascota seed
        if (mascotaRepository.findByIdRefugio(r1.getId()).isEmpty()) {
            crearMascota("Max", "Labrador", 24, "Perro muy juguetón y amigable", "PERRO", r1);
            crearMascota("Luna", "Siames", 12, "Gata tranquila", "GATO", r1);
            crearMascota("Rocky", "Bulldog", 36, "Tranquilo y perezoso", "PERRO", r1);
            crearMascota("Kiwi", "Loro", 5, "Loro hablador", "AVE", r1);
            crearMascota("Milo", "Beagle", 8, "Curioso y explorador", "PERRO", r1);
        }

        if (mascotaRepository.findByIdRefugio(r2.getId()).isEmpty()) {
            crearMascota("Bella", "Persa", 48, "Gata muy cariñosa", "GATO", r2);
            crearMascota("Zeus", "Pastor Alemán", 18, "Protector y leal", "PERRO", r2);
            crearMascota("Coco", "Conejo", 6, "Conejo enano blanco", "OTRO", r2);
            crearMascota("Simba", "Maine Coon", 20, "Gato gigante y peludo", "GATO", r2);
            crearMascota("Lola", "Pug", 14, "Pequeña y divertida", "PERRO", r2);
        }

        return "Seeded DB!";
    }

    private void crearMascota(String nombre, String raza, int edad, String desc, String cat, Usuario refugio) {
        Mascota m = new Mascota();
        m.setNombre(nombre);
        m.setRaza(raza);
        m.setEdad(String.valueOf(edad));
        m.setDescripcion(desc);
        m.setCategoria(CategoriaMascota.valueOf(cat));
        m.setEstado(EstadoMascota.DISPONIBLE);
        m.setRefugio(String.valueOf(refugio.getId()));
        m.setCreadoEn(LocalDateTime.now());
        m.setImagenUrl("https://images.unsplash.com/photo-1543466835-00a7907e9de1");
        mascotaRepository.save(m);
    }
}
