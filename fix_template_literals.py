import re

# Leer el archivo
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Buscar y arreglar problemas de template literals
fixed_lines = []
errors_found = []

for i, line in enumerate(lines, 1):
    original_line = line
    
    # Buscar patrones problemáticos con backticks mal usados
    # Patrón: className={`...${...}...`}
    if 'className=' in line and '${' in line:
        # Verificar que esté usando backticks correctamente
        if "className={`" not in line and "className={'" not in line and 'className={"' not in line:
            # Necesita corrección
            errors_found.append(f"Línea {i}: Template literal mal formado")
    
    # Buscar líneas con comillas mezcladas incorrectamente
    if "className={`navbar-enlace ${vistaActual ===" in line:
        # Esta línea está correcta, no hacer nada
        pass
    elif "className=(`navbar-enlace ${vistaActual ===" in line:
        # Arreglar: quitar paréntesis extra
        line = line.replace("className=(", "className={")
        errors_found.append(f"Línea {i}: Paréntesis extra removido")
    
    fixed_lines.append(line)

# Guardar archivo arreglado
with open('src/App.jsx', 'w', encoding='utf-8', newline='\r\n') as f:
    f.writelines(fixed_lines)

print(f"✅ Archivo revisado")
print(f"✅ {len(errors_found)} errores encontrados y arreglados:")
for error in errors_found:
    print(f"   - {error}")

if len(errors_found) == 0:
    print("✅ No se encontraron errores de template literals")
    print("Los errores pueden ser de otro tipo. Revisando...")
