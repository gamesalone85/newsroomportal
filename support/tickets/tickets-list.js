/* =========================================================
   NEWSROOM PORTAL
   TICKETS
   LISTADO DE REPORTES
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
                "Newsroom Portal: auth.js no disponible."
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
           CARGAR TICKETS
        ================================================== */

        cargarTickets();

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
   CARGAR TICKETS
========================================================= */

function cargarTickets() {


    const tbody =
        document.getElementById(
            "ticketsTableBody"
        );


    const emptyState =
        document.getElementById(
            "emptyState"
        );


    if (!tbody) {
        return;
    }



    /* =================================================
       OBTENER DATOS
    ================================================== */

    let tickets = [];


    if (
        typeof obtenerTickets ===
        "function"
    ) {

        tickets =
            obtenerTickets();

    }



    /* =================================================
       FILTRAR CERRADOS
    ================================================== */

    tickets =
        tickets.filter(
            ticket =>
                ticket.estatus !==
                "Cerrado"
        );



    /* =================================================
       ORDENAR
    ================================================== */

    tickets.sort(
        (a, b) =>
            Number(b.id) -
            Number(a.id)
    );



    /* =================================================
       EMPTY STATE
    ================================================== */

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
    ================================================== */

    tbody.innerHTML = "";


    tickets.forEach(
        ticket => {


            const row =
                document.createElement(
                    "tr"
                );


            /* =========================================
               CLASES
            ========================================= */

            const prioridadClase =
                normalizarClase(
                    ticket.prioridad
                );


            const estatusClase =
                normalizarClase(
                    ticket.estatus
                );



            /* =========================================
               FECHA
            ========================================= */

            const fecha =
                formatearFecha(
                    ticket.fecha_creacion
                );



            /* =========================================
               TÉCNICO
            ========================================= */

            const tecnico =
                ticket.tecnico
                    ? ticket.tecnico
                    : "Sin asignar";



            /* =========================================
               HTML
            ========================================= */

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
   FORMATEAR FECHA
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
