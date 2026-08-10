package com.pawtok.repository;

import com.pawtok.model.HistorialMedico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistorialMedicoRepository extends JpaRepository<HistorialMedico, Long> {
    List<HistorialMedico> findByIdMascotaOrderByFechaDesc(Long idMascota);
    List<HistorialMedico> findByIdMascotaAndActivoTrue(Long idMascota);
}
