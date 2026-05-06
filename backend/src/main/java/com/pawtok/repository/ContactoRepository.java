package com.pawtok.repository;

import com.pawtok.model.ContactoMensaje;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactoRepository extends JpaRepository<ContactoMensaje, Long> {
    List<ContactoMensaje> findAllByOrderByFechaEnvioDesc();
}
