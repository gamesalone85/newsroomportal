/* =========================================================
   NEWSROOM PORTAL
   DASHBOARD ADMINISTRATIVO DE TICKETS
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log(
        "Newsroom Portal: dashboard-admin.js cargado correctamente."
    );

    /* =====================================================
       VERIFICAR SESIÓN
    ===================================================== */

    if (typeof verificarSesion !== "function") {

        console.error(
            "Newsroom Portal: auth.js no está disponible."
        );

        return;
    }

    if (!verificarSesion("../../login.html")) {
        return;
    }

    const session =
        typeof obtenerSesion === "function"
            ? obtenerSesion()
            : null;

    if (!session) {
        return;
    }

    /* =====================================================
       VERIFICAR ADMINISTRADOR
    ===================================================== */

    if (Number(session.rol_id) !== 1) {

        alert(
            "No tienes permisos para acceder a esta sección."
        );

        window.location.href =
            "../dashboard/index.html";

        return;
    }

    /* =====================================================
       ACTUALIZAR USUARIO
    ===================================================== */

    actualizarUsuario(session);

    /* =====================================================
       CARGAR DASHBOARD
    ===================================================== */

    cargarDashboard();

    /* =====================================================
       EVENTOS
    ===================================================== */

    configurarEventos();

});


/* =========================================================
   ACTUALIZAR USUARIO
========================================================= */

function actualizarUsuario(session) {

    const nombre =
        session.nombre ||
        session.usuario ||
        "Administrador";

    const userName =
        document.getElementById("userName");

    const userAvatar =
        document.getElementById("userAvatar");

    if (userName) {
        userName.textContent = nombre;
    }

    if (userAvatar) {

        userAvatar.textContent =
            nombre.charAt(0).toUpperCase();

    }

}


/* =========================================================
   OBTENER TICKETS
========================================================= */

function obtenerTicketsAdmin() {

    let tickets = [];

    /* -----------------------------------------------------
       ESTRUCTURA GLOBAL
    ----------------------------------------------------- */

    if (
        typeof NEWSROOM_TICKETS !== "undefined" &&
        Array.isArray(NEWSROOM_TICKETS)
    ) {

        tickets = NEWSROOM_TICKETS;

    }

    /* -----------------------------------------------------
       LOCAL STORAGE
    ----------------------------------------------------- */

    try {

        const almacenados =
            JSON.parse(
                localStorage.getItem("newsroomTickets")
            );

        if (Array.isArray(almacenados)) {

            tickets = almacenados;

        }

    } catch (error) {

        console.error(
            "Error leyendo newsroomTickets:",
            error
        );

    }

    return Array.isArray(tickets)
        ? tickets
        : [];

}


/* =========================================================
   CARGAR DASHBOARD
========================================================= */

function cargarDashboard() {

    const tickets =
        obtenerTicketsAdmin();

    actualizarKPIs(tickets);

    renderizarTickets(tickets);

}


/* =========================================================
   ACTUALIZAR KPIs
========================================================= */

function actualizarKPIs(tickets) {

    const total =
        tickets.length;

    const registrados =
        tickets.filter(function (ticket) {

            return (
                normalizarEstatus(ticket.estatus) ===
                "Registrado"
            );

        }).length;

    const pendientes =
        tickets.filter(function (ticket) {

            return (
                normalizarEstatus(ticket.estatus) ===
                "Pendiente"
            );

        }).length;

    const proceso =
        tickets.filter(function (ticket) {

            return (
                normalizarEstatus(ticket.estatus) ===
                "En Proceso"
            );

        }).length;

    const resueltos =
        tickets.filter(function (ticket) {

            return (
                normalizarEstatus(ticket.estatus) ===
                "Resuelto"
            );

        }).length;

    const cerrados =
        tickets.filter(function (ticket) {

            return (
                normalizarEstatus(ticket.estatus) ===
                "Cerrado"
            );

        }).length;

    actualizarTexto(
        "totalTickets",
        total
    );

    actualizarTexto(
        "ticketsRegistrados",
        registrados
    );

    actualizarTexto(
        "ticketsPendientes",
        pendientes
    );

    actualizarTexto(
        "ticketsProceso",
        proceso
    );

    actualizarTexto(
        "ticketsResueltos",
        resueltos
    );

    actualizarTexto(
        "ticketsCerrados",
        cerrados
    );

}


/* =========================================================
   ACTUALIZAR TEXTO
========================================================= */

