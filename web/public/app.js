// ==========================================================================
// ESTADO GLOBAL DE LA APLICACIÓN
// ==========================================================================
const state = {
    projects: [],
    tasks: [],
    activeTab: 'dashboard'
};

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initModals();
    initForms();
    initSeedButtons();
    
    // Cargar datos iniciales
    refreshAllData();
});

// ==========================================================================
// SISTEMA DE NAVEGACIÓN Y PESTAÑAS
// ==========================================================================
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    const tabMeta = {
        dashboard: {
            title: "Panel de Control",
            desc: "Vista consolidada, estadísticas y cumplimiento de requisitos del sistema."
        },
        proyectos: {
            title: "Gestión de Proyectos",
            desc: "Listado interactivo de proyectos registrados y visualización de relaciones."
        },
        tareas: {
            title: "Control de Tareas",
            desc: "Muro de control de tareas del sistema con dependencias de proyectos."
        },
    };

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Cambiar clase activa en botones
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Cambiar clase activa en secciones
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`tab-${tabId}`).classList.add('active');
            
            // Actualizar textos del header
            document.getElementById('current-tab-title').textContent = tabMeta[tabId].title;
            document.getElementById('current-tab-desc').textContent = tabMeta[tabId].desc;
            
            state.activeTab = tabId;
            
            // Refrescar datos al cambiar de vista para asegurar actualización
            if (tabId === 'proyectos' || tabId === 'tareas' || tabId === 'dashboard') {
                refreshAllData();
            }
        });
    });

}

// ==========================================================================
// GESTIÓN DE MODALES
// ==========================================================================
function initModals() {
    const projModal = document.getElementById('project-modal');
    const taskModal = document.getElementById('task-modal');
    
    // Abrir modales
    document.getElementById('btn-open-project-modal').addEventListener('click', () => openModal(projModal));
    document.getElementById('btn-new-project-inline').addEventListener('click', () => openModal(projModal));
    document.getElementById('btn-open-task-modal').addEventListener('click', () => {
        populateProjectDropdown();
        openModal(taskModal);
    });
    
    // Cerrar con botones X
    document.getElementById('btn-close-project-modal').addEventListener('click', () => closeModal(projModal));
    document.getElementById('btn-close-task-modal').addEventListener('click', () => closeModal(taskModal));
    
    // Cerrar con botones Cancelar
    document.getElementById('btn-cancel-project').addEventListener('click', () => closeModal(projModal));
    document.getElementById('btn-cancel-task').addEventListener('click', () => closeModal(taskModal));
    
    // Cerrar haciendo click fuera del modal
    window.addEventListener('click', (e) => {
        if (e.target === projModal) closeModal(projModal);
        if (e.target === taskModal) closeModal(taskModal);
    });
}

function openModal(modal) {
    modal.classList.add('open');
}

function closeModal(modal) {
    modal.classList.remove('open');
}

// ==========================================================================
// LLAMADAS Y PETICIONES API (HTTP FETCH)
// ==========================================================================
async function refreshAllData() {
    try {
        const [projectsRes, tasksRes] = await Promise.all([
            fetch('/api/proyectos'),
            fetch('/api/tareas')
        ]);
        
        state.projects = await projectsRes.json();
        state.tasks = await tasksRes.json();
        
        // Renderizar vistas
        renderDashboardStats();
        renderProjects();
        renderTasksTable();
    } catch (error) {
        console.error('Error al sincronizar datos de la API:', error);
        showToast('Error al conectar con la API de la base de datos', 'error');
    }
}

// Rellenar el dropdown de proyectos al crear una tarea
function populateProjectDropdown() {
    const select = document.getElementById('t-proyecto');
    select.innerHTML = '<option value="">Seleccione un proyecto...</option>';
    
    state.projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.nombre;
        select.appendChild(option);
    });
}

// ==========================================================================
// RENDERIZAR INTERFAZ DE USUARIO (DOM MANIPULATION)
// ==========================================================================

