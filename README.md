# Project & Task Tracker - Aplicación Contenerizada con Docker

Este proyecto se trata de un **Sistema de Control de Proyectos y Tareas** de nivel empresarial con soporte multi-contenedor que integra una base de datos relacional MySQL y un servidor web Node.js Express, orquestados de forma aislada mediante Docker Compose.

---

## 🚀 Características

**Persistencia y Base de Datos Relacional (MySQL)**:

*   Contenedor de base de datos MySQL 8.0 con volumen persistente (`tracker_db_persistent_data`) para asegurar que los datos no se pierdan al apagar los contenedores.
*   **Modelo Entidad-Relación (1-N)**: Un proyecto posee múltiples tareas, con integridad referencial (`FOREIGN KEY`) y eliminación en cascada (`ON DELETE CASCADE`).
*   **8 Columnas por Tabla**: Ambas tablas cuentan con exactamente 8 columnas con diversos tipos de datos, superando el mínimo exigido de 7 columnas por tabla.

**Servidor Web Node.js + Express**:

*   Servidor contenerizado con imagen optimizada `node:20-alpine` que expone una API REST moderna.
*   Mecanismo robusto de **reintento de conexión a la base de datos** (resiliencia de arranque), evitando caídas si el servidor web arranca antes de que MySQL esté completamente listo.

**Interfaz de Usuario (SPA Premium)**:

*   Panel de control responsivo, moderno, en modo oscuro elegante, desarrollado con Vanilla CSS puro.
*   **Pre-carga de 15 Registros de Prueba**: Un botón en el Dashboard que limpia e inserta automáticamente **5 proyectos y 10 tareas relacionadas (15 registros totales)** en un solo clic. Esto permite demostrar instantáneamente el volumen de datos requerido y la visualización de relaciones para el video de entrega.
*   **Diagrama ER Integrado**: Un diagrama dinámico en formato vectorial SVG integrado directamente en la interfaz.
*   **Diagnóstico Docker**: Muestra variables de entorno, uptime, plataforma y el ID del contenedor del servidor Express (hostname).

**Documentación Swagger y API Testing**:

*   Documentación interactiva de la API con **Swagger UI** expuesta de forma nativa en la ruta `/api-docs`.
*   Archivo de configuración de **Postman Collection** (`tracker_api.postman_collection.json`) incluido en la raíz para pruebas externas.

**Guía de 30+ Comandos Docker**:

*   Incluida en este archivo y de forma interactiva (con botón de copia) en la propia interfaz web para facilitar la grabación del video.

---

## 📁 Estructura del Proyecto

```
contenerizaciondeapliaciones/
├── docker-compose.yml                     # Archivo de orquestación multi-contenedor
├── tracker_api.postman_collection.json     # Colección para pruebas en Postman (API)
├── db/
│   ├── Dockerfile                         # Imagen personalizada para MySQL
│   └── init.sql                           # Script de inicialización (Tablas y Semilla básica)
├── web/
│   ├── Dockerfile                         # Imagen personalizada para Node.js
│   ├── .dockerignore                      # Evita copiar archivos innecesarios al contenedor
│   ├── package.json                       # Gestión de dependencias Node.js
│   ├── server.js                          # Lógica del backend y API REST
│   ├── swagger.json                       # Especificación OpenAPI/Swagger de la API
│   └── public/                            # Interfaz Web de Usuario (SPA)
│       ├── index.html                     # Estructura del frontend
│       ├── styles.css                     # Estilos visuales del Dashboard
│       └── app.js                         # Lógica del cliente y reactividad
└── README.md                              # Esta documentación y guía de comandos
```

---

## 📐 Diseño del Modelo Entidad-Relación

### Tabla: `proyectos` (8 Columnas)

