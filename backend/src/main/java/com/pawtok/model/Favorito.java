package com.pawtok.model;
import com.pawtok.model.enums.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "favoritos")
public class Favorito {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_mascota", nullable = false)
    private Mascota mascota;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion;

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Usuario getUsuario() { return usuario; } public void setUsuario(Usuario usuario) { this.usuario = usuario; }
    public Mascota getMascota() { return mascota; } public void setMascota(Mascota mascota) { this.mascota = mascota; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; } public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
}
