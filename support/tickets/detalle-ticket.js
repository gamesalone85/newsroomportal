```javascript
/* =========================================================
   NEWSROOM PORTAL
   DETALLE DE TICKET
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =================================================
           SESIÓN
        ================================================== */

        if (
            typeof verificarSesion !==
            "function"
        ) {

            console.error(
                "auth.js no disponible."
            );

            return;

        }


        if (
            !verificarSesion(
                "../../login.html"
            )
        ) {

            return;

        }


        const session =
            obtenerSesion();


        if (!session) {

            return;

        }



        /* =================================================
           USUARIO
        ================================================== */

        actualizarUsuario(
            session
        );



        /* =================================================
           ID DEL TICKET
        ================================================== */

        const params =
            new URLSearchParams(
                window.location.search
            );


        const ticketId =
            params.get("id");


        if (!ticketId) {

            window.location.href =
                "mis_reportes.html";

            return;

        }



        /* =================================================
           CARGAR TICKET
        ================================================== */

        const ticket =
            obtenerTicketPorId(
                ticketId
            );


        if (!ticket) {

            mostrarTicketNoEncontrado();

            return;

        }



        /* =================================================
           MOSTRAR TICKET
        ================================================== */

        mostrarTicket(
            ticket
        );



        /* =================================================
           CONFIGURAR FORMULARIO
        ================================================== */

        configurarFormulario(
            ticket,
            session
        );



        /* =================================================
           HISTORIAL
        ================================================== */

        cargarHistorial(
            ticket.id
        );



        /* =================================================
           KNOWLEDGE BASE
        ================================================== */

        configurarKnowledgeBase();

    }
);



/* =========================================================
   USUARIO
========================================================= */

function actualizarUsuario(
    session
) {

    const nombre =
        session.nombre ||
        session.usuario ||
        "Usuario";


    const userName =
        document.getElementById(
            "userName"
        );


    const userAvatar =
        document.getElementById(
            "userAvatar"
        );


    if (userName) {

        userName.textContent =
            nombre;

    }


    if (userAvatar) {

        userAvatar.textContent =
            nombre
                .charAt(0)
                .toUpperCase();

    }

}



/* =========================================================
   OBTENER TICKET
========================================================= */

function obtenerTicketPorId(
    id
) {

    if (
        typeof obtenerTickets !==
        "function"
    ) {

        return null;

    }


    const tickets =
        obtenerTickets();


    return tickets.find(
        ticket =>
            String(ticket.id) ===
            String(id)
    ) || null;

}



/* =========================================================
   MOSTRAR TICKET
========================================================= */

function mostrarTicket(
    ticket
) {

    const title =
        document.getElementById(
            "ticketTitle"
        );


    const description =
        document.getElementById(
            "ticketDescription"
        );


    const pageTitle =
        document.getElementById(
            "pageTitle"
        );


    if (title) {

        title.textContent =
            ticket.titulo ||
            "Sin título";

    }


    if (description) {

        description.textContent =
            ticket.descripcion ||
            "Sin descripción";

    }


    if (pageTitle) {

        pageTitle.textContent =
            "Ticket #" +
            (
                ticket.folio ||
                ticket.id
            );

    }



    /* =================================================
       INFORMACIÓN
    ================================================== */

    const info =
        document.getElementById(
            "ticketInfoGrid"
        );


    if (!info) {

        return;

    }


    info.innerHTML = `

        ${crearInfo(
            "Empleado",
            ticket.empleado
        )}

        ${crearInfo(
            "Contacto",
            ticket.contacto
        )}

        ${crearInfo(
            "División",
            ticket.division
        )}

        ${crearInfo(
            "Área",
            ticket.area
        )}

        ${crearInfo(
            "Categoría",
            ticket.categoria
        )}

        ${crearInfo(
            "Equipo",
            ticket.equipo
        )}

        ${crearInfo(
            "Prioridad",
            ticket.prioridad
        )}

        ${crearInfo(
            "Estatus",
            ticket.estatus
        )}

        ${crearInfo(
            "Técnico",
            ticket.tecnico ||
            "Sin asignar"
        )}

        ${crearInfo(
            "Fecha de creación",
            formatearFecha(
                ticket.fecha_creacion
            )
        )}

        ${
            ticket.fecha_cierre
                ? crearInfo(
                    "Fecha de cierre",
                    formatearFecha(
                        ticket.fecha_cierre
                    )
                )
                : ""
        }

    `;



    /* =================================================
       SOLUCIÓN
    ================================================== */

    const solutionBox =
        document.getElementById(
            "solutionBox"
        );


    const solution =
        document.getElementById(
            "ticketSolution"
        );


    if (
        ticket.solucion &&
        ticket.solucion.trim() !== ""
    ) {

        solutionBox.style.display =
            "block";

        solution.textContent =
            ticket.solucion;

    }
    else {

        solutionBox.style.display =
            "none";

    }

}



/* =========================================================
   CREAR INFO
========================================================= */

function crearInfo(
    label,
    value
) {

    return `

        <div class="ticket-info-item">

            <span>
                ${escapeHTML(label)}
            </span>

            <strong>
                ${escapeHTML(
                    value ||
                    "No especificado"
                )}
            </strong>

        </div>

    `;

}



/* =========================================================
   FORMULARIO
========================================================= */

function configurarFormulario(
    ticket,
    session
) {

    const form =
        document.getElementById(
            "ticketForm"
        );


    const updateContainer =
        document.getElementById(
            "updateContainer"
        );


    const lockedMessage =
        document.getElementById(
            "lockedMessage"
        );


    const adminActionGroup =
        document.getElementById(
            "adminActionGroup"
        );


    const statusGroup =
        document.getElementById(
            "statusGroup"
        );


    const technicianGroup =
        document.getElementById(
            "technicianGroup"
        );


    const status =
        document.getElementById(
            "ticketStatus"
        );


    const adminStatus =
        document.getElementById(
            "adminStatus"
        );


    const technician =
        document.getElementById(
            "technicianSelect"
        );


    const solution =
        document.getElementById(
            "solutionInput"
        );



    /* =================================================
       ROL
    ================================================== */

    const rol =
        Number(
            session.rol_id
        );



    /* =================================================
       TÉCNICOS
    ================================================== */

    cargarTecnicos(
        technician
    );



    /* =================================================
       SOLUCIÓN ACTUAL
    ================================================== */

    if (solution) {

        solution.value =
            ticket.solucion ||
            "";

    }



    /* =================================================
       TICKET BLOQUEADO
    ================================================== */

    const bloqueado =
        [
            "Cerrado",
            "Cancelado"
        ].includes(
            ticket.estatus
        );


    if (
        bloqueado &&
        rol !== 1
    ) {

        updateContainer.style.display =
            "none";

        lockedMessage.style.display =
            "block";

        return;

    }



    /* =================================================
       MOSTRAR FORMULARIO
    ================================================== */

    updateContainer.style.display =
        "block";



    /* =================================================
       ADMIN REABRIENDO
    ================================================== */

    if (
        bloqueado &&
        rol === 1
    ) {

        adminActionGroup.style.display =
            "block";

        statusGroup.style.display =
            "none";

        technicianGroup.style.display =
            "none";

    }



    /* =================================================
       ESTATUS ACTUAL
    ================================================== */

    if (status) {

        status.value =
            ticket.estatus;

    }



    /* =================================================
       TÉCNICO ACTUAL
    ================================================== */

    if (technician) {

        technician.value =
            ticket.tecnico_id ||
            "";

    }



    /* =================================================
       SUBMIT
    ================================================== */

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            actualizarTicket(
                ticket,
                session
            );

        }
    );

}



/* =========================================================
   CARGAR TÉCNICOS
========================================================= */

function cargarTecnicos(
    select
) {

    if (!select) {

        return;

    }


    if (
        typeof obtenerUsuarios !==
        "function"
    ) {

        return;

    }


    const usuarios =
        obtenerUsuarios();


    const tecnicos =
        usuarios.filter(
            usuario =>
                Number(
                    usuario.rol_id
                ) === 2
        );


    tecnicos.forEach(
        tecnico => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                tecnico.id;


            option.textContent =
                tecnico.nombre;


            select.appendChild(
                option
            );

        }
    );

}



/* =========================================================
   ACTUALIZAR TICKET
========================================================= */

function actualizarTicket(
    ticket,
    session
) {

    const rol =
        Number(
            session.rol_id
        );


    const status =
        document.getElementById(
            "ticketStatus"
        );


    const adminStatus =
        document.getElementById(
            "adminStatus"
        );


    const technician =
        document.getElementById(
            "technicianSelect"
        );


    const comment =
        document.getElementById(
            "commentInput"
        );


    const solution =
        document.getElementById(
            "solutionInput"
        );



    /* =================================================
       DATOS
    ================================================== */

    let nuevoEstatus;


    if (
        ticket.estatus ===
        "Cerrado" ||
        ticket.estatus ===
        "Cancelado"
    ) {

        nuevoEstatus =
            adminStatus.value;

    }
    else {

        nuevoEstatus =
            status.value;

    }



    /* =================================================
       RESUELTO -> CERRADO
    ================================================== */

    if (
        nuevoEstatus ===
        "Resuelto" &&
        rol !== 1
    ) {

        nuevoEstatus =
            "Cerrado";

    }



    /* =================================================
       NUEVO TÉCNICO
    ================================================== */

    let tecnicoId =
        technician
            ? technician.value
            : "";


    let tecnicoNombre =
        "Sin asignar";


    if (tecnicoId) {

        const usuarios =
            obtenerUsuarios();


        const tecnico =
            usuarios.find(
                usuario =>
                    String(
                        usuario.id
                    ) ===
                    String(
                        tecnicoId
                    )
            );


        if (tecnico) {

            tecnicoNombre =
                tecnico.nombre;

        }

    }



    /* =================================================
       ACTUALIZAR
    ================================================== */

    const tecnicoAnterior =
        ticket.tecnico_id ||
        "";


    const ahora =
        new Date()
            .toISOString();


    ticket.estatus =
        nuevoEstatus;


    ticket.tecnico_id =
        tecnicoId ||
        null;


    ticket.tecnico =
        tecnicoNombre;


    ticket.fecha_actualizacion =
        ahora;



    /* =================================================
       SOLUCIÓN
    ================================================== */

    if (
        solution &&
        solution.value.trim() !== ""
    ) {

        ticket.solucion =
            solution.value.trim();

    }



    /* =================================================
       CIERRE
    ================================================== */

    if (
        nuevoEstatus ===
            "Cerrado" ||
        nuevoEstatus ===
            "Cancelado"
    ) {

        ticket.fecha_cierre =
            ahora;


        if (
            ticket.fecha_creacion
        ) {

            const inicio =
                new Date(
                    ticket.fecha_creacion
                );


            const fin =
                new Date(
                    ahora
                );


            ticket.tiempo_resolucion =
                Math.round(
                    (
                        fin -
                        inicio
                    ) / 60000
                );

        }

    }
    else {

        ticket.fecha_cierre =
            null;

        ticket.tiempo_resolucion =
            null;

    }



    /* =================================================
       GUARDAR
    ================================================== */

    guardarTicketActualizado(
        ticket
    );



    /* =================================================
       HISTORIAL
    ================================================== */

    if (
        String(tecnicoAnterior) !==
        String(tecnicoId)
    ) {

        agregarHistorial(
            ticket.id,
            session,
            "Asignación",
            "Ticket asignado a: " +
            tecnicoNombre
        );

    }


    if (
        comment &&
        comment.value.trim() !== ""
    ) {

        agregarHistorial(
            ticket.id,
            session,
            "Comentario",
            comment.value.trim()
        );

    }


    agregarHistorial(
        ticket.id,
        session,
        "Estatus",
        "Estatus actualizado a: " +
        nuevoEstatus
    );


    if (
        solution &&
        solution.value.trim() !== ""
    ) {

        agregarHistorial(
            ticket.id,
            session,
            "Solución",
            solution.value.trim()
        );

    }



    /* =================================================
       KNOWLEDGE BASE
    ================================================== */

    if (
        (
            nuevoEstatus ===
            "Resuelto" ||
            nuevoEstatus ===
            "Cerrado"
        ) &&
        ticket.solucion
    ) {

        guardarKnowledgeBase(
            ticket
        );

    }



    /* =================================================
       AVISO
    ================================================== */

    alert(
        "Ticket actualizado correctamente."
    );


    window.location.reload();

}



/* =========================================================
   GUARDAR TICKET
========================================================= */

function guardarTicketActualizado(
    ticket
) {

    const tickets =
        obtenerTickets();


    const index =
        tickets.findIndex(
            item =>
                String(
                    item.id
                ) ===
                String(
                    ticket.id
                )
        );


    if (index === -1) {

        return;

    }


    tickets[index] =
        ticket;


    localStorage.setItem(
        "newsroomTickets",
        JSON.stringify(
            tickets
        )
    );

}



/* =========================================================
   HISTORIAL
========================================================= */

function agregarHistorial(
    ticketId,
    session,
    tipo,
    detalle
) {

    const historial =
        JSON.parse(
            localStorage.getItem(
                "newsroomTicketHistory"
            )
        ) || [];


    historial.push({

        id:
            Date.now(),

        ticket_id:
            ticketId,

        usuario_id:
            session.id,

        usuario:
            session.nombre ||
            session.usuario,

        tipo:
            tipo,

        comentario:
            detalle,

        fecha:
            new Date()
                .toISOString()

    });


    localStorage.setItem(
        "newsroomTicketHistory",
        JSON.stringify(
            historial
        )
    );

}



/* =========================================================
   CARGAR HISTORIAL
========================================================= */

function cargarHistorial(
    ticketId
) {

    const tbody =
        document.getElementById(
            "historyBody"
        );


    if (!tbody) {

        return;

    }


    const historial =
        JSON.parse(
            localStorage.getItem(
                "newsroomTicketHistory"
            )
        ) || [];


    const registros =
        historial
            .filter(
                item =>
                    String(
                        item.ticket_id
                    ) ===
                    String(
                        ticketId
                    )
            )
            .sort(
                (a,b) =>
                    new Date(b.fecha) -
                    new Date(a.fecha)
            );


    tbody.innerHTML = "";


    if (
        registros.length ===
        0
    ) {

        tbody.innerHTML = `

            <tr>

                <td colspan="4">

                    No existe historial
                    registrado para este ticket.

                </td>

            </tr>

        `;

        return;

    }


    registros.forEach(
        registro => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>

                    ${escapeHTML(
                        formatearFecha(
                            registro.fecha
                        )
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        registro.usuario ||
                        "Sistema"
                    )}

                </td>


                <td>

                    <span
                        class="history-badge ${obtenerClaseBadge(
                            registro.tipo
                        )}"
                    >

                        ${escapeHTML(
                            registro.tipo
                        )}

                    </span>

                </td>


                <td>

                    ${escapeHTML(
                        registro.comentario
                    )}

                </td>

            `;


            tbody.appendChild(
                row
            );

        }
    );

}



