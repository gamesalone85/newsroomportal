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

        console.error(
            "Newsroom Portal: no existe una sesión activa."
        );

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

    actualizarUsuario(
        session
    );


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
        session.email ||
        "Administrador";


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
   OBTENER TICKETS
========================================================= */

function obtenerTicketsAdmin() {

    let tickets = [];


    /* =====================================================
       1. ESTRUCTURA GLOBAL
    ===================================================== */

    if (
        typeof NEWSROOM_TICKETS !== "undefined" &&
        Array.isArray(NEWSROOM_TICKETS)
    ) {

        tickets =
            NEWSROOM_TICKETS;

    }


    /* =====================================================
       2. LOCAL STORAGE
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

    }
    catch (error) {

        console.error(
            "Newsroom Portal: error leyendo newsroomTickets.",
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
        "Newsroom Portal: tickets encontrados:",
        tickets.length
    );


    /* =====================================================
       KPIs
    ===================================================== */

    actualizarKPIs(
        tickets
    );


    /* =====================================================
       FILTROS
    ===================================================== */

    cargarOpcionesFiltros(
        tickets
    );


    /* =====================================================
       RESÚMENES
    ===================================================== */

    actualizarResumenes(
        tickets
    );


    /* =====================================================
       TABLA
    ===================================================== */

    renderizarTickets(
        tickets
    );

}



/* =========================================================
   ACTUALIZAR KPIs
========================================================= */

function actualizarKPIs(
    tickets
) {

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
                !tieneTecnico(
                    ticket
                )
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
        "Newsroom Portal: KPIs actualizados.",
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
        [
            ...new Set(
                tickets
                    .map(
                        ticket =>
                            String(
                                ticket.division ||
                                ""
                            ).trim()
                    )
                    .filter(
                        valor =>
                            valor !== ""
                    )
            )
        ]
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
        [
            ...new Set(
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
            )
        ]
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
                    normalizarPrioridad(
                        ticket.prioridad
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
                    ).trim() !==
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

                        ticket.tecnico,

                        ticket.tecnico_nombre

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
            "Newsroom Portal: no existe #ticketsTableBody."
        );

        return;

    }


    tbody.innerHTML =
        "";



    /* =====================================================
       SIN RESULTADOS
    ===================================================== */

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

                    No existen tickets que coincidan
                    con los filtros seleccionados.

                </td>

            </tr>

        `;


        actualizarResultado(
            0
        );


        return;

    }



    /* =====================================================
       ORDENAR POR FECHA
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
       GENERAR FILAS
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
                normalizarPrioridad(
                    ticket.prioridad
                );


            const tecnico =
                obtenerNombreTecnico(
                    ticket
                );


            const ticketId =
                ticket.id ||
                ticket.folio ||
                "";



            tr.innerHTML = `

                <td>

                    <strong>

                        ${escapeHTML(
                            ticket.folio ||
                            "#" +
                            ticketId
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
                        ticket.usuario ||
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
                            ticketId
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
   ACTUALIZAR RESÚMENES
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
                normalizarPrioridad(
                    ticket.prioridad
                );


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
                String(
                    ticket.division ||
                    "Sin división"
                ).trim();


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

    /* =====================================================
       TÉCNICO COMO STRING
    ===================================================== */

    if (
        typeof ticket.tecnico === "string" &&
        ticket.tecnico.trim() !== ""
    ) {

        return ticket.tecnico.trim();

    }



    /* =====================================================
       TÉCNICO COMO OBJETO
    ===================================================== */

    if (
        ticket.tecnico &&
        typeof ticket.tecnico === "object" &&
        ticket.tecnico.nombre
    ) {

        return String(
            ticket.tecnico.nombre
        );

    }



    /* =====================================================
       TÉCNICO_NOMBRE
    ===================================================== */

    if (
        ticket.tecnico_nombre &&
        String(
            ticket.tecnico_nombre
        ).trim() !== ""
    ) {

        return String(
            ticket.tecnico_nombre
        ).trim();

    }



    /* =====================================================
       TÉCNICO_ID
    ===================================================== */

    if (
        ticket.tecnico_id !== null &&
        ticket.tecnico_id !== undefined &&
        String(
            ticket.tecnico_id
        ).trim() !== ""
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

        "enproceso":
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
   NORMALIZAR PRIORIDAD
========================================================= */

function normalizarPrioridad(
    prioridad
) {

    const valor =
        String(
            prioridad ||
            "Media"
        )
        .trim()
        .toLowerCase();


    const mapa = {

        "crítica":
            "Crítica",

        "critica":
            "Crítica",

        "crítica ":
            "Crítica",

        "critica ":
            "Crítica",

        "alta":
            "Alta",

        "media":
            "Media",

        "baja":
            "Baja"

    };


    return (
        mapa[
            valor
        ] ||
        prioridad ||
        "Media"
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


    if (!fecha) {

        return new Date(
            0
        );

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
