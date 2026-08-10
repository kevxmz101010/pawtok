package com.pawtok.repository;

import com.pawtok.model.CategoriaMascotaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoriaMascotaEntityRepository extends JpaRepository<CategoriaMascotaEntity, Long> {
    Optional<CategoriaMascotaEntity> findByNombreCategoria(String nombreCategoria);
}
