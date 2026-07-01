package com.pawtok.controller;

import com.pawtok.dto.UsuarioDTO;
import com.pawtok.model.Direccion;
import com.pawtok.model.Refugio;
import com.pawtok.model.Usuario;
import com.pawtok.repository.DireccionRepository;
import com.pawtok.repository.RefugioRepository;
import com.pawtok.repository.UsuarioRepository;
import com.pawtok.service.FileStorageService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/onboarding")
public class OnboardingController {

    private final UsuarioRepository usuarioRepository;
    private final RefugioRepository refugioRepository;
    private final DireccionRepository direccionRepository;
    private final FileStorageService fileStorageService;

    public OnboardingController(UsuarioRepository usuarioRepository, RefugioRepository refugioRepository, DireccionRepository direccionRepository, FileStorageService fileStorageService) {
        this.usuarioRepository = usuarioRepository;
        this.refugioRepository = refugioRepository;
        this.direccionRepository = direccionRepository;
        this.fileStorageService = fileStorageService;
    }


    @PostMapping(value = "/usuario", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UsuarioDTO> onboardUsuario(
            @RequestParam(value = "foto", required = false) MultipartFile foto,
            @RequestParam(value = "bio", required = false) String bio,
            @RequestParam(value = "telefono", required = false) String telefono) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (foto != null && !foto.isEmpty()) {
            String fotoUrl = fileStorageService.storeFile(foto);
            usuario.setFoto(fotoUrl);
        }

        if (telefono != null) {
            usuario.setTelefono(telefono);
        }

        if (bio != null) {
            usuario.setBio(bio);
        }

        usuario = usuarioRepository.save(usuario);

        UsuarioDTO dto = UsuarioDTO.builder()
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .rol(usuario.getRol())
                .creadoEn(usuario.getCreadoEn())
                .foto(usuario.getFoto())
                .telefono(usuario.getTelefono())
                .bio(usuario.getBio())
                .build();

        return ResponseEntity.ok(dto);
    }

    @PostMapping(value = "/refugio", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> onboardRefugio(
            @RequestParam(value = "logo", required = false) MultipartFile logo,
            @RequestParam("certificado") MultipartFile certificado,
            @RequestParam("documentoRepresentante") MultipartFile documentoRepresentante,
            @RequestParam(value = "fotosLugar", required = false) List<MultipartFile> fotosLugar,
            @RequestParam("nombre") String nombre,
            @RequestParam("direccion") String direccionStr,
            @RequestParam("ciudad") String ciudad,
            @RequestParam("telefono") String telefono,
            @RequestParam("email") String emailRefugio,
            @RequestParam("descripcion") String descripcion,
            @RequestParam(value = "redesSociales", required = false, defaultValue = "") String redesSociales,
            @RequestParam(value = "horario", required = false, defaultValue = "") String horario) {

        String emailAuth = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByEmail(emailAuth)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Refugio refugio = new Refugio();
        refugio.setIdUsuario(usuario.getId());
        refugio.setNombre(nombre);
        refugio.setDireccion(direccionStr);
        refugio.setTelefono(telefono);
        refugio.setEmail(emailRefugio);
        refugio.setDescripcion(descripcion);
        refugio.setRedesSociales(redesSociales);
        refugio.setHorario(horario);
        refugio.setEstadoVerificacion("Pendiente");

        if (logo != null && !logo.isEmpty()) {
            refugio.setLogoUrl(fileStorageService.storeFile(logo));
        }
        if (certificado != null && !certificado.isEmpty()) {
            refugio.setCertificadoUrl(fileStorageService.storeFile(certificado));
        }
        if (documentoRepresentante != null && !documentoRepresentante.isEmpty()) {
            refugio.setDocumentoRepresentanteUrl(fileStorageService.storeFile(documentoRepresentante));
        }

        if (fotosLugar != null && !fotosLugar.isEmpty()) {
            String fotosUrls = fotosLugar.stream()
                    .filter(f -> f != null && !f.isEmpty())
                    .map(fileStorageService::storeFile)
                    .collect(Collectors.joining(","));
            refugio.setFotosLugarUrl(fotosUrls);
        }

        refugio = refugioRepository.save(refugio);

        Direccion dir = new Direccion();
        dir.setIdRefugio(refugio.getId());
        dir.setCiudad(ciudad);
        dir.setDireccion(direccionStr);
        direccionRepository.save(dir);

        usuario.setRol(com.pawtok.model.enums.Rol.PENDIENTE_REFUGIO);
        usuarioRepository.save(usuario);

        return ResponseEntity.ok(Map.of("message", "Refugio registrado exitosamente."));
    }
}
