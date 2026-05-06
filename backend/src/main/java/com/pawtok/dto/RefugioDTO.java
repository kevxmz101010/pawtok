package com.pawtok.dto;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefugioDTO {
    private Long id;
    private String nombre;
    private String direccion;
    private String telefono;
    private String email;
    private Long idUsuario;
    private String descripcion;
    private String redesSociales;
    private String horario;
    private String certificadoUrl;
    private String documentoRepresentanteUrl;
    private String fotosLugarUrl;
    private String estadoVerificacion;
    private String logoUrl;
    public Long getId() { return this.id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return this.nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDireccion() { return this.direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    public String getTelefono() { return this.telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getEmail() { return this.email; }
    public void setEmail(String email) { this.email = email; }
    public Long getIdUsuario() { return this.idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }
    public String getDescripcion() { return this.descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getRedesSociales() { return this.redesSociales; }
    public void setRedesSociales(String redesSociales) { this.redesSociales = redesSociales; }
    public String getHorario() { return this.horario; }
    public void setHorario(String horario) { this.horario = horario; }
    public String getCertificadoUrl() { return this.certificadoUrl; }
    public void setCertificadoUrl(String certificadoUrl) { this.certificadoUrl = certificadoUrl; }
    public String getDocumentoRepresentanteUrl() { return this.documentoRepresentanteUrl; }
    public void setDocumentoRepresentanteUrl(String documentoRepresentanteUrl) { this.documentoRepresentanteUrl = documentoRepresentanteUrl; }
    public String getFotosLugarUrl() { return this.fotosLugarUrl; }
    public void setFotosLugarUrl(String fotosLugarUrl) { this.fotosLugarUrl = fotosLugarUrl; }
    public String getEstadoVerificacion() { return this.estadoVerificacion; }
    public void setEstadoVerificacion(String estadoVerificacion) { this.estadoVerificacion = estadoVerificacion; }
    public String getLogoUrl() { return this.logoUrl; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
}
