package com.pawtok.dto;

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
public class CitaVisitaDTO {
    private Long id;
    private Long idUsuario;
    private Long idMascota;
    private String nombreUsuario;
    private String nombreMascota;
    private String fotoMascota;
    private String nombreRefugio;
    private LocalDate fecha;
    private LocalTime hora;
    private String telefono;
    private String direccion;
    private String tipoVivienda;
    private String tieneMascotas;
    private String ocupacion;
    private String ingresosAprox;
    private String mensaje;
    private String novedad;
    private String estado;
    private LocalDateTime fechaCreacion;
}
