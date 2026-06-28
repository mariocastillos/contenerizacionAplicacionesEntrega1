const express = require('express');
const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
const os = require('os');
const swaggerUi = require('swagger-ui-express');

// Cargar variables de entorno si existe un archivo .env
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware para procesar JSON y archivos estáticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de la conexión a la Base de Datos
const dbConfig = {
    host: process.env.DB_HOST || 'db',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'secret',
    database: process.env.DB_NAME || 'tracker_db',
    port: parseInt(process.env.DB_PORT || '3306')
};

let pool;

// Función para inicializar la conexión a la base de datos con reintentos
async function conectarBaseDatos(intentos = 10, retraso = 3000) {
    for (let i = 0; i < intentos; i++) {
        try {
            console.log(`Intentando conectar a la base de datos MySQL (Intento ${i + 1}/${intentos})...`);
            pool = mysql.createPool({
                ...dbConfig,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });
            // Probar la conexión
            const connection = await pool.getConnection();
            console.log('¡Conexión a la base de datos establecida exitosamente!');
            connection.release();
            return true;
        } catch (error) {
            console.error(`Error de conexión a la base de datos: ${error.message}`);
            if (i < intentos - 1) {
                console.log(`Esperando ${retraso / 1000} segundos antes del siguiente intento...`);
                await new Promise(resolve => setTimeout(resolve, retraso));
            }
        }
    }
    console.error('No se pudo conectar a la base de datos tras múltiples intentos. Finalizando proceso.');
    process.exit(1);
}

// Cargar especificación Swagger JSON de forma síncrona
let swaggerDocument;
try {
    const swaggerPath = path.join(__dirname, 'swagger.json');
    const rawData = fs.readFileSync(swaggerPath, 'utf8');
    swaggerDocument = JSON.parse(rawData);
    // Configurar Swagger UI en la ruta /api-docs
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    console.log('Documentación de Swagger disponible en /api-docs');
} catch (error) {
    console.error('Error al cargar swagger.json:', error.message);
}


// ==========================================
// ENDPOINTS DE LA API REST
// ==========================================

// 1. OBTENER PROYECTOS
app.get('/api/proyectos', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM proyectos ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener proyectos:', error);
        res.status(500).json({ error: 'Error al obtener proyectos de la base de datos' });
    }
});

// 2. CREAR PROYECTO
app.post('/api/proyectos', async (req, res) => {
    const { nombre, descripcion, presupuesto, fecha_inicio, activo, prioridad, cliente } = req.body;
    
    // Validación básica de campos obligatorios
    if (!nombre || presupuesto === undefined || !fecha_inicio || !prioridad || !cliente) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: nombre, presupuesto, fecha_inicio, prioridad y cliente' });
    }

    try {
        const query = `
            INSERT INTO proyectos (nombre, descripcion, presupuesto, fecha_inicio, activo, prioridad, cliente)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            nombre,
            descripcion || null,
            parseFloat(presupuesto),
            fecha_inicio,
            activo !== undefined ? activo : true,
            prioridad,
            cliente
        ];

        const [result] = await pool.query(query, values);
        res.status(201).json({ mensaje: 'Proyecto creado exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Error al crear proyecto:', error);
        res.status(500).json({ error: 'Error al insertar el proyecto en la base de datos' });
    }
});

// 3. ELIMINAR PROYECTO
app.delete('/api/proyectos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM proyectos WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Proyecto no encontrado' });
        }
        res.json({ mensaje: 'Proyecto eliminado exitosamente (se eliminaron sus tareas en cascada)' });
    } catch (error) {
        console.error('Error al eliminar proyecto:', error);
        res.status(500).json({ error: 'Error al eliminar el proyecto de la base de datos' });
    }
});

// 4. OBTENER TAREAS (con datos del proyecto relacionado)
app.get('/api/tareas', async (req, res) => {
    try {
        const query = `
            SELECT t.*, p.nombre AS proyecto_nombre 
            FROM tareas t 
            INNER JOIN proyectos p ON t.proyecto_id = p.id 
            ORDER BY t.id DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener tareas:', error);
        res.status(500).json({ error: 'Error al obtener tareas de la base de datos' });
    }
});

