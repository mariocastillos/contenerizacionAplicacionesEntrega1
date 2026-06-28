-- Script de inicialización de la Base de Datos para el Tracker de Proyectos y Tareas
CREATE DATABASE IF NOT EXISTS tracker_db;
USE tracker_db;

-- 1. Tabla de Proyectos (8 columnas)
CREATE TABLE IF NOT EXISTS proyectos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    presupuesto DECIMAL(12, 2) NOT NULL,
    fecha_inicio DATE NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    prioridad VARCHAR(20) NOT NULL, -- 'Baja', 'Media', 'Alta'
    cliente VARCHAR(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Tabla de Tareas (8 columnas, relación y dependencia con proyectos)
CREATE TABLE IF NOT EXISTS tareas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proyecto_id INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    responsable VARCHAR(100) NOT NULL,
    fecha_entrega DATE NOT NULL,
    horas_estimadas INT NOT NULL,
    completada BOOLEAN DEFAULT FALSE,
    costo_estimado DECIMAL(10, 2) DEFAULT 0.00,
    FOREIGN KEY (proyecto_id) REFERENCES proyectos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar datos iniciales de prueba (Semilla inicial básica)
INSERT INTO proyectos (nombre, descripcion, presupuesto, fecha_inicio, activo, prioridad, cliente) VALUES
('Migración Cloud 2026', 'Migración de la infraestructura local a AWS.', 75000.00, '2026-01-15', TRUE, 'Alta', 'TechCorp Inc.'),
('Rediseño Portal Web', 'Rediseño del portal corporativo para mejorar la UX/UI.', 30000.00, '2026-03-01', TRUE, 'Media', 'Global Retail S.A.'),
('Implementación ERP', 'Integración del nuevo sistema ERP para finanzas y recursos humanos.', 120000.00, '2026-02-10', FALSE, 'Alta', 'Inversiones Omega');

INSERT INTO tareas (proyecto_id, titulo, responsable, fecha_entrega, horas_estimadas, completada, costo_estimado) VALUES
(1, 'Diseño de arquitectura VPC', 'María Delgado', '2026-02-01', 40, TRUE, 2500.00),
(1, 'Configuración de bases de datos RDS', 'Carlos Mendoza', '2026-02-28', 60, TRUE, 4500.00),
(1, 'Migración de microservicios', 'María Delgado', '2026-07-15', 120, FALSE, 9000.00),
(2, 'Diseño de mockups de alta fidelidad', 'Ana Gómez', '2026-03-25', 50, TRUE, 1500.00),
(2, 'Desarrollo frontend en React', 'Juan Pérez', '2026-06-30', 100, FALSE, 4000.00),
(3, 'Relevamiento de requerimientos financieros', 'Luis Torres', '2026-03-15', 80, TRUE, 5000.00);