| Columna | Tipo de Dato | Rol / Descripción |
| --- | --- | --- |
| `id` | `INT` | Llave Primaria (`PRIMARY KEY`), Auto-incremental |
| `nombre` | `VARCHAR(100)` | Nombre único del proyecto (Obligatorio) |
| `descripcion` | `TEXT` | Breve descripción del alcance (Opcional) |
| `presupuesto` | `DECIMAL(12,2)` | Presupuesto financiero asignado (Obligatorio) |
| `fecha_inicio` | `DATE` | Fecha de inicio oficial del proyecto (Obligatorio) |
| `activo` | `BOOLEAN` | Estado actual de ejecución (Por defecto `TRUE`) |
| `prioridad` | `VARCHAR(20)` | Clasificación del proyecto: 'Baja', 'Media', 'Alta' |
| `cliente` | `VARCHAR(100)` | Entidad o cliente que financia el proyecto |

### Tabla: `tareas` (8 Columnas)

| Columna | Tipo de Dato | Rol / Descripción |
| --- | --- | --- |
| `id` | `INT` | Llave Primaria (`PRIMARY KEY`), Auto-incremental |
| `proyecto_id` | `INT` | Llave Foránea (`FOREIGN KEY`) conectada a `proyectos(id)` con `ON DELETE CASCADE` |
| `titulo` | `VARCHAR(150)` | Título o nombre de la tarea (Obligatorio) |
| `responsable` | `VARCHAR(100)` | Nombre de la persona encargada (Obligatorio) |
| `fecha_entrega` | `DATE` | Fecha límite para finalizar la tarea (Obligatorio) |
| `horas_estimadas` | `INT` | Tiempo estimado de esfuerzo en horas (Obligatorio) |
| `completada` | `BOOLEAN` | Estado de progreso (Por defecto `FALSE`) |
| `costo_estimado` | `DECIMAL(10,2)` | Costo financiero proyectado para la tarea |

---

## 🛠️ Instrucciones de Levantamiento y Despliegue

Sigue estos sencillos pasos para iniciar y probar toda la aplicación contenerizada en tu máquina local:

### 1\. Requisitos Previos

Asegúrate de tener instalado y en ejecución **Docker Desktop** en tu sistema operativo (Windows, macOS o Linux). Puedes comprobarlo corriendo:

```
docker --version
docker-compose --version
```

### 2\. Clonar / Acceder al Directorio

Abre tu consola de comandos o terminal (Powershell, CMD o Bash) en la raíz del proyecto:

```
cd c:\Users\proyectos\maestria\contenerizaciondeapliaciones
```

### 3\. Levantar los Contenedores

Ejecuta el siguiente comando de Docker Compose para construir las imágenes personalizadas y levantar los servicios en segundo plano:

```
docker-compose up --build -d
```

_Este comando construirá automáticamente las imágenes locales descritas en_ `_web/Dockerfile_` _y_ `_db/Dockerfile_`_, configurará la red aislada y el almacenamiento persistente, e iniciará el sistema._

### 4\. Verificar el Estado

Comprueba que ambos contenedores estén ejecutándose correctamente y de manera saludable:

```
docker-compose ps
```

### 5\. Acceder a las Aplicaciones

Una vez levantado, abre tu navegador web favorito y accede a las siguientes direcciones:

