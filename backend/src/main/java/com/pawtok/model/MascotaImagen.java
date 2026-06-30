package com.pawtok.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "mascota_imagenes")
public class MascotaImagen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_imagen")
    private Long idImagen;

    @Column(name = "id_mascota")
    private Long idMascota;

    @Column(name = "nombre_archivo")
    private String nombreArchivo;

    @Column(name = "orden_img")
    private Integer ordenImg = 0;

    @Column(name = "fecha_subida")
    private LocalDateTime fechaSubida;

    @Column(name = "activo")
    private boolean activo = true;
}
