package com.pawtok.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "seguimiento")
public class Seguimiento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_seguimiento")
    private Long idSeguimiento;

    @Column(name = "id_adopcion")
    private Long idAdopcion;

    @Column(name = "fecha")
    private Date fecha;

    @Column(name = "comentario")
    private String comentario;

    @Column(name = "foto_opcional")
    private String fotoOpcional;
}
