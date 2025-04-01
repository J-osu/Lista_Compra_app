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
// Configurar middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Ruta para servir el archivo index.html
app.get('/', (req, res) => {
    res.sendFile(path_1.default.join(__dirname, 'public', 'index.html'));
});
// Ruta para obtener los items desde el archivo JSON
app.get('/items', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield leerArchivoJson();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al leer el archivo' });
    }
}));
// Ruta para agregar un nuevo item a la lista
app.post('/items', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { descripcion } = req.body;
    if (!descripcion) {
        res.status(400).json({ error: 'Descripción del item es requerida' });
        return;
    }
    const nuevoItem = { id: Date.now(), descripcion };
    try {
        const data = yield leerArchivoJson();
        data.items.push(nuevoItem);
        yield escribirArchivoJson(data);
        res.json(nuevoItem);
    }
    catch (error) {
        res.status(500).json({ error: 'Error al agregar el item' });
    }
}));
// Ruta para eliminar un item de la lista
app.delete('/items/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = parseInt(req.params.id);
        const data = yield leerArchivoJson();
        const index = data.items.findIndex(item => item.id === id);
        if (index === -1) {
            res.status(404).json({ error: 'Item no encontrado' });
            return;
        }
        data.items.splice(index, 1);
        yield escribirArchivoJson(data);
        res.json({ message: 'Item eliminado' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al eliminar el item' });
    }
}));
// Ruta para editar un item de la lista
app.put('/items/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = parseInt(req.params.id);
    const { descripcion } = req.body;
    if (!descripcion) {
        res.status(400).json({ error: 'Descripción del item es requerida' });
        return;
    }
    try {
        const data = yield leerArchivoJson();
        const item = data.items.find(item => item.id === id);
        if (!item) {
            res.status(404).json({ error: 'Item no encontrado' });
            return;
        }
        item.descripcion = descripcion;
        yield escribirArchivoJson(data);
        res.json({ message: 'Item actualizado' });
    }
    catch (error) {
        res.status(500).json({ error: 'Error al actualizar el item' });
    }
}));
// Función para leer el archivo JSON
const leerArchivoJson = () => {
    return new Promise((resolve, reject) => {
        fs_1.default.readFile(path_1.default.join(process.cwd(), 'lista.json'), 'utf8', (err, data) => {
            if (err)
                return reject(err);
            try {
                resolve(JSON.parse(data));
            }
            catch (parseError) {
                reject(parseError);
            }
        });
    });
};
// Función para escribir en el archivo JSON
const escribirArchivoJson = (data) => {
    return new Promise((resolve, reject) => {
        fs_1.default.writeFile(path_1.default.join(process.cwd(), 'lista.json'), JSON.stringify(data, null, 2), 'utf8', (err) => {
            if (err)
                return reject(err);
            resolve();
        });
    });
};
// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
