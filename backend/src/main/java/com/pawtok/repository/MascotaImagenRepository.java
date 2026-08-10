package com.pawtok.repository;

import com.pawtok.model.MascotaImagen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MascotaImagenRepository extends JpaRepository<MascotaImagen, Long> {
    List<MascotaImagen> findByIdMascotaAndActivoTrueOrderByOrdenImgAsc(Long idMascota);
    List<MascotaImagen> findByIdMascota(Long idMascota);
}
