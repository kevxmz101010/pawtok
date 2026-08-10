package com.pawtok.repository;

import com.pawtok.model.AuditoriaHistorial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditoriaHistorialRepository extends JpaRepository<AuditoriaHistorial, Long> {
}
