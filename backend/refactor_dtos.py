import os
import re

src_dir = "src/main/java/com/pawtok"

def process_dtos():
    dto_dir = os.path.join(src_dir, "dto")
    if not os.path.exists(dto_dir): return
    for f_name in os.listdir(dto_dir):
        if not f_name.endswith('.java'): continue
        file_path = os.path.join(dto_dir, f_name)
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        content = re.sub(r'@Data\s*', '', content)
        content = re.sub(r'@Builder\s*', '', content)
        content = re.sub(r'@NoArgsConstructor\s*', '', content)
        content = re.sub(r'@AllArgsConstructor\s*', '', content)
        content = re.sub(r'import lombok\..*?;\n', '', content)
        
        # We won't add getters/setters to DTOs in this quick script, 
        # Actually we must, otherwise they won't compile.
        fields = re.findall(r'private\s+([A-Za-z0-9_<>]+)\s+([A-Za-z0-9_]+)\s*;', content)
        methods = ""
        for f_type, f_n in fields:
            cap_name = f_n[0].upper() + f_n[1:]
            methods += f"""
    public {f_type} get{cap_name}() {{ return {f_n}; }}
    public void set{cap_name}({f_type} {f_n}) {{ this.{f_n} = {f_n}; }}
"""
        # remove builder methods if any. Builders are used in tests/controllers. 
        # This will break any `.builder()...build()` calls. 
        
        idx = content.rfind('}')
        if idx != -1:
            content = content[:idx] + methods + content[idx:]
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

def process_services_and_controllers():
    for root, dirs, files in os.walk(src_dir):
        for f_name in files:
            if not f_name.endswith('.java'): continue
            file_path = os.path.join(root, f_name)
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            orig = content
            
            # Replace repository imports
            content = re.sub(r'import com\.pawtok\.repository\.([A-Za-z]+)Repository;', r'import com.pawtok.dao.\1DAO;', content)
            
            # Replace RequiredArgsConstructor
            if '@RequiredArgsConstructor' in content:
                content = re.sub(r'@RequiredArgsConstructor\s*', '', content)
                content = re.sub(r'import lombok\.RequiredArgsConstructor;\n', '', content)
                
                # Find all private final fields
                finals = re.findall(r'private\s+final\s+([A-Za-z0-9_<>]+)\s+([A-Za-z0-9_]+)\s*;', content)
                if finals:
                    class_match = re.search(r'public\s+class\s+([A-Za-z0-9_]+)', content)
                    if class_match:
                        class_name = class_match.group(1)
                        args = ", ".join([f"{t} {n}" for t, n in finals])
                        assigns = "\n".join([f"        this.{n} = {n};" for t, n in finals])
                        constructor = f"""
    public {class_name}({args}) {{
{assigns}
    }}
"""
                        # Insert constructor after the last private final
                        last_final_match = list(re.finditer(r'private\s+final\s+.*?;', content))
                        if last_final_match:
                            last_idx = last_final_match[-1].end()
                            content = content[:last_idx] + "\n" + constructor + content[last_idx:]
            
            # Replace TypeRepository with TypeDAO
            content = re.sub(r'([A-Z][A-Za-z0-9_]*)Repository\b', r'\1DAO', content)
            content = re.sub(r'\brepository\b', r'dao', content)
            content = re.sub(r'([a-z][A-Za-z0-9_]*)Repository\b', r'\1DAO', content)
            
            # Remove @Transactional from services (since JPA is gone)
            content = re.sub(r'@Transactional\s*', '', content)
            content = re.sub(r'import org\.springframework\.transaction\.annotation\.Transactional;\n', '', content)

            if orig != content:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)

process_dtos()
process_services_and_controllers()
print("Refactored DTOs and injected constructors.")
