package com.pawtok.dto;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdopcionRequest {
    private Long mascotaId;
    private String mensaje;
    public Long getMascotaId() { return this.mascotaId; }
    public void setMascotaId(Long mascotaId) { this.mascotaId = mascotaId; }
    public String getMensaje() { return this.mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
}