/* =========================================================
   BADGE HISTORIAL
========================================================= */

function obtenerClaseBadge(
    tipo
) {

    switch (tipo) {

        case "Comentario":

            return "badge-comentario";


        case "Estatus":

            return "badge-estatus";


        case "Solución":

            return "badge-solucion";


        case "Asignación":

            return "badge-asignacion";


        default:

            return "badge-sistema";

    }

}



/* =========================================================
   KNOWLEDGE BASE
========================================================= */

function configurarKnowledgeBase() {

    const input =
        document.getElementById(
            "kbSearch"
        );


    const results =
        document.getElementById(
            "kbResults"
        );


    if (
        !input ||
        !results
    ) {

        return;

    }


    let timer;


    input.addEventListener(
        "input",
        function () {

            clearTimeout(
                timer
            );


            const query =
                this.value
                    .trim()
                    .toLowerCase();


            if (
                query.length <
                3
            ) {

                results.innerHTML =
                    "";

                return;

            }


            timer =
                setTimeout(
                    () => {

                        buscarKnowledgeBase(
                            query,
                            results
                        );

                    },
                    300
                );

        }
    );

}



/* =========================================================
   BUSCAR KNOWLEDGE BASE
========================================================= */

function buscarKnowledgeBase(
    query,
    results
) {

    const knowledge =
        JSON.parse(
            localStorage.getItem(
                "newsroomKnowledgeBase"
            )
        ) || [];


    const coincidencias =
        knowledge.filter(
            item => {

                const texto =

                    (
                        item.titulo +
                        " " +
                        item.problema +
                        " " +
                        item.solucion
                    )
                    .toLowerCase();


                return texto.includes(
                    query
                );

            }
        );


    if (
        coincidencias.length ===
        0
    ) {

        results.innerHTML = `

            <p>
                No hay coincidencias.
            </p>

        `;

        return;

    }


    results.innerHTML =
        coincidencias
            .map(
                item => `

                    <div class="kb-result">

                        <strong>
                            ${escapeHTML(
                                item.titulo
                            )}
                        </strong>

                        <p>
                            ${escapeHTML(
                                item.problema
                            )}
                        </p>

                        <details>

                            <summary>
                                Ver solución
                            </summary>

                            <p>
                                ${escapeHTML(
                                    item.solucion
                                )}
                            </p>

                        </details>

                    </div>

                `
            )
            .join("");

}



