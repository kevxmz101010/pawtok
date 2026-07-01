package com.pawtok.model;
import com.pawtok.model.enums.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Modelo Mascota (Entidad de Base de Datos)
 * Esta clase es como el "Plano" o "Molde" de una mascota.
 * Le dice a Hibernate (la herramienta de Spring Boot) exactamente cómo debe crear la tabla `mascotas` en MySQL.
 */
@Entity // Indica que esto es una tabla en la BD.
@Table(name = "mascotas") // El nombre exacto de la tabla en MySQL.
public class Mascota {
    // @Id indica que esta es la Llave Primaria (Primary Key). 
    // @GeneratedValue(strategy = GenerationType.IDENTITY) hace que sea Autoincremental (1, 2, 3...).
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Si la columna en SQL se llama diferente que la variable en Java, usamos @Column.
    @Column(name = "id_refugio")
    private Long idRefugio;
    
    private String nombre;
    
    @Column(name = "tipo")
    private String categoriaStr; // We map this to avoid Enum issues, or handle it via getter
    
    private String raza;
    private String edad;
    private String ubicacion;
    
    @Column(columnDefinition = "TEXT") // Permite guardar textos muy largos, no solo 255 caracteres.
    private String descripcion;
    
    @Column(name = "foto")
    private String imagenUrl;
    
    // updatable = false significa que una vez guardada la fecha de creación, nunca más se puede modificar.
    @Column(name = "fecha_publicacion", updatable = false) 
    private LocalDateTime creadoEn;
    
    private String peso;
    private String tamano;
    private String energia;
    
    @Column(name = "con_ninos")
    private String conNinos;
    
    private String personalidad;
    private String origen;
    
    @Column(name = "estado")
    private String estadoStr;
    
    private Boolean disponible;
    
    @Column(columnDefinition = "TEXT")
    private String galeria;

    public Long getId() { return id; } public void setId(Long val) { id = val; }
    public String getNombre() { return nombre; } public void setNombre(String val) { nombre = val; }
    public String getRaza() { return raza; } public void setRaza(String val) { raza = val; }
    public String getEdad() { return edad; } 
    public void setEdad(String val) { edad = val; }
    public String getDescripcion() { return descripcion; } public void setDescripcion(String val) { descripcion = val; }
    public String getImagenUrl() { return imagenUrl; } public void setImagenUrl(String val) { imagenUrl = val; }
    
    public CategoriaMascota getCategoria() { 
        try { return categoriaStr == null ? null : CategoriaMascota.valueOf(categoriaStr.toUpperCase()); } 
        catch (Exception e) { return CategoriaMascota.OTRO; }
    } 
    public void setCategoria(CategoriaMascota val) { categoriaStr = val == null ? null : val.name(); }
    
    public EstadoMascota getEstado() { 
        if (estadoStr == null) return null;
        if (estadoStr.equalsIgnoreCase("Disponible")) return EstadoMascota.DISPONIBLE;
        if (estadoStr.equalsIgnoreCase("Adoptado")) return EstadoMascota.ADOPTADO;
        return EstadoMascota.DISPONIBLE;
    } 
    public void setEstado(EstadoMascota val) { 
        if (val == null) estadoStr = null;
        else if (val == EstadoMascota.DISPONIBLE) estadoStr = "Disponible";
        else if (val == EstadoMascota.ADOPTADO) estadoStr = "Adoptado";
    }
    
    public String getRefugio() { return idRefugio == null ? null : idRefugio.toString(); } 
    public void setRefugio(String val) { 
        try { idRefugio = val == null ? null : Long.parseLong(val); } catch(Exception e) {} 
    }
    public LocalDateTime getCreadoEn() { return creadoEn; } public void setCreadoEn(LocalDateTime val) { creadoEn = val; }
    public Long getIdRefugio() { return idRefugio; }
    
    public String getUbicacion() { return ubicacion; } public void setUbicacion(String ubicacion) { this.ubicacion = ubicacion; }
    public String getPeso() { return peso; } public void setPeso(String peso) { this.peso = peso; }
    public String getTamano() { return tamano; } public void setTamano(String tamano) { this.tamano = tamano; }
    public String getEnergia() { return energia; } public void setEnergia(String energia) { this.energia = energia; }
    public String getConNinos() { return conNinos; } public void setConNinos(String conNinos) { this.conNinos = conNinos; }
    public String getPersonalidad() { return personalidad; } public void setPersonalidad(String personalidad) { this.personalidad = personalidad; }
    public String getOrigen() { return origen; } public void setOrigen(String origen) { this.origen = origen; }
    public Boolean getDisponible() { return disponible; } public void setDisponible(Boolean disponible) { this.disponible = disponible; }
    public String getGaleria() { return galeria; } public void setGaleria(String galeria) { this.galeria = galeria; }

    public static Builder builder() { return new Builder(); }
    
    // Método especial que se ejecuta justo antes de guardar la mascota por primera vez en la BD.
    @PrePersist
    protected void onCreate() {
        if (creadoEn == null) {
            creadoEn = LocalDateTime.now(); // Asigna la fecha y hora actual automáticamente.
        }
    }
    
    public static class Builder {
        private Mascota obj = new Mascota();
        public Builder id(Long val) { obj.setId(val); return this; }
        public Builder nombre(String val) { obj.setNombre(val); return this; }
        public Builder raza(String val) { obj.setRaza(val); return this; }
        public Builder edad(String val) { obj.setEdad(val); return this; }
        public Builder descripcion(String val) { obj.setDescripcion(val); return this; }
        public Builder imagenUrl(String val) { obj.setImagenUrl(val); return this; }
        public Builder categoria(CategoriaMascota val) { obj.setCategoria(val); return this; }
        public Builder estado(EstadoMascota val) { obj.setEstado(val); return this; }
        public Builder refugio(String val) { obj.setRefugio(val); return this; }
        public Builder creadoEn(LocalDateTime val) { obj.setCreadoEn(val); return this; }
        public Builder disponible(Boolean val) { obj.setDisponible(val); return this; }
        public Builder peso(String val) { obj.setPeso(val); return this; }
        public Builder tamano(String val) { obj.setTamano(val); return this; }
        public Builder energia(String val) { obj.setEnergia(val); return this; }
        public Builder conNinos(String val) { obj.setConNinos(val); return this; }
        public Builder personalidad(String val) { obj.setPersonalidad(val); return this; }
        public Builder origen(String val) { obj.setOrigen(val); return this; }
        public Builder galeria(String val) { obj.setGaleria(val); return this; }
        public Builder ubicacion(String val) { obj.setUbicacion(val); return this; }
        public Mascota build() { return obj; }
    }
}
