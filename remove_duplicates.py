import re

# Leer el archivo
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Eliminar botones y tarjetas duplicadas de amenities
output = []
skip_until = 0

for i, line in enumerate(lines):
    # Si estamos en modo skip, saltar hasta la línea indicada
    if i < skip_until:
        continue
    
    # Detectar botón duplicado de amenities (el que tiene el error)
    if i == 903 and '<button' in lines[i+1]:  # Línea 904 (índice 903)
        # Verificar si es el botón duplicado de amenities
        if i+6 < len(lines) and 'Usos Diarios en el Hotel' in lines[i+6]:
            # Saltar las siguientes 7 líneas (el botón completo duplicado)
            skip_until = i + 8
            continue
    
    output.append(line)

# Guardar
with open('src/App.jsx', 'w', encoding='utf-8', newline='\r\n') as f:
    f.writelines(output)

print("✅ Botones duplicados eliminados")
print(f"✅ Archivo reducido de {len(lines)} a {len(output)} líneas")
print(f"✅ {len(lines) - len(output)} líneas eliminadas")