*   **Aplicación Web (Dashboard)**: [http://localhost:3000](http://localhost:3000)
*   **Documentación Interactiva Swagger**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 🧪 Validación y Pruebas de la API

### Opción A: Desde la Interfaz Web (Fácil y Rápido para el Video)

1.  Entra a [http://localhost:3000](http://localhost:3000).
2.  Haz clic en el botón superior **"Precargar 15 Datos Semilla"**.
3.  Verás una alerta de éxito. Ve a la pestaña **Dashboard** y verás los indicadores actualizados (presupuesto, promedio de horas, gráfico de prioridades).
4.  Dirígete a la pestaña **Proyectos** para inspeccionar las tarjetas y abrir los acordeones de tareas asociadas para demostrar la relación 1-N.
5.  Abre la pestaña **Tareas** para ver la tabla con los registros detallados.
6.  Agrega un nuevo proyecto o tarea mediante los formularios flotantes y valida la inserción inmediata y la persistencia de datos.

### Opción B: Desde Swagger UI

1.  Navega a [http://localhost:3000/api-docs](http://localhost:3000/api-docs).
2.  Despliega cualquiera de los endpoints, como `GET /proyectos` o `POST /tareas`.
3.  Haz clic en **"Try it out"** (Probar), ingresa los parámetros y presiona **"Execute"**. Analiza las respuestas formateadas en JSON con código HTTP `200` o `211`.

### Opción C: Desde Postman

1.  Abre **Postman**.
2.  Haz clic en **Import** (Importar) y selecciona el archivo `tracker_api.postman_collection.json` ubicado en la raíz del proyecto.
3.  Se creará la colección **Project & Task Tracker API** con todas las consultas pre-estructuradas.
4.  Ejecuta las peticiones para crear, obtener y eliminar registros. Las rutas ya utilizan la variable de colección `{{baseUrl}}` apuntando a tu puerto local `3000`.

---

## 🐳 Comandos Docker Utilizados

### 🔴 Limpieza del Entorno

```
# Detener y eliminar contenedores, red y volúmenes del proyecto
docker-compose down --volumes --remove-orphans

# Detener contenedores individualmente
docker stop tracker_web_server
docker stop tracker_mysql_db

# Eliminar contenedores individualmente
docker rm tracker_web_server
docker rm tracker_mysql_db

# Eliminar imágenes del proyecto
docker rmi contenerizaciondeapliaciones-web
docker rmi contenerizaciondeapliaciones-db

# Eliminar todas las imágenes sin etiquetar (dangling)
docker image prune -f

# Eliminar TODAS las imágenes del sistema ⚠️
docker rmi $(docker images -aq) -f

# Eliminar el volumen persistente de la base de datos
docker volume rm contenerizaciondeapliaciones_db_data

# Limpieza total del sistema Docker (contenedores, redes, imágenes, caché)
docker system prune -a --volumes -f
```

### 🔨 Construcción de Imágenes por Separado

```
# Construir la imagen de la base de datos
docker build -t tracker-db:latest ./db

# Construir la imagen del servidor web
docker build -t tracker-web:latest ./web

# Verificar imágenes creadas
docker images
```

### ▶️ Arrancar Contenedores por Separado (sin Compose)

```
# Crear la red compartida
docker network create tracker_net

# Crear el volumen persistente
docker volume create db_data

# Levantar el contenedor de Base de Datos
docker run -d \
  --name tracker_mysql_db \
  --network tracker_net \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=tracker_db \
  -v db_data:/var/lib/mysql \
  --restart always \
  tracker-db:latest

# Verificar estado de salud de MySQL
docker inspect --format='{{.State.Health.Status}}' tracker_mysql_db

# Levantar el contenedor del Servidor Web
docker run -d \
  --name tracker_web_server \
  --network tracker_net \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e DB_HOST=db \
  -e DB_USER=root \
  -e DB_PASSWORD=secret \
  -e DB_NAME=tracker_db \
  --restart always \
  tracker-web:latest

# Verificar que ambos contenedores corren
docker ps
```

### 🚀 Arrancar en Conjunto con Docker Compose

```
# Construir imágenes y levantar todos los servicios
docker-compose up -d --build

# Levantar sin reconstruir (imágenes ya existentes)
docker-compose up -d

# Levantar solo la base de datos
docker-compose up -d db

# Levantar solo el servidor web
docker-compose up -d web

# Ver estado de los servicios
docker-compose ps

# Detener servicios (sin eliminar contenedores)
docker-compose stop

# Detener y eliminar contenedores (conserva volúmenes)
docker-compose down

# Detener, eliminar contenedores Y volúmenes
docker-compose down --volumes
```

### 🔍 Inspección y Diagnóstico

```
# Ver logs en tiempo real de todos los servicios
docker-compose logs -f

# Ver logs solo del servicio web
docker-compose logs -f web

# Ver logs solo de la base de datos
docker-compose logs -f db

# Abrir terminal dentro del contenedor web
docker exec -it tracker_web_server sh

# Abrir terminal dentro del contenedor MySQL
docker exec -it tracker_mysql_db bash

# Conectarse a MySQL desde dentro del contenedor
docker exec -it tracker_mysql_db mysql -u root -psecret tracker_db

# Ver uso de recursos en tiempo real
docker stats

# Inspeccionar detalles de un contenedor
docker inspect tracker_web_server
docker inspect tracker_mysql_db

# Ver red y contenedores conectados
docker network inspect contenerizaciondeapliaciones_tracker_net
```

---