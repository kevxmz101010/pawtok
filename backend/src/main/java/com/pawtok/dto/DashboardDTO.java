package com.pawtok.dto;
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
        private Long adopcionId;
        private String mascota;
        private String refugio;
        private String estado;
        private String fotoMascota;

        private String mascotaTipo;
        private String mascotaRaza;

        public Long getAdopcionId() { return adopcionId; } public void setAdopcionId(Long val) { adopcionId = val; }
        public String getMascota() { return mascota; } public void setMascota(String val) { mascota = val; }
        public String getRefugio() { return refugio; } public void setRefugio(String val) { refugio = val; }
        public String getEstado() { return estado; } public void setEstado(String val) { estado = val; }
        public String getFotoMascota() { return fotoMascota; } public void setFotoMascota(String val) { fotoMascota = val; }
        public String getMascotaTipo() { return mascotaTipo; } public void setMascotaTipo(String val) { mascotaTipo = val; }
        public String getMascotaRaza() { return mascotaRaza; } public void setMascotaRaza(String val) { mascotaRaza = val; }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private SolicitudDTO obj = new SolicitudDTO();
            public Builder adopcionId(Long val) { obj.setAdopcionId(val); return this; }
            public Builder mascota(String val) { obj.setMascota(val); return this; }
            public Builder refugio(String val) { obj.setRefugio(val); return this; }
            public Builder estado(String val) { obj.setEstado(val); return this; }
            public Builder fotoMascota(String val) { obj.setFotoMascota(val); return this; }
            public Builder mascotaTipo(String val) { obj.setMascotaTipo(val); return this; }
            public Builder mascotaRaza(String val) { obj.setMascotaRaza(val); return this; }
            public SolicitudDTO build() { return obj; }
        }
    }

    public static class MensajeDTO {
        private String remitente;
        private String mensaje;
        private String fecha;
        private Long adopcionId;

        public String getRemitente() { return remitente; } public void setRemitente(String val) { remitente = val; }
        public String getMensaje() { return mensaje; } public void setMensaje(String val) { mensaje = val; }
        public String getFecha() { return fecha; } public void setFecha(String val) { fecha = val; }
        public Long getAdopcionId() { return adopcionId; } public void setAdopcionId(Long val) { adopcionId = val; }

        public static Builder builder() { return new Builder(); }
        public static class Builder {
            private MensajeDTO obj = new MensajeDTO();
            public Builder remitente(String val) { obj.setRemitente(val); return this; }
            public Builder mensaje(String val) { obj.setMensaje(val); return this; }
            public Builder fecha(String val) { obj.setFecha(val); return this; }
            public Builder adopcionId(Long val) { obj.setAdopcionId(val); return this; }
            public MensajeDTO build() { return obj; }
        }
    }
}
