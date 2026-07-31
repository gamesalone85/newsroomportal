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
       USUARIO
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
   OBTENER TICKETS
========================================================= */

function obtenerTicketsAdmin() {

    let tickets = [];


    /* =====================================================
       ESTRUCTURA GLOBAL
    ===================================================== */

    if (
        typeof NEWSROOM_TICKETS !== "undefined" &&
        Array.isArray(NEWSROOM_TICKETS)
    ) {

        tickets =
            NEWSROOM_TICKETS;

    }


    /* =====================================================
       LOCAL STORAGE
    ===================================================== */

    try {

        const almacenados =
            JSON.parse(
                localStorage.getItem(
                    "newsroomTickets"
                )
            );


        if (Array.isArray(almacenados)) {

            tickets =
                almacenados;

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


    console.log(
        "Tickets encontrados:",
        tickets.length
    );


    actualizarKPIs(
        tickets
    );


    cargarOpcionesFiltros(
        tickets
    );


    actualizarResumenes(
        tickets
    );


    renderizarTickets(
        tickets
    );

}



/* =========================================================
   ACTUALIZAR KPIs
========================================================= */

function actualizarKPIs(tickets) {

    const total =
        tickets.length;


    const registrados =
        tickets.filter(
            ticket =>
                normalizarEstatus(
                    ticket.estatus
                ) === "Registrado"
        ).length;


    const pendientes =
        tickets.filter(
            ticket =>
                normalizarEstatus(
                    ticket.estatus
                ) === "Pendiente"
        ).length;


    const proceso =
        tickets.filter(
            ticket =>
                normalizarEstatus(
                    ticket.estatus
                ) === "En Proceso"
        ).length;


    const resueltos =
        tickets.filter(
            ticket =>
                normalizarEstatus(
                    ticket.estatus
                ) === "Resuelto"
        ).length;


    const cancelados =
        tickets.filter(
            ticket =>
                normalizarEstatus(
                    ticket.estatus
                ) === "Cancelado"
        ).length;


    const cerrados =
        tickets.filter(
            ticket =>
                normalizarEstatus(
                    ticket.estatus
                ) === "Cerrado"
        ).length;


    const sinAsignar =
        tickets.filter(
            ticket =>
                !tieneTecnico(ticket)
        ).length;



    /* =====================================================
       ACTUALIZAR HTML
    ===================================================== */

    actualizarTexto(
        "kpiTotal",
        total
    );


    actualizarTexto(
        "kpiRegistrados",
        registrados
    );


    actualizarTexto(
        "kpiPendientes",
        pendientes
    );


    actualizarTexto(
        "kpiProceso",
        proceso
    );


    actualizarTexto(
        "kpiResueltos",
        resueltos
    );


    actualizarTexto(
        "kpiCancelados",
        cancelados
    );


    actualizarTexto(
        "kpiCerrados",
        cerrados
    );


    actualizarTexto(
        "kpiSinAsignar",
        sinAsignar
    );


    console.log(
        "KPIs actualizados:",
        {
            total,
            registrados,
            pendientes,
            proceso,
            resueltos,
            cancelados,
            cerrados,
            sinAsignar
        }
    );

}



/* =========================================================
   ACTUALIZAR TEXTO
========================================================= */

function actualizarTexto(
    id,
    valor
) {

    const elemento =
        document.getElementById(
            id
        );


    if (elemento) {

        elemento.textContent =
            valor;

    }

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


    const filtroDivision =
        document.getElementById(
            "filtroDivision"
        );


    const filtroTecnico =
        document.getElementById(
            "filtroTecnico"
        );


    const filtroBusqueda =
        document.getElementById(
            "filtroBusqueda"
        );


    const btnActualizar =
        document.getElementById(
            "btnActualizar"
        );



    /* =====================================================
       ESTATUS
    ===================================================== */

    if (filtroEstatus) {

        filtroEstatus.addEventListener(
            "change",
            aplicarFiltros
        );

    }



    /* =====================================================
       PRIORIDAD
    ===================================================== */

    if (filtroPrioridad) {

        filtroPrioridad.addEventListener(
            "change",
            aplicarFiltros
        );

    }



    /* =====================================================
       DIVISIÓN
    ===================================================== */

    if (filtroDivision) {

        filtroDivision.addEventListener(
            "change",
            aplicarFiltros
        );

    }



    /* =====================================================
       TÉCNICO
    ===================================================== */

    if (filtroTecnico) {

        filtroTecnico.addEventListener(
            "change",
            aplicarFiltros
        );

    }



    /* =====================================================
       BÚSQUEDA
    ===================================================== */

    if (filtroBusqueda) {

        filtroBusqueda.addEventListener(
            "input",
            aplicarFiltros
        );

    }



    /* =====================================================
       ACTUALIZAR
    ===================================================== */

    if (btnActualizar) {

        btnActualizar.addEventListener(
            "click",
            function () {

                btnActualizar.disabled =
                    true;


                cargarDashboard();


                setTimeout(
                    function () {

                        btnActualizar.disabled =
                            false;

                    },
                    300
                );

            }
        );

    }

}



/* =========================================================
   CARGAR OPCIONES DE FILTROS
========================================================= */

function cargarOpcionesFiltros(
    tickets
) {

    cargarFiltroDivision(
        tickets
    );


    cargarFiltroTecnico(
        tickets
    );

}



/* =========================================================
   FILTRO DIVISIÓN
========================================================= */

function cargarFiltroDivision(
    tickets
) {

    const select =
        document.getElementById(
            "filtroDivision"
        );


    if (!select) {
        return;
    }


    const valorActual =
        select.value;


    const divisiones =
        [...new Set(
            tickets
                .map(
                    ticket =>
                        ticket.division
                )
                .filter(
                    valor =>
                        valor
                )
        )]
        .sort(
            function (a, b) {

                return String(a)
                    .localeCompare(
                        String(b),
                        "es"
                    );

            }
        );


    select.innerHTML = `

        <option value="">
            Todas
        </option>

    `;


    divisiones.forEach(
        function (division) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                division;


            option.textContent =
                division;


            select.appendChild(
                option
            );

        }
    );


    if (
        divisiones.includes(
            valorActual
        )
    ) {

        select.value =
            valorActual;

    }

}



/* =========================================================
   FILTRO TÉCNICO
========================================================= */

function cargarFiltroTecnico(
    tickets
) {

    const select =
        document.getElementById(
            "filtroTecnico"
        );


    if (!select) {
        return;
    }


    const valorActual =
        select.value;


    const tecnicos =
        [...new Set(
            tickets
                .map(
                    ticket =>
                        obtenerNombreTecnico(
                            ticket
                        )
                )
                .filter(
                    tecnico =>
                        tecnico &&
                        tecnico !==
                        "Sin asignar"
                )
        )]
        .sort(
            function (a, b) {

                return String(a)
                    .localeCompare(
                        String(b),
                        "es"
                    );

            }
        );


    select.innerHTML = `

        <option value="">
            Todos
        </option>

    `;


    tecnicos.forEach(
        function (tecnico) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                tecnico;


            option.textContent =
                tecnico;


            select.appendChild(
                option
            );

        }
    );


    if (
        tecnicos.includes(
            valorActual
        )
    ) {

        select.value =
            valorActual;

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


    const division =
        document.getElementById(
            "filtroDivision"
        )?.value || "";


    const tecnico =
        document.getElementById(
            "filtroTecnico"
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
        tickets.filter(
            function (ticket) {


                /* =====================================
                   ESTATUS
                ===================================== */

                if (
                    estatus &&
                    normalizarEstatus(
                        ticket.estatus
                    ) !==
                    estatus
                ) {

                    return false;

                }



                /* =====================================
                   PRIORIDAD
                ===================================== */

                if (
                    prioridad &&
                    String(
                        ticket.prioridad ||
                        ""
                    ) !==
                    prioridad
                ) {

                    return false;

                }



                /* =====================================
                   DIVISIÓN
                ===================================== */

                if (
                    division &&
                    String(
                        ticket.division ||
                        ""
                    ) !==
                    division
                ) {

                    return false;

                }



                /* =====================================
                   TÉCNICO
                ===================================== */

                if (
                    tecnico &&
                    obtenerNombreTecnico(
                        ticket
                    ) !==
                    tecnico
                ) {

                    return false;

                }



                /* =====================================
                   BÚSQUEDA
                ===================================== */

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

            }
        );


    actualizarResumenes(
        filtrados
    );


    renderizarTickets(
        filtrados
    );

}



/* =========================================================
   RENDERIZAR TABLA
========================================================= */

function renderizarTickets(
    tickets
) {

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


    tbody.innerHTML =
        "";



    if (!tickets.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="11"
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


        actualizarResultado(
            0
        );


        return;

    }



    /* =====================================================
       ORDENAR
    ===================================================== */

    const ordenados =
        [...tickets]
        .sort(
            function (a, b) {

                const fechaA =
                    obtenerFecha(
                        a.fecha_creacion
                    );


                const fechaB =
                    obtenerFecha(
                        b.fecha_creacion
                    );


                return (
                    fechaB -
                    fechaA
                );

            }
        );



    /* =====================================================
       FILAS
    ===================================================== */

    ordenados.forEach(
        function (ticket) {

            const tr =
                document.createElement(
                    "tr"
                );


            const estatus =
                normalizarEstatus(
                    ticket.estatus
                );


            const prioridad =
                ticket.prioridad ||
                "Media";


            const tecnico =
                obtenerNombreTecnico(
                    ticket
                );



            tr.innerHTML = `

                <td>

                    <strong>

                        ${escapeHTML(
                            ticket.folio ||
                            "#" +
                            (
                                ticket.id ||
                                ""
                            )
                        )}

                    </strong>

                </td>


                <td>

                    <div
                        class="ticket-title-cell"
                    >

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

                    ${escapeHTML(
                        ticket.categoria ||
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

                    ${escapeHTML(
                        tecnico
                    )}

                </td>


                <td>

                    ${formatearFecha(
                        ticket.fecha_creacion
                    )}

                </td>


                <td>

                    <a
                        href="detalle_ticket.html?id=${encodeURIComponent(
                            ticket.id ||
                            ""
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


            tbody.appendChild(
                tr
            );

        }
    );



    actualizarResultado(
        ordenados.length
    );

}



/* =========================================================
   RESÚMENES
========================================================= */

function actualizarResumenes(
    tickets
) {

    actualizarResumenPrioridades(
        tickets
    );


    actualizarResumenDivisiones(
        tickets
    );


    actualizarResumenTecnicos(
        tickets
    );

}



/* =========================================================
   RESUMEN PRIORIDADES
========================================================= */

function actualizarResumenPrioridades(
    tickets
) {

    const container =
        document.getElementById(
            "prioridadesContainer"
        );


    if (!container) {
        return;
    }


    const prioridades = {

        "Crítica": 0,

        "Alta": 0,

        "Media": 0,

        "Baja": 0

    };


    tickets.forEach(
        function (ticket) {

            const prioridad =
                ticket.prioridad ||
                "Media";


            if (
                prioridades[
                    prioridad
                ] !== undefined
            ) {

                prioridades[
                    prioridad
                ]++;

            }

        }
    );


    container.innerHTML =
        "";


    Object.keys(
        prioridades
    ).forEach(
        function (prioridad) {

            const cantidad =
                prioridades[
                    prioridad
                ];


            const porcentaje =
                tickets.length
                    ? Math.round(
                        (
                            cantidad /
                            tickets.length
                        ) * 100
                    )
                    : 0;


            container.innerHTML += `

                <div
                    class="summary-item"
                >

                    <div>

                        <strong>
                            ${escapeHTML(
                                prioridad
                            )}
                        </strong>

                        <span>
                            ${cantidad} tickets
                        </span>

                    </div>

                    <div
                        class="summary-value"
                    >

                        ${porcentaje}%

                    </div>

                </div>

            `;

        }
    );

}



/* =========================================================
   RESUMEN DIVISIONES
========================================================= */

function actualizarResumenDivisiones(
    tickets
) {

    const container =
        document.getElementById(
            "divisionesContainer"
        );


    if (!container) {
        return;
    }


    const contador = {};


    tickets.forEach(
        function (ticket) {

            const division =
                ticket.division ||
                "Sin división";


            contador[
                division
            ] =
                (
                    contador[
                        division
                    ] ||
                    0
                ) + 1;

        }
    );


    const lista =
        Object.entries(
            contador
        )
        .sort(
            function (a, b) {

                return b[1] - a[1];

            }
        );


    container.innerHTML =
        "";


    if (!lista.length) {

        container.innerHTML = `

            <div class="summary-empty">

                No hay información disponible.

            </div>

        `;

        return;

    }


    lista.forEach(
        function (item) {

            const nombre =
                item[0];


            const cantidad =
                item[1];


            container.innerHTML += `

                <div
                    class="summary-item"
                >

                    <div>

                        <strong>
                            ${escapeHTML(
                                nombre
                            )}
                        </strong>

                        <span>
                            ${cantidad} tickets
                        </span>

                    </div>

                    <div
                        class="summary-value"
                    >

                        ${cantidad}

                    </div>

                </div>

            `;

        }
    );

}



/* =========================================================
   RESUMEN TÉCNICOS
========================================================= */

function actualizarResumenTecnicos(
    tickets
) {

    const container =
        document.getElementById(
            "tecnicosContainer"
        );


    if (!container) {
        return;
    }


    const contador = {};


    tickets.forEach(
        function (ticket) {

            const tecnico =
                obtenerNombreTecnico(
                    ticket
                );


            contador[
                tecnico
            ] =
                (
                    contador[
                        tecnico
                    ] ||
                    0
                ) + 1;

        }
    );


    const lista =
        Object.entries(
            contador
        )
        .sort(
            function (a, b) {

                return b[1] - a[1];

            }
        );


    container.innerHTML =
        "";


    if (!lista.length) {

        container.innerHTML = `

            <div class="summary-empty">

                No hay información disponible.

            </div>

        `;

        return;

    }


    lista.forEach(
        function (item) {

            const nombre =
                item[0];


            const cantidad =
                item[1];


            container.innerHTML += `

                <div
                    class="summary-item"
                >

                    <div>

                        <strong>
                            ${escapeHTML(
                                nombre
                            )}
                        </strong>

                        <span>
                            ${cantidad} tickets
                        </span>

                    </div>

                    <div
                        class="summary-value"
                    >

                        ${cantidad}

                    </div>

                </div>

            `;

        }
    );

}



/* =========================================================
   ACTUALIZAR RESULTADO
========================================================= */

function actualizarResultado(
    cantidad
) {

    const elemento =
        document.getElementById(
            "totalResultados"
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
   OBTENER NOMBRE DEL TÉCNICO
========================================================= */

function obtenerNombreTecnico(
    ticket
) {

    if (
        ticket.tecnico &&
        typeof ticket.tecnico === "string"
    ) {

        return ticket.tecnico;

    }


    if (
        ticket.tecnico_nombre
    ) {

        return ticket.tecnico_nombre;

    }


    if (
        ticket.tecnico?.nombre
    ) {

        return ticket.tecnico.nombre;

    }


    if (
        ticket.tecnico_id
    ) {

        return "Técnico #" +
            ticket.tecnico_id;

    }


    return "Sin asignar";

}



/* =========================================================
   VERIFICAR SI TIENE TÉCNICO
========================================================= */

function tieneTecnico(
    ticket
) {

    return (
        obtenerNombreTecnico(
            ticket
        ) !==
        "Sin asignar"
    );

}



/* =========================================================
   NORMALIZAR ESTATUS
========================================================= */

function normalizarEstatus(
    estatus
) {

    const valor =
        String(
            estatus ||
            ""
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
        mapa[
            valor
        ] ||
        estatus ||
        "Registrado"
    );

}



/* =========================================================
   NORMALIZAR CLASE CSS
========================================================= */

function normalizarClase(
    valor
) {

    return String(
        valor ||
        ""
    )
    .normalize(
        "NFD"
    )
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

function formatearFecha(
    fecha
) {

    if (!fecha) {
        return "-";
    }


    const fechaObj =
        obtenerFecha(
            fecha
        );


    if (
        isNaN(
            fechaObj.getTime()
        )
    ) {

        return escapeHTML(
            String(
                fecha
            )
        );

    }


    return fechaObj.toLocaleString(
        "es-MX",
        {
            day:
                "2-digit",

            month:
                "2-digit",

            year:
                "numeric",

            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );

}



/* =========================================================
   OBTENER FECHA
========================================================= */

function obtenerFecha(
    fecha
) {

    if (
        fecha instanceof Date
    ) {

        return fecha;

    }


    const resultado =
        new Date(
            fecha
        );


    if (
        !isNaN(
            resultado.getTime()
        )
    ) {

        return resultado;

    }


    return new Date(
        0
    );

}



/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    valor
) {

    return String(
        valor ??
        ""
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
