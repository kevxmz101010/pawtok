package com.pawtok.dto;
import com.pawtok.model.enums.*;
import java.time.LocalDateTime;
public class AdopcionDTO {
    private Long id;
    private Long usuarioId;
    private String usuarioNombre;
    private Long mascotaId;
    private String mascotaNombre;
    private String mascotaTipo;
    private String mascotaRaza;
    private EstadoAdopcion estado;
    private String mensaje;
    private LocalDateTime solicitadoEn;
    private LocalDateTime resueltoEn;
    
    // Extra fields from frontend
    private String direccion;
    private String fechaVisita;
    private String horaVisita;
    private String ingresosAprox;
    private String ocupacion;
    private String telefono;
    private String tieneMascotas;
    private String tipoVivienda;

    public Long getId() { return id; } public void setId(Long val) { id = val; }
    public Long getUsuarioId() { return usuarioId; } public void setUsuarioId(Long val) { usuarioId = val; }
    public String getUsuarioNombre() { return usuarioNombre; } public void setUsuarioNombre(String val) { usuarioNombre = val; }
    public Long getMascotaId() { return mascotaId; } public void setMascotaId(Long val) { mascotaId = val; }
    public String getMascotaNombre() { return mascotaNombre; } public void setMascotaNombre(String val) { mascotaNombre = val; }
    public String getMascotaTipo() { return mascotaTipo; } public void setMascotaTipo(String val) { mascotaTipo = val; }
    public String getMascotaRaza() { return mascotaRaza; } public void setMascotaRaza(String val) { mascotaRaza = val; }
    public EstadoAdopcion getEstado() { return estado; } public void setEstado(EstadoAdopcion val) { estado = val; }
    public String getMensaje() { return mensaje; } public void setMensaje(String val) { mensaje = val; }
    public LocalDateTime getSolicitadoEn() { return solicitadoEn; } public void setSolicitadoEn(LocalDateTime val) { solicitadoEn = val; }
    public LocalDateTime getResueltoEn() { return resueltoEn; } public void setResueltoEn(LocalDateTime val) { resueltoEn = val; }

    public String getDireccion() { return direccion; } public void setDireccion(String val) { direccion = val; }
    public String getFechaVisita() { return fechaVisita; } public void setFechaVisita(String val) { fechaVisita = val; }
    public String getHoraVisita() { return horaVisita; } public void setHoraVisita(String val) { horaVisita = val; }
    public String getIngresosAprox() { return ingresosAprox; } public void setIngresosAprox(String val) { ingresosAprox = val; }
    public String getOcupacion() { return ocupacion; } public void setOcupacion(String val) { ocupacion = val; }
    public String getTelefono() { return telefono; } public void setTelefono(String val) { telefono = val; }
    public String getTieneMascotas() { return tieneMascotas; } public void setTieneMascotas(String val) { tieneMascotas = val; }
    public String getTipoVivienda() { return tipoVivienda; } public void setTipoVivienda(String val) { tipoVivienda = val; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private AdopcionDTO obj = new AdopcionDTO();
        public Builder id(Long val) { obj.setId(val); return this; }
        public Builder usuarioId(Long val) { obj.setUsuarioId(val); return this; }
        public Builder usuarioNombre(String val) { obj.setUsuarioNombre(val); return this; }
        public Builder mascotaId(Long val) { obj.setMascotaId(val); return this; }
        public Builder mascotaNombre(String val) { obj.setMascotaNombre(val); return this; }
        public Builder mascotaTipo(String val) { obj.setMascotaTipo(val); return this; }
        public Builder mascotaRaza(String val) { obj.setMascotaRaza(val); return this; }
        public Builder estado(EstadoAdopcion val) { obj.setEstado(val); return this; }
        public Builder mensaje(String val) { obj.setMensaje(val); return this; }
        public Builder solicitadoEn(LocalDateTime val) { obj.setSolicitadoEn(val); return this; }
        public Builder resueltoEn(LocalDateTime val) { obj.setResueltoEn(val); return this; }
        
        public Builder direccion(String val) { obj.setDireccion(val); return this; }
        public Builder fechaVisita(String val) { obj.setFechaVisita(val); return this; }
        public Builder horaVisita(String val) { obj.setHoraVisita(val); return this; }
        public Builder ingresosAprox(String val) { obj.setIngresosAprox(val); return this; }
        public Builder ocupacion(String val) { obj.setOcupacion(val); return this; }
        public Builder telefono(String val) { obj.setTelefono(val); return this; }
        public Builder tieneMascotas(String val) { obj.setTieneMascotas(val); return this; }
        public Builder tipoVivienda(String val) { obj.setTipoVivienda(val); return this; }
        
        public AdopcionDTO build() { return obj; }
    }
}
