// Variable global para mantener el contexto de la sesión actual
let contextoActual = {
    categoria: "Soporte General",
    prioridad: "Media",
    descripcion: ""
};

// Asegurar que el script espere a que el HTML esté listo
document.addEventListener("DOMContentLoaded", () => {
    console.log("Asistente de Newsroom cargado correctamente.");
});

function toggleAssistant() {
    const chat = document.getElementById("aiChat");
    if (!chat) return;
    
    // Forzamos el cambio de estado independientemente del CSS externo
    if (chat.style.display === "none" || chat.style.display === "") {
        chat.style.display = "block";
    } else {
        chat.style.display = "none";
    }
}

function analizarProblemaEspecializado(texto) {
    const input = texto.toLowerCase();
    
    const baseConocimiento = [
        {
            llaves: ["vpn", "acceso remoto", "forticlient", "anyconnect"],
            cat: "Infraestructura / VPN",
            pri: "Alta",
            soluciones: [
                "Verificar estabilidad de conexión a internet.",
                "Reiniciar el servicio de VPN desde el Administrador de Tareas.",
                "Asegurarse de que el token de autenticación no haya expirado.",
                "Validar que el firewall corporativo no esté bloqueando el acceso."
            ]
        },
        {
            llaves: ["correo", "outlook", "email", "buzon", "no llegan"],
            cat: "Servicios de Correo",
            pri: "Media",
            soluciones: [
                "Revisar el estado de la conexión en la barra inferior de Outlook.",
                "Limpiar archivos temporales de Microsoft Office.",
                "Verificar espacio de almacenamiento en la nube (OneDrive/Outlook).",
                "Intentar acceso vía Webmail para descartar falla de la aplicación."
            ]
        },
        {
            llaves: ["wifi", "internet", "lento", "red", "desconectado"],
            cat: "Conectividad (Redes)",
            pri: "Alta",
            soluciones: [
                "Olvidar la red corporativa en los ajustes de Windows y re-conectar.",
                "Verificar que el modo avión esté desactivado.",
                "Reiniciar el adaptador de red inalámbrica.",
                "Si usas cable, validar que los leds del puerto estén parpadeando."
            ]
        }

    {
        llaves: ["vpn", "acceso"],
        cat: "VPN", // Coincide con tu <option>VPN</option>
        pri: "Alta",
        // ... soluciones
    },
    {
        llaves: ["wifi", "lento"],
        cat: "WIFI", // Coincide con tu <option>WIFI</option>
        pri: "Alta",
        // ... soluciones
    }
];
    ];

    let coincidencia = baseConocimiento.find(item => 
        item.llaves.some(llave => input.includes(llave))
    );

    return coincidencia || {
        cat: "Soporte Técnico General",
        pri: "Media",
        soluciones: [
            "Reiniciar el equipo para refrescar servicios de sistema.",
            "Verificar si el problema afecta a otros compañeros de tu área.",
            "Validar si hay actualizaciones de Windows Update pendientes."
        ]
    };
}

function procesarIA() {
    const inputElement = document.getElementById("aiInput");
    const responseElement = document.getElementById("aiResponse");
    
    if (!inputElement || !responseElement) return;

    const texto = inputElement.value.trim();
    if (texto === "") return;

    const analise = analizarProblemaEspecializado(texto);

    // Guardado de contexto para el ticket final
    contextoActual.categoria = analise.cat;
    contextoActual.prioridad = analise.pri;
    contextoActual.descripcion = texto;

    let listaHTML = analise.soluciones.map(s => 
        `<li class="mb-2"><i class="bi bi-info-circle-fill me-2 text-primary"></i>${s}</li>`
    ).join('');

    responseElement.innerHTML = `
        <div class="ai-result border-start border-4 border-primary ps-3 animate__animated animate__fadeIn">
            <h6 class="text-primary d-flex align-items-center">
                <i class="bi bi-cpu-fill me-2"></i> Análisis del Asistente
            </h6>
            <p class="small text-muted mb-2">Problema identificado: <strong>${analise.cat}</strong>.</p>
            <ul class="list-unstyled mb-3 small text-dark">${listaHTML}</ul>
            <div class="d-grid gap-2">
                <button class="btn btn-sm btn-success" onclick="problemaResuelto()">✅ Funcionó</button>
                <button class="btn btn-sm btn-outline-danger" onclick="solicitarDatosTicket()">❌ Sigo con problemas</button>
            </div>
        </div>
    `;
}

