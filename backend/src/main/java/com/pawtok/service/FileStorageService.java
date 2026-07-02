package com.pawtok.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;
import java.util.Base64;

/**
 * Servicio de Almacenamiento de Archivos (FileStorageService)
 * Este archivo es el responsable de guardar las fotos de los perritos o de los usuarios.
 * Tiene una característica especial: funciona de dos maneras.
 * 1. Local: Si estás probando en tu computadora, guarda las fotos en una carpeta llamada "uploads".
 * 2. Nube: Si detecta la variable CLOUDINARY_URL (en Render), sube las fotos a Cloudinary automáticamente.
 */
@Service
public class FileStorageService {

    private final Path fileStorageLocation; // Ruta de la carpeta local ("uploads")
    private Cloudinary cloudinary; // Objeto para conectarse a Cloudinary
    private final boolean useCloudinary; // Bandera: ¿Estamos usando la nube o local?

    // Constructor: Aquí Spring inyecta la variable CLOUDINARY_URL si existe en tu application.properties o en Render.
    public FileStorageService(@Value("${cloudinary.url:}") String cloudinaryUrl) {
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("No se pudo crear el directorio donde se subirán los archivos.", ex);
        }

        if (StringUtils.hasText(cloudinaryUrl) && !cloudinaryUrl.contains("dummy_key")) {
            this.cloudinary = new Cloudinary(cloudinaryUrl);
            this.useCloudinary = true;
        } else {
            this.useCloudinary = false;
        }
    }

    /**
     * Guarda un archivo MultipartFile (generalmente enviado desde un formulario tradicional).
     * Retorna la URL pública si usó Cloudinary, o la ruta local si lo guardó en tu disco.
     */
    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        if (useCloudinary) {
            try {
                // Sube el archivo a Cloudinary
                Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
                // Extrae la URL segura (https) que Cloudinary generó
                return uploadResult.get("secure_url").toString();
            } catch (IOException ex) {
                throw new RuntimeException("No se pudo subir a Cloudinary", ex);
            }
        } else {
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = "";
            try {
                if (originalFileName.contains(".")) {
                    fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
                }
                String newFileName = UUID.randomUUID().toString() + fileExtension;
                Path targetLocation = this.fileStorageLocation.resolve(newFileName);
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                return "/uploads/" + newFileName;
            } catch (IOException ex) {
                throw new RuntimeException("No se pudo guardar el archivo " + originalFileName, ex);
            }
        }
    }

    /**
     * Guarda una imagen que viene en formato Base64.
     * React, en este proyecto, recorta la imagen y la envía como un string largo (Base64) en lugar de un archivo normal.
     * Este método lee ese string, lo convierte a bytes de imagen real, y lo sube.
     */
    public String storeBase64File(String base64String) {
        if (!StringUtils.hasText(base64String)) {
            return null;
        }

        try {
            String[] parts = base64String.split(",");
            String base64Data = parts.length > 1 ? parts[1] : parts[0];
            
            String extension = ".png";
            if (parts.length > 1) {
                if (parts[0].contains("jpeg") || parts[0].contains("jpg")) extension = ".jpg";
                else if (parts[0].contains("webp")) extension = ".webp";
            }

            byte[] decodedBytes = Base64.getDecoder().decode(base64Data);

            if (useCloudinary) {
                Map uploadResult = cloudinary.uploader().upload(decodedBytes, ObjectUtils.emptyMap());
                return uploadResult.get("secure_url").toString();
            } else {
                String newFileName = UUID.randomUUID().toString() + extension;
                Path targetLocation = this.fileStorageLocation.resolve(newFileName);
                Files.write(targetLocation, decodedBytes);
                return newFileName;
            }
        } catch (Exception ex) {
            throw new RuntimeException("No se pudo guardar la imagen base64", ex);
        }
    }
}
