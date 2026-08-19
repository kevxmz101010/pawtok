package com.pawtok.repository;
import com.pawtok.model.Mensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MensajeRepository extends JpaRepository<Mensaje, Long> {
    List<Mensaje> findByReceptorIdOrderByFechaEnvioDesc(Long id);
    java.util.List<com.pawtok.model.Mensaje> findTop5ByReceptorIdOrderByFechaEnvioDesc(Long id);
    List<Mensaje> findByAdopcionIdOrderByFechaEnvioAsc(Long adopcionId);
}
