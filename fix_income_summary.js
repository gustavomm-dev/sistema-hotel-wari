const fs = require('fs');

// Read file with error handling
let content;
try {
    content = fs.readFileSync('src/App.jsx', 'utf8');
} catch (err) {
    console.error('Error reading file:', err);
    process.exit(1);
}

const lines = content.split('\n');
console.log(`Total lines: ${lines.length}`);

// Find the income summary section
let startIdx = null;
let endIdx = null;

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.includes('Sección de Resumen de Ingresos') ||
        (line.includes('Secci') && line.includes('Resumen'))) {
        startIdx = i;
        console.log(`Found start at line ${i + 1}: ${line.substring(0, 60)}`);
    }

    if (startIdx !== null && endIdx === null) {
        if (line.includes("usuarioActual?.rol === 'recepcionista'") && i > startIdx) {
            endIdx = i;
            console.log(`Found end at line ${i + 1}: ${line.substring(0, 60)}`);
            break;
        }
    }
}

if (startIdx !== null && endIdx !== null) {
    console.log(`\nIncome summary section: lines ${startIdx + 1} to ${endIdx}`);

    // Get indentation from the start line
    const indentMatch = lines[startIdx].match(/^(\s*)/);
    const indent = indentMatch ? indentMatch[1] : '          ';

    // Create new content
    const before = lines.slice(0, startIdx);
    const section = lines.slice(startIdx, endIdx);
    const after = lines.slice(endIdx);

    const newLines = [
        ...before,
        `${indent}{usuarioActual?.rol === 'administrador' && (`,
        ...section,
        `${indent})}`,
        '',
        ...after
    ];

    // Write back
    fs.writeFileSync('src/App.jsx', newLines.join('\n'), 'utf8');

    console.log('\n✓ Successfully modified App.jsx');
    console.log('✓ Income summary is now only visible to administrators');
    console.log('✓ Receptionists will not see the income summary section');
} else {
    console.log('\nCould not find section boundaries');
    console.log(`startIdx: ${startIdx}, endIdx: ${endIdx}`);

    // Debug: show lines around 837
    console.log('\nLines 835-865:');
    for (let i = 834; i < 865 && i < lines.length; i++) {
        console.log(`${i + 1}: ${lines[i].substring(0, 80)}`);
    }
}
