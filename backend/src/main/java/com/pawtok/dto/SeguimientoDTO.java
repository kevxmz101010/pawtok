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
public class SeguimientoDTO {
    private Long id;
    private Long idAdopcion;
    private LocalDate fecha;
    private String comentario;
    private String fotoOpcional;
}
