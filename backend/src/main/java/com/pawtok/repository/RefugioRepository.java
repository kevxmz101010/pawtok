package com.pawtok.repository;
import com.pawtok.model.Refugio;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RefugioRepository extends JpaRepository<Refugio, Long> {
    Optional<Refugio> findByIdUsuario(Long id);
}
