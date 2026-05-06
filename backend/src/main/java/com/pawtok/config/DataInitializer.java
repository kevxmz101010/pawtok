package com.pawtok.config;

import com.pawtok.model.Usuario;
import com.pawtok.model.Mascota;
import com.pawtok.model.enums.Rol;
import com.pawtok.model.enums.CategoriaMascota;
import com.pawtok.model.enums.EstadoMascota;
import com.pawtok.repository.UsuarioRepository;
import com.pawtok.repository.MascotaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Random;

import com.pawtok.repository.RefugioRepository;
import com.pawtok.model.Refugio;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final MascotaRepository mascotaRepository;
    private final RefugioRepository refugioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create Admin
        if (usuarioRepository.findByEmail("admin@pawtok.com").isEmpty()) {
            Usuario admin = Usuario.builder()
                    .nombre("Administrador Principal")
                    .email("admin@pawtok.com")
                    .contrasena(passwordEncoder.encode("admin123"))
                    .rol(Rol.ADMIN)
                    .bio("Administrador del sistema Pawtok.")
                    .telefono("0000000000")
                    .creadoEn(LocalDateTime.now())
                    .build();
            usuarioRepository.save(admin);
        }

        // Create a default Refugio if it doesn't exist to own the 20 pets
        Usuario refugioUser = usuarioRepository.findByEmail("refugio1@pawtok.com").orElse(null);
        if (refugioUser == null) {
            refugioUser = Usuario.builder()
                    .nombre("Refugio Uno")
                    .email("refugio1@pawtok.com")
                    .contrasena(passwordEncoder.encode("refugio123"))
                    .rol(Rol.REFUGIO)
                    .bio("El refugio principal de la ciudad.")
                    .telefono("111222333")
                    .creadoEn(LocalDateTime.now())
                    .build();
            refugioUser = usuarioRepository.save(refugioUser);
        }

        Refugio refugio = refugioRepository.findByIdUsuario(refugioUser.getId()).orElse(null);
        if (refugio == null) {
            refugio = new Refugio();
            refugio.setIdUsuario(refugioUser.getId());
            refugio.setNombre(refugioUser.getNombre());
            refugio.setEmail(refugioUser.getEmail());
            refugio.setTelefono(refugioUser.getTelefono());
            refugio.setDireccion("Calle Principal 123");
            refugio.setDescripcion(refugioUser.getBio());
            refugio = refugioRepository.save(refugio);
        }

        // Create 20 pets for this refugio if it has less than 20
        if (mascotaRepository.findByIdRefugio(refugio.getId()).size() < 20) {
            String[] nombresPerros = {"Max", "Bella", "Charlie", "Luna", "Buddy", "Lucy", "Rocky", "Daisy", "Milo", "Zoe"};
            String[] nombresGatos = {"Oliver", "Leo", "Milo", "Loki", "Chloe", "Nala", "Simba", "Lily", "Mia", "Shadow"};
            Random random = new Random();

            for (int i = 1; i <= 20; i++) {
                boolean isPerro = random.nextBoolean();
                String nombre = isPerro ? nombresPerros[random.nextInt(nombresPerros.length)] + " " + i : nombresGatos[random.nextInt(nombresGatos.length)] + " " + i;
                CategoriaMascota categoria = isPerro ? CategoriaMascota.PERRO : CategoriaMascota.GATO;
                
                Mascota mascota = new Mascota();
                mascota.setNombre(nombre);
                mascota.setRaza(isPerro ? "Mestizo" : "Gato Común Europeo");
                mascota.setEdad(String.valueOf(random.nextInt(60) + 2)); // 2 to 61 months
                mascota.setDescripcion("Una mascota muy juguetona y cariñosa que busca un hogar lleno de amor. Número de registro: " + i);
                mascota.setImagenUrl(isPerro ? "https://images.unsplash.com/photo-1543466835-00a7907e9de1?q=80&w=400" : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=400");
                mascota.setCategoria(categoria);
                mascota.setEstado(EstadoMascota.DISPONIBLE);
                mascota.setRefugio(refugio.getId().toString());
                mascota.setCreadoEn(LocalDateTime.now().minusDays(random.nextInt(30)));
                
                mascota.setTamano(isPerro ? "Mediano" : "Pequeño");
                mascota.setPeso(isPerro ? "15 kg" : "4 kg");
                mascota.setUbicacion("Ciudad Central");
                mascota.setEnergia("Alta");
                mascota.setConNinos("Sí");
                mascota.setOrigen("Rescatado");
                mascota.setPersonalidad("Juguetón,Cariñoso");
                mascota.setDisponible(true);
                
                mascotaRepository.save(mascota);
            }
        }
    }
}
