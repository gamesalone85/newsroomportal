
/* =========================================================
   NEWSROOM PORTAL
   TICKETS
   LISTADO DE REPORTES
   FIREBASE FIRESTORE
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =================================================
           VERIFICAR AUTH.JS
        ================================================== */

        if (
            typeof verificarSesion !==
            "function"
        ) {

            console.error(
                "Newsroom Portal: auth.js no disponible."
            );

            return;

        }


        /* =================================================
           VERIFICAR SESIÓN
        ================================================== */

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

            console.error(
                "Newsroom Portal: no existe sesión."
            );

            return;

        }



        /* =================================================
           VERIFICAR FIREBASE
        ================================================== */

        if (
            typeof newsroomDB ===
            "undefined"
        ) {

            console.error(
                "Newsroom Portal: Firestore no está disponible."
            );

            mostrarError(
                "No fue posible conectar con el sistema de tickets."
            );

            return;

        }



        /* =================================================
           VERIFICAR UID
        ================================================== */

        if (
            !session.uid
        ) {

            console.error(
                "Newsroom Portal: la sesión no contiene UID de Firebase.",
                session
            );

            mostrarError(
                "La sesión del usuario no es válida."
            );

            return;

        }



        /* =================================================
           USUARIO
        ================================================== */

        actualizarUsuario(
            session
        );



        /* =================================================
           CARGAR TICKETS
        ================================================== */

        cargarTickets(
            session
        );

    }
);



/* =========================================================
   ACTUALIZAR USUARIO
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
   CARGAR TICKETS DESDE FIRESTORE
========================================================= */

async function cargarTickets(
    session
) {


    const tbody =
        document.getElementById(
            "ticketsTableBody"
        );


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    if (!tbody) {

        console.error(
            "Newsroom Portal: no se encontró ticketsTableBody."
        );

        return;

    }



    /* =================================================
       ESTADO DE CARGA
    ================================================== */

    tbody.innerHTML = `

        <tr>

            <td
                colspan="10"
                style="text-align:center; padding:40px;"
            >

                <i class="fa-solid fa-spinner fa-spin"></i>

                Cargando tickets...

            </td>

        </tr>

    `;


    if (emptyState) {

        emptyState.style.display =
            "none";

    }



    /* =================================================
       CONSULTAR FIRESTORE
    ================================================= */

    try {


        console.log(
            "Newsroom Portal: consultando tickets de:",
            session.uid
        );


        const snapshot =
            await newsroomDB
                .collection("tickets")
                .where(
                    "usuario_id",
                    "==",
                    session.uid
                )
                .get();



        /* =================================================
           CONVERTIR DOCUMENTOS
        ================================================= */

        let tickets = [];


        snapshot.forEach(
            doc => {

                const data =
                    doc.data();


                tickets.push({

                    /*
                     * Conservamos el ID de Firestore
                     * para abrir el detalle posteriormente.
                     */

                    id:
                        doc.id,

                    ...data

                });

            }
        );



        console.log(
            "Newsroom Portal: tickets encontrados:",
            tickets.length
        );



        /* =================================================
           FILTRAR CERRADOS
        ================================================= */

        tickets =
            tickets.filter(
                ticket =>
                    String(
                        ticket.estatus ||
                        ""
                    )
                    .toLowerCase() !==
                    "cerrado"
            );



        /* =================================================
           ORDENAR
        ================================================= */

        tickets.sort(
            (a, b) => {

                const fechaA =
                    obtenerFechaOrden(
                        a.fecha_creacion
                    );


                const fechaB =
                    obtenerFechaOrden(
                        b.fecha_creacion
                    );


                return fechaB - fechaA;

            }
        );



        /* =================================================
           EMPTY STATE
        ================================================= */

        if (
            tickets.length ===
            0
        ) {

            tbody.innerHTML = "";


            if (emptyState) {

                emptyState.style.display =
                    "block";

            }


            return;

        }


        if (emptyState) {

            emptyState.style.display =
                "none";

        }



        /* =================================================
           GENERAR FILAS
        ================================================= */

        tbody.innerHTML = "";


        tickets.forEach(
            ticket => {

                generarFilaTicket(
                    ticket,
                    tbody
                );

            }
        );


    } catch (error) {


        console.error(
            "Newsroom Portal: error cargando tickets desde Firestore.",
            error
        );


        tbody.innerHTML = "";


        if (emptyState) {

            emptyState.style.display =
                "block";


            emptyState.innerHTML = `

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>
                    No fue posible cargar los tickets
                </h3>

                <p>
                    ${escapeHTML(
                        obtenerMensajeError(
                            error
                        )
                    )}
                </p>

            `;

        }

    }

}



/* =========================================================
   GENERAR FILA
========================================================= */