function problemaResuelto() {
    document.getElementById("aiResponse").innerHTML = `
        <div class="alert alert-success mt-3 shadow-sm border-0">
            <i class="bi bi-emoji-smile-fill me-2"></i> <strong>¡Excelente!</strong> Me alegra haberte ayudado.
        </div>
    `;
}

function solicitarDatosTicket() {
    document.getElementById("aiResponse").innerHTML = `
        <div class="card card-body bg-light border-0 shadow-sm mt-3">
            <h6 class="mb-3 text-danger d-flex align-items-center">
                <i class="bi bi-ticket-perforated me-2"></i> Generar Ticket
            </h6>
            <input type="text" id="nombreUsuario" class="form-control form-control-sm mb-2" placeholder="Nombre completo">
            <select id="divisionUsuario" class="form-select form-select-sm mb-2">
                <option value="">Selecciona tu división</option>
                <option value="Adenergy">Adenergy</option>
                <option value="Ducter">Ducter</option>
                <option value="Nietofin">Nietofin</option>
            </select>
            <input type="text" id="contactoUsuario" class="form-control form-control-sm mb-2" placeholder="Correo o Extensión">
            <input type="text" id="equipoUsuario" class="form-control form-control-sm mb-2" placeholder="ID de Activo (Opcional)">
            <button class="btn btn-primary btn-sm w-100 mt-2" onclick="crearTicketAutomatico()">🎫 Enviar Reporte</button>
        </div>
    `;
}

function crearTicketAutomatico() {
    const usuarioForm = document.getElementById("nombreUsuario").value;
    const divisionForm = document.getElementById("divisionUsuario").value;
    const contactoForm = document.getElementById("contactoUsuario").value;
    const equipoForm = document.getElementById("equipoUsuario").value;

    if (!usuarioForm || !divisionForm) {
        alert("El nombre y la división son obligatorios.");
        return;
    }

    // 1. Obtenemos lo que ya existe en la plataforma de tickets
    let tickets = JSON.parse(localStorage.getItem("tickets")) || [];
    
    // 2. Creamos el objeto con el formato exacto de tu plataforma
    const nuevoTicket = {
        ticket: `TKT-${String(tickets.length + 1).padStart(4, "0")}`,
        usuario: usuarioForm,
        fecha: new Date().toLocaleString(),
        division: divisionForm,
        categoria: contextoActual.categoria, // Viene del análisis de la IA
        prioridad: contextoActual.prioridad,
        descripcion: contextoActual.descripcion,
        contacto: contactoForm,
        equipo: equipoForm,
        estado: "Abierto"
    };

    // 3. Guardamos en el mismo almacén que usa support.js
    tickets.push(nuevoTicket);
    localStorage.setItem("tickets", JSON.stringify(tickets));

    // 4. FEEDBACK VISUAL
    document.getElementById("aiResponse").innerHTML = `
        <div class="text-center p-3 mt-2 shadow-sm rounded bg-white border-top border-success border-4">
            <i class="bi bi-check-circle-fill text-success d-block mb-2" style="font-size: 2.5rem;"></i>
            <h6 class="fw-bold">Ticket Enviado a Mesa de Ayuda</h6>
            <p class="small mb-1">Folio: <strong>${nuevoTicket.ticket}</strong></p>
            <hr>
            <button class="btn btn-sm btn-outline-primary" onclick="location.reload()">Ver en mi historial</button>
        </div>
    `;
    
    // 5. Opcional: Si el usuario ya está en la página de soporte, recargar la tabla
    if (typeof renderTickets === 'function') {
        renderTickets();
    }
}
