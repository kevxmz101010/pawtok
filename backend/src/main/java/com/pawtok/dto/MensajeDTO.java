package com.pawtok.dto;

import java.time.LocalDateTime;

public class MensajeDTO {
    private Long id;
    private Long remitenteId;
    private String remitenteNombre;
    private Long adopcionId;
    private String contenido;
    private String archivoUrl;
    private LocalDateTime fechaEnvio;
    private Boolean leido;

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Long getRemitenteId() { return remitenteId; } public void setRemitenteId(Long remitenteId) { this.remitenteId = remitenteId; }
    public String getRemitenteNombre() { return remitenteNombre; } public void setRemitenteNombre(String remitenteNombre) { this.remitenteNombre = remitenteNombre; }
    public Long getAdopcionId() { return adopcionId; } public void setAdopcionId(Long adopcionId) { this.adopcionId = adopcionId; }
    public String getContenido() { return contenido; } public void setContenido(String contenido) { this.contenido = contenido; }
    public String getArchivoUrl() { return archivoUrl; } public void setArchivoUrl(String archivoUrl) { this.archivoUrl = archivoUrl; }
    public LocalDateTime getFechaEnvio() { return fechaEnvio; } public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }
    public Boolean getLeido() { return leido; } public void setLeido(Boolean leido) { this.leido = leido; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private MensajeDTO obj = new MensajeDTO();
        public Builder id(Long val) { obj.setId(val); return this; }
        public Builder remitenteId(Long val) { obj.setRemitenteId(val); return this; }
        public Builder remitenteNombre(String val) { obj.setRemitenteNombre(val); return this; }
        public Builder adopcionId(Long val) { obj.setAdopcionId(val); return this; }
        public Builder contenido(String val) { obj.setContenido(val); return this; }
        public Builder archivoUrl(String val) { obj.setArchivoUrl(val); return this; }
        public Builder fechaEnvio(LocalDateTime val) { obj.setFechaEnvio(val); return this; }
        public Builder leido(Boolean val) { obj.setLeido(val); return this; }
        public MensajeDTO build() { return obj; }
    }
}
