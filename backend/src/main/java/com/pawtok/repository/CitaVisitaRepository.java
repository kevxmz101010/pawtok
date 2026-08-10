package com.pawtok.repository;

import com.pawtok.model.CitaVisita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CitaVisitaRepository extends JpaRepository<CitaVisita, Long> {
    List<CitaVisita> findByIdUsuarioOrderByFechaCreacionDesc(Long idUsuario);
    List<CitaVisita> findByIdMascotaOrderByFechaDesc(Long idMascota);
}
