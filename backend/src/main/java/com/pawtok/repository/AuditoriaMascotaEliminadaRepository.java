package com.pawtok.repository;

import com.pawtok.model.AuditoriaMascotaEliminada;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditoriaMascotaEliminadaRepository extends JpaRepository<AuditoriaMascotaEliminada, Long> {
}
