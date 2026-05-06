import os
import re

dirs = ['src/main/java/com/pawtok/model', 'src/main/java/com/pawtok/dto']

for d in dirs:
    if not os.path.exists(d): continue
    for f in os.listdir(d):
        if not f.endswith('.java'): continue
        path = os.path.join(d, f)
        with open(path, 'r', encoding='utf-8') as file: content = file.read()
        
        # skip inner classes for now to keep it simple, or match them carefully.
        # find all private fields.
        fields = re.findall(r'private\s+([A-Za-z0-9_<>\[\]]+)\s+([A-Za-z0-9_]+)\s*;', content)
        
        getters_setters = []
        for type_name, var_name in fields:
            CapName = var_name[0].upper() + var_name[1:]
            
            # getter
            if f'public {type_name} get{CapName}' not in content:
                getters_setters.append(f'    public {type_name} get{CapName}() {{ return this.{var_name}; }}')
            
            # setter
            if f'public void set{CapName}' not in content:
                getters_setters.append(f'    public void set{CapName}({type_name} {var_name}) {{ this.{var_name} = {var_name}; }}')
                
        # Also Adopcion might need getEstadoString
        if f == 'Adopcion.java' and 'public String getEstadoString' not in content:
            getters_setters.append('    public String getEstadoString() { return this.estado != null ? this.estado.name() : ""; }')
            
        if getters_setters:
            methods_str = '\n'.join(getters_setters)
            
            # insert before the last closing brace
            last_brace_idx = content.rfind('}')
            if last_brace_idx != -1:
                content = content[:last_brace_idx] + methods_str + '\n}' + content[last_brace_idx+1:]
            
            with open(path, 'w', encoding='utf-8') as file: file.write(content)

print("Generated getters and setters.")