function actualizarTexto(id, valor) {

    const elemento =
        document.getElementById(id);

    if (elemento) {

        elemento.textContent =
            valor;

    }

}


/* =========================================================
   RENDERIZAR TABLA
========================================================= */

function renderizarTickets(tickets) {

    const tbody =
        document.getElementById(
            "ticketsTableBody"
        );

    if (!tbody) {

        console.warn(
            "No existe #ticketsTableBody en el HTML."
        );

        return;
    }

    tbody.innerHTML = "";

    if (!tickets.length) {

        tbody.innerHTML = `
            <tr>
                <td
                    colspan="10"
                    style="
                        text-align:center;
                        padding:40px;
                        color:#6b7280;
                    "
                >
                    <i
                        class="fa-solid fa-ticket"
                        style="
                            font-size:28px;
                            display:block;
                            margin-bottom:10px;
                        "
                    ></i>

                    No existen tickets registrados.
                </td>
            </tr>
        `;

        actualizarResultado(0);

        return;
    }

    /* -----------------------------------------------------
       ORDENAR MÁS RECIENTE PRIMERO
    ----------------------------------------------------- */

    const ordenados =
        [...tickets].sort(function (a, b) {

            const fechaA =
                obtenerFecha(a.fecha_creacion);

            const fechaB =
                obtenerFecha(b.fecha_creacion);

            return fechaB - fechaA;

        });


    /* -----------------------------------------------------
       CREAR FILAS
    ----------------------------------------------------- */

    ordenados.forEach(function (ticket) {

        const tr =
            document.createElement("tr");

        const estatus =
            ticket.estatus ||
            "Registrado";

        const prioridad =
            ticket.prioridad ||
            "Media";

        const tecnico =
            ticket.tecnico ||
            ticket.tecnico_nombre ||
            "Sin asignar";


        tr.innerHTML = `

            <td>

                <strong>
                    ${escapeHTML(
                        ticket.folio ||
                        "#" + (ticket.id || "")
                    )}
                </strong>

            </td>


            <td>

                <div class="ticket-title-cell">

                    ${escapeHTML(
                        ticket.titulo ||
                        "Sin título"
                    )}

                </div>

            </td>


            <td>

                ${escapeHTML(
                    ticket.empleado ||
                    ticket.nombre_usuario ||
                    "-"
                )}

            </td>


            <td>

                ${escapeHTML(
                    ticket.division ||
                    "-"
                )}

            </td>


            <td>

                ${escapeHTML(
                    ticket.area ||
                    "-"
                )}

            </td>


            <td>

                <span
                    class="
                        priority-badge
                        priority-${normalizarClase(
                            prioridad
                        )}
                    "
                >

                    ${escapeHTML(
                        prioridad
                    )}

                </span>

            </td>


            <td>

                <span
                    class="
                        status-badge
                        status-${normalizarClase(
                            estatus
                        )}
                    "
                >

                    ${escapeHTML(
                        estatus
                    )}

                </span>

            </td>


            <td>

                ${formatearFecha(
                    ticket.fecha_creacion
                )}

            </td>


            <td>

                ${escapeHTML(
                    tecnico
                )}

            </td>


            <td>

                <a
                    href="detalle-ticket.html?id=${encodeURIComponent(
                        ticket.id || ""
                    )}"
                    class="btn-view"
                >

                    <i
                        class="fa-solid fa-eye"
                    ></i>

                    Gestionar

                </a>

            </td>

        `;

        tbody.appendChild(tr);

    });


    actualizarResultado(
        ordenados.length
    );

}


/* =========================================================
   CONFIGURAR EVENTOS
========================================================= */

function configurarEventos() {

    const filtroEstatus =
        document.getElementById(
            "filtroEstatus"
        );

    const filtroPrioridad =
        document.getElementById(
            "filtroPrioridad"
        );

    const filtroBusqueda =
        document.getElementById(
            "filtroBusqueda"
        );

    const limpiarFiltros =
        document.getElementById(
            "limpiarFiltros"
        );


    /* -----------------------------------------------------
       ESTATUS
    ----------------------------------------------------- */

    if (filtroEstatus) {

        filtroEstatus.addEventListener(
            "change",
            aplicarFiltros
        );

    }


    /* -----------------------------------------------------
       PRIORIDAD
    ----------------------------------------------------- */

    if (filtroPrioridad) {

        filtroPrioridad.addEventListener(
            "change",
            aplicarFiltros
        );

    }


    /* -----------------------------------------------------
       BÚSQUEDA
    ----------------------------------------------------- */

    if (filtroBusqueda) {

        filtroBusqueda.addEventListener(
            "input",
            aplicarFiltros
        );

    }


    /* -----------------------------------------------------
       LIMPIAR
    ----------------------------------------------------- */

    if (limpiarFiltros) {

        limpiarFiltros.addEventListener(
            "click",
            function () {

                if (filtroEstatus) {
                    filtroEstatus.value = "";
                }

                if (filtroPrioridad) {
                    filtroPrioridad.value = "";
                }

                if (filtroBusqueda) {
                    filtroBusqueda.value = "";
                }

                aplicarFiltros();

            }
        );

    }

}