// 5. CREAR TAREA
app.post('/api/tareas', async (req, res) => {
    const { proyecto_id, titulo, responsable, fecha_entrega, horas_estimadas, completada, costo_estimado } = req.body;

    if (!proyecto_id || !titulo || !responsable || !fecha_entrega || horas_estimadas === undefined) {
        return res.status(400).json({ error: 'Faltan campos obligatorios: proyecto_id, titulo, responsable, fecha_entrega y horas_estimadas' });
    }

    try {
        // Verificar si el proyecto existe
        const [proyecto] = await pool.query('SELECT id FROM proyectos WHERE id = ?', [proyecto_id]);
        if (proyecto.length === 0) {
            return res.status(400).json({ error: 'El proyecto asociado especificado no existe' });
        }

        const query = `
            INSERT INTO tareas (proyecto_id, titulo, responsable, fecha_entrega, horas_estimadas, completada, costo_estimado)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            proyecto_id,
            titulo,
            responsable,
            fecha_entrega,
            parseInt(horas_estimadas),
            completada !== undefined ? completada : false,
            costo_estimado !== undefined ? parseFloat(costo_estimado) : 0.00
        ];

        const [result] = await pool.query(query, values);
        res.status(201).json({ mensaje: 'Tarea creada exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Error al crear tarea:', error);
        res.status(500).json({ error: 'Error al insertar la tarea en la base de datos' });
    }
});

// 6. ELIMINAR TAREA
app.delete('/api/tareas/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM tareas WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Tarea no encontrada' });
        }
        res.json({ mensaje: 'Tarea eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar tarea:', error);
        res.status(500).json({ error: 'Error al eliminar la tarea de la base de datos' });
    }
});

// 7. ENDPOINT DIAGNÓSTICO DE DOCKER
app.get('/api/docker-info', (req, res) => {
    // Determinar si corre bajo Docker (verificar existencia del archivo .dockerenv)
    const enDocker = fs.existsSync('/.dockerenv');
    
    res.json({
        enDocker: enDocker,
        hostname: os.hostname(), // En Docker, suele ser el ID del contenedor
        plataforma: os.platform(),
        arquitectura: os.arch(),
        nodeVersion: process.version,
        uptime: Math.floor(process.uptime()) + ' segundos',
        variablesEntorno: {
            NODE_ENV: process.env.NODE_ENV || 'desarrollo',
            PORT: PORT,
            DB_HOST: dbConfig.host,
            DB_NAME: dbConfig.database,
            DB_USER: dbConfig.user
        }
    });
});

// 8. CARGAR DATOS SEMILLA (Inserta 15 registros de prueba relacionados de golpe)
app.post('/api/seed', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Limpiar base de datos (por seguridad y control)
        await connection.query('DELETE FROM tareas');
        await connection.query('DELETE FROM proyectos');
        await connection.query('ALTER TABLE proyectos AUTO_INCREMENT = 1');
        await connection.query('ALTER TABLE tareas AUTO_INCREMENT = 1');

        // 2. Insertar 5 Proyectos (5 registros)
        const proyectosSeed = [
            ['Desarrollo App Móvil', 'Creación de app híbrida para clientes.', 45000.00, '2026-04-01', true, 'Alta', 'Supermercados Max'],
            ['Seguridad TI Phase 2', 'Implementación de políticas Zero-Trust.', 28000.00, '2026-05-15', true, 'Media', 'Banco del Norte'],
            ['Automatización QA', 'Creación de suite de pruebas automáticas.', 15000.00, '2026-06-01', true, 'Baja', 'InsurCo S.A.'],
            ['Migración Base Datos', 'Upgrade de PostgreSQL local a la nube.', 60000.00, '2026-02-20', false, 'Alta', 'Logística Express'],
            ['Lanzamiento Marketing', 'Campaña publicitaria digital de verano.', 12000.00, '2026-06-10', true, 'Media', 'Moda Joven']
        ];

        const idsProyectos = [];
        const queryProyecto = `
            INSERT INTO proyectos (nombre, descripcion, presupuesto, fecha_inicio, activo, prioridad, cliente)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        for (const proyecto of proyectosSeed) {
            const [resProj] = await connection.query(queryProyecto, proyecto);
            idsProyectos.push(resProj.insertId);
        }

        // 3. Insertar 10 Tareas asociadas a los proyectos anteriores (10 registros)
        // Total registros semilla insertados = 5 proyectos + 10 tareas = 15 registros
        const tareasSeed = [
            [idsProyectos[0], 'Diseñar Wireframes UX', 'Ana Gómez', '2026-04-15', 30, true, 1200.00],
            [idsProyectos[0], 'Desarrollo API de Integración', 'Carlos Mendoza', '2026-05-30', 80, false, 3200.00],
            [idsProyectos[0], 'Publicar en tiendas App Store', 'Ana Gómez', '2026-07-01', 15, false, 800.00],
            [idsProyectos[1], 'Auditoría de firewalls actuales', 'Roberto Díaz', '2026-06-10', 45, true, 2500.00],
            [idsProyectos[1], 'Configurar MFA en cuentas corporativas', 'Roberto Díaz', '2026-06-30', 25, false, 1000.00],
            [idsProyectos[2], 'Escribir scripts Selenium/Cypress', 'Lucía Fernández', '2026-06-25', 60, true, 2000.00],
            [idsProyectos[2], 'Configurar Pipeline CI/CD Jenkins', 'Lucía Fernández', '2026-07-05', 20, false, 950.00],
            [idsProyectos[3], 'Esquematizar migración de esquemas', 'Carlos Mendoza', '2026-03-05', 50, true, 3000.00],
            [idsProyectos[3], 'Validación de integridad de datos post-migración', 'María Delgado', '2026-04-10', 40, true, 2200.00],
            [idsProyectos[4], 'Diseño de banners y material digital', 'Ana Gómez', '2026-06-18', 20, true, 600.00]
        ];

        const queryTarea = `
            INSERT INTO tareas (proyecto_id, titulo, responsable, fecha_entrega, horas_estimadas, completada, costo_estimado)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        for (const tarea of tareasSeed) {
            await connection.query(queryTarea, tarea);
        }

        await connection.commit();
        res.json({
            mensaje: '¡Éxito! Base de datos reiniciada e insertados 15 registros de prueba (5 proyectos, 10 tareas).',
            proyectosInsertados: idsProyectos.length,
            tareasInsertadas: tareasSeed.length
        });
    } catch (error) {
        await connection.rollback();
        console.error('Error durante la inserción de datos semilla:', error);
        res.status(500).json({ error: 'Error al rellenar base de datos con registros semilla' });
    } finally {
        connection.release();
    }
});

// Capturar rutas no encontradas para la API
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: 'Ruta de API no encontrada' });
});

// Redirigir cualquier otra ruta no controlada al index del frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inicializar base de datos y arrancar servidor express
conectarBaseDatos().then(() => {
    app.listen(PORT, () => {
        console.log(`===================================================`);
        console.log(` Servidor levantado con éxito en el puerto ${PORT}`);
        console.log(` - Aplicación local: http://localhost:${PORT}`);
        console.log(` - Documentación Swagger: http://localhost:${PORT}/api-docs`);
        console.log(`===================================================`);
    });
});
