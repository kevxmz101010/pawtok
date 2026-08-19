package com.pawtok.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificacionDTO {
    private Long id;
    private Long idUsuario;
    private String titulo;
    private String mensaje;
    private String tipo;
    private String enlace;
    private boolean leida;
    private LocalDateTime fechaCreacion;
}
