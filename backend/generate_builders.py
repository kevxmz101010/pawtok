import os
import re

dto_dir = "src/main/java/com/pawtok/dto"

def generate_builders():
    if not os.path.exists(dto_dir): return
    for f_name in os.listdir(dto_dir):
        if not f_name.endswith('.java'): continue
        file_path = os.path.join(dto_dir, f_name)
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Check if Builder already exists
        if "public static class Builder" in content or "public static Builder builder()" in content:
            continue
            
        class_match = re.search(r'public\s+class\s+([A-Za-z0-9_]+)', content)
        if not class_match: continue
        class_name = class_match.group(1)
        
        fields = re.findall(r'private\s+([A-Za-z0-9_<>]+)\s+([A-Za-z0-9_]+)\s*;', content)
        
        builder_code = f"""
    public static Builder builder() {{
        return new Builder();
    }}

    public static class Builder {{
"""
        for f_type, f_n in fields:
            builder_code += f"        private {f_type} {f_n};\n"
            
        for f_type, f_n in fields:
            builder_code += f"""
        public Builder {f_n}({f_type} {f_n}) {{
            this.{f_n} = {f_n};
            return this;
        }}
"""
        
        builder_code += f"""
        public {class_name} build() {{
            {class_name} obj = new {class_name}();
"""
        for _, f_n in fields:
            cap_name = f_n[0].upper() + f_n[1:]
            builder_code += f"            obj.set{cap_name}(this.{f_n});\n"
        
        builder_code += """            return obj;
        }
    }
"""
        
        idx = content.rfind('}')
        if idx != -1:
            content = content[:idx] + builder_code + content[idx:]
            
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)

generate_builders()
print("Builders generated.")
