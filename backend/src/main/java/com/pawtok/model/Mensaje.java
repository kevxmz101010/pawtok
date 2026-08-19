package com.pawtok.model;
import com.pawtok.model.enums.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "mensajes")
public class Mensaje {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_remitente", nullable = false)
    private Usuario remitente;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_destinatario", nullable = false)
    private Usuario receptor;

    @Column(name = "mensaje", columnDefinition = "TEXT")
    private String contenido;

    @Column(name = "fecha")
    private LocalDateTime fechaEnvio;
    private Boolean leido = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_adopcion")
    private Adopcion adopcion;

    @Column(name = "archivo_url")
    private String archivoUrl;

        public String getMensaje() { return contenido; }
    public java.time.LocalDateTime getFecha() { return fechaEnvio; }

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public Usuario getRemitente() { return remitente; } public void setRemitente(Usuario remitente) { this.remitente = remitente; }
    public Usuario getReceptor() { return receptor; } public void setReceptor(Usuario receptor) { this.receptor = receptor; }
    public String getContenido() { return contenido; } public void setContenido(String contenido) { this.contenido = contenido; }
    public LocalDateTime getFechaEnvio() { return fechaEnvio; } public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }
    public Boolean getLeido() { return leido; } public void setLeido(Boolean leido) { this.leido = leido; }
    public Adopcion getAdopcion() { return adopcion; } public void setAdopcion(Adopcion adopcion) { this.adopcion = adopcion; }
    public String getArchivoUrl() { return archivoUrl; } public void setArchivoUrl(String archivoUrl) { this.archivoUrl = archivoUrl; }
}
