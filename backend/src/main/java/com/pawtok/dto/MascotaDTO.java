package com.pawtok.dto;

import com.pawtok.model.enums.*;
import java.time.LocalDateTime;
import java.util.List;

public class MascotaDTO {
    private Long id;
    private String nombre;
    private String raza;
    private String edad;
    private String descripcion;
    private String imagenUrl;
    private CategoriaMascota categoria;
    private EstadoMascota estado;
    private String refugio;
    private String refugioNombre;
    private LocalDateTime creadoEn;
    
    // Additional fields
    private String peso;
    private String tamano;
    private String energia;
    private String conNinos;
    private String personalidad;
    private String origen;
    private List<String> galeria;
    private String ubicacion;

    public Long getId() { return id; } public void setId(Long val) { id = val; }
    public String getNombre() { return nombre; } public void setNombre(String val) { nombre = val; }
    public String getRaza() { return raza; } public void setRaza(String val) { raza = val; }
    public String getEdad() { return edad; } public void setEdad(String val) { edad = val; }
    public String getDescripcion() { return descripcion; } public void setDescripcion(String val) { descripcion = val; }
    public String getImagenUrl() { return imagenUrl; } public void setImagenUrl(String val) { imagenUrl = val; }
    public CategoriaMascota getCategoria() { return categoria; } public void setCategoria(CategoriaMascota val) { categoria = val; }
    public EstadoMascota getEstado() { return estado; } public void setEstado(EstadoMascota val) { estado = val; }
    public String getRefugio() { return refugio; } public void setRefugio(String val) { refugio = val; }
    public String getRefugioNombre() { return refugioNombre; } public void setRefugioNombre(String val) { refugioNombre = val; }
    public LocalDateTime getCreadoEn() { return creadoEn; } public void setCreadoEn(LocalDateTime val) { creadoEn = val; }
    
    public String getPeso() { return peso; } public void setPeso(String val) { peso = val; }
    public String getTamano() { return tamano; } public void setTamano(String val) { tamano = val; }
    public String getEnergia() { return energia; } public void setEnergia(String val) { energia = val; }
    public String getConNinos() { return conNinos; } public void setConNinos(String val) { conNinos = val; }
    public String getPersonalidad() { return personalidad; } public void setPersonalidad(String val) { personalidad = val; }
    public String getOrigen() { return origen; } public void setOrigen(String val) { origen = val; }
    public List<String> getGaleria() { return galeria; } public void setGaleria(List<String> val) { galeria = val; }
    public String getUbicacion() { return ubicacion; } public void setUbicacion(String val) { ubicacion = val; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private MascotaDTO obj = new MascotaDTO();
        public Builder id(Long val) { obj.setId(val); return this; }
        public Builder nombre(String val) { obj.setNombre(val); return this; }
        public Builder raza(String val) { obj.setRaza(val); return this; }
        public Builder edad(String val) { obj.setEdad(val); return this; }
        public Builder descripcion(String val) { obj.setDescripcion(val); return this; }
        public Builder imagenUrl(String val) { obj.setImagenUrl(val); return this; }
        public Builder categoria(CategoriaMascota val) { obj.setCategoria(val); return this; }
        public Builder estado(EstadoMascota val) { obj.setEstado(val); return this; }
        public Builder refugio(String val) { obj.setRefugio(val); return this; }
        public Builder refugioNombre(String val) { obj.setRefugioNombre(val); return this; }
        public Builder creadoEn(LocalDateTime val) { obj.setCreadoEn(val); return this; }
        
        public Builder peso(String val) { obj.setPeso(val); return this; }
        public Builder tamano(String val) { obj.setTamano(val); return this; }
        public Builder energia(String val) { obj.setEnergia(val); return this; }
        public Builder conNinos(String val) { obj.setConNinos(val); return this; }
        public Builder personalidad(String val) { obj.setPersonalidad(val); return this; }
        public Builder origen(String val) { obj.setOrigen(val); return this; }
        public Builder galeria(List<String> val) { obj.setGaleria(val); return this; }
        public Builder ubicacion(String val) { obj.setUbicacion(val); return this; }
        
        public MascotaDTO build() { return obj; }
    }
}
