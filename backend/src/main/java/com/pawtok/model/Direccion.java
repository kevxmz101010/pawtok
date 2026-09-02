package com.pawtok.model;
import com.pawtok.model.enums.*;
import jakarta.persistence.*;

@Entity
@Table(name = "direcciones")
public class Direccion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_direccion")
    private Long id;

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "id_refugio")
    private Long idRefugio;

    private String direccion;
    private String ciudad;
    @Column(name = "codigo_postal")
    private String codigoPostal;
    public Long getIdRefugio() { return idRefugio; } public void setIdRefugio(Long val) { idRefugio = val; }

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Long getIdUsuario() { return idUsuario; } public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }
    public String getCiudad() { return ciudad; } public void setCiudad(String ciudad) { this.ciudad = ciudad; }
    public String getCodigoPostal() { return codigoPostal; } public void setCodigoPostal(String codigoPostal) { this.codigoPostal = codigoPostal; }
    public String getDireccion() { return direccion; } public void setDireccion(String direccion) { this.direccion = direccion; }
}
