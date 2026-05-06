package com.pawtok.repository;

import com.pawtok.model.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MascotaRepository extends JpaRepository<Mascota, Long> {
    List<Mascota> findByIdRefugio(Long idRefugio);
    Page<Mascota> findByIdRefugio(Long idRefugio, Pageable pageable);
}