/* =========================================================
   KNOWLEDGE BASE
========================================================= */

function guardarKnowledgeBase(
    ticket
) {

    const knowledge =
        JSON.parse(
            localStorage.getItem(
                "newsroomKnowledgeBase"
            )
        ) || [];


    const existe =
        knowledge.some(
            item =>
                String(
                    item.created_from_ticket_id
                ) ===
                String(
                    ticket.id
                )
        );


    if (existe) {

        return;

    }


    knowledge.push({

        id:
            Date.now(),

        titulo:
            ticket.titulo,

        problema:
            ticket.descripcion,

        solucion:
            ticket.solucion,

        categoria:
            ticket.categoria ||
            "General",

        created_from_ticket_id:
            ticket.id,

        created_by:
            ticket.usuario_id,

        fecha:
            new Date()
                .toISOString()

    });


    localStorage.setItem(
        "newsroomKnowledgeBase",
        JSON.stringify(
            knowledge
        )
    );

}



/* =========================================================
   TICKET NO ENCONTRADO
========================================================= */

function mostrarTicketNoEncontrado() {

    const detail =
        document.getElementById(
            "ticketDetail"
        );


    if (!detail) {

        return;

    }


    detail.innerHTML = `

        <div
            style="
                text-align:center;
                padding:50px;
            "
        >

            <i
                class="fa-solid fa-ticket"
                style="
                    font-size:45px;
                    color:#c8102e;
                    margin-bottom:15px;
                "
            ></i>


            <h2>
                Ticket no encontrado
            </h2>


            <p>
                El ticket solicitado no existe
                o fue eliminado.
            </p>


            <a
                href="mis_reportes.html"
                class="btn-primary"
                style="
                    margin-top:15px;
                "
            >

                Volver a Mis Reportes

            </a>

        </div>

    `;

}



/* =========================================================
   FECHA
========================================================= */

function formatearFecha(
    fecha
) {

    if (!fecha) {

        return "Sin fecha";

    }


    const date =
        new Date(
            fecha
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return fecha;

    }


    return date.toLocaleString(
        "es-MX",
        {

            year: "numeric",

            month: "2-digit",

            day: "2-digit",

            hour: "2-digit",

            minute: "2-digit"

        }
    );

}



/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    valor
) {

    return String(
        valor ?? ""
    )
    .replace(
        /&/g,
        "&amp;"
    )
    .replace(
        /</g,
        "&lt;"
    )
    .replace(
        />/g,
        "&gt;"
    )
    .replace(
        /"/g,
        "&quot;"
    )
    .replace(
        /'/g,
        "&#039;"
    );

}
```
