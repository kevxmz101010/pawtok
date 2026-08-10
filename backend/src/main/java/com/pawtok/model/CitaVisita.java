package com.pawtok.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "citas_visita")
public class CitaVisita {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "id_mascota")
    private Long idMascota;

    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(name = "hora")
    private LocalTime hora;

    @Column(name = "telefono")
    private String telefono;

    @Column(name = "direccion")
    private String direccion;

    @Column(name = "tipo_vivienda")
    private String tipoVivienda;

    @Column(name = "tiene_mascotas")
    private String tieneMascotas;

    @Column(name = "ocupacion")
    private String ocupacion;

    @Column(name = "ingresos_aprox")
    private String ingresosAprox;

    @Column(name = "mensaje")
    private String mensaje;

    @Column(name = "estado")
    private String estado = "pendiente";

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;
}
