package com.pawtok.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletRequest;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
public class FileViewController {

    @GetMapping(value = {"/api/files/**", "/api/files/uploads/**", "/uploads/uploads/**"})
    public ResponseEntity<Resource> serveFiles(HttpServletRequest request) {
        String requestUri = request.getRequestURI();
        
        // Extraer nombre de archivo o ruta interna eliminando prefijos
        String relative = requestUri.replaceFirst("^/api/files/?", "");
        while (relative.startsWith("/") || relative.startsWith("uploads/")) {
            relative = relative.replaceFirst("^/+", "");
            relative = relative.replaceFirst("^uploads/+", "");
        }
        if (relative.isBlank()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        // Prevenir directory traversal
        relative = Paths.get(relative).getFileName().toString();

        Path filePath = Paths.get("uploads", relative).toAbsolutePath().normalize();
        File file = filePath.toFile();

        if (!file.exists()) {
            filePath = Paths.get("backend", "uploads", relative).toAbsolutePath().normalize();
            file = filePath.toFile();
        }

        if (!file.exists() || !file.isFile()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        try {
            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                String lower = relative.toLowerCase();
                if (lower.endsWith(".png")) contentType = "image/png";
                else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) contentType = "image/jpeg";
                else if (lower.endsWith(".webp")) contentType = "image/webp";
                else if (lower.endsWith(".pdf")) contentType = "application/pdf";
                else contentType = "application/octet-stream";
            }

            Resource resource = new FileSystemResource(file);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .body(resource);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
