// Importar las dependencias necesarias
const express = require('express'); // Framework para crear aplicaciones web en Node.js
const cors = require('cors'); // Middleware para habilitar el intercambio de recursos entre diferentes dominios
const fs = require('fs'); // Módulo de Node.js para interactuar con el sistema de archivos
const path = require('path'); // Módulo de Node.js para trabajar con rutas de archivos
const app = express(); // Crear una instancia de la aplicación Express
const PORT = 3000; // Definir el puerto en el que el servidor escuchará
// Configurar middleware
app.use(cors()); // Habilitar CORS para permitir que el frontend acceda al backend desde diferentes dominios
app.use(express.json()); // Middleware para analizar las solicitudes entrantes con cuerpo JSON
// Ruta para servir el archivo index.html cuando se accede a la raíz
app.get('/', (req, res) => {
// Enviar el archivo index.html como respuesta
res.sendFile(path.join(__dirname, 'index.html'));
});
// Ruta para obtener los items desde el archivo JSON
app.get('/items', (req, res) => {
// Llamar a la función para leer el archivo JSON y devolver los items
leerArchivoJson()
 .then(data => res.json(data)) // Si se lee correctamente, devolver los datos como JSON
 .catch(error => res.status(500).json({ error: 'Error al leer el archivo' }));
// Si hay un error, devolver un mensaje de error
});
// Ruta para agregar un nuevo item a la lista
app.post('/items', (req, res) => {
const { descripcion } = req.body; // Extraer la descripción del item desde el cuerpo de la solicitud
if (!descripcion) {
 // Si la descripción no está presente, devolver un error
 return res.status(400).json({ error: 'Descripción del item es requerida' });
}
const nuevoItem = { id: Date.now(), descripcion }; // Crear un nuevo item con un ID basado en la fecha actual
// Leer el archivo JSON, agregar el nuevo item y escribir el archivo de nuevo
leerArchivoJson()
 .then(data => {
 data.items.push(nuevoItem); // Agregar el nuevo item al array de items
 return escribirArchivoJson(data); // Escribir los datos actualizados en el
archivo
 })
 .then(() => res.json(nuevoItem)) // Devolver el nuevo item como respuesta
 .catch(error => res.status(500).json({ error: 'Error al agregar el item' }));
// Si hay un error, devolver un mensaje de error
});
// Ruta para eliminar un item de la lista
app.delete('/items/:id', (req, res) => {
const { id } = req.params; // Extraer el ID del item de los parámetros de la URL
// Leer el archivo JSON, buscar el item y eliminarlo
leerArchivoJson()
 .then(data => {
 const index = data.items.findIndex(item => item.id === parseInt(id)); // Buscar el índice del item en el array
 if (index === -1) {
 // Si no se encuentra el item, devolver un error 404
 return res.status(404).json({ error: 'Item no encontrado' });
 }
 data.items.splice(index, 1); // Eliminar el item del array
 return escribirArchivoJson(data); // Escribir los datos actualizados en el
archivo
 })
 .then(() => res.json({ message: 'Item eliminado' })) // Devolver un mensaje de
éxito
 .catch(error => res.status(500).json({ error: 'Error al eliminar el item' }));
// Si hay un error, devolver un mensaje de error
});
// Función para leer el archivo JSON
function leerArchivoJson() {
return new Promise((resolve, reject) => {
 fs.readFile(path.join(__dirname, 'lista.json'), 'utf8', (err, data) => {
 if (err) return reject(err); // Si ocurre un error al leer el archivo,rechazar la promesa
 resolve(JSON.parse(data)); // Parsear el contenido del archivo JSON y resolver la promesa
 });
});
}
// Función para escribir en el archivo JSON
function escribirArchivoJson(data) {
return new Promise((resolve, reject) => {
 fs.writeFile(path.join(__dirname, 'lista.json'), JSON.stringify(data, null,
2), 'utf8', (err) => {
 if (err) return reject(err); // Si ocurre un error al escribir el archivo, rechazar la promesa
 resolve(); // Si se escribe correctamente, resolver la promesa
 });
});
}
// Iniciar el servidor para que escuche las peticiones en el puerto especificado
app.listen(PORT, () => {
console.log(`Servidor corriendo en http://localhost:${PORT}`); // Mensaje en consola cuando el servidor esté corriendo
});
