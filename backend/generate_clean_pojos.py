import os

files = {
    'src/main/java/com/pawtok/model/Mascota.java': """package com.pawtok.model;
import com.pawtok.model.enums.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mascotas")
public class Mascota {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String raza;
    private Integer edad;
    @Column(columnDefinition = "TEXT") private String descripcion;
    private String imagenUrl;
    @Enumerated(EnumType.STRING) private CategoriaMascota categoria;
    @Enumerated(EnumType.STRING) private EstadoMascota estado;
    private String refugio;
    @Column(updatable = false) private LocalDateTime creadoEn;

    public Long getId() { return id; } public void setId(Long val) { id = val; }
    public String getNombre() { return nombre; } public void setNombre(String val) { nombre = val; }
    public String getRaza() { return raza; } public void setRaza(String val) { raza = val; }
    public Integer getEdad() { return edad; } public void setEdad(Integer val) { edad = val; }
    public String getDescripcion() { return descripcion; } public void setDescripcion(String val) { descripcion = val; }
    public String getImagenUrl() { return imagenUrl; } public void setImagenUrl(String val) { imagenUrl = val; }
    public CategoriaMascota getCategoria() { return categoria; } public void setCategoria(CategoriaMascota val) { categoria = val; }
    public EstadoMascota getEstado() { return estado; } public void setEstado(EstadoMascota val) { estado = val; }
    public String getRefugio() { return refugio; } public void setRefugio(String val) { refugio = val; }
    public LocalDateTime getCreadoEn() { return creadoEn; } public void setCreadoEn(LocalDateTime val) { creadoEn = val; }
    public Long getIdRefugio() { return null; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Mascota obj = new Mascota();
        public Builder id(Long val) { obj.setId(val); return this; }
        public Builder nombre(String val) { obj.setNombre(val); return this; }
        public Builder raza(String val) { obj.setRaza(val); return this; }
        public Builder edad(Integer val) { obj.setEdad(val); return this; }
        public Builder descripcion(String val) { obj.setDescripcion(val); return this; }
        public Builder imagenUrl(String val) { obj.setImagenUrl(val); return this; }
        public Builder categoria(CategoriaMascota val) { obj.setCategoria(val); return this; }
        public Builder estado(EstadoMascota val) { obj.setEstado(val); return this; }
        public Builder refugio(String val) { obj.setRefugio(val); return this; }
        public Builder creadoEn(LocalDateTime val) { obj.setCreadoEn(val); return this; }
        public Mascota build() { return obj; }
    }
}
""",
    'src/main/java/com/pawtok/model/Adopcion.java': """package com.pawtok.model;
import com.pawtok.model.enums.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "adopciones")
public class Adopcion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "usuario_id") private Usuario usuario;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "mascota_id") private Mascota mascota;
    @Enumerated(EnumType.STRING) private EstadoAdopcion estado;
    @Column(columnDefinition = "TEXT") private String mensaje;
    private LocalDateTime solicitadoEn;
    private LocalDateTime resueltoEn;

    public Long getId() { return id; } public void setId(Long val) { id = val; }
    public Usuario getUsuario() { return usuario; } public void setUsuario(Usuario val) { usuario = val; }
    public Mascota getMascota() { return mascota; } public void setMascota(Mascota val) { mascota = val; }
    public EstadoAdopcion getEstado() { return estado; } public void setEstado(EstadoAdopcion val) { estado = val; }
    public String getMensaje() { return mensaje; } public void setMensaje(String val) { mensaje = val; }
    public LocalDateTime getSolicitadoEn() { return solicitadoEn; } public void setSolicitadoEn(LocalDateTime val) { solicitadoEn = val; }
    public LocalDateTime getResueltoEn() { return resueltoEn; } public void setResueltoEn(LocalDateTime val) { resueltoEn = val; }
    public String getEstadoString() { return estado != null ? estado.name() : ""; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Adopcion obj = new Adopcion();
        public Builder id(Long val) { obj.setId(val); return this; }
        public Builder usuario(Usuario val) { obj.setUsuario(val); return this; }
        public Builder mascota(Mascota val) { obj.setMascota(val); return this; }
        public Builder estado(EstadoAdopcion val) { obj.setEstado(val); return this; }
        public Builder mensaje(String val) { obj.setMensaje(val); return this; }
        public Builder solicitadoEn(LocalDateTime val) { obj.setSolicitadoEn(val); return this; }
        public Builder resueltoEn(LocalDateTime val) { obj.setResueltoEn(val); return this; }
        public Adopcion build() { return obj; }
    }
}
""",
    'src/main/java/com/pawtok/dto/DashboardDTO.java': """package com.pawtok.dto;
import java.util.List;

public class DashboardDTO {
    private long totalSolicitudes;
    private long totalFavoritos;
    private long totalAdoptadas;
    private List<SolicitudDTO> recientes;
    private List<MensajeDTO> mensajes;

    public long getTotalSolicitudes() { return totalSolicitudes; } public void setTotalSolicitudes(long val) { totalSolicitudes = val; }
    public long getTotalFavoritos() { return totalFavoritos; } public void setTotalFavoritos(long val) { totalFavoritos = val; }
    public long getTotalAdoptadas() { return totalAdoptadas; } public void setTotalAdoptadas(long val) { totalAdoptadas = val; }
    public List<SolicitudDTO> getRecientes() { return recientes; } public void setRecientes(List<SolicitudDTO> val) { recientes = val; }
    public List<MensajeDTO> getMensajes() { return mensajes; } public void setMensajes(List<MensajeDTO> val) { mensajes = val; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private DashboardDTO obj = new DashboardDTO();
        public Builder totalSolicitudes(long val) { obj.setTotalSolicitudes(val); return this; }
        public Builder totalFavoritos(long val) { obj.setTotalFavoritos(val); return this; }
        public Builder totalAdoptadas(long val) { obj.setTotalAdoptadas(val); return this; }
        public Builder recientes(List<SolicitudDTO> val) { obj.setRecientes(val); return this; }
        public Builder mensajes(List<MensajeDTO> val) { obj.setMensajes(val); return this; }
        public DashboardDTO build() { return obj; }
    }

    public static class SolicitudDTO {
        private String mascota;
        private String refugio;
        private String estado;
        private String fotoMascota;

        public String getMascota() { return mascota; } public void setMascota(String val) { mascota = val; }
        public String getRefugio() { return refugio; } public void setRefugio(String val) { refugio = val; }
        public String getEstado() { return estado; } public void setEstado(String val) { estado = val; }
        public String getFotoMascota() { return fotoMascota; } public void setFotoMascota(String val) { fotoMascota = val; }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private SolicitudDTO obj = new SolicitudDTO();
            public Builder mascota(String val) { obj.setMascota(val); return this; }
            public Builder refugio(String val) { obj.setRefugio(val); return this; }
            public Builder estado(String val) { obj.setEstado(val); return this; }
            public Builder fotoMascota(String val) { obj.setFotoMascota(val); return this; }
            public SolicitudDTO build() { return obj; }
        }
    }

    public static class MensajeDTO {
        private String remitente;
        private String mensaje;
        private String fecha;

        public String getRemitente() { return remitente; } public void setRemitente(String val) { remitente = val; }
        public String getMensaje() { return mensaje; } public void setMensaje(String val) { mensaje = val; }
        public String getFecha() { return fecha; } public void setFecha(String val) { fecha = val; }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private MensajeDTO obj = new MensajeDTO();
            public Builder remitente(String val) { obj.setRemitente(val); return this; }
            public Builder mensaje(String val) { obj.setMensaje(val); return this; }
            public Builder fecha(String val) { obj.setFecha(val); return this; }
            public MensajeDTO build() { return obj; }
        }
    }
}
""",
    'src/main/java/com/pawtok/dto/AdopcionDTO.java': """package com.pawtok.dto;
import com.pawtok.model.enums.*;
import java.time.LocalDateTime;
public class AdopcionDTO {
    private Long id;
    private Long usuarioId;
    private String usuarioNombre;
    private Long mascotaId;
    private String mascotaNombre;
    private EstadoAdopcion estado;
    private String mensaje;
    private LocalDateTime solicitadoEn;
    private LocalDateTime resueltoEn;

    public Long getId() { return id; } public void setId(Long val) { id = val; }
    public Long getUsuarioId() { return usuarioId; } public void setUsuarioId(Long val) { usuarioId = val; }
    public String getUsuarioNombre() { return usuarioNombre; } public void setUsuarioNombre(String val) { usuarioNombre = val; }
    public Long getMascotaId() { return mascotaId; } public void setMascotaId(Long val) { mascotaId = val; }
    public String getMascotaNombre() { return mascotaNombre; } public void setMascotaNombre(String val) { mascotaNombre = val; }
    public EstadoAdopcion getEstado() { return estado; } public void setEstado(EstadoAdopcion val) { estado = val; }
    public String getMensaje() { return mensaje; } public void setMensaje(String val) { mensaje = val; }
    public LocalDateTime getSolicitadoEn() { return solicitadoEn; } public void setSolicitadoEn(LocalDateTime val) { solicitadoEn = val; }
    public LocalDateTime getResueltoEn() { return resueltoEn; } public void setResueltoEn(LocalDateTime val) { resueltoEn = val; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private AdopcionDTO obj = new AdopcionDTO();
        public Builder id(Long val) { obj.setId(val); return this; }
        public Builder usuarioId(Long val) { obj.setUsuarioId(val); return this; }
        public Builder usuarioNombre(String val) { obj.setUsuarioNombre(val); return this; }
        public Builder mascotaId(Long val) { obj.setMascotaId(val); return this; }
        public Builder mascotaNombre(String val) { obj.setMascotaNombre(val); return this; }
        public Builder estado(EstadoAdopcion val) { obj.setEstado(val); return this; }
        public Builder mensaje(String val) { obj.setMensaje(val); return this; }
        public Builder solicitadoEn(LocalDateTime val) { obj.setSolicitadoEn(val); return this; }
        public Builder resueltoEn(LocalDateTime val) { obj.setResueltoEn(val); return this; }
        public AdopcionDTO build() { return obj; }
    }
}
""",
    'src/main/java/com/pawtok/dto/MascotaDTO.java': """package com.pawtok.dto;
import com.pawtok.model.enums.*;
import java.time.LocalDateTime;
public class MascotaDTO {
    private Long id;
    private String nombre;
    private String raza;
    private Integer edad;
    private String descripcion;
    private String imagenUrl;
    private CategoriaMascota categoria;
    private EstadoMascota estado;
    private String refugio;
    private LocalDateTime creadoEn;

    public Long getId() { return id; } public void setId(Long val) { id = val; }
    public String getNombre() { return nombre; } public void setNombre(String val) { nombre = val; }
    public String getRaza() { return raza; } public void setRaza(String val) { raza = val; }
    public Integer getEdad() { return edad; } public void setEdad(Integer val) { edad = val; }
    public String getDescripcion() { return descripcion; } public void setDescripcion(String val) { descripcion = val; }
    public String getImagenUrl() { return imagenUrl; } public void setImagenUrl(String val) { imagenUrl = val; }
    public CategoriaMascota getCategoria() { return categoria; } public void setCategoria(CategoriaMascota val) { categoria = val; }
    public EstadoMascota getEstado() { return estado; } public void setEstado(EstadoMascota val) { estado = val; }
    public String getRefugio() { return refugio; } public void setRefugio(String val) { refugio = val; }
    public LocalDateTime getCreadoEn() { return creadoEn; } public void setCreadoEn(LocalDateTime val) { creadoEn = val; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private MascotaDTO obj = new MascotaDTO();
        public Builder id(Long val) { obj.setId(val); return this; }
        public Builder nombre(String val) { obj.setNombre(val); return this; }
        public Builder raza(String val) { obj.setRaza(val); return this; }
        public Builder edad(Integer val) { obj.setEdad(val); return this; }
        public Builder descripcion(String val) { obj.setDescripcion(val); return this; }
        public Builder imagenUrl(String val) { obj.setImagenUrl(val); return this; }
        public Builder categoria(CategoriaMascota val) { obj.setCategoria(val); return this; }
        public Builder estado(EstadoMascota val) { obj.setEstado(val); return this; }
        public Builder refugio(String val) { obj.setRefugio(val); return this; }
        public Builder creadoEn(LocalDateTime val) { obj.setCreadoEn(val); return this; }
        public MascotaDTO build() { return obj; }
    }
}
""",
    'src/main/java/com/pawtok/dto/UsuarioDTO.java': """package com.pawtok.dto;
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
"""
}

for path, content in files.items():
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
