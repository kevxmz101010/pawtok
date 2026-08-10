package com.pawtok.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HistorialMedicoDTO {
    private Long id;
    private Long idMascota;
    private LocalDate fecha;
    private String descripcion;
    private boolean vacuna;
    private boolean desparasitacion;
    private boolean activo;
}
