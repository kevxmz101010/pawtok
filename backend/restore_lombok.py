import os
import re

src_dir = "src/main/java/com/pawtok"

def fix_dtos():
    dto_dir = os.path.join(src_dir, "dto")
    if not os.path.exists(dto_dir): return
    for f_name in os.listdir(dto_dir):
        if not f_name.endswith('.java'): continue
        file_path = os.path.join(dto_dir, f_name)
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Remove manual getters/setters and builders
        content = re.sub(r'public\s+[A-Za-z0-9_<>\[\]]+\s+get[A-Z][A-Za-z0-9_]*\(\)\s*\{[^}]*\}', '', content)
        content = re.sub(r'public\s+void\s+set[A-Z][A-Za-z0-9_]*\([^\)]*\)\s*\{[^}]*\}', '', content)
        content = re.sub(r'public\s+static\s+Builder\s+builder\(\)\s*\{[^}]*\}', '', content)
        content = re.sub(r'public\s+static\s+class\s+Builder\s*\{[^}]*\}', '', content)
        content = re.sub(r'public\s+[A-Za-z0-9_]+\(\)\s*\{\s*\}', '', content) # default constructors
        
        # Remove nested static class Builder (greedy match)
        content = re.sub(r'public\s+static\s+class\s+Builder\s*\{.*?public\s+[A-Za-z0-9_]+\s+build\(\)\s*\{.*?\}\s*\}', '', content, flags=re.DOTALL)

        if "import lombok.Data;" not in content:
            content = content.replace("public class", "import lombok.Data;\nimport lombok.Builder;\nimport lombok.NoArgsConstructor;\nimport lombok.AllArgsConstructor;\n\n@Data\n@Builder\n@NoArgsConstructor\n@AllArgsConstructor\npublic class")
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

def fix_models():
    model_dir = os.path.join(src_dir, "model")
    if not os.path.exists(model_dir): return
    for f_name in os.listdir(model_dir):
        if not f_name.endswith('.java'): continue
        file_path = os.path.join(model_dir, f_name)
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if "import jakarta.persistence" not in content and "@Entity" not in content:
            content = content.replace("public class", "import jakarta.persistence.*;\nimport lombok.Data;\nimport lombok.Builder;\nimport lombok.NoArgsConstructor;\nimport lombok.AllArgsConstructor;\n\n@Entity\n@Table(name = \"" + f_name.lower().replace('.java', 's') + "\")\n@Data\n@Builder\n@NoArgsConstructor\n@AllArgsConstructor\npublic class")
            content = re.sub(r'private\s+Long\s+id;', '@Id\n    @GeneratedValue(strategy = GenerationType.IDENTITY)\n    private Long id;', content)
            
            # Remove manual getters/setters
            content = re.sub(r'public\s+[A-Za-z0-9_<>\[\]]+\s+get[A-Z][A-Za-z0-9_]*\(\)\s*\{[^}]*\}', '', content)
            content = re.sub(r'public\s+void\s+set[A-Z][A-Za-z0-9_]*\([^\)]*\)\s*\{[^}]*\}', '', content)

        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

def fix_usuario():
    file_path = os.path.join(src_dir, "model", "Usuario.java")
    if not os.path.exists(file_path): return
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
        
    if "private String bio;" not in content:
        content = content.replace("}", "    private String bio;\n    private String foto;\n    private String telefono;\n}")
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

fix_dtos()
fix_models()
fix_usuario()
print("Restored Lombok and JPA to DTOs and missed Models.")
