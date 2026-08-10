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
@Table(name = "registros_actividad")
public class RegistroActividad {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_registro")
    private Long idRegistro;

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "accion")
    private String accion;

    @Column(name = "detalles")
    private String detalles;

    @Column(name = "fecha")
    private LocalDateTime fecha;
}
