package com.pawtok.repository;

import com.pawtok.model.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Repositorio de Mascotas
 * Esta interfaz es MÁGICA. Gracias a Spring Data JPA, no tenemos que escribir consultas SQL a mano 
 * como "SELECT * FROM mascotas WHERE id = 1". 
 * Spring genera el código SQL automáticamente solo con extender `JpaRepository`.
 */
public interface MascotaRepository extends JpaRepository<Mascota, Long> {
    
    // Spring adivina la consulta: "Busca Mascotas por idRefugio" y la traduce a SQL
    List<Mascota> findByIdRefugio(Long idRefugio);
    
    // Lo mismo, pero paginado (devuelve de a 10 resultados, por ejemplo)
    Page<Mascota> findByIdRefugio(Long idRefugio, Pageable pageable);
}
