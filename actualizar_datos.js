// Script para actualizar los datos de amenities e inventario en localStorage
// Ejecuta esto en la consola del navegador (F12 > Console)

console.log('🔄 Actualizando datos de amenities e inventario...');

// Nuevos datos de amenities
const nuevosAmenities = [
    { id: 1, nombre: 'Jabones', cantidad: 50 },
    { id: 2, nombre: 'Shampoo', cantidad: 50 },
    { id: 3, nombre: 'Acondicionador', cantidad: 50 },
    { id: 4, nombre: 'Crema corporal', cantidad: 50 },
    { id: 5, nombre: 'Enjuague bucal', cantidad: 50 },
    { id: 6, nombre: 'Kit afeitar', cantidad: 50 },
    { id: 7, nombre: 'Kit cepillo dental', cantidad: 50 }
];

// Nuevos datos de inventario
const nuevoInventario = [
    { id: 1, producto: 'Toallas', categoria: 'Ropa de Cama', cantidad: 25 },
    { id: 2, producto: 'Jabones', categoria: 'Higiene', cantidad: 50 },
    { id: 3, producto: 'Bebidas (Botellas)', categoria: 'Minibar', cantidad: 15 },
    { id: 4, producto: 'Sábanas', categoria: 'Ropa de Cama', cantidad: 8 },
    { id: 5, producto: 'Shampoo', categoria: 'Higiene', cantidad: 50 },
    { id: 6, producto: 'Papel Higiénico', categoria: 'Higiene', cantidad: 30 },
    { id: 7, producto: 'Acondicionador', categoria: 'Higiene', cantidad: 50 },
    { id: 8, producto: 'Crema corporal', categoria: 'Higiene', cantidad: 50 },
    { id: 9, producto: 'Enjuague bucal', categoria: 'Higiene', cantidad: 50 },
    { id: 10, producto: 'Kit afeitar', categoria: 'Higiene', cantidad: 50 },
    { id: 11, producto: 'Kit cepillo dental', categoria: 'Higiene', cantidad: 50 }
];

// Actualizar localStorage
localStorage.setItem('hotel-wari-amenities', JSON.stringify(nuevosAmenities));
localStorage.setItem('hotel-wari-inventario', JSON.stringify(nuevoInventario));

console.log('✅ Datos actualizados correctamente');
console.log('🔄 Recarga la página (F5) para ver los cambios');
