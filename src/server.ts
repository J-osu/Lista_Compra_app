import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

// Tipado para los items (tu estructura actual)
interface Item {
  id: number;
  descripcion: string;
}

interface ListaItems {
  items: Item[];
}

// Tipado para las nuevas listas
interface Producto {
  id: number;
  nombre: string;
  cantidad?: number;
}

interface Lista {
  id: number;
  nombre: string;
  productos: Producto[];
}

interface DatabaseListas {
  listas: Lista[];
}

// Paths de archivos
const LISTA_ITEMS_PATH = path.join(__dirname, 'lista.json');
const LISTAS_PATH = path.join(__dirname, 'listas.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir el archivo index.html
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ===== Funciones para tu lista original (lista.json) =====
const leerListaItems = async (): Promise<ListaItems> => {
  try {
    const data = await fs.promises.readFile(LISTA_ITEMS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { items: [] };
  }
};

const obtenerLista = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const id = parseInt(req.params.id);
    
    try {
      const db = await leerListas();
      const lista = db.listas.find(l => l.id === id);
      
      if (!lista) {
        res.status(404).json({ error: 'Lista no encontrada' });
        return;
      }
      
      res.json(lista);
    } catch (error) {
      next(error);
    }
  };

const guardarListaItems = async (data: ListaItems): Promise<void> => {
  await fs.promises.writeFile(LISTA_ITEMS_PATH, JSON.stringify(data, null, 2));
};

// ===== Funciones para múltiples listas (listas.json) =====
const leerListas = async (): Promise<DatabaseListas> => {
  try {
    const data = await fs.promises.readFile(LISTAS_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return { listas: [] };
  }
};

const guardarListas = async (data: DatabaseListas): Promise<void> => {
  await fs.promises.writeFile(LISTAS_PATH, JSON.stringify(data, null, 2));
};

// ===== Controladores para listas =====
const obtenerListas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const db = await leerListas();
    res.json(db.listas);
  } catch (error) {
    next(error);
  }
};

const crearLista = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { nombre } = req.body;
  if (!nombre) {
    res.status(400).json({ error: 'Nombre de lista requerido' });
    return;
  }

  try {
    const db = await leerListas();
    const nuevaLista: Lista = {
      id: Date.now(),
      nombre,
      productos: []
    };
    db.listas.push(nuevaLista);
    await guardarListas(db);
    res.status(201).json(nuevaLista);
  } catch (error) {
    next(error);
  }
};

const agregarProducto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const listaId = parseInt(req.params.id);
  const { nombre, cantidad } = req.body;

  if (!nombre) {
    res.status(400).json({ error: 'Nombre de producto requerido' });
    return;
  }

  try {
    const db = await leerListas();
    const lista = db.listas.find(l => l.id === listaId);
    
    if (!lista) {
      res.status(404).json({ error: 'Lista no encontrada' });
      return;
    }

    const nuevoProducto: Producto = {
      id: Date.now(),
      nombre,
      cantidad: cantidad || 1
    };

    lista.productos.push(nuevoProducto);
    await guardarListas(db);
    res.status(201).json(nuevoProducto);
  } catch (error) {
    next(error);
  }
};

const eliminarLista = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const id = parseInt(req.params.id);
  
  try {
    const db = await leerListas();
    const listaIndex = db.listas.findIndex(lista => lista.id === id);
    
    if (listaIndex === -1) {
      res.status(404).json({ error: 'Lista no encontrada' });
      return;
    }
    
    db.listas.splice(listaIndex, 1);
    await guardarListas(db);
    res.json({ message: 'Lista eliminada correctamente' });
  } catch (error) {
    next(error);
  }
};

const eliminarProducto = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const listaId = parseInt(req.params.listaId);
  const productoId = parseInt(req.params.productoId);
  
  try {
    const db = await leerListas();
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
    await guardarListas(db);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

// ===== Rutas para listas =====
app.get('/listas/:id', obtenerLista);
app.get('/listas', obtenerListas);
app.post('/listas', crearLista);
app.post('/listas/:id/productos', agregarProducto);
app.delete('/listas/:id', eliminarLista);
app.delete('/listas/:listaId/productos/:productoId', eliminarProducto);

// ===== Rutas para tu lista original =====
app.get('/items', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await leerListaItems();
    res.json(data.items);
  } catch (error) {
    next(error);
  }
});

app.post('/items', async (req: Request, res: Response, next: NextFunction) => {
  const { descripcion } = req.body;
  if (!descripcion) {
    res.status(400).json({ error: 'Descripción requerida' });
    return;
  }

  try {
    const data = await leerListaItems();
    const nuevoItem: Item = { id: Date.now(), descripcion };
    data.items.push(nuevoItem);
    await guardarListaItems(data);
    res.status(201).json(nuevoItem);
  } catch (error) {
    next(error);
  }
});

// Manejo de errores centralizado
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
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