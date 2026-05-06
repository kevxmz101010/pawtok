package com.pawtok.repository;
import com.pawtok.model.Direccion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DireccionRepository extends JpaRepository<Direccion, Long> {
    Optional<Direccion> findByIdUsuario(Long id);
}