function generarFilaTicket(
    ticket,
    tbody
) {


    const row =
        document.createElement(
            "tr"
        );



    /* =================================================
       CLASE PRIORIDAD
    ================================================== */

    const prioridadClase =
        normalizarClase(
            ticket.prioridad
        );



    /* =================================================
       CLASE ESTATUS
    ================================================== */

    const estatusClase =
        normalizarClase(
            ticket.estatus
        );



    /* =================================================
       FECHA
    ================================================== */

    const fecha =
        formatearFecha(
            ticket.fecha_creacion
        );



    /* =================================================
       TÉCNICO
    ================================================== */

    const tecnico =
        ticket.tecnico
            ? ticket.tecnico
            : "Sin asignar";



    /* =================================================
       HTML
    ================================================== */

    row.innerHTML = `

        <td>

            <div class="ticket-number">

                #${escapeHTML(
                    ticket.folio ||
                    ticket.id
                )}

            </div>

            <div class="ticket-title">

                ${escapeHTML(
                    ticket.titulo
                )}

            </div>

        </td>


        <td>

            ${escapeHTML(
                ticket.empleado ||
                ""
            )}

        </td>


        <td>

            ${escapeHTML(
                ticket.division ||
                ""
            )}

        </td>


        <td>

            ${escapeHTML(
                ticket.area ||
                ""
            )}

        </td>


        <td>

            ${escapeHTML(
                ticket.categoria ||
                ""
            )}

        </td>


        <td>

            <span
                class="priority-badge priority-${prioridadClase}"
            >

                ${escapeHTML(
                    ticket.prioridad ||
                    ""
                )}

            </span>

        </td>


        <td>

            <span
                class="status-badge status-${estatusClase}"
            >

                ${escapeHTML(
                    ticket.estatus ||
                    ""
                )}

            </span>

        </td>


        <td>

            ${escapeHTML(
                tecnico
            )}

        </td>


        <td>

            ${escapeHTML(
                fecha
            )}

        </td>


        <td>

            <a
                href="detalle_ticket.html?id=${encodeURIComponent(ticket.id)}"
                class="btn-view"
            >

                <i class="fa-solid fa-eye"></i>

                Ver Ticket

            </a>

        </td>

    `;


    tbody.appendChild(
        row
    );

}



/* =========================================================
   OBTENER FECHA PARA ORDENAMIENTO
========================================================= */

function obtenerFechaOrden(
    fecha
) {


    if (!fecha) {

        return 0;

    }


    /*
     * Firestore Timestamp
     */

    if (
        typeof fecha.toDate ===
        "function"
    ) {

        return fecha
            .toDate()
            .getTime();

    }


    /*
     * Fecha JS
     */

    if (
        fecha instanceof Date
    ) {

        return fecha.getTime();

    }


    /*
     * String ISO
     */

    const date =
        new Date(
            fecha
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return 0;

    }


    return date.getTime();

}



/* =========================================================
   FORMATEAR FECHA
========================================================= */

function formatearFecha(
    fecha
) {


    if (!fecha) {

        return "Sin fecha";

    }


    let date;


    /*
     * Firestore Timestamp
     */

    if (
        typeof fecha.toDate ===
        "function"
    ) {

        date =
            fecha.toDate();

    }


    /*
     * JavaScript Date
     */

    else if (
        fecha instanceof Date
    ) {

        date =
            fecha;

    }


    /*
     * String / ISO
     */

    else {

        date =
            new Date(
                fecha
            );

    }


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return String(
            fecha
        );

    }


    return date.toLocaleString(
        "es-MX",
        {

            year:
                "numeric",

            month:
                "2-digit",

            day:
                "2-digit",

            hour:
                "2-digit",

            minute:
                "2-digit"

        }
    );

}



/* =========================================================
   NORMALIZAR CLASE
========================================================= */

function normalizarClase(
    valor
) {

    return String(
        valor || ""
    )
    .toLowerCase()
    .normalize(
        "NFD"
    )
    .replace(
        /[\u0300-\u036f]/g,
        ""
    )
    .replace(
        /\s+/g,
        "-"
    );

}



/* =========================================================
   MENSAJE DE ERROR
========================================================= */

function obtenerMensajeError(
    error
) {


    if (!error) {

        return "Error desconocido.";

    }


    switch (
        error.code
    ) {

        case "permission-denied":

            return (
                "Firebase rechazó la consulta por permisos de Firestore."
            );


        case "failed-precondition":

            return (
                "Firestore requiere una configuración adicional para realizar esta consulta."
            );


        case "unavailable":

            return (
                "Firebase no está disponible temporalmente. Inténtalo nuevamente."
            );


        default:

            return (
                error.message ||
                "No fue posible cargar los tickets."
            );

    }

}



/* =========================================================
   MOSTRAR ERROR
========================================================= */

function mostrarError(
    mensaje
) {


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    const tbody =
        document.getElementById(
            "ticketsTableBody"
        );


    if (tbody) {

        tbody.innerHTML = "";

    }


    if (!emptyState) {

        return;

    }


    emptyState.style.display =
        "block";


    emptyState.innerHTML = `

        <i class="fa-solid fa-triangle-exclamation"></i>

        <h3>
            Error
        </h3>

        <p>
            ${escapeHTML(
                mensaje
            )}
        </p>

    `;

}



/* =========================================================
   PROTECCIÓN HTML
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

