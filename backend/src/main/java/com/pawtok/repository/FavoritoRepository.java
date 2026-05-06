package com.pawtok.repository;
import com.pawtok.model.Favorito;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface FavoritoRepository extends JpaRepository<Favorito, Long> {
    List<Favorito> findByUsuarioId(Long id);
    long countByUsuarioId(Long id);
    Optional<Favorito> findByUsuarioIdAndMascotaId(Long usuarioId, Long mascotaId);
}
