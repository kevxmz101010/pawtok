import os
import re
import shutil

src_dir = "src/main/java/com/pawtok"

# Delete dao and database folders
dao_dir = os.path.join(src_dir, "dao")
db_dir = os.path.join(src_dir, "database")
if os.path.exists(dao_dir): shutil.rmtree(dao_dir)
if os.path.exists(db_dir): shutil.rmtree(db_dir)

# Revert controllers and services
for root, dirs, files in os.walk(src_dir):
    for f_name in files:
        if not f_name.endswith('.java'): continue
        if 'DAO' in f_name: continue # already deleted
        
        file_path = os.path.join(root, f_name)
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        orig = content
        
        # Replace DAO with Repository
        content = re.sub(r'import com\.pawtok\.dao\.([A-Za-z]+)DAO;', r'import com.pawtok.repository.\1Repository;', content)
        content = re.sub(r'([A-Z][A-Za-z0-9_]*)DAO\b', r'\1Repository', content)
        content = re.sub(r'([a-z][A-Za-z0-9_]*)DAO\b', r'\1Repository', content)
        
        # We also removed @RequiredArgsConstructor. Let's just put it back.
        # But wait, removing the manual constructors is harder via regex.
        # Actually, Spring supports constructor injection automatically, so keeping the manual constructors is perfectly valid Spring Boot! We don't need to revert the constructors.
        
        # But wait, did I change any method names? I might have.
        # Let's see if there are any `dao` words left.
        
        if orig != content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)

print("Reverted DAOs back to Repositories.")
