import os
import re

models = ["Usuario", "Mascota", "Adopcion", "Favorito", "Refugio", "Direccion"]
model_dir = "src/main/java/com/pawtok/model"
dao_dir = "src/main/java/com/pawtok/dao"

def camel_to_snake(name):
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

def capitalize(s):
    return s[0].upper() + s[1:] if s else s

type_mapping = {
    "String": ("getString", "setString"),
    "Long": ("getLong", "setLong"),
    "Integer": ("getInt", "setInt"),
    "LocalDateTime": ("getTimestamp", "setTimestamp"),
    "CategoriaMascota": ("getString", "setString"), # enums stored as string
    "EstadoMascota": ("getString", "setString"),
    "EstadoAdopcion": ("getString", "setString"),
    "Rol": ("getString", "setString")
}

for model in models:
    file_path = os.path.join(model_dir, f"{model}.java")
    if not os.path.exists(file_path): continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    fields = re.findall(r'private\s+([A-Za-z0-9_<>]+)\s+([A-Za-z0-9_]+)\s*;', content)
    
    table_name = model.lower() + "s"
    if model == "Adopcion": table_name = "adopciones"
    if model == "Direccion": table_name = "direcciones"
    
    # Generate Map
    map_code = ""
    for f_type, f_name in fields:
        col_name = camel_to_snake(f_name)
        if col_name == "id_rol": col_name = "id_rol"
        getter, _ = type_mapping.get(f_type, ("getObject", "setObject"))
        
        if f_type == "LocalDateTime":
            map_code += f"        if (rs.getTimestamp(\"{col_name}\") != null) entity.set{capitalize(f_name)}(rs.getTimestamp(\"{col_name}\").toLocalDateTime());\n"
        elif f_type in ["CategoriaMascota", "EstadoMascota", "EstadoAdopcion", "Rol"]:
            map_code += f"        if (rs.getString(\"{col_name}\") != null) entity.set{capitalize(f_name)}(com.pawtok.model.enums.{f_type}.valueOf(rs.getString(\"{col_name}\")));\n"
        else:
            map_code += f"        entity.set{capitalize(f_name)}(rs.{getter}(\"{col_name}\"));\n"

    # Generate Insert
    cols = []
    qs = []
    set_code = ""
    idx = 1
    for f_type, f_name in fields:
        if f_name == "id": continue
        cols.append(camel_to_snake(f_name))
        qs.append("?")
        _, setter = type_mapping.get(f_type, ("setObject", "setObject"))
        
        if f_type == "LocalDateTime":
            set_code += f"            stmt.setTimestamp({idx}, entity.get{capitalize(f_name)}() != null ? Timestamp.valueOf(entity.get{capitalize(f_name)}()) : null);\n"
        elif f_type in ["CategoriaMascota", "EstadoMascota", "EstadoAdopcion", "Rol"]:
            set_code += f"            stmt.setString({idx}, entity.get{capitalize(f_name)}() != null ? entity.get{capitalize(f_name)}().name() : null);\n"
        else:
            set_code += f"            stmt.{setter}({idx}, entity.get{capitalize(f_name)}());\n"
        idx += 1
        
    insert_sql = f"INSERT INTO {table_name} ({', '.join(cols)}) VALUES ({', '.join(qs)})"

    dao_content = f"""package com.pawtok.dao;

import com.pawtok.database.Conexion;
import com.pawtok.model.{model};
import org.springframework.stereotype.Repository;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class {model}DAO {{

    private final Conexion conexion;

    public {model}DAO(Conexion conexion) {{
        this.conexion = conexion;
    }}

    public List<{model}> findAll() {{
        List<{model}> list = new ArrayList<>();
        String sql = "SELECT * FROM {table_name}";
        try (Connection conn = conexion.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {{
            while (rs.next()) {{
                list.add(mapResultSetToEntity(rs));
            }}
        }} catch (SQLException e) {{
            e.printStackTrace();
        }}
        return list;
    }}

    public Optional<{model}> findById(Long id) {{
        String sql = "SELECT * FROM {table_name} WHERE id = ?";
        if("{model}" == "Usuario") sql = "SELECT * FROM {table_name} WHERE id_usuario = ?";
        if("{model}" == "Refugio") sql = "SELECT * FROM {table_name} WHERE id_refugio = ?";
        
        try (Connection conn = conexion.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {{
            stmt.setLong(1, id);
            try (ResultSet rs = stmt.executeQuery()) {{
                if (rs.next()) {{
                    return Optional.of(mapResultSetToEntity(rs));
                }}
            }}
        }} catch (SQLException e) {{
            e.printStackTrace();
        }}
        return Optional.empty();
    }}

    public {model} save({model} entity) {{
        if (entity.getId() == null) {{
            String sql = "{insert_sql}";
            try (Connection conn = conexion.getConnection();
                 PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {{
{set_code}
                stmt.executeUpdate();
                try (ResultSet rs = stmt.getGeneratedKeys()) {{
                    if (rs.next()) {{
                        entity.setId(rs.getLong(1));
                    }}
                }}
            }} catch (SQLException e) {{
                e.printStackTrace();
            }}
        }} else {{
            // Update logic (simplified for script)
        }}
        return entity;
    }}

    public void deleteById(Long id) {{
        String sql = "DELETE FROM {table_name} WHERE id = ?";
        try (Connection conn = conexion.getConnection();
             PreparedStatement stmt = conn.prepareStatement(sql)) {{
            stmt.setLong(1, id);
            stmt.executeUpdate();
        }} catch (SQLException e) {{
            e.printStackTrace();
        }}
    }}
    
    public boolean existsById(Long id) {{
        return findById(id).isPresent();
    }}

    private {model} mapResultSetToEntity(ResultSet rs) throws SQLException {{
        {model} entity = new {model}();
{map_code}
        return entity;
    }}
}}
"""
    
    with open(os.path.join(dao_dir, f"{model}DAO.java"), 'w', encoding='utf-8') as f:
        f.write(dao_content)

print("Generated DAOs with Advanced Mapping.")
