package com.pawtok.dto;
import com.pawtok.model.enums.Rol;
import java.time.LocalDateTime;

public class UsuarioDTO {
    private Long id;
    private String nombre;
    private String email;
    private Rol rol;
    private LocalDateTime creadoEn;
    private String bio;
    private String foto;
    private String telefono;

    public Long getId() { return id; } public void setId(Long val) { id = val; }
    public String getNombre() { return nombre; } public void setNombre(String val) { nombre = val; }
    public String getEmail() { return email; } public void setEmail(String val) { email = val; }
    public Rol getRol() { return rol; } public void setRol(Rol val) { rol = val; }
    public LocalDateTime getCreadoEn() { return creadoEn; } public void setCreadoEn(LocalDateTime val) { creadoEn = val; }
    public String getBio() { return bio; } public void setBio(String val) { bio = val; }
    public String getFoto() { return foto; } public void setFoto(String val) { foto = val; }
    public String getTelefono() { return telefono; } public void setTelefono(String val) { telefono = val; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private UsuarioDTO obj = new UsuarioDTO();
        public Builder id(Long val) { obj.setId(val); return this; }
        public Builder nombre(String val) { obj.setNombre(val); return this; }
        public Builder email(String val) { obj.setEmail(val); return this; }
        public Builder rol(Rol val) { obj.setRol(val); return this; }
        public Builder creadoEn(LocalDateTime val) { obj.setCreadoEn(val); return this; }
        public Builder bio(String val) { obj.setBio(val); return this; }
        public Builder foto(String val) { obj.setFoto(val); return this; }
        public Builder telefono(String val) { obj.setTelefono(val); return this; }
        public UsuarioDTO build() { return obj; }
    }
}
