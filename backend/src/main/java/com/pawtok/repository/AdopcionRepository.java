package com.pawtok.repository;

import com.pawtok.model.Adopcion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdopcionRepository extends JpaRepository<Adopcion, Long> {
    List<Adopcion> findByUsuarioId(Long usuarioId);
    List<Adopcion> findByMascotaIdRefugio(Long idRefugio);
    java.util.List<com.pawtok.model.Adopcion> findByUsuarioIdOrderBySolicitadoEnDesc(Long id);
    long countByUsuarioId(Long id);
}
