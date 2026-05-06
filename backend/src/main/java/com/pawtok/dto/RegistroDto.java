package com.pawtok.dto;

import com.pawtok.model.enums.Rol;
import lombok.Data;

@Data
public class RegistroDto {
    private String nombre;
    private String email;
    private String contrasena;
    private Rol rol;
    public String getNombre() { return this.nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEmail() { return this.email; }
    public void setEmail(String email) { this.email = email; }
    public String getContrasena() { return this.contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }
    public Rol getRol() { return this.rol; }
    public void setRol(Rol rol) { this.rol = rol; }
}
