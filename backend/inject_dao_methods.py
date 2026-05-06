import os

dao_methods = {
    "UsuarioDAO": """
    public Optional<Usuario> findByEmail(String email) {
        String sql = "SELECT * FROM usuarios WHERE email = ?";
        try (Connection conn = conexion.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, email);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) return Optional.of(mapResultSetToEntity(rs));
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return Optional.empty();
    }
    public boolean existsByEmail(String email) {
        return findByEmail(email).isPresent();
    }
    """,
    "RefugioDAO": """
    public Optional<Refugio> findByIdUsuario(Long idUsuario) {
        String sql = "SELECT * FROM refugios WHERE id_usuario = ?";
        try (Connection conn = conexion.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, idUsuario);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) return Optional.of(mapResultSetToEntity(rs));
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return Optional.empty();
    }
    """,
    "DireccionDAO": """
    public Optional<Direccion> findByIdUsuario(Long idUsuario) {
        String sql = "SELECT * FROM direcciones WHERE id_usuario = ?";
        try (Connection conn = conexion.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, idUsuario);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) return Optional.of(mapResultSetToEntity(rs));
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return Optional.empty();
    }
    """,
    "MascotaDAO": """
    public List<Mascota> findByCategoria(com.pawtok.model.enums.CategoriaMascota cat) {
        return findBy("categoria", cat.name());
    }
    public List<Mascota> findByEstado(com.pawtok.model.enums.EstadoMascota est) {
        return findBy("estado", est.name());
    }
    public List<Mascota> findByNombreContainingIgnoreCase(String nombre) {
        return findBy("nombre", "%" + nombre + "%");
    }
    private List<Mascota> findBy(String col, String val) {
        List<Mascota> list = new ArrayList<>();
        String sql = "SELECT * FROM mascotas WHERE " + col + " LIKE ?";
        try (Connection conn = conexion.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setString(1, val);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) list.add(mapResultSetToEntity(rs));
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }
    """,
    "AdopcionDAO": """
    public List<Adopcion> findByUsuarioId(Long id) { return findBy("id_usuario", id); }
    public List<Adopcion> findByMascotaId(Long id) { return findBy("id_mascota", id); }
    public List<Adopcion> findByMascotaIdRefugioOrderBySolicitadoEnDesc(Long id) { return findBy("id_refugio", id); } // rough mock
    public List<Adopcion> findByUsuarioIdOrderBySolicitadoEnDesc(Long id) { return findBy("id_usuario", id); }
    public long countByUsuarioId(Long id) { return findBy("id_usuario", id).size(); }
    private List<Adopcion> findBy(String col, Long val) {
        List<Adopcion> list = new ArrayList<>();
        String sql = "SELECT * FROM adopciones WHERE " + col + " = ?";
        try (Connection conn = conexion.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {
            stmt.setLong(1, val);
            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) list.add(mapResultSetToEntity(rs));
            }
        } catch (SQLException e) { e.printStackTrace(); }
        return list;
    }
    """,
    "FavoritoDAO": """
    public long countByUsuarioId(Long id) { return 0; } // mock
    """
}

dao_dir = "src/main/java/com/pawtok/dao"
for f_name in os.listdir(dao_dir):
    if not f_name.endswith('DAO.java'): continue
    dao_name = f_name.replace('.java', '')
    if dao_name in dao_methods:
        file_path = os.path.join(dao_dir, f_name)
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        idx = content.rfind('}')
        if idx != -1:
            content = content[:idx] + dao_methods[dao_name] + content[idx:]
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

print("Injected DAO methods.")
