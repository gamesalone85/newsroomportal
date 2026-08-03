/* =========================================================
   NEWSROOM PORTAL
   DASHBOARD ADMINISTRATIVO DE TICKETS
   FIRESTORE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    console.log(
        "Newsroom Portal: dashboard-admin.js cargado correctamente."
    );


    /* =====================================================
       VERIFICAR AUTH
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


    /* =====================================================
       OBTENER SESIÓN
    ===================================================== */

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
       EVENTOS
    ===================================================== */

    configurarEventos();


    /* =====================================================
       INICIAR FIRESTORE
    ===================================================== */

    iniciarDashboardFirestore();

});



/* =========================================================
   ACTUALIZAR USUARIO
========================================================= */

function actualizarUsuario(session) {

    const nombre =
        session.nombre ||
        session.usuario ||
        session.correo ||
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
   FIRESTORE
========================================================= */

let newsroomTicketsUnsubscribe = null;


/* =========================================================
   INICIAR DASHBOARD FIRESTORE
========================================================= */

function iniciarDashboardFirestore() {

    console.log(
        "Newsroom Portal: iniciando conexión con Firestore..."
    );


    /* =====================================================
       VERIFICAR FIREBASE
    ===================================================== */

    if (
        typeof firebase === "undefined"
    ) {

        console.error(
            "Newsroom Portal: Firebase no está cargado."
        );

        mostrarErrorDashboard(
            "Firebase no está cargado correctamente."
        );

        return;

    }


    /* =====================================================
       VERIFICAR FIRESTORE
    ===================================================== */

    if (
        typeof newsroomDB === "undefined" ||
        !newsroomDB
    ) {

        console.error(
            "Newsroom Portal: newsroomDB no está disponible."
        );

        mostrarErrorDashboard(
            "La conexión con Firestore no está disponible."
        );

        return;

    }


    console.log(
        "Newsroom Portal: Firestore disponible."
    );


    /* =====================================================
       CANCELAR LISTENER ANTERIOR
    ===================================================== */

    if (
        typeof newsroomTicketsUnsubscribe === "function"
    ) {

        newsroomTicketsUnsubscribe();

        newsroomTicketsUnsubscribe =
            null;

    }


    /* =====================================================
       ESCUCHAR COLECCIÓN TICKETS
    ===================================================== */

    newsroomTicketsUnsubscribe =
        newsroomDB
            .collection("tickets")
            .onSnapshot(

                function (snapshot) {

                    console.log(
                        "Newsroom Portal: actualización de tickets recibida.",
                        snapshot.size
                    );


                    const tickets = [];


                    snapshot.forEach(
                        function (doc) {

                            const data =
                                doc.data() || {};


                            /* =================================
                               AGREGAR ID REAL DE FIRESTORE
                            ================================= */

                            const ticket = {

                                id:
                                    doc.id,

                                ...data

                            };


                            tickets.push(
                                ticket
                            );

                        }
                    );


                    console.log(
                        "Newsroom Portal: tickets cargados desde Firestore:",
                        tickets
                    );


                    cargarDashboard(
                        tickets
                    );

                },


                function (error) {

                    console.error(
                        "Newsroom Portal: error escuchando tickets de Firestore:",
                        error
                    );


                    mostrarErrorDashboard(
                        "No se pudieron cargar los tickets desde Firestore."
                    );

                }

            );

}



/* =========================================================
   CARGAR DASHBOARD
========================================================= */

function cargarDashboard(
    tickets
) {

    tickets =
        Array.isArray(
            tickets
        )
            ? tickets
            : [];


    console.log(
        "Newsroom Portal: cargando dashboard con",
        tickets.length,
        "tickets."
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

    aplicarFiltrosConTickets(
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


    if (filtroEstatus) {

        filtroEstatus.addEventListener(
            "change",
            aplicarFiltros
        );

    }


    if (filtroPrioridad) {

        filtroPrioridad.addEventListener(
            "change",
            aplicarFiltros
        );

    }


    if (filtroDivision) {

        filtroDivision.addEventListener(
            "change",
            aplicarFiltros
        );

    }


    if (filtroTecnico) {

        filtroTecnico.addEventListener(
            "change",
            aplicarFiltros
        );

    }


    if (filtroBusqueda) {

        filtroBusqueda.addEventListener(
            "input",
            aplicarFiltros
        );

    }


    if (btnActualizar) {

        btnActualizar.addEventListener(
            "click",
            function () {

                btnActualizar.disabled =
                    true;


                /* =========================================
                   FORZAR RECARGA DE FIRESTORE
                ========================================= */

                recargarTicketsFirestore();


                setTimeout(
                    function () {

                        btnActualizar.disabled =
                            false;

                    },
                    800
                );

            }
        );

    }

}



/* =========================================================
   RECARGAR TICKETS FIRESTORE
========================================================= */

function recargarTicketsFirestore() {

    console.log(
        "Newsroom Portal: solicitando actualización de tickets..."
    );


    if (
        typeof newsroomDB === "undefined" ||
        !newsroomDB
    ) {

        console.error(
            "Newsroom Portal: newsroomDB no está disponible."
        );

        return;

    }


    newsroomDB
        .collection("tickets")
        .get()
        .then(
            function (snapshot) {

                const tickets = [];


                snapshot.forEach(
                    function (doc) {

                        tickets.push({

                            id:
                                doc.id,

                            ...(
                                doc.data() || {}
                            )

                        });

                    }
                );


                console.log(
                    "Newsroom Portal: actualización manual:",
                    tickets.length,
                    "tickets."
                );


                cargarDashboard(
                    tickets
                );

            }
        )
        .catch(
            function (error) {

                console.error(
                    "Newsroom Portal: error actualizando tickets:",
                    error
                );

            }
        );

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

    /* =====================================================
       OBTENER DATOS ACTUALES DE FIRESTORE
    ===================================================== */

    if (
        typeof newsroomDB === "undefined" ||
        !newsroomDB
    ) {

        return;

    }


    newsroomDB
        .collection("tickets")
        .get()
        .then(
            function (snapshot) {

                const tickets = [];


                snapshot.forEach(
                    function (doc) {

                        tickets.push({

                            id:
                                doc.id,

                            ...(
                                doc.data() || {}
                            )

                        });

                    }
                );


                aplicarFiltrosConTickets(
                    tickets
                );

            }
        )
        .catch(
            function (error) {

                console.error(
                    "Newsroom Portal: error aplicando filtros:",
                    error
                );

            }
        );

}



/* =========================================================
   APLICAR FILTROS CON DATOS
========================================================= */

function aplicarFiltrosConTickets(
    tickets
) {

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

                        ticket.correo,

                        ticket.correo_usuario,

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
       ORDENAR
    ===================================================== */

    const ordenados =
        [...tickets]
        .sort(
            function (a, b) {

                const fechaA =
                    obtenerFecha(
                        a.fecha_creacion ||
                        a.createdAt ||
                        a.fecha
                    );


                const fechaB =
                    obtenerFecha(
                        b.fecha_creacion ||
                        b.createdAt ||
                        b.fecha
                    );


                return (
                    fechaB.getTime() -
                    fechaA.getTime()
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


            const folio =
                ticket.folio ||
                "#" +
                ticketId;


            tr.innerHTML = `

                <td>

                    <strong>

                        ${escapeHTML(
                            folio
                        )}

                    </strong>

                </td>


                <td>

                    <div
                        class="ticket-title-cell"
                    >

                        ${escapeHTML(
                            ticket.titulo ||
                            ticket.asunto ||
                            "Sin título"
                        )}

                    </div>

                </td>


                <td>

                    ${escapeHTML(
                        ticket.empleado ||
                        ticket.nombre_usuario ||
                        ticket.usuario ||
                        ticket.nombre ||
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
                        ticket.fecha_creacion ||
                        ticket.createdAt ||
                        ticket.fecha
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

    if (
        typeof ticket.tecnico === "string" &&
        ticket.tecnico.trim() !== ""
    ) {

        return ticket.tecnico.trim();

    }


    if (
        ticket.tecnico &&
        typeof ticket.tecnico === "object" &&
        ticket.tecnico.nombre
    ) {

        return String(
            ticket.tecnico.nombre
        );

    }


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
   VERIFICAR TÉCNICO
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
        fechaObj.getTime() === 0
    ) {

        return "-";

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
   COMPATIBLE CON FIRESTORE TIMESTAMP
========================================================= */

function obtenerFecha(
    fecha
) {

    if (
        fecha instanceof Date
    ) {

        return fecha;

    }


    /* =====================================================
       FIRESTORE TIMESTAMP
    ===================================================== */

    if (
        fecha &&
        typeof fecha.toDate === "function"
    ) {

        const resultado =
            fecha.toDate();


        if (
            resultado instanceof Date &&
            !isNaN(
                resultado.getTime()
            )
        ) {

            return resultado;

        }

    }


    /* =====================================================
       FIRESTORE TIMESTAMP SERIALIZADO
    ===================================================== */

    if (
        fecha &&
        typeof fecha === "object" &&
        typeof fecha.seconds === "number"
    ) {

        const resultado =
            new Date(
                fecha.seconds * 1000
            );


        if (
            !isNaN(
                resultado.getTime()
            )
        ) {

            return resultado;

        }

    }


    /* =====================================================
       STRING / NUMBER
    ===================================================== */

    if (
        fecha !== null &&
        fecha !== undefined &&
        fecha !== ""
    ) {

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

    }


    return new Date(
        0
    );

}



/* =========================================================
   MOSTRAR ERROR
========================================================= */

function mostrarErrorDashboard(
    mensaje
) {

    const tbody =
        document.getElementById(
            "ticketsTableBody"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = `

        <tr>

            <td
                colspan="11"
                style="
                    text-align:center;
                    padding:40px;
                    color:#b91c1c;
                "
            >

                <i
                    class="fa-solid fa-triangle-exclamation"
                    style="
                        font-size:30px;
                        display:block;
                        margin-bottom:12px;
                    "
                ></i>

                ${escapeHTML(
                    mensaje
                )}

            </td>

        </tr>

    `;

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
