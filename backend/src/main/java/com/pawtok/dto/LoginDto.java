package com.pawtok.dto;

import lombok.Data;

@Data
public class LoginDto {
    private String email;
    private String contrasena;
    public String getEmail() { return this.email; }
    public void setEmail(String email) { this.email = email; }
    public String getContrasena() { return this.contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }
}
