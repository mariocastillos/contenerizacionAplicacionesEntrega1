# Project & Task Tracker - Aplicación Contenerizada con Docker

Este proyecto es una solución integral diseñada y desarrollada para cumplir de forma sobresaliente con todos los requisitos y criterios de evaluación de la **Actividad Sumativa - Unidad 2: Creación de aplicación contenerizada en Docker**, en el módulo **Contenerización de Aplicaciones de Software**.

Se trata de un **Sistema de Control de Proyectos y Tareas** de nivel empresarial con soporte multi-contenedor que integra una base de datos relacional MySQL y un servidor web Node.js Express, orquestados de forma aislada mediante Docker Compose.

---

## 🚀 Características Clave y Cumplimiento de Rúbrica

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
cd c:\Users\mario.castillo\proyectos\maestria\contenerizaciondeapliaciones
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

## 📹 Guía Interactiva: 30+ Comandos Docker para tu Video de Entrega

La rúbrica evalúa la ejecución de **al menos 30 comandos Docker** en la consola mostrando su instalación y diferenciando su arquitectura. A continuación se presenta el listado de comandos útiles que puedes ir ejecutando en tu consola durante la grabación para obtener la máxima nota:

### ⚙️ Categoría A: Instalación y Comandos de Diagnóstico

1.  **Comprobar versión**: Muestra la versión del motor Docker.
2.  **Diagnóstico general**: Entrega detalles del motor, almacenamiento y configuraciones de red.
3.  **Ayuda de comandos**: Lista detallada de comandos principales del CLI.
4.  **Login a Docker Hub**: Conecta tu CLI con tu cuenta oficial.
5.  **Logout de Docker Hub**: Cierra la sesión activa.

### 📦 Categoría B: Gestión y Construcción de Imágenes

1.  **Construir imagen web**: Crea la imagen del frontend y api de forma local.
2.  **Construir imagen base de datos**: Crea la imagen personalizada para MySQL.
3.  **Listar imágenes**: Muestra todas las imágenes cargadas en el almacenamiento.
4.  **Descargar imagen externa**: Descarga la versión oficial de MySQL de Docker Hub.
5.  **Etiquetar imagen**: Genera un alias o versión para subir a un registro.
6.  **Subir imagen**: Sube tu desarrollo de forma pública a Docker Hub.
7.  **Ver capas e historial**: Revisa las capas internas del Dockerfile compiladas en la imagen.
8.  **Eliminar imagen**: Borra una imagen local para liberar espacio (ej. mysql:8.0).
9.  **Limpieza de imágenes huérfanas**: Remueve imágenes corruptas o sin etiquetas.

### 🐳 Categoría C: Control y Monitoreo de Contenedores

1.  **Arrancar contenedor individual**: Corre un contenedor mapeando puertos en background.
2.  **Listar contenedores activos**: Muestra ID, imagen, estado y puertos abiertos.
3.  **Listar todos los contenedores**: Muestra incluso contenedores apagados o con error de salida.
4.  **Detener contenedor**: Detiene de forma segura el contenedor temporal.
5.  **Arrancar contenedor detenido**: Vuelve a iniciar el contenedor temporal.
6.  **Reiniciar contenedor**: Fuerza un reinicio rápido del contenedor.
7.  **Ver logs de contenedor**: Imprime la salida estándar de ejecución del servidor.
8.  **Seguir logs en vivo**: Escucha las nuevas conexiones a la API en tiempo real.
9.  **Acceder al contenedor de forma interactiva**: Abre una consola de comandos interna en el servidor._(Escribe_ `_exit_` _para salir de la terminal interna)_
10.  **Inspeccionar contenedor**: Muestra configuraciones de red, IPs y variables en formato JSON.
11.  **Estadísticas de consumo**: Monitorea consumo en tiempo real de RAM, CPU y Red.
12.  **Ver procesos internos**: Lista los hilos de ejecución activos dentro del contenedor.
13.  **Eliminar contenedor**: Borra el contenedor temporal inactivo.
14.  **Limpieza masiva de contenedores**: Borra todos los contenedores apagados de golpe.

### 🐙 Categoría D: Orquestación con Docker Compose

