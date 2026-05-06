package com.pawtok.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContactoDTO {
    private Long id;
    private String nombre;
    private String email;
    private String mensaje;
    private LocalDateTime fechaEnvio;
    private boolean leido;
}
