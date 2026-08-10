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
@Table(name = "auditoria_historial")
public class AuditoriaHistorial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_auditoria")
    private Long idAuditoria;

    @Column(name = "id_adopcion")
    private Long idAdopcion;

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "id_mascota")
    private Long idMascota;

    @Column(name = "nombre_adoptante")
    private String nombreAdoptante;

    @Column(name = "nombre_mascota")
    private String nombreMascota;

    @Column(name = "fecha_adopcion")
    private LocalDateTime fechaAdopcion;

    @Column(name = "estado_previo")
    private String estadoPrevio;

    @Column(name = "accion")
    private String accion = "inactivado";

    @Column(name = "id_admin")
    private Long idAdmin;

    @Column(name = "fecha_accion")
    private LocalDateTime fechaAccion;

    @Column(name = "motivo")
    private String motivo;
}