/* =========================================================
   APLICAR FILTROS
========================================================= */

function aplicarFiltros() {

    const tickets =
        obtenerTicketsAdmin();

    const estatus =
        document.getElementById(
            "filtroEstatus"
        )?.value || "";

    const prioridad =
        document.getElementById(
            "filtroPrioridad"
        )?.value || "";

    const busqueda =
        (
            document.getElementById(
                "filtroBusqueda"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    const filtrados =
        tickets.filter(function (ticket) {

            /* ---------------------------------------------
               ESTATUS
            --------------------------------------------- */

            if (
                estatus &&
                normalizarEstatus(
                    ticket.estatus
                ) !== estatus
            ) {

                return false;

            }


            /* ---------------------------------------------
               PRIORIDAD
            --------------------------------------------- */

            if (
                prioridad &&
                String(
                    ticket.prioridad || ""
                ) !== prioridad
            ) {

                return false;

            }


            /* ---------------------------------------------
               BÚSQUEDA
            --------------------------------------------- */

            if (busqueda) {

                const contenido = [

                    ticket.id,
                    ticket.folio,
                    ticket.titulo,
                    ticket.descripcion,
                    ticket.empleado,
                    ticket.contacto,
                    ticket.usuario,
                    ticket.nombre_usuario,
                    ticket.division,
                    ticket.area,
                    ticket.categoria,
                    ticket.tecnico

                ]
                .join(" ")
                .toLowerCase();


                if (
                    !contenido.includes(
                        busqueda
                    )
                ) {

                    return false;

                }

            }


            return true;

        });


    renderizarTickets(
        filtrados
    );

}


/* =========================================================
   RESULTADO
========================================================= */

function actualizarResultado(cantidad) {

    const elemento =
        document.getElementById(
            "resultadoTickets"
        );

    if (!elemento) {
        return;
    }

    elemento.textContent =
        cantidad === 1
            ? "Mostrando 1 ticket"
            : `Mostrando ${cantidad} tickets`;

}


/* =========================================================
   NORMALIZAR ESTATUS
========================================================= */

function normalizarEstatus(estatus) {

    const valor =
        String(
            estatus || ""
        )
        .trim()
        .toLowerCase();

    const mapa = {

        "registrado":
            "Registrado",

        "pendiente":
            "Pendiente",

        "en proceso":
            "En Proceso",

        "en-proceso":
            "En Proceso",

        "resuelto":
            "Resuelto",

        "cancelado":
            "Cancelado",

        "cerrado":
            "Cerrado"

    };

    return (
        mapa[valor] ||
        estatus ||
        "Registrado"
    );

}


/* =========================================================
   NORMALIZAR CLASE CSS
========================================================= */

function normalizarClase(valor) {

    return String(
        valor || ""
    )
    .normalize("NFD")
    .replace(
        /[\u0300-\u036f]/g,
        ""
    )
    .toLowerCase()
    .replace(
        /\s+/g,
        "-"
    )
    .replace(
        /[^a-z0-9-]/g,
        ""
    );

}


/* =========================================================
   FORMATEAR FECHA
========================================================= */

function formatearFecha(fecha) {

    if (!fecha) {
        return "-";
    }

    const fechaObj =
        obtenerFecha(fecha);

    if (
        isNaN(
            fechaObj.getTime()
        )
    ) {

        return escapeHTML(
            String(fecha)
        );

    }

    return fechaObj.toLocaleString(
        "es-MX",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    );

}


/* =========================================================
   OBTENER FECHA
========================================================= */

function obtenerFecha(fecha) {

    if (fecha instanceof Date) {
        return fecha;
    }

    const resultado =
        new Date(fecha);

    if (
        !isNaN(
            resultado.getTime()
        )
    ) {

        return resultado;

    }

    return new Date(0);

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(valor) {

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
