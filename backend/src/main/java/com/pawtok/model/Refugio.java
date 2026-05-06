package com.pawtok.model;
import jakarta.persistence.*;

@Entity
@Table(name = "refugios")
public class Refugio {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_refugio")
    private Long id;

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "estado_verificacion")
    private String estadoVerificacion;
    @Column(name = "logo_url")
    private String logoUrl;
    @Column(name = "certificado_url")
    private String certificadoUrl;
    @Column(name = "documento_representante_url")
    private String documentoRepresentanteUrl;
    @Column(name = "fotos_lugar_url", columnDefinition = "TEXT")
    private String fotosLugarUrl;
    private String direccion;
    @Column(columnDefinition = "TEXT") private String descripcion;

    @Column(name = "redes_sociales") private String redesSociales;
    private String horario;
    private String nombre;
    private String telefono;
    private String email;

    public String getRedesSociales() { return redesSociales; } public void setRedesSociales(String val) { redesSociales = val; }
    public String getHorario() { return horario; } public void setHorario(String val) { horario = val; }
    public Long getIdUsuario() { return idUsuario; } public void setIdUsuario(Long val) { idUsuario = val; }
    public String getNombre() { return nombre; } public void setNombre(String val) { nombre = val; }
    public String getTelefono() { return telefono; } public void setTelefono(String val) { telefono = val; }
    public String getEmail() { return email; } public void setEmail(String val) { email = val; }

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getEstadoVerificacion() { return estadoVerificacion; } public void setEstadoVerificacion(String estadoVerificacion) { this.estadoVerificacion = estadoVerificacion; }
    public String getLogoUrl() { return logoUrl; } public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public String getCertificadoUrl() { return certificadoUrl; } public void setCertificadoUrl(String certificadoUrl) { this.certificadoUrl = certificadoUrl; }
    public String getDocumentoRepresentanteUrl() { return documentoRepresentanteUrl; } public void setDocumentoRepresentanteUrl(String documentoRepresentanteUrl) { this.documentoRepresentanteUrl = documentoRepresentanteUrl; }
    public String getFotosLugarUrl() { return fotosLugarUrl; } public void setFotosLugarUrl(String fotosLugarUrl) { this.fotosLugarUrl = fotosLugarUrl; }
    public String getDireccion() { return direccion; } public void setDireccion(String direccion) { this.direccion = direccion; }
    public String getDescripcion() { return descripcion; } public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}
