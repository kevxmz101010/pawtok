import os
import shutil

base_path = "C:/Users/Aprendiz/Documents/drops-hero-section/backend/src/main/java/com/pawtok"
model_path = os.path.join(base_path, "model")

# 1. Delete duplicate enums from model/
enums_to_delete = ["CategoriaMascota.java", "EstadoAdopcion.java", "EstadoMascota.java", "Rol.java"]
for e in enums_to_delete:
    p = os.path.join(model_path, e)
    if os.path.exists(p):
        os.remove(p)
        print(f"Deleted old enum: {p}")

# 2. Replace old imports in all java files and ensure classes in com.pawtok.model import the enums
for root, dirs, files in os.walk(base_path):
    for f in files:
        if f.endswith(".java"):
            filepath = os.path.join(root, f)
            with open(filepath, "r", encoding="utf-8") as file:
                content = file.read()
                
            new_content = content
            
            # Replace explicit imports
            replacements = {
                "import com.pawtok.model.CategoriaMascota;": "import com.pawtok.model.enums.CategoriaMascota;",
                "import com.pawtok.model.EstadoMascota;": "import com.pawtok.model.enums.EstadoMascota;",
                "import com.pawtok.model.EstadoAdopcion;": "import com.pawtok.model.enums.EstadoAdopcion;",
                "import com.pawtok.model.Rol;": "import com.pawtok.model.enums.Rol;"
            }
            
            for old, new in replacements.items():
                new_content = new_content.replace(old, new)
                
            # If the file is in com.pawtok.model and uses enums, it might need import com.pawtok.model.enums.*
            if "package com.pawtok.model;" in new_content and "import com.pawtok.model.enums" not in new_content:
                # add import com.pawtok.model.enums.*; after package com.pawtok.model;
                new_content = new_content.replace("package com.pawtok.model;", "package com.pawtok.model;\nimport com.pawtok.model.enums.*;")

            if new_content != content:
                with open(filepath, "w", encoding="utf-8") as file:
                    file.write(new_content)
                print(f"Updated imports in: {filepath}")

print("Fix completed.")
