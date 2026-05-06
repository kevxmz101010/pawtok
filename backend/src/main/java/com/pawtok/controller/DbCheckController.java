package com.pawtok.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class DbCheckController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private com.pawtok.repository.MascotaRepository mascotaRepository;

    @GetMapping("/api/testdb")
    public List<Map<String, Object>> testDb() {
        return jdbcTemplate.queryForList("SHOW CREATE TABLE mascotas");
    }

    @GetMapping("/api/testpet")
    public String testPet() {
        com.pawtok.model.Mascota m = com.pawtok.model.Mascota.builder()
                .nombre("Test Null")
                .categoria(com.pawtok.model.enums.CategoriaMascota.PERRO)
                .estado(com.pawtok.model.enums.EstadoMascota.DISPONIBLE)
                .origen("refugio")
                .disponible(true)
                .build();
        try {
            mascotaRepository.save(m);
            return "OK " + m.getIdRefugio();
        } catch (Exception e) {
            e.printStackTrace();
            return "Error: " + e.getMessage() + " | idRefugio was: " + m.getIdRefugio();
        }
    }

    @GetMapping("/api/fixpets")
    public String fixPets() {
        try {
            Long refugioId = jdbcTemplate.queryForObject("SELECT id_refugio FROM refugios WHERE email = 'refugio1@pawtok.com'", Long.class);
            int rows = jdbcTemplate.update("UPDATE mascotas SET id_refugio = ?", refugioId);
            return "Updated " + rows + " pets to refugio1: " + refugioId;
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}