// 1. RENDERIZAR DASHBOARD
function renderDashboardStats() {
    // Presupuesto total (Suma presupuesto de proyectos)
    const totalBudget = state.projects.reduce((acc, p) => acc + parseFloat(p.presupuesto), 0);
    document.getElementById('stat-budget').textContent = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(totalBudget);
    
    // Proyectos Activos
    const activeProjects = state.projects.filter(p => p.activo === 1 || p.activo === true).length;
    document.getElementById('stat-active-projects').textContent = activeProjects;
    
    // Progreso de Tareas (Completadas / Total)
    const totalTasks = state.tasks.length;
    const completedTasks = state.tasks.filter(t => t.completada === 1 || t.completada === true).length;
    const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    document.getElementById('stat-tasks-progress').textContent = `${progressPercent}%`;
    document.getElementById('stat-tasks-count').textContent = `${completedTasks} / ${totalTasks} tareas completadas`;
    
    // Promedio de Horas Estimadas por Tarea
    const totalHours = state.tasks.reduce((acc, t) => acc + parseInt(t.horas_estimadas), 0);
    const avgHours = totalTasks > 0 ? Math.round(totalHours / totalTasks) : 0;
    document.getElementById('stat-avg-hours').textContent = `${avgHours}h`;
    
    // Gráfico de Prioridades
    const priorities = { Alta: 0, Media: 0, Baja: 0 };
    state.projects.forEach(p => {
        if (priorities[p.prioridad] !== undefined) {
            priorities[p.prioridad]++;
        }
    });
    
    const maxVal = Math.max(priorities.Alta, priorities.Media, priorities.Baja, 1); // evitar division por cero
    
    // Rellenar barras y valores
    const updateBar = (priorityKey, cssId, valId) => {
        const val = priorities[priorityKey];
        const percent = (val / maxVal) * 100;
        document.getElementById(cssId).style.width = `${percent}%`;
        document.getElementById(valId).textContent = val;
    };
    
    updateBar('Alta', 'bar-priority-high', 'val-priority-high');
    updateBar('Media', 'bar-priority-medium', 'val-priority-medium');
    updateBar('Baja', 'bar-priority-low', 'val-priority-low');
}

