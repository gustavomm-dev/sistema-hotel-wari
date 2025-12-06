import re

# Leer el archivo
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Eliminar líneas 904-910 (el botón duplicado con error)
# En Python, los índices son 0-based, así que línea 904 = índice 903
output = lines[:903] + lines[910:]

# Buscar y eliminar otras posibles duplicaciones de tarjetas de dashboard
# Buscar tarjetas duplicadas de "Usos Diarios en el Hotel"
in_amenities_card = False
amenities_card_count = 0
final_output = []

for i, line in enumerate(output):
    # Detectar inicio de tarjeta de amenities
    if 'onClick={() => setVistaActual(\'amenities\')}' in line or 'onClick={() => setVistaActual("amenities")}' in line:
        amenities_card_count += 1
        # Si es la segunda o más, marcar para saltar
        if amenities_card_count > 2:  # Permitir máximo 2 (menú y dashboard)
            in_amenities_card = True
            continue
    
    # Si estamos saltando una tarjeta, buscar el cierre
    if in_amenities_card:
        if '</div>' in line and 'tarjeta-menu' not in line:
            in_amenities_card = False
        continue
    
    final_output.append(line)

# Guardar
with open('src/App.jsx', 'w', encoding='utf-8', newline='\r\n') as f:
    f.writelines(final_output)

print(f"✅ Duplicados eliminados")
print(f"✅ Archivo reducido de {len(lines)} a {len(final_output)} líneas")
print(f"✅ {len(lines) - len(final_output)} líneas eliminadas")
