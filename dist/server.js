"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = 3000;
// Paths de archivos
const LISTA_ITEMS_PATH = path_1.default.join(__dirname, 'lista.json');
const LISTAS_PATH = path_1.default.join(__dirname, 'listas.json');
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Ruta para servir el archivo index.html
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'));
});
// ===== Funciones para tu lista original (lista.json) =====
const leerListaItems = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield fs_1.default.promises.readFile(LISTA_ITEMS_PATH, 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
        return { items: [] };
    }
});
const obtenerLista = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    try {
        const db = yield leerListas();
        const lista = db.listas.find(l => l.id === id);
        if (!lista) {
            res.status(404).json({ error: 'Lista no encontrada' });
            return;
        }
        res.json(lista);
    }
    catch (error) {
        next(error);
    }
});
const guardarListaItems = (data) => __awaiter(void 0, void 0, void 0, function* () {
    yield fs_1.default.promises.writeFile(LISTA_ITEMS_PATH, JSON.stringify(data, null, 2));
});
// ===== Funciones para múltiples listas (listas.json) =====
const leerListas = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield fs_1.default.promises.readFile(LISTAS_PATH, 'utf8');
        return JSON.parse(data);
    }
    catch (error) {
        return { listas: [] };
    }
});
const guardarListas = (data) => __awaiter(void 0, void 0, void 0, function* () {
    yield fs_1.default.promises.writeFile(LISTAS_PATH, JSON.stringify(data, null, 2));
});
// ===== Controladores para listas =====
const obtenerListas = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const db = yield leerListas();
        res.json(db.listas);
    }
    catch (error) {
        next(error);
    }
});
const crearLista = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre } = req.body;
    if (!nombre) {
        res.status(400).json({ error: 'Nombre de lista requerido' });
        return;
    }
    try {
        const db = yield leerListas();
        const nuevaLista = {
            id: Date.now(),
            nombre,
            productos: []
        };
        db.listas.push(nuevaLista);
        yield guardarListas(db);
        res.status(201).json(nuevaLista);
    }
    catch (error) {
        next(error);
    }
});
const agregarProducto = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const listaId = parseInt(req.params.id);
    const { nombre, cantidad } = req.body;
    if (!nombre) {
        res.status(400).json({ error: 'Nombre de producto requerido' });
        return;
    }
    try {
        const db = yield leerListas();
        const lista = db.listas.find(l => l.id === listaId);
        if (!lista) {
            res.status(404).json({ error: 'Lista no encontrada' });
            return;
        }
        const nuevoProducto = {
            id: Date.now(),
            nombre,
            cantidad: cantidad || 1
        };
        lista.productos.push(nuevoProducto);
        yield guardarListas(db);
        res.status(201).json(nuevoProducto);
    }
    catch (error) {
        next(error);
    }
});
const eliminarLista = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    try {
        const db = yield leerListas();
        const listaIndex = db.listas.findIndex(lista => lista.id === id);
        if (listaIndex === -1) {
            res.status(404).json({ error: 'Lista no encontrada' });
            return;
        }
        db.listas.splice(listaIndex, 1);
        yield guardarListas(db);
        res.json({ message: 'Lista eliminada correctamente' });
    }
    catch (error) {
        next(error);
    }
});
const eliminarProducto = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const listaId = parseInt(req.params.listaId);
    const productoId = parseInt(req.params.productoId);
    try {
        const db = yield leerListas();
        const lista = db.listas.find(lista => lista.id === listaId);
        if (!lista) {
            res.status(404).json({ error: 'Lista no encontrada' });
            return;
        }
        const productoIndex = lista.productos.findIndex(p => p.id === productoId);
        if (productoIndex === -1) {
            res.status(404).json({ error: 'Producto no encontrado' });
            return;
        }
        lista.productos.splice(productoIndex, 1);
        yield guardarListas(db);
        res.json({ message: 'Producto eliminado correctamente' });
    }
    catch (error) {
        next(error);
    }
});
// ===== Rutas para listas =====
app.get('/listas/:id', obtenerLista);
app.get('/listas', obtenerListas);
app.post('/listas', crearLista);
app.post('/listas/:id/productos', agregarProducto);
app.delete('/listas/:id', eliminarLista);
app.delete('/listas/:listaId/productos/:productoId', eliminarProducto);
// ===== Rutas para tu lista original =====
app.get('/items', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield leerListaItems();
        res.json(data.items);
    }
    catch (error) {
        next(error);
    }
}));
app.post('/items', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { descripcion } = req.body;
    if (!descripcion) {
        res.status(400).json({ error: 'Descripción requerida' });
        return;
    }
    try {
        const data = yield leerListaItems();
        const nuevoItem = { id: Date.now(), descripcion };
        data.items.push(nuevoItem);
        yield guardarListaItems(data);
        res.status(201).json(nuevoItem);
    }
    catch (error) {
        next(error);
    }
}));
// Manejo de errores centralizado
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
});
// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    // Crear archivo listas.json si no existe
    leerListas().then(db => {
        if (db.listas.length === 0) {
            guardarListas({ listas: [] });
        }
    });
});
