package com.pawtok.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "auditoria_mascotas_eliminadas")
public class AuditoriaMascotaEliminada {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_auditoria")
    private Long idAuditoria;

    @Column(name = "id_mascota_original")
    private Integer idMascotaOriginal;

    @Column(name = "nombre_mascota")
    private String nombreMascota;

    @Column(name = "id_usuario_elimina")
    private Integer idUsuarioElimina;

    @Column(name = "fecha_eliminacion")
    private LocalDateTime fechaEliminacion;
}
