/* =========================================================
   NEWSROOM PORTAL
   DASHBOARD ADMINISTRATIVO DE TICKETS
   FIRESTORE
========================================================= */


let newsroomTicketsUnsubscribe = null;

let newsroomTicketsActuales = [];



/* =========================================================
   INICIAR DASHBOARD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Newsroom Portal: dashboard-admin.js cargado correctamente."
        );


        /* =================================================
           AUTH
        ================================================= */

        if (
            typeof verificarSesion !==
            "function"
        ) {

            console.error(
                "Newsroom Portal: auth.js no está disponible."
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
            typeof obtenerSesion ===
            "function"

                ? obtenerSesion()

                : null;


        if (!session) {

            console.error(
                "Newsroom Portal: no existe una sesión activa."
            );

            return;

        }



        /* =================================================
           VERIFICAR ADMIN
        ================================================= */

        if (
            Number(session.rol_id) !==
            1
        ) {

            alert(
                "No tienes permisos para acceder a esta sección."
            );


            window.location.href =
                "../dashboard/index.html";


            return;

        }



        /* =================================================
           USUARIO
        ================================================= */

        actualizarUsuario(
            session
        );



        /* =================================================
           EVENTOS
        ================================================= */

        configurarEventos();



        /* =================================================
           CATÁLOGOS
        ================================================= */

        cargarCatalogosDashboard();



        /* =================================================
           FIRESTORE
        ================================================= */

        iniciarDashboardFirestore();

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
   CARGAR CATÁLOGOS
========================================================= */

function cargarCatalogosDashboard() {

    cargarFiltroDesdeCatalogo(
        "filtroDivision",
        typeof obtenerDivisiones ===
            "function"
            ? obtenerDivisiones()
            : [],
        "Todas"
    );


    cargarFiltroDesdeCatalogo(
        "filtroArea",
        typeof obtenerAreas ===
            "function"
            ? obtenerAreas()
            : [],
        "Todas"
    );


    cargarFiltroDesdeCatalogo(
        "filtroCategoria",
        typeof obtenerCategorias ===
            "function"
            ? obtenerCategorias()
            : [],
        "Todas"
    );

}



/* =========================================================
   CARGAR SELECT DESDE CATÁLOGO
========================================================= */

function cargarFiltroDesdeCatalogo(
    id,
    elementos,
    textoTodos
) {

    const select =
        document.getElementById(
            id
        );


    if (!select) {

        return;

    }


    const valorActual =
        select.value;


    select.innerHTML = "";


    const optionTodos =
        document.createElement(
            "option"
        );


    optionTodos.value =
        "";


    optionTodos.textContent =
        textoTodos;


    select.appendChild(
        optionTodos
    );


    elementos.forEach(
        function (elemento) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                elemento.nombre;


            option.textContent =
                elemento.nombre;


            select.appendChild(
                option
            );

        }
    );


    if (
        Array.from(
            select.options
        ).some(
            option =>
                option.value ===
                valorActual
        )
    ) {

        select.value =
            valorActual;

    }

}



/* =========================================================
   INICIAR FIRESTORE
========================================================= */

function iniciarDashboardFirestore() {

    console.log(
        "Newsroom Portal: iniciando conexión con Firestore..."
    );


    if (
        typeof firebase ===
        "undefined"
    ) {

        mostrarErrorDashboard(
            "Firebase no está cargado correctamente."
        );

        return;

    }


    if (
        typeof newsroomDB ===
        "undefined" ||
        !newsroomDB
    ) {

        mostrarErrorDashboard(
            "La conexión con Firestore no está disponible."
        );

        return;

    }


    if (
        typeof newsroomTicketsUnsubscribe ===
        "function"
    ) {

        newsroomTicketsUnsubscribe();

        newsroomTicketsUnsubscribe =
            null;

    }



    /* =====================================================
       LISTENER
    ===================================================== */

    newsroomTicketsUnsubscribe =
        newsroomDB
            .collection(
                "tickets"
            )
            .onSnapshot(

                function (snapshot) {

                    const tickets =
                        [];


                    snapshot.forEach(
                        function (doc) {

                            tickets.push({

                                id:
                                    doc.id,

                                ...(
                                    doc.data() ||
                                    {}
                                )

                            });

                        }
                    );


                    newsroomTicketsActuales =
                        tickets;


                    console.log(
                        "Newsroom Portal: tickets cargados:",
                        tickets.length
                    );


                    cargarDashboard(
                        tickets
                    );

                },


                function (error) {

                    console.error(
                        "Newsroom Portal: error Firestore:",
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


    actualizarKPIs(
        tickets
    );


    actualizarResumenes(
        tickets
    );


    aplicarFiltrosConTickets(
        tickets
    );

}



/* =========================================================
   KPIs
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
                ) ===
                "Registrado"
        ).length;


    const pendientes =
        tickets.filter(
            ticket =>
                normalizarEstatus(
                    ticket.estatus
                ) ===
                "Pendiente"
        ).length;


    const proceso =
        tickets.filter(
            ticket =>
                normalizarEstatus(
                    ticket.estatus
                ) ===
                "En Proceso"
        ).length;


    const resueltos =
        tickets.filter(
            ticket =>
                normalizarEstatus(
                    ticket.estatus
                ) ===
                "Resuelto"
        ).length;


    const cancelados =
        tickets.filter(
            ticket =>
                normalizarEstatus(
                    ticket.estatus
                ) ===
                "Cancelado"
        ).length;


    const cerrados =
        tickets.filter(
            ticket =>
                normalizarEstatus(
                    ticket.estatus
                ) ===
                "Cerrado"
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

}



/* =========================================================
   TEXTO
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
   EVENTOS
========================================================= */

function configurarEventos() {

    const filtros = [

        "filtroEstatus",

        "filtroPrioridad",

        "filtroDivision",

        "filtroArea",

        "filtroCategoria",

        "filtroTecnico",

        "filtroEmpleado",

        "filtroBusqueda"

    ];


    filtros.forEach(
        function (id) {

            const elemento =
                document.getElementById(
                    id
                );


            if (!elemento) {

                return;

            }


            const evento =
                elemento.tagName ===
                "INPUT"

                    ? "input"

                    : "change";


            elemento.addEventListener(
                evento,
                aplicarFiltros
            );

        }
    );



    /* =====================================================
       BOTÓN ACTUALIZAR
    ===================================================== */

    const btnActualizar =
        document.getElementById(
            "btnActualizar"
        );


    if (btnActualizar) {

        btnActualizar.addEventListener(
            "click",
            function () {

                btnActualizar.disabled =
                    true;


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
   RECARGAR FIRESTORE
========================================================= */

function recargarTicketsFirestore() {

    if (
        typeof newsroomDB ===
        "undefined" ||
        !newsroomDB
    ) {

        return;

    }


    newsroomDB
        .collection(
            "tickets"
        )
        .get()
        .then(
            function (snapshot) {

                const tickets =
                    [];


                snapshot.forEach(
                    function (doc) {

                        tickets.push({

                            id:
                                doc.id,

                            ...(
                                doc.data() ||
                                {}
                            )

                        });

                    }
                );


                newsroomTicketsActuales =
                    tickets;


                cargarDashboard(
                    tickets
                );

            }
        )
        .catch(
            function (error) {

                console.error(
                    "Newsroom Portal: error actualizando:",
                    error
                );

            }
        );

}



/* =========================================================
   APLICAR FILTROS
========================================================= */

function aplicarFiltros() {

    aplicarFiltrosConTickets(
        newsroomTicketsActuales
    );

}



/* =========================================================
   FILTRAR TICKETS
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


    const area =
        document.getElementById(
            "filtroArea"
        )?.value || "";


    const categoria =
        document.getElementById(
            "filtroCategoria"
        )?.value || "";


    const tecnico =
        document.getElementById(
            "filtroTecnico"
        )?.value || "";


    const empleado =
        (
            document.getElementById(
                "filtroEmpleado"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


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
                   ÁREA
                ===================================== */

                if (
                    area &&
                    String(
                        ticket.area ||
                        ""
                    ).trim() !==
                    area
                ) {

                    return false;

                }



                /* =====================================
                   CATEGORÍA
                ===================================== */

                if (
                    categoria &&
                    String(
                        ticket.categoria ||
                        ""
                    ).trim() !==
                    categoria
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
                   EMPLEADO
                ===================================== */

                if (empleado) {

                    const nombreEmpleado =
                        String(
                            ticket.empleado ||
                            ticket.nombre_usuario ||
                            ""
                        )
                        .toLowerCase();


                    if (
                        !nombreEmpleado.includes(
                            empleado
                        )
                    ) {

                        return false;

                    }

                }



                /* =====================================
                   BÚSQUEDA GENERAL
                ===================================== */

                if (busqueda) {

                    const contenido = [

                        ticket.id,

                        ticket.folio,

                        ticket.titulo,

                        ticket.descripcion,

                        ticket.empleado,

                        ticket.contacto,

                        ticket.equipo,

                        ticket.usuario,

                        ticket.nombre_usuario,

                        ticket.correo,

                        ticket.correo_usuario,

                        ticket.division,

                        ticket.area,

                        ticket.categoria,

                        ticket.prioridad,

                        ticket.estatus,

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
   RESÚMENES
========================================================= */

function actualizarResumenes(
    tickets
) {

    actualizarResumenPrioridades(
        tickets
    );


    actualizarResumenEstatus(
        tickets
    );


    actualizarResumenGenerico(
        tickets,
        "divisionesContainer",
        "division",
        "Sin división"
    );


    actualizarResumenGenerico(
        tickets,
        "areasContainer",
        "area",
        "Sin área"
    );


    actualizarResumenGenerico(
        tickets,
        "categoriasContainer",
        "categoria",
        "Sin categoría"
    );


    actualizarResumenTecnicos(
        tickets
    );

}



/* =========================================================
   PRIORIDADES
========================================================= */

function actualizarResumenPrioridades(
    tickets
) {

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


    const container =
        document.getElementById(
            "prioridadesContainer"
        );


    if (!container) {

        return;

    }


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
                        ) *
                        100
                    )
                    : 0;


            container.innerHTML += `

                <div class="summary-item">

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

                    <div class="summary-value">

                        ${porcentaje}%

                    </div>

                </div>

            `;

        }
    );

}



/* =========================================================
   ESTATUS
========================================================= */

function actualizarResumenEstatus(
    tickets
) {

    const estatuses = {

        "Registrado": 0,

        "Pendiente": 0,

        "En Proceso": 0,

        "Resuelto": 0,

        "Cancelado": 0,

        "Cerrado": 0

    };


    tickets.forEach(
        function (ticket) {

            const estatus =
                normalizarEstatus(
                    ticket.estatus
                );


            if (
                estatuses[
                    estatus
                ] !== undefined
            ) {

                estatuses[
                    estatus
                ]++;

            }

        }
    );


    const container =
        document.getElementById(
            "estatusContainer"
        );


    if (!container) {

        return;

    }


    container.innerHTML =
        "";


    Object.entries(
        estatuses
    ).forEach(
        function ([nombre, cantidad]) {

            container.innerHTML += `

                <div class="summary-item">

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

                    <div class="summary-value">

                        ${cantidad}

                    </div>

                </div>

            `;

        }
    );

}



/* =========================================================
   RESUMEN GENÉRICO
========================================================= */

function actualizarResumenGenerico(
    tickets,
    containerId,
    campo,
    valorVacio
) {

    const container =
        document.getElementById(
            containerId
        );


    if (!container) {

        return;

    }


    const contador = {};


    tickets.forEach(
        function (ticket) {

            const valor =
                String(
                    ticket[campo] ||
                    valorVacio
                )
                .trim();


            contador[
                valor
            ] =
                (
                    contador[
                        valor
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
        function ([nombre, cantidad]) {

            container.innerHTML += `

                <div class="summary-item">

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

                    <div class="summary-value">

                        ${cantidad}

                    </div>

                </div>

            `;

        }
    );

}



/* =========================================================
   TÉCNICOS
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
        function ([nombre, cantidad]) {

            container.innerHTML += `

                <div class="summary-item">

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

                    <div class="summary-value">

                        ${cantidad}

                    </div>

                </div>

            `;

        }
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

                    <div class="ticket-title-cell">

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
   RESULTADOS
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
   TÉCNICO
========================================================= */

function obtenerNombreTecnico(
    ticket
) {

    if (
        typeof ticket.tecnico ===
        "string" &&
        ticket.tecnico.trim() !==
        ""
    ) {

        return ticket.tecnico.trim();

    }


    if (
        ticket.tecnico &&
        typeof ticket.tecnico ===
        "object" &&
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
        ).trim() !==
        ""
    ) {

        return String(
            ticket.tecnico_nombre
        ).trim();

    }


    if (
        ticket.tecnico_id !==
        null &&
        ticket.tecnico_id !==
        undefined &&
        String(
            ticket.tecnico_id
        ).trim() !==
        ""
    ) {

        return (
            "Técnico #" +
            ticket.tecnico_id
        );

    }


    return "Sin asignar";

}



/* =========================================================
   TIENE TÉCNICO
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
   ESTATUS
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
   PRIORIDAD
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
   CLASE CSS
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
   FECHA
========================================================= */

function obtenerFecha(
    fecha
) {

    if (
        fecha instanceof Date
    ) {

        return fecha;

    }


    if (
        fecha &&
        typeof fecha.toDate ===
        "function"
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


    if (
        fecha &&
        typeof fecha ===
        "object" &&
        typeof fecha.seconds ===
        "number"
    ) {

        const resultado =
            new Date(
                fecha.seconds *
                1000
            );


        if (
            !isNaN(
                resultado.getTime()
            )
        ) {

            return resultado;

        }

    }


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
        fechaObj.getTime() ===
        0
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
   ERROR
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
