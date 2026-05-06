package com.pawtok.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path fileStorageLocation;

    public FileStorageService() {
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("No se pudo crear el directorio donde se subirán los archivos.", ex);
        }
    }

    public String storeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

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

    public String storeBase64File(String base64String) {
        if (!StringUtils.hasText(base64String)) {
            return null;
        }

        try {
            // Strip the data:image/png;base64, prefix if present
            String[] parts = base64String.split(",");
            String base64Data = parts.length > 1 ? parts[1] : parts[0];
            
            // Determine extension from header or default to png
            String extension = ".png";
            if (parts.length > 1) {
                if (parts[0].contains("jpeg") || parts[0].contains("jpg")) extension = ".jpg";
                else if (parts[0].contains("webp")) extension = ".webp";
            }

            byte[] decodedBytes = java.util.Base64.getDecoder().decode(base64Data);
            String newFileName = UUID.randomUUID().toString() + extension;
            Path targetLocation = this.fileStorageLocation.resolve(newFileName);
            Files.write(targetLocation, decodedBytes);

            return newFileName;
        } catch (Exception ex) {
            throw new RuntimeException("No se pudo guardar la imagen base64", ex);
        }
    }
}
