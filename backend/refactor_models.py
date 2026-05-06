import os
import re

model_dir = "src/main/java/com/pawtok/model"
dao_dir = "src/main/java/com/pawtok/dao"
repo_dir = "src/main/java/com/pawtok/repository"
os.makedirs(dao_dir, exist_ok=True)

models = ["Usuario", "Mascota", "Adopcion", "Favorito", "Refugio", "Direccion"]

def to_camel_case(snake_str):
    components = snake_str.split('_')
    return components[0] + ''.join(x.title() for x in components[1:])

def capitalize(s):
    return s[0].upper() + s[1:] if s else s

# Parse existing models
for model in models:
    file_path = os.path.join(model_dir, f"{model}.java")
    if not os.path.exists(file_path): continue
    
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Strip JPA annotations
    content = re.sub(r'@Entity\s*', '', content)
    content = re.sub(r'@Table\([^)]*\)\s*', '', content)
    content = re.sub(r'@Data\s*', '', content)
    content = re.sub(r'@NoArgsConstructor\s*', '', content)
    content = re.sub(r'@AllArgsConstructor\s*', '', content)
    content = re.sub(r'@Builder\s*', '', content)
    content = re.sub(r'@Id\s*', '', content)
    content = re.sub(r'@GeneratedValue\([^)]*\)\s*', '', content)
    content = re.sub(r'@Column\([^)]*\)\s*', '', content)
    content = re.sub(r'@Enumerated\([^)]*\)\s*', '', content)
    content = re.sub(r'@ManyToOne\([^)]*\)\s*', '', content)
    content = re.sub(r'@JoinColumn\([^)]*\)\s*', '', content)
    content = re.sub(r'@PrePersist\s*', '', content)
    content = re.sub(r'@PreUpdate\s*', '', content)
    content = re.sub(r'@Transient\s*', '', content)
    content = re.sub(r'import jakarta\.persistence\.\*;\n', '', content)
    content = re.sub(r'import lombok\..*?;\n', '', content)
    
    # Extract fields
    fields = re.findall(r'private\s+([A-Za-z0-9_<>]+)\s+([A-Za-z0-9_]+)\s*;', content)
    
    # Add getters and setters
    methods = ""
    for f_type, f_name in fields:
        cap_name = capitalize(f_name)
        methods += f"""
    public {f_type} get{cap_name}() {{
        return {f_name};
    }}

    public void set{cap_name}({f_type} {f_name}) {{
        this.{f_name} = {f_name};
    }}
"""
    
    # Insert methods before last brace
    idx = content.rfind('}')
    if idx != -1:
        content = content[:idx] + methods + content[idx:]
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Refactored {model}")

print("Done refactoring models.")
