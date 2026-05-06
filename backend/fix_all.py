import os

files = {
    "src/main/java/com/pawtok/model/Usuario.java": """package com.pawtok.model;
import com.pawtok.model.enums.Rol;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    @Column(unique = true) private String email;
    private String contrasena;
    @Enumerated(EnumType.STRING) private Rol rol;
    @CreationTimestamp @Column(updatable = false) private LocalDateTime creadoEn;
    private String bio;
    private String foto;
    private String telefono;
}
""",
    "src/main/java/com/pawtok/model/Refugio.java": """package com.pawtok.model;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "refugios")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Refugio {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nombre;
    private String direccion;
    private String telefono;
    private String email;
    private Long idUsuario;
    private String descripcion;
    private String redesSociales;
    private String horario;
    private String certificadoUrl;
    private String documentoRepresentanteUrl;
    private String fotosLugarUrl;
    private String estadoVerificacion;
    private String logoUrl;
}
""",
    "src/main/java/com/pawtok/dto/RefugioDTO.java": """package com.pawtok.dto;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefugioDTO {
    private Long id;
    private String nombre;
    private String direccion;
    private String telefono;
    private String email;
    private Long idUsuario;
    private String descripcion;
    private String redesSociales;
    private String horario;
    private String certificadoUrl;
    private String documentoRepresentanteUrl;
    private String fotosLugarUrl;
    private String estadoVerificacion;
    private String logoUrl;
}
""",
    "src/main/java/com/pawtok/dto/RegisterRequest.java": """package com.pawtok.dto;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String nombre;
    private String email;
    private String contrasena;
}
""",
    "src/main/java/com/pawtok/dto/LoginRequest.java": """package com.pawtok.dto;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {
    private String email;
    private String contrasena;
}
""",
    "src/main/java/com/pawtok/dto/AdopcionRequest.java": """package com.pawtok.dto;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdopcionRequest {
    private Long mascotaId;
    private String mensaje;
}
""",
    "src/main/java/com/pawtok/dto/AdopcionDto.java": """package com.pawtok.dto;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdopcionDto {
    private Long id;
    private Long mascotaId;
    private String mensaje;
}
""",
    "src/main/java/com/pawtok/dto/UsuarioDTO.java": """package com.pawtok.dto;
import com.pawtok.model.enums.Rol;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioDTO {
    private Long id;
    private String nombre;
    private String email;
    private Rol rol;
    private LocalDateTime creadoEn;
    private String bio;
    private String foto;
    private String telefono;
}
""",
    "src/main/java/com/pawtok/dto/DashboardDTO.java": """package com.pawtok.dto;
import lombok.*;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private long totalSolicitudes;
    private long totalFavoritos;
    private long totalAdoptadas;
    private List<SolicitudDTO> recientes;
    private List<MensajeDTO> mensajes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SolicitudDTO {
        private String mascota;
        private String refugio;
        private String estado;
        private String fotoMascota;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MensajeDTO {
        private String remitente;
        private String mensaje;
        private String fecha;
    }
}
"""
}

for path, content in files.items():
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed broken files.")
