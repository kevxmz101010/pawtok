package com.pawtok.model;
import com.pawtok.model.enums.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "adopciones")
public class Adopcion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_adopcion")
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_usuario") private Usuario usuario;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "id_mascota") private Mascota mascota;
    
    @Column(name = "fecha_adopcion", updatable = false)
    private LocalDateTime fechaAdopcion;
    
    @Column(name = "estado")
    private String estadoStr;
    
    private Boolean activo;
    
    @Column(name = "fecha_solicitud", updatable = false)
    private LocalDateTime solicitadoEn;
    
    private String direccion;
    @Column(name = "fecha_visita") private String fechaVisita;
    @Column(name = "hora_visita") private String horaVisita;
    @Column(name = "ingresos_aprox") private String ingresosAprox;
    @Column(columnDefinition = "TEXT") private String mensaje;
    private String ocupacion;
    private String telefono;
    @Column(name = "tiene_mascotas") private String tieneMascotas;
    @Column(name = "tipo_vivienda") private String tipoVivienda;
    
    public Long getId() { return id; } public void setId(Long val) { id = val; }
    public Usuario getUsuario() { return usuario; } public void setUsuario(Usuario val) { usuario = val; }
    public Mascota getMascota() { return mascota; } public void setMascota(Mascota val) { mascota = val; }
    
    public EstadoAdopcion getEstado() {
        if (estadoStr == null) return null;
        try { return EstadoAdopcion.valueOf(estadoStr.toUpperCase()); } 
        catch(Exception e) { return EstadoAdopcion.PENDIENTE; }
    } 
    public void setEstado(EstadoAdopcion val) { estadoStr = val == null ? null : val.name().toLowerCase(); }
    
    public String getMensaje() { return mensaje; } public void setMensaje(String val) { mensaje = val; }
    public LocalDateTime getSolicitadoEn() { return solicitadoEn; } public void setSolicitadoEn(LocalDateTime val) { solicitadoEn = val; }
    public LocalDateTime getResueltoEn() { return null; } public void setResueltoEn(LocalDateTime val) {}
    public String getEstadoString() { return estadoStr; }

    public LocalDateTime getFechaAdopcion() { return fechaAdopcion; } public void setFechaAdopcion(LocalDateTime fechaAdopcion) { this.fechaAdopcion = fechaAdopcion; }
    public Boolean getActivo() { return activo; } public void setActivo(Boolean activo) { this.activo = activo; }
    public String getDireccion() { return direccion; } public void setDireccion(String direccion) { this.direccion = direccion; }
    public String getFechaVisita() { return fechaVisita; } public void setFechaVisita(String fechaVisita) { this.fechaVisita = fechaVisita; }
    public String getHoraVisita() { return horaVisita; } public void setHoraVisita(String horaVisita) { this.horaVisita = horaVisita; }
    public String getIngresosAprox() { return ingresosAprox; } public void setIngresosAprox(String ingresosAprox) { this.ingresosAprox = ingresosAprox; }
    public String getOcupacion() { return ocupacion; } public void setOcupacion(String ocupacion) { this.ocupacion = ocupacion; }
    public String getTelefono() { return telefono; } public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getTieneMascotas() { return tieneMascotas; } public void setTieneMascotas(String tieneMascotas) { this.tieneMascotas = tieneMascotas; }
    public String getTipoVivienda() { return tipoVivienda; } public void setTipoVivienda(String tipoVivienda) { this.tipoVivienda = tipoVivienda; }

    public static Builder builder() { return new Builder(); }
    
    @PrePersist
    protected void onCreate() {
        if (fechaAdopcion == null) fechaAdopcion = LocalDateTime.now();
        if (solicitadoEn == null) solicitadoEn = LocalDateTime.now();
    }
    
    public static class Builder {
        private Adopcion obj = new Adopcion();
        public Builder() {
            obj.setActivo(true);
        }
        public Builder id(Long val) { obj.setId(val); return this; }
        public Builder usuario(Usuario val) { obj.setUsuario(val); return this; }
        public Builder mascota(Mascota val) { obj.setMascota(val); return this; }
        public Builder estado(EstadoAdopcion val) { obj.setEstado(val); return this; }
        public Builder mensaje(String val) { obj.setMensaje(val); return this; }
        public Builder solicitadoEn(LocalDateTime val) { obj.setSolicitadoEn(val); return this; }
        public Builder resueltoEn(LocalDateTime val) { return this; }
        public Builder direccion(String val) { obj.setDireccion(val); return this; }
        public Builder fechaVisita(String val) { obj.setFechaVisita(val); return this; }
        public Builder horaVisita(String val) { obj.setHoraVisita(val); return this; }
        public Builder ingresosAprox(String val) { obj.setIngresosAprox(val); return this; }
        public Builder ocupacion(String val) { obj.setOcupacion(val); return this; }
        public Builder telefono(String val) { obj.setTelefono(val); return this; }
        public Builder tieneMascotas(String val) { obj.setTieneMascotas(val); return this; }
        public Builder tipoVivienda(String val) { obj.setTipoVivienda(val); return this; }
        public Adopcion build() { return obj; }
    }
}
