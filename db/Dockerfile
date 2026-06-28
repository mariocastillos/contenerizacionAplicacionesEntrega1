FROM mysql:8.0

# Copiar el script de inicialización al directorio de ejecución automática al iniciar el contenedor
COPY init.sql /docker-entrypoint-initdb.d/

# Exponer el puerto estándar de MySQL
EXPOSE 3306