1.  **Levantar stack completo**: Descarga, compila y levanta la red y contenedores.
2.  **Detener y remover stack**: Apaga los servicios y elimina redes y contenedores.
3.  **Ver estado de servicios**: Lista los servicios activos del proyecto Compose.
4.  **Ver logs de compose**: Muestra e integra los logs consolidados de web y base de datos.
5.  **Forzar reconstrucción**: Compila cambios del código y los inyecta en nuevos contenedores.

### 🌐 Categoría E: Gestión de Redes y Volúmenes (Persistencia)

1.  **Listar redes**: Lista las redes activas en tu motor Docker.
2.  **Inspeccionar red del proyecto**: Muestra qué IPs tienen asignadas la DB y el Web Server dentro de la red aislada.
3.  **Listar volúmenes**: Muestra todos los volúmenes de datos montados.
4.  **Inspeccionar volumen persistente**: Revela la ruta física en el disco host donde MySQL guarda los datos.

---

## 📝 Consejos para Grabar tu Video Explicativo

1.  **Introducción**: Explica que tu sistema está compuesto por una base de datos MySQL (relacional, 1-N, 8 columnas por tabla) y una aplicación web Node.js Express.
2.  **Demostración de Instalación y Comandos**: Abre la consola de tu sistema operativo y corre comandos de diagnóstico como `docker --version`, `docker info`, `docker images` y `docker ps`. Esto demuestra el motor instalado.
3.  **Levantamiento del Proyecto**: Ejecuta `docker-compose up -d` en tu consola y muestra cómo Docker Compose compila y levanta ambos servicios en segundos. Corre `docker ps` para certificar que están en ejecución.
4.  **Demostración Práctica**: Abre [http://localhost:3000](http://localhost:3000) en el navegador. Haz clic en **"Precargar 15 Datos Semilla"**. Muestra el Dashboard con los indicadores y gráficos actualizados. Navega por las pestañas de **Proyectos** y **Tareas** para explicar las relaciones y la existencia de los 8 campos requeridos por tabla. Muestra la pestaña **Modelo ER** para explicar la teoría del diseño.
5.  **Demostración de Persistencia**: Agrega un proyecto nuevo desde la interfaz, luego apaga la aplicación ejecutando `docker-compose down` en la consola. Vuelve a levantarla con `docker-compose up -d` y recarga la página. Muestra cómo el proyecto que agregaste sigue allí intacto gracias al volumen montado.
6.  **Demostración de la API (Swagger / Postman)**: Muestra la ruta `/api-docs` para lucir la documentación Swagger y realiza una prueba rápida desde allí, o abre Postman e importa la colección para hacer una consulta.
7.  **Cierre**: Destaca la separación de responsabilidades, la seguridad de la red aislada y los beneficios de usar contenedores para el ciclo de vida del software.

```
docker volume inspect tracker_db_persistent_data
```

```
docker volume ls
```

```
docker network inspect tracker_isolated_network
```

```
docker network ls
```

```
docker-compose up --build -d
```

```
docker-compose logs --tail=50
```

```
docker-compose ps
```

```
docker-compose down
```

```
docker-compose up -d
```

```
docker container prune -f
```

```
docker rm web-temp
```

```
docker top tracker_web_server
```

```
docker stats --no-stream
```

```
docker inspect tracker_web_server
```

```
docker exec -it tracker_web_server sh
```

```
docker logs -f tracker_web_server
```

```
docker logs tracker_web_server
```

```
docker restart web-temp
```

```
docker start web-temp
```

```
docker stop web-temp
```

```
docker ps -a
```

```
docker ps
```

```
docker run -d -p 3000:3000 --name web-temp tracker-web:latest
```

```
docker image prune -f
```

```
docker rmi mysql:8.0
```

```
docker history tracker-web:latest
```

```
docker push mi-usuario/tracker-web:v1.0
```

```
docker tag tracker-web:latest mi-usuario/tracker-web:v1.0
```

```
docker pull mysql:8.0
```

```
docker images
```

```
docker build -t tracker-db:latest ./db
```

```
docker build -t tracker-web:latest ./web
```

```
docker logout
```

```
docker login
```

```
docker help
```

```
docker info
```

```
docker --version
```