import re

# Leer el archivo
with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Normalizar saltos de línea
content = content.replace('\r\n', '\n')

# Arreglar el problema específico de la línea 198-199
content = re.sub(
    r'(\}, \[mensajes\]\))\n(  // Estado de Usos Diarios)',
    r'\1\n\n\2',
    content
)

# Guardar con saltos de línea Windows
with open('src/App.jsx', 'w', encoding='utf-8', newline='\r\n') as f:
    f.write(content)

print("✅ Archivo normalizado correctamente")
print("✅ Saltos de línea arreglados")
