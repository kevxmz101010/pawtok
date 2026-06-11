package com.pawtok.model;
import com.pawtok.model.enums.Rol;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

/**
 * Modelo Usuario (Entidad de Base de Datos)
 * Representa a cualquier persona que se registra en Pawtok (ya sea Adoptante, Refugio o Admin).
 * Hibernate lee esta clase para crear y mapear la tabla `usuarios` en MySQL.
 */
@Entity
@Table(name = "usuarios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id; // Identificador único generado por MySQL
    
    private String nombre;
    
    @Column(unique = true) // Ningún otro usuario puede tener el mismo email
    private String email;
    
    @Column(name = "password") // En MySQL se llama password, pero en Java lo llamamos contrasena
    private String contrasena;
    
    @Column(name = "id_rol")
    private Integer idRol; // 1 = ADMIN, 2 = USUARIO (Adoptante), 3 = REFUGIO
    
    // Anotación de Hibernate para que ponga la fecha actual automáticamente cuando se crea el usuario
    @CreationTimestamp @Column(name = "fecha_registro", updatable = false) private LocalDateTime creadoEn;
    private String bio;
    private String foto;
    private String telefono;

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Usuario obj = new Usuario();
        public Builder id(Long val) { obj.setId(val); return this; }
        public Builder nombre(String val) { obj.setNombre(val); return this; }
        public Builder email(String val) { obj.setEmail(val); return this; }
        public Builder contrasena(String val) { obj.setContrasena(val); return this; }
        public Builder idRol(Integer val) { obj.setIdRol(val); return this; }
        public Builder rol(Rol val) { obj.setRol(val); return this; }
        public Builder creadoEn(LocalDateTime val) { obj.setCreadoEn(val); return this; }
        public Builder bio(String val) { obj.setBio(val); return this; }
        public Builder foto(String val) { obj.setFoto(val); return this; }
        public Builder telefono(String val) { obj.setTelefono(val); return this; }
        public Usuario build() { return obj; }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }
    public Integer getIdRol() { return idRol; }
    public void setIdRol(Integer idRol) { this.idRol = idRol; }
    public Rol getRol() {
        if (idRol == null) return null;
        if (idRol == 1) return Rol.ADMIN;
        if (idRol == 2) return Rol.USUARIO;
        if (idRol == 3) return Rol.REFUGIO;
        return Rol.USUARIO;
    }
    public void setRol(Rol rol) {
        if (rol == Rol.ADMIN) this.idRol = 1;
        else if (rol == Rol.USUARIO) this.idRol = 2;
        else if (rol == Rol.REFUGIO) this.idRol = 3;
    }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public String getFoto() { return foto; }
    public void setFoto(String foto) { this.foto = foto; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
}