// 2. RENDERIZAR PROYECTOS
function renderProjects() {
    const container = document.getElementById('projects-container');
    container.innerHTML = '';
    
    if (state.projects.length === 0) {
        container.innerHTML = `
            <div class="loading-state">
                <i class="fa-solid fa-folder-open" style="font-size: 30px; margin-bottom: 10px;"></i>
                <p>No hay proyectos registrados aún.</p>
                <p style="font-size: 11px; font-weight: normal; color: var(--text-muted);">Usa el botón "Nuevo Proyecto" o realiza la precarga rápida.</p>
            </div>
        `;
        return;
    }
    
    state.projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        
        // Buscar tareas del proyecto
        const projectTasks = state.tasks.filter(t => t.proyecto_id === project.id);
        const completedCount = projectTasks.filter(t => t.completada === 1 || t.completada === true).length;
        
        // Formatear Fecha
        const fechaFormateada = new Date(project.fecha_inicio).toLocaleDateString('es-ES', { timeZone: 'UTC' });
        const budgetFormatted = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(project.presupuesto);
        
        // Determinar prioridad badge clase
        let priorityBadgeClass = 'badge-purple';
        if (project.prioridad === 'Alta') priorityBadgeClass = 'badge-danger';
        else if (project.prioridad === 'Baja') priorityBadgeClass = 'badge-success';
        
        card.innerHTML = `
            <div>
                <div class="project-card-header">
                    <h3>${escapeHTML(project.nombre)}</h3>
                    <span class="badge ${project.activo ? 'badge-success' : 'badge-danger'}">${project.activo ? 'Activo' : 'Inactivo'}</span>
                </div>
                <p class="project-desc">${escapeHTML(project.descripcion || 'Sin descripción detallada.')}</p>
                
                <div class="project-details-list">
                    <div class="project-detail-item">
                        <strong>Cliente:</strong>
                        <span>${escapeHTML(project.cliente)}</span>
                    </div>
                    <div class="project-detail-item">
                        <strong>Presupuesto:</strong>
                        <span>${budgetFormatted}</span>
                    </div>
                    <div class="project-detail-item">
                        <strong>F. Inicio:</strong>
                        <span>${fechaFormateada}</span>
                    </div>
                    <div class="project-detail-item">
                        <strong>Prioridad:</strong>
                        <span class="badge ${priorityBadgeClass}">${project.prioridad}</span>
                    </div>
                </div>
            </div>
            
            <div>
                <div class="project-card-footer">
                    <span class="text-muted" style="font-size: 11px; font-weight: 600;">
                        <i class="fa-solid fa-list-check"></i> ${completedCount} / ${projectTasks.length} Tareas
                    </span>
                    <button class="btn-danger-icon" onclick="eliminarProyecto(${project.id})" title="Eliminar Proyecto y sus Tareas">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
                
                <!-- Acordeón de Tareas -->
                ${projectTasks.length > 0 ? `
                    <div class="project-tasks-accordion">
                        <button class="accordion-header-btn" onclick="toggleAccordion(this)">
                            <span>Ver tareas vinculadas</span>
                            <i class="fa-solid fa-chevron-down"></i>
                        </button>
                        <div class="accordion-content">
                            ${projectTasks.map(task => `
                                <div class="accordion-task-item">
                                    <span class="${task.completada ? 'text-muted' : ''}" style="${task.completada ? 'text-decoration: line-through;' : ''}">
                                        ${escapeHTML(task.titulo)}
                                    </span>
                                    <span class="badge ${task.completada ? 'badge-success' : 'badge-purple'}">
                                        ${task.completada ? 'Completada' : `${task.horas_estimadas}h`}
                                    </span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        container.appendChild(card);
    });
}

// 3. RENDERIZAR TABLA DE TAREAS
function renderTasksTable() {
    const tbody = document.getElementById('tasks-table-body');
    tbody.innerHTML = '';
    
    if (state.tasks.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center text-muted" style="padding: 30px;">
                    No hay tareas registradas aún en el sistema.
                </td>
            </tr>
        `;
        return;
    }
    
    state.tasks.forEach(task => {
        const tr = document.createElement('tr');
        const fecha = new Date(task.fecha_entrega).toLocaleDateString('es-ES', { timeZone: 'UTC' });
        const costo = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(task.costo_estimado);
        
        tr.innerHTML = `
            <td><code>#${task.id}</code></td>
            <td><strong>${escapeHTML(task.titulo)}</strong></td>
            <td><span class="badge badge-purple">${escapeHTML(task.proyecto_nombre)}</span></td>
            <td>${escapeHTML(task.responsable)}</td>
            <td>${fecha}</td>
            <td>${task.horas_estimadas} hrs</td>
            <td>${costo}</td>
            <td>
                <span class="badge ${task.completada ? 'badge-success' : 'badge-danger'}">
                    ${task.completada ? 'Completada' : 'Pendiente'}
                </span>
            </td>
            <td>
                <button class="btn-danger-icon" onclick="eliminarTarea(${task.id})" title="Eliminar Tarea">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Auxiliar para acordeones
window.toggleAccordion = function(btn) {
    const content = btn.nextElementSibling;
    const icon = btn.querySelector('i');
    
    content.classList.toggle('open');
    if (content.classList.contains('open')) {
        icon.className = 'fa-solid fa-chevron-up';
    } else {
        icon.className = 'fa-solid fa-chevron-down';
    }
};

// ==========================================================================
// ACCIONES Y ENVIOS DE FORMULARIOS (CREACIÓN Y ELIMINACIÓN)
// ==========================================================================
function initForms() {
    // Formulario de Proyectos
    document.getElementById('form-new-project').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            nombre: document.getElementById('p-nombre').value,
            cliente: document.getElementById('p-cliente').value,
            presupuesto: parseFloat(document.getElementById('p-presupuesto').value),
            prioridad: document.getElementById('p-prioridad').value,
            fecha_inicio: document.getElementById('p-fecha-inicio').value,
            activo: document.getElementById('p-activo').checked,
            descripcion: document.getElementById('p-descripcion').value
        };
        
        try {
            const res = await fetch('/api/proyectos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                showToast('Proyecto registrado correctamente en la base de datos', 'success');
                closeModal(document.getElementById('project-modal'));
                document.getElementById('form-new-project').reset();
                refreshAllData();
            } else {
                const err = await res.json();
                showToast(`Error: ${err.error}`, 'error');
            }
        } catch (error) {
            showToast('Error al procesar la solicitud en el servidor', 'error');
        }
    });

    // Formulario de Tareas
    document.getElementById('form-new-task').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const payload = {
            proyecto_id: parseInt(document.getElementById('t-proyecto').value),
            titulo: document.getElementById('t-titulo').value,
            responsable: document.getElementById('t-responsable').value,
            fecha_entrega: document.getElementById('t-fecha-entrega').value,
            horas_estimadas: parseInt(document.getElementById('t-horas').value),
            costo_estimado: parseFloat(document.getElementById('t-costo').value || 0),
            completada: document.getElementById('t-completada').checked
        };
        
        try {
            const res = await fetch('/api/tareas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            if (res.ok) {
                showToast('Tarea guardada exitosamente y relacionada con el proyecto', 'success');
                closeModal(document.getElementById('task-modal'));
                document.getElementById('form-new-task').reset();
                refreshAllData();
            } else {
                const err = await res.json();
                showToast(`Error: ${err.error}`, 'error');
            }
        } catch (error) {
            showToast('Error al conectar con la API', 'error');
        }
    });
}

// Eliminar un proyecto
window.eliminarProyecto = async function(id) {
    if (!confirm('¿Está seguro de eliminar este proyecto? Todas sus tareas asociadas se borrarán de forma permanente en la base de datos.')) {
        return;
    }
    
    try {
        const res = await fetch(`/api/proyectos/${id}`, {
            method: 'DELETE'
        });
        
        if (res.ok) {
            showToast('Proyecto y sus tareas eliminados en cascada', 'success');
            refreshAllData();
        } else {
            showToast('Error al eliminar el proyecto', 'error');
        }
    } catch (error) {
        showToast('Error de red al intentar eliminar el registro', 'error');
    }
};

// Eliminar una tarea
window.eliminarTarea = async function(id) {
    if (!confirm('¿Está seguro de eliminar esta tarea permanentemente?')) {
        return;
    }
    
    try {
        const res = await fetch(`/api/tareas/${id}`, {
            method: 'DELETE'
        });
        
        if (res.ok) {
            showToast('Tarea eliminada correctamente', 'success');
            refreshAllData();
        } else {
            showToast('Error al eliminar la tarea', 'error');
        }
    } catch (error) {
        showToast('Error al comunicar con el servidor', 'error');
    }
};

// ==========================================================================
// PRECARGA DE DATOS SEMILLA (15 REGISTROS)
// ==========================================================================
function initSeedButtons() {
    const btnQuick = document.getElementById('btn-quick-seed');
    const btnDashboard = document.getElementById('btn-dashboard-seed');
    
    const ejecutarSeeder = async () => {
        const originalTextQ = btnQuick.innerHTML;
        const originalTextD = btnDashboard.innerHTML;
        
        // Estilo cargando
        btnQuick.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sembrando...';
        btnDashboard.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Cargando semilla...';
        btnQuick.disabled = true;
        btnDashboard.disabled = true;
        
        try {
            const res = await fetch('/api/seed', { method: 'POST' });
            const data = await res.json();
            
            if (res.ok) {
                showToast(data.mensaje, 'success');
                // Sincronizar UI
                await refreshAllData();
            } else {
                showToast(`Error: ${data.error}`, 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error en la llamada de red al sembrar datos', 'error');
        } finally {
            // Reestablecer botones
            btnQuick.innerHTML = originalTextQ;
            btnDashboard.innerHTML = originalTextD;
            btnQuick.disabled = false;
            btnDashboard.disabled = false;
        }
    };
    
    btnQuick.addEventListener('click', ejecutarSeeder);
    btnDashboard.addEventListener('click', ejecutarSeeder);
}

// ==========================================================================
// UTILIDADES (TOAST, COPIAR PORTAPAPELES, SEGURIDAD)
// ==========================================================================
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${escapeHTML(message)}</span>
    `;
    
    container.appendChild(toast);
    
    // Remover del DOM al terminar animación
    setTimeout(() => {
        toast.remove();
    }, 4000);
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
