/* =========================================================
   NEWSROOM PORTAL
   CENTRO DE REPORTES
   FIREBASE AUTH + FIRESTORE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Newsroom Portal: reportes.js cargado correctamente."
        );

        iniciarCentroReportes();

    }
);


/* =========================================================
   VARIABLES GLOBALES
========================================================= */

let newsroomReportesTickets = [];

let newsroomReportesUnsubscribe = null;

let newsroomReportesUsuario = null;


/* =========================================================
   INICIAR CENTRO DE REPORTES
========================================================= */

async function iniciarCentroReportes() {

    console.log(
        "Newsroom Portal: iniciando Centro de Reportes..."
    );


    /* =====================================================
       VERIFICAR FIREBASE
    ===================================================== */

    if (
        typeof firebase ===
        "undefined"
    ) {

        console.error(
            "Newsroom Portal: Firebase no está disponible."
        );

        mostrarEstadoReporte(
            "Firebase no está cargado correctamente.",
            "error"
        );

        return;

    }


    /* =====================================================
       VERIFICAR AUTH
    ===================================================== */

    if (
        !firebase.auth
    ) {

        console.error(
            "Newsroom Portal: Firebase Authentication no está disponible."
        );

        mostrarEstadoReporte(
            "Firebase Authentication no está disponible.",
            "error"
        );

        return;

    }


    /* =====================================================
       VERIFICAR FIRESTORE
    ===================================================== */

    if (
        typeof newsroomDB ===
        "undefined" ||
        !newsroomDB
    ) {

        console.error(
            "Newsroom Portal: Firestore no está disponible."
        );

        mostrarEstadoReporte(
            "La conexión con Firestore no está disponible.",
            "error"
        );

        return;

    }


    /* =====================================================
       ESPERAR ESTADO DE AUTH
    ===================================================== */

    firebase.auth().onAuthStateChanged(
        async function (user) {

            console.log(
                "Newsroom Portal: cambio de estado Auth:",
                user
                    ? user.email
                    : "sin usuario"
            );


            if (!user) {

                console.warn(
                    "Newsroom Portal: no existe usuario autenticado."
                );


                window.location.href =
                    "../login.html";


                return;

            }


            newsroomReportesUsuario =
                user;


            /* =============================================
               VERIFICAR ADMINISTRADOR
            ============================================= */

            const esAdministrador =
                await verificarAdministradorFirebase(
                    user
                );


            if (!esAdministrador) {

                console.warn(
                    "Newsroom Portal: usuario sin permisos administrativos."
                );


                alert(
                    "No tienes permisos para acceder a esta sección."
                );


                window.location.href =
                    "index.html";


                return;

            }


            /* =============================================
               ACTUALIZAR USUARIO
            ============================================= */

            actualizarUsuarioReportes(
                user
            );


            /* =============================================
               CONFIGURAR EVENTOS
            ============================================= */

            configurarEventosReportes();


            /* =============================================
               INICIAR FIRESTORE
            ============================================= */

            iniciarReportesFirestore();

        }
    );

}


/* =========================================================
   VERIFICAR ADMINISTRADOR FIREBASE
========================================================= */

async function verificarAdministradorFirebase(
    user
) {

    try {

        if (!user || !user.uid) {

            return false;

        }


        /* =================================================
           COLECCIÓN ADMINS
        ================================================= */

        const adminDoc =
            await newsroomDB
                .collection("admins")
                .doc(user.uid)
                .get();


        if (
            adminDoc.exists
        ) {

            const adminData =
                adminDoc.data() ||
                {};


            console.log(
                "Newsroom Portal: administrador encontrado:",
                adminData
            );


            /*
             * Si existe el documento en admins,
             * consideramos al usuario administrador.
             *
             * Si existe un campo activo, también
             * respetamos su valor.
             */

            if (
                Object.prototype.hasOwnProperty.call(
                    adminData,
                    "activo"
                )
            ) {

                return (
                    adminData.activo ===
                    true
                );

            }


            if (
                Object.prototype.hasOwnProperty.call(
                    adminData,
                    "active"
                )
            ) {

                return (
                    adminData.active ===
                    true
                );

            }


            return true;

        }


        /* =================================================
           FALLBACK POR CORREO
        ================================================= */

        /*
         * Este fallback permite trabajar con una colección
         * admins donde el documento no necesariamente tiene
         * como ID el UID.
         *
         * Si tu colección admins utiliza exclusivamente
         * el UID como ID, esta consulta no será necesaria.
         */

        if (
            user.email
        ) {

            const snapshot =
                await newsroomDB
                    .collection("admins")
                    .where(
                        "correo",
                        "==",
                        user.email
                    )
                    .limit(1)
                    .get();


            if (
                !snapshot.empty
            ) {

                const adminData =
                    snapshot
                        .docs[0]
                        .data() ||
                        {};


                if (
                    Object.prototype.hasOwnProperty.call(
                        adminData,
                        "activo"
                    )
                ) {

                    return (
                        adminData.activo ===
                        true
                    );

                }


                if (
                    Object.prototype.hasOwnProperty.call(
                        adminData,
                        "active"
                    )
                ) {

                    return (
                        adminData.active ===
                        true
                    );

                }


                return true;

            }

        }


        return false;

    }
    catch (error) {

        console.error(
            "Newsroom Portal: error verificando administrador:",
            error
        );


        /*
         * Importante:
         * Si Firestore rechaza la consulta por reglas,
         * NO damos acceso.
         */

        return false;

    }

}


/* =========================================================
   ACTUALIZAR USUARIO
========================================================= */

function actualizarUsuarioReportes(
    user
) {

    if (!user) {

        return;

    }


    const nombre =
        user.displayName ||
        user.email ||
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
   INICIAR FIRESTORE
========================================================= */

function iniciarReportesFirestore() {

    console.log(
        "Newsroom Portal: iniciando escucha de tickets..."
    );


    if (
        typeof newsroomDB ===
        "undefined" ||
        !newsroomDB
    ) {

        mostrarEstadoReporte(
            "La conexión con Firestore no está disponible.",
            "error"
        );

        return;

    }


    if (
        typeof newsroomReportesUnsubscribe ===
        "function"
    ) {

        newsroomReportesUnsubscribe();

        newsroomReportesUnsubscribe =
            null;

    }


    mostrarEstadoReporte(
        "Cargando información de tickets...",
        "info"
    );


    newsroomReportesUnsubscribe =
        newsroomDB
            .collection("tickets")
            .onSnapshot(

                function (snapshot) {

                    newsroomReportesTickets =
                        [];


                    snapshot.forEach(
                        function (doc) {

                            const data =
                                doc.data() ||
                                {};


                            newsroomReportesTickets.push({

                                id:
                                    doc.id,

                                ...data

                            });

                        }
                    );


                    console.log(
                        "Newsroom Portal: tickets disponibles para reportes:",
                        newsroomReportesTickets.length
                    );


                    cargarOpcionesReportes();


                    aplicarFiltrosReportes();


                    mostrarEstadoReporte(
                        "Información actualizada correctamente.",
                        "success"
                    );

                },


                function (error) {

                    console.error(
                        "Newsroom Portal: error cargando reportes:",
                        error
                    );


                    mostrarEstadoReporte(
                        "No se pudieron cargar los tickets desde Firestore.",
                        "error"
                    );

                }

            );

}


/* =========================================================
   CONFIGURAR EVENTOS
========================================================= */

function configurarEventosReportes() {

    const idsFiltros = [

        "fechaInicio",

        "fechaFin",

        "reporteEstatus",

        "reportePrioridad",

        "reporteDivision",

        "reporteArea",

        "reporteCategoria",

        "reporteTecnico"

    ];


    idsFiltros.forEach(
        function (id) {

            const elemento =
                document.getElementById(
                    id
                );


            if (!elemento) {

                return;

            }


            elemento.addEventListener(
                "change",
                aplicarFiltrosReportes
            );

        }
    );


    const busqueda =
        document.getElementById(
            "reporteBusqueda"
        );


    if (busqueda) {

        busqueda.addEventListener(
            "input",
            aplicarFiltrosReportes
        );

    }


    const btnAplicar =
        document.getElementById(
            "btnAplicarFiltros"
        );


    if (btnAplicar) {

        btnAplicar.addEventListener(
            "click",
            aplicarFiltrosReportes
        );

    }


    const btnLimpiar =
        document.getElementById(
            "btnLimpiarFiltros"
        );


    if (btnLimpiar) {

        btnLimpiar.addEventListener(
            "click",
            limpiarFiltrosReportes
        );

    }


    const btnActualizar =
        document.getElementById(
            "btnActualizarReportes"
        );


    if (btnActualizar) {

        btnActualizar.addEventListener(
            "click",
            recargarReportesFirestore
        );

    }


    const btnExportarTodo =
        document.getElementById(
            "btnExportarTodo"
        );


    if (btnExportarTodo) {

        btnExportarTodo.addEventListener(
            "click",
            exportarTodoZIP
        );

    }


    const btnExportarTodoInferior =
        document.getElementById(
            "btnExportarTodoInferior"
        );


    if (btnExportarTodoInferior) {

        btnExportarTodoInferior.addEventListener(
            "click",
            exportarTodoZIP
        );

    }


    const btnPreview =
        document.getElementById(
            "btnExportarTicketsPreview"
        );


    if (btnPreview) {

        btnPreview.addEventListener(
            "click",
            function () {

                exportarReporte(
                    "tickets"
                );

            }
        );

    }


    document
        .querySelectorAll(
            ".reportes-export-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const tipo =
                            button.dataset.report;


                        exportarReporte(
                            tipo
                        );

                    }
                );

            }
        );

}


/* =========================================================
   RECARGAR FIRESTORE
========================================================= */

function recargarReportesFirestore() {

    if (
        typeof newsroomDB ===
        "undefined" ||
        !newsroomDB
    ) {

        mostrarEstadoReporte(
            "Firestore no está disponible.",
            "error"
        );

        return;

    }


    mostrarEstadoReporte(
        "Actualizando información...",
        "info"
    );


    newsroomDB
        .collection("tickets")
        .get()
        .then(
            function (snapshot) {

                newsroomReportesTickets =
                    [];


                snapshot.forEach(
                    function (doc) {

                        newsroomReportesTickets.push({

                            id:
                                doc.id,

                            ...(
                                doc.data() ||
                                {}
                            )

                        });

                    }
                );


                cargarOpcionesReportes();


                aplicarFiltrosReportes();


                mostrarEstadoReporte(
                    "Información actualizada correctamente.",
                    "success"
                );

            }
        )
        .catch(
            function (error) {

                console.error(
                    "Newsroom Portal: error actualizando reportes:",
                    error
                );


                mostrarEstadoReporte(
                    "No se pudo actualizar la información.",
                    "error"
                );

            }
        );

}


/* =========================================================
   CARGAR OPCIONES
========================================================= */

function cargarOpcionesReportes() {

    cargarOpcionesSelect(
        "reporteDivision",
        obtenerValoresUnicos(
            newsroomReportesTickets,
            function (ticket) {

                return ticket.division;

            }
        ),
        "Todas"
    );


    cargarOpcionesSelect(
        "reporteArea",
        obtenerValoresUnicos(
            newsroomReportesTickets,
            function (ticket) {

                return ticket.area;

            }
        ),
        "Todas"
    );


    cargarOpcionesSelect(
        "reporteCategoria",
        obtenerValoresUnicos(
            newsroomReportesTickets,
            function (ticket) {

                return ticket.categoria;

            }
        ),
        "Todas"
    );


    cargarOpcionesSelect(
        "reporteTecnico",
        obtenerValoresUnicos(
            newsroomReportesTickets,
            function (ticket) {

                return obtenerNombreTecnicoReporte(
                    ticket
                );

            },
            true
        ),
        "Todos"
    );

}


/* =========================================================
   OBTENER VALORES ÚNICOS
========================================================= */

function obtenerValoresUnicos(
    tickets,
    callback,
    excluirSinAsignar
) {

    const valores =
        new Set();


    tickets.forEach(
        function (ticket) {

            let valor =
                callback(
                    ticket
                );


            valor =
                String(
                    valor ||
                    ""
                ).trim();


            if (!valor) {

                return;

            }


            if (
                excluirSinAsignar &&
                valor ===
                "Sin asignar"
            ) {

                return;

            }


            valores.add(
                valor
            );

        }
    );


    return [
        ...valores
    ].sort(
        function (a, b) {

            return String(a)
                .localeCompare(
                    String(b),
                    "es",
                    {
                        sensitivity:
                            "base"
                    }
                );

        }
    );

}


/* =========================================================
   CARGAR SELECT
========================================================= */

function cargarOpcionesSelect(
    id,
    valores,
    textoInicial
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


    select.innerHTML =
        "";


    const inicial =
        document.createElement(
            "option"
        );


    inicial.value =
        "";


    inicial.textContent =
        textoInicial;


    select.appendChild(
        inicial
    );


    valores.forEach(
        function (valor) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                valor;


            option.textContent =
                valor;


            select.appendChild(
                option
            );

        }
    );


    if (
        valores.includes(
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

function aplicarFiltrosReportes() {

    const filtrados =
        obtenerTicketsFiltrados();


    actualizarKPIsReportes(
        filtrados
    );


    actualizarContadorReportes(
        filtrados
    );


    renderizarPreviewReportes(
        filtrados
    );

}


/* =========================================================
   OBTENER TICKETS FILTRADOS
========================================================= */

function obtenerTicketsFiltrados() {

    const fechaInicio =
        document.getElementById(
            "fechaInicio"
        )?.value || "";


    const fechaFin =
        document.getElementById(
            "fechaFin"
        )?.value || "";


    const estatus =
        document.getElementById(
            "reporteEstatus"
        )?.value || "";


    const prioridad =
        document.getElementById(
            "reportePrioridad"
        )?.value || "";


    const division =
        document.getElementById(
            "reporteDivision"
        )?.value || "";


    const area =
        document.getElementById(
            "reporteArea"
        )?.value || "";


    const categoria =
        document.getElementById(
            "reporteCategoria"
        )?.value || "";


    const tecnico =
        document.getElementById(
            "reporteTecnico"
        )?.value || "";


    const busqueda =
        (
            document.getElementById(
                "reporteBusqueda"
            )?.value || ""
        )
        .trim()
        .toLowerCase();


    let inicio =
        null;


    let fin =
        null;


    if (fechaInicio) {

        inicio =
            new Date(
                fechaInicio +
                "T00:00:00"
            );

    }


    if (fechaFin) {

        fin =
            new Date(
                fechaFin +
                "T23:59:59.999"
            );

    }


    return newsroomReportesTickets
        .filter(
            function (ticket) {

                const fecha =
                    obtenerFechaReporte(
                        ticket.fecha_creacion ||
                        ticket.createdAt ||
                        ticket.fecha
                    );


                if (
                    inicio &&
                    fecha < inicio
                ) {

                    return false;

                }


                if (
                    fin &&
                    fecha > fin
                ) {

                    return false;

                }


                if (
                    estatus &&
                    normalizarEstatusReporte(
                        ticket.estatus
                    ) !==
                    estatus
                ) {

                    return false;

                }


                if (
                    prioridad &&
                    normalizarPrioridadReporte(
                        ticket.prioridad
                    ) !==
                    prioridad
                ) {

                    return false;

                }


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


                if (
                    tecnico &&
                    obtenerNombreTecnicoReporte(
                        ticket
                    ) !==
                    tecnico
                ) {

                    return false;

                }


                if (busqueda) {

                    const contenido = [

                        ticket.id,

                        ticket.folio,

                        ticket.titulo,

                        ticket.asunto,

                        ticket.descripcion,

                        ticket.empleado,

                        ticket.nombre_usuario,

                        ticket.usuario,

                        ticket.nombre,

                        ticket.contacto,

                        ticket.correo,

                        ticket.correo_usuario,

                        ticket.division,

                        ticket.area,

                        ticket.categoria,

                        ticket.tecnico,

                        ticket.tecnico_nombre,

                        ticket.tecnico_id

                    ]
                    .map(
                        function (valor) {

                            return String(
                                valor ?? ""
                            );

                        }
                    )
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
        )
        .sort(
            function (a, b) {

                return (
                    obtenerFechaReporte(
                        b.fecha_creacion ||
                        b.createdAt ||
                        b.fecha
                    ).getTime()
                    -
                    obtenerFechaReporte(
                        a.fecha_creacion ||
                        a.createdAt ||
                        a.fecha
                    ).getTime()
                );

            }
        );

}


/* =========================================================
   KPI REPORTES
========================================================= */

function actualizarKPIsReportes(
    tickets
) {

    const total =
        tickets.length;


    const resueltos =
        tickets.filter(
            function (ticket) {

                return (
                    normalizarEstatusReporte(
                        ticket.estatus
                    ) ===
                    "Resuelto"
                );

            }
        ).length;


    const cerrados =
        tickets.filter(
            function (ticket) {

                return (
                    normalizarEstatusReporte(
                        ticket.estatus
                    ) ===
                    "Cerrado"
                );

            }
        ).length;


    const pendientes =
        tickets.filter(
            function (ticket) {

                return (
                    normalizarEstatusReporte(
                        ticket.estatus
                    ) ===
                    "Pendiente"
                );

            }
        ).length;


    const sinAsignar =
        tickets.filter(
            function (ticket) {

                return (
                    obtenerNombreTecnicoReporte(
                        ticket
                    ) ===
                    "Sin asignar"
                );

            }
        ).length;


    const tasaResolucion =
        total
            ? Math.round(
                (
                    (
                        resueltos +
                        cerrados
                    ) /
                    total
                ) *
                100
            )
            : 0;


    actualizarTextoReporte(
        "reporteKpiTotal",
        total
    );


    actualizarTextoReporte(
        "reporteKpiResueltos",
        resueltos
    );


    actualizarTextoReporte(
        "reporteKpiCerrados",
        cerrados
    );


    actualizarTextoReporte(
        "reporteKpiPendientes",
        pendientes
    );


    actualizarTextoReporte(
        "reporteKpiSinAsignar",
        sinAsignar
    );


    actualizarTextoReporte(
        "reporteKpiResolucion",
        tasaResolucion +
        "%"
    );

}


/* =========================================================
   CONTADOR
========================================================= */

function actualizarContadorReportes(
    tickets
) {

    const elemento =
        document.getElementById(
            "contadorFiltrados"
        );


    if (!elemento) {

        return;

    }


    elemento.textContent =
        tickets.length === 1
            ? "1 ticket"
            : `${tickets.length} tickets`;

}


/* =========================================================
   PREVIEW
========================================================= */

function renderizarPreviewReportes(
    tickets
) {

    const tbody =
        document.getElementById(
            "reportesPreviewBody"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML =
        "";


    const preview =
        tickets.slice(
            0,
            50
        );


    const descripcion =
        document.getElementById(
            "previewDescripcion"
        );


    if (descripcion) {

        descripcion.textContent =
            `Mostrando ${preview.length} de ${tickets.length} tickets filtrados.`;

    }


    if (!preview.length) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="10"
                    class="reportes-empty"
                >

                    <i
                        class="fa-solid fa-magnifying-glass"
                    ></i>

                    No existen tickets con los
                    criterios seleccionados.

                </td>

            </tr>

        `;

        return;

    }


    preview.forEach(
        function (ticket) {

            const tr =
                document.createElement(
                    "tr"
                );


            const folio =
                ticket.folio ||
                (
                    ticket.id
                        ? "#" + ticket.id
                        : "-"
                );


            const titulo =
                ticket.titulo ||
                ticket.asunto ||
                "Sin título";


            const usuario =
                ticket.empleado ||
                ticket.nombre_usuario ||
                ticket.usuario ||
                ticket.nombre ||
                "-";


            const division =
                ticket.division ||
                "-";


            const area =
                ticket.area ||
                "-";


            const categoria =
                ticket.categoria ||
                "-";


            const prioridad =
                normalizarPrioridadReporte(
                    ticket.prioridad
                );


            const estatus =
                normalizarEstatusReporte(
                    ticket.estatus
                );


            const tecnico =
                obtenerNombreTecnicoReporte(
                    ticket
                );


            const fecha =
                formatearFechaReporte(
                    ticket.fecha_creacion ||
                    ticket.createdAt ||
                    ticket.fecha
                );


            tr.innerHTML = `

                <td>

                    <strong>
                        ${escapeHTMLReporte(
                            folio
                        )}
                    </strong>

                </td>

                <td>
                    ${escapeHTMLReporte(
                        titulo
                    )}
                </td>

                <td>
                    ${escapeHTMLReporte(
                        usuario
                    )}
                </td>

                <td>
                    ${escapeHTMLReporte(
                        division
                    )}
                </td>

                <td>
                    ${escapeHTMLReporte(
                        area
                    )}
                </td>

                <td>
                    ${escapeHTMLReporte(
                        categoria
                    )}
                </td>

                <td>

                    <span
                        class="
                            reportes-priority-badge
                            reportes-priority-${normalizarClaseReporte(
                                prioridad
                            )}
                        "
                    >
                        ${escapeHTMLReporte(
                            prioridad
                        )}
                    </span>

                </td>

                <td>

                    <span
                        class="
                            reportes-status-badge
                            reportes-status-${normalizarClaseReporte(
                                estatus
                            )}
                        "
                    >
                        ${escapeHTMLReporte(
                            estatus
                        )}
                    </span>

                </td>

                <td>
                    ${escapeHTMLReporte(
                        tecnico
                    )}
                </td>

                <td>
                    ${escapeHTMLReporte(
                        fecha
                    )}
                </td>

            `;


            tbody.appendChild(
                tr
            );

        }
    );

}


/* =========================================================
   EXPORTAR REPORTE
========================================================= */

function exportarReporte(
    tipo
) {

    const tickets =
        obtenerTicketsFiltrados();


    if (!tickets.length) {

        mostrarEstadoReporte(
            "No existen registros para exportar con los filtros actuales.",
            "error"
        );

        return;

    }


    let filas = [];

    let nombreArchivo = "";


    switch (tipo) {

        case "tickets":

            filas =
                construirReporteTickets(
                    tickets
                );

            nombreArchivo =
                "tickets";

            break;


        case "tecnicos":

            filas =
                construirReporteTecnicos(
                    tickets
                );

            nombreArchivo =
                "tecnicos";

            break;


        case "usuarios":

            filas =
                construirReporteUsuarios(
                    tickets
                );

            nombreArchivo =
                "usuarios";

            break;


        case "divisiones":

            filas =
                construirReporteDivisiones(
                    tickets
                );

            nombreArchivo =
                "divisiones";

            break;


        case "areas":

            filas =
                construirReporteAreas(
                    tickets
                );

            nombreArchivo =
                "areas";

            break;


        case "categorias":

            filas =
                construirReporteCategorias(
                    tickets
                );

            nombreArchivo =
                "categorias";

            break;


        default:

            mostrarEstadoReporte(
                "Tipo de reporte no reconocido.",
                "error"
            );

            return;

    }


    const csv =
        generarCSV(
            filas
        );


    descargarCSV(
        csv,
        generarNombreArchivo(
            nombreArchivo
        )
    );


    mostrarEstadoReporte(
        `Reporte "${nombreArchivo}" exportado correctamente.`,
        "success"
    );

}


/* =========================================================
   REPORTE TICKETS
========================================================= */

function construirReporteTickets(
    tickets
) {

    return tickets.map(
        function (ticket) {

            return {

                "ID Firestore":
                    ticket.id || "",

                "Folio":
                    ticket.folio || "",

                "Título":
                    ticket.titulo ||
                    ticket.asunto ||
                    "",

                "Descripción":
                    ticket.descripcion ||
                    "",

                "Empleado":
                    ticket.empleado ||
                    ticket.nombre_usuario ||
                    ticket.usuario ||
                    ticket.nombre ||
                    "",

                "Correo":
                    ticket.correo ||
                    ticket.correo_usuario ||
                    "",

                "Contacto":
                    ticket.contacto ||
                    "",

                "División":
                    ticket.division ||
                    "",

                "Área":
                    ticket.area ||
                    "",

                "Categoría":
                    ticket.categoria ||
                    "",

                "Prioridad":
                    normalizarPrioridadReporte(
                        ticket.prioridad
                    ),

                "Estatus":
                    normalizarEstatusReporte(
                        ticket.estatus
                    ),

                "Técnico":
                    obtenerNombreTecnicoReporte(
                        ticket
                    ),

                "Técnico ID":
                    ticket.tecnico_id ||
                    "",

                "Fecha creación":
                    formatearFechaReporte(
                        ticket.fecha_creacion ||
                        ticket.createdAt ||
                        ticket.fecha
                    ),

                "Fecha creación ISO":
                    obtenerFechaISOReporte(
                        ticket.fecha_creacion ||
                        ticket.createdAt ||
                        ticket.fecha
                    ),

                "Última actualización":
                    formatearFechaReporte(
                        ticket.updatedAt ||
                        ticket.fecha_actualizacion ||
                        ticket.fecha_modificacion
                    )

            };

        }
    );

}


/* =========================================================
   REPORTE TÉCNICOS
========================================================= */

function construirReporteTecnicos(
    tickets
) {

    const grupos = {};


    tickets.forEach(
        function (ticket) {

            const tecnico =
                obtenerNombreTecnicoReporte(
                    ticket
                );


            if (!grupos[tecnico]) {

                grupos[tecnico] = {

                    total: 0,

                    registrados: 0,

                    pendientes: 0,

                    proceso: 0,

                    resueltos: 0,

                    cerrados: 0,

                    cancelados: 0

                };

            }


            const grupo =
                grupos[tecnico];


            grupo.total++;


            const estatus =
                normalizarEstatusReporte(
                    ticket.estatus
                );


            incrementarEstado(
                grupo,
                estatus
            );

        }
    );


    return Object.entries(
        grupos
    )
    .sort(
        function (a, b) {

            return (
                b[1].total -
                a[1].total
            );

        }
    )
    .map(
        function (item) {

            const tecnico =
                item[0];


            const grupo =
                item[1];


            const completados =
                grupo.resueltos +
                grupo.cerrados;


            const tasa =
                grupo.total
                    ? Math.round(
                        (
                            completados /
                            grupo.total
                        ) * 100
                    )
                    : 0;


            return {

                "Técnico":
                    tecnico,

                "Total":
                    grupo.total,

                "Registrados":
                    grupo.registrados,

                "Pendientes":
                    grupo.pendientes,

                "En Proceso":
                    grupo.proceso,

                "Resueltos":
                    grupo.resueltos,

                "Cerrados":
                    grupo.cerrados,

                "Cancelados":
                    grupo.cancelados,

                "Tasa resolución":
                    tasa + "%"

            };

        }
    );

}


/* =========================================================
   REPORTE USUARIOS
========================================================= */

function construirReporteUsuarios(
    tickets
) {

    const grupos = {};


    tickets.forEach(
        function (ticket) {

            const usuario =
                ticket.empleado ||
                ticket.nombre_usuario ||
                ticket.usuario ||
                ticket.nombre ||
                "Sin usuario";


            const correo =
                ticket.correo ||
                ticket.correo_usuario ||
                "";


            const clave =
                usuario +
                "|" +
                correo;


            if (!grupos[clave]) {

                grupos[clave] = {

                    usuario,

                    correo,

                    division:
                        ticket.division ||
                        "",

                    area:
                        ticket.area ||
                        "",

                    total: 0,

                    abiertos: 0,

                    resueltos: 0,

                    cerrados: 0,

                    cancelados: 0

                };

            }


            const grupo =
                grupos[clave];


            grupo.total++;


            const estatus =
                normalizarEstatusReporte(
                    ticket.estatus
                );


            if (
                estatus !==
                "Resuelto" &&
                estatus !==
                "Cerrado" &&
                estatus !==
                "Cancelado"
            ) {

                grupo.abiertos++;

            }


            if (
                estatus ===
                "Resuelto"
            ) {

                grupo.resueltos++;

            }


            if (
                estatus ===
                "Cerrado"
            ) {

                grupo.cerrados++;

            }


            if (
                estatus ===
                "Cancelado"
            ) {

                grupo.cancelados++;

            }

        }
    );


    return Object.values(
        grupos
    )
    .sort(
        function (a, b) {

            return (
                b.total -
                a.total
            );

        }
    )
    .map(
        function (grupo) {

            return {

                "Usuario":
                    grupo.usuario,

                "Correo":
                    grupo.correo,

                "División":
                    grupo.division,

                "Área":
                    grupo.area,

                "Tickets":
                    grupo.total,

                "Abiertos":
                    grupo.abiertos,

                "Resueltos":
                    grupo.resueltos,

                "Cerrados":
                    grupo.cerrados,

                "Cancelados":
                    grupo.cancelados

            };

        }
    );

}


/* =========================================================
   REPORTE DIVISIONES
========================================================= */

function construirReporteDivisiones(
    tickets
) {

    return construirAgrupacionGeneral(
        tickets,
        function (ticket) {

            return (
                ticket.division ||
                "Sin división"
            );

        }
    );

}


/* =========================================================
   REPORTE ÁREAS
========================================================= */

function construirReporteAreas(
    tickets
) {

    const grupos = {};


    tickets.forEach(
        function (ticket) {

            const division =
                ticket.division ||
                "Sin división";


            const area =
                ticket.area ||
                "Sin área";


            const clave =
                division +
                "|" +
                area;


            if (!grupos[clave]) {

                grupos[clave] = {

                    division,

                    area,

                    total: 0,

                    registrados: 0,

                    pendientes: 0,

                    proceso: 0,

                    resueltos: 0,

                    cerrados: 0,

                    cancelados: 0

                };

            }


            grupos[clave].total++;


            incrementarEstado(
                grupos[clave],
                normalizarEstatusReporte(
                    ticket.estatus
                )
            );

        }
    );


    return Object.values(
        grupos
    )
    .sort(
        function (a, b) {

            return (
                b.total -
                a.total
            );

        }
    )
    .map(
        function (grupo) {

            return {

                "División":
                    grupo.division,

                "Área":
                    grupo.area,

                "Total":
                    grupo.total,

                "Registrados":
                    grupo.registrados,

                "Pendientes":
                    grupo.pendientes,

                "En Proceso":
                    grupo.proceso,

                "Resueltos":
                    grupo.resueltos,

                "Cerrados":
                    grupo.cerrados,

                "Cancelados":
                    grupo.cancelados

            };

        }
    );

}


/* =========================================================
   REPORTE CATEGORÍAS
========================================================= */

function construirReporteCategorias(
    tickets
) {

    const contador = {};


    tickets.forEach(
        function (ticket) {

            const categoria =
                ticket.categoria ||
                "Sin categoría";


            contador[categoria] =
                (
                    contador[categoria] ||
                    0
                ) + 1;

        }
    );


    return Object.entries(
        contador
    )
    .sort(
        function (a, b) {

            return b[1] - a[1];

        }
    )
    .map(
        function (item) {

            const categoria =
                item[0];


            const cantidad =
                item[1];


            const porcentaje =
                tickets.length
                    ? Math.round(
                        (
                            cantidad /
                            tickets.length
                        ) * 100
                    )
                    : 0;


            return {

                "Categoría":
                    categoria,

                "Tickets":
                    cantidad,

                "Porcentaje":
                    porcentaje + "%"

            };

        }
    );

}


/* =========================================================
   AGRUPACIÓN GENERAL
========================================================= */

function construirAgrupacionGeneral(
    tickets,
    obtenerGrupo
) {

    const grupos = {};


    tickets.forEach(
        function (ticket) {

            const nombre =
                obtenerGrupo(
                    ticket
                );


            if (!grupos[nombre]) {

                grupos[nombre] = {

                    nombre,

                    total: 0,

                    registrados: 0,

                    pendientes: 0,

                    proceso: 0,

                    resueltos: 0,

                    cerrados: 0,

                    cancelados: 0

                };

            }


            grupos[nombre].total++;


            incrementarEstado(
                grupos[nombre],
                normalizarEstatusReporte(
                    ticket.estatus
                )
            );

        }
    );


    return Object.values(
        grupos
    )
    .sort(
        function (a, b) {

            return (
                b.total -
                a.total
            );

        }
    )
    .map(
        function (grupo) {

            return {

                "Nombre":
                    grupo.nombre,

                "Total":
                    grupo.total,

                "Registrados":
                    grupo.registrados,

                "Pendientes":
                    grupo.pendientes,

                "En Proceso":
                    grupo.proceso,

                "Resueltos":
                    grupo.resueltos,

                "Cerrados":
                    grupo.cerrados,

                "Cancelados":
                    grupo.cancelados

            };

        }
    );

}


/* =========================================================
   INCREMENTAR ESTADO
========================================================= */

function incrementarEstado(
    grupo,
    estatus
) {

    switch (estatus) {

        case "Registrado":

            grupo.registrados++;

            break;


        case "Pendiente":

            grupo.pendientes++;

            break;


        case "En Proceso":

            grupo.proceso++;

            break;


        case "Resuelto":

            grupo.resueltos++;

            break;


        case "Cerrado":

            grupo.cerrados++;

            break;


        case "Cancelado":

            grupo.cancelados++;

            break;

    }

}


/* =========================================================
   EXPORTAR TODO ZIP
========================================================= */

function exportarTodoZIP() {

    const tickets =
        obtenerTicketsFiltrados();


    if (!tickets.length) {

        mostrarEstadoReporte(
            "No existen registros para generar la exportación.",
            "error"
        );

        return;

    }


    if (
        typeof JSZip ===
        "undefined"
    ) {

        mostrarEstadoReporte(
            "La librería de exportación ZIP no está disponible.",
            "error"
        );

        return;

    }


    mostrarEstadoReporte(
        "Generando paquete completo de reportes...",
        "info"
    );


    const zip =
        new JSZip();


    const reportes = {

        "tickets.csv":
            construirReporteTickets(
                tickets
            ),

        "tecnicos.csv":
            construirReporteTecnicos(
                tickets
            ),

        "usuarios.csv":
            construirReporteUsuarios(
                tickets
            ),

        "divisiones.csv":
            construirReporteDivisiones(
                tickets
            ),

        "areas.csv":
            construirReporteAreas(
                tickets
            ),

        "categorias.csv":
            construirReporteCategorias(
                tickets
            )

    };


    Object.entries(
        reportes
    )
    .forEach(
        function (item) {

            const nombre =
                item[0];


            const filas =
                item[1];


            zip.file(
                nombre,
                generarCSV(
                    filas
                )
            );

        }
    );


    zip.file(
        "README.txt",
        generarREADMEExportacion(
            tickets
        )
    );


    zip.generateAsync(
        {
            type:
                "blob"
        }
    )
    .then(
        function (blob) {

            const url =
                URL.createObjectURL(
                    blob
                );


            const enlace =
                document.createElement(
                    "a"
                );


            enlace.href =
                url;


            enlace.download =
                generarNombreArchivo(
                    "newsroom-reportes",
                    "zip"
                );


            document.body.appendChild(
                enlace
            );


            enlace.click();


            enlace.remove();


            setTimeout(
                function () {

                    URL.revokeObjectURL(
                        url
                    );

                },
                1000
            );


            mostrarEstadoReporte(
                "Paquete ZIP generado correctamente.",
                "success"
            );

        }
    )
    .catch(
        function (error) {

            console.error(
                "Newsroom Portal: error generando ZIP:",
                error
            );


            mostrarEstadoReporte(
                "No se pudo generar el paquete ZIP.",
                "error"
            );

        }
    );

}


/* =========================================================
   README DE EXPORTACIÓN
========================================================= */

function generarREADMEExportacion(
    tickets
) {

    const fecha =
        new Date()
            .toLocaleString(
                "es-MX"
            );


    const inicio =
        document.getElementById(
            "fechaInicio"
        )?.value ||
        "Sin límite";


    const fin =
        document.getElementById(
            "fechaFin"
        )?.value ||
        "Sin límite";


    return [

        "NEWSROOM PORTAL",

        "CENTRO DE REPORTES",

        "",

        "Fecha de generación: " +
        fecha,

        "Tickets incluidos: " +
        tickets.length,

        "Fecha inicial: " +
        inicio,

        "Fecha final: " +
        fin,

        "",

        "ARCHIVOS",

        "tickets.csv - Historial completo de tickets",

        "tecnicos.csv - Resumen por técnico",

        "usuarios.csv - Resumen por usuario",

        "divisiones.csv - Resumen por división",

        "areas.csv - Resumen por área",

        "categorias.csv - Resumen por categoría",

        "",

        "NOTA",

        "Este paquete fue generado desde el Centro de Reportes de Newsroom Portal."

    ].join(
        "\n"
    );

}


/* =========================================================
   GENERAR CSV
========================================================= */

function generarCSV(
    filas
) {

    if (
        !Array.isArray(filas) ||
        !filas.length
    ) {

        return (
            "\uFEFF" +
            "Sin registros\r\n"
        );

    }


    const columnas =
        Object.keys(
            filas[0]
        );


    const encabezados =
        columnas
            .map(
                escaparCSV
            )
            .join(",");


    const filasCSV =
        filas.map(
            function (fila) {

                return columnas
                    .map(
                        function (columna) {

                            return escaparCSV(
                                fila[
                                    columna
                                ]
                            );

                        }
                    )
                    .join(",");

            }
        );


    return (
        "\uFEFF" +
        encabezados +
        "\r\n" +
        filasCSV.join(
            "\r\n"
        ) +
        "\r\n"
    );

}


/* =========================================================
   ESCAPAR CSV
========================================================= */

function escaparCSV(
    valor
) {

    let texto =
        String(
            valor ??
            ""
        );


    texto =
        texto.replace(
            /"/g,
            '""'
        );


    return (
        '"' +
        texto +
        '"'
    );

}


/* =========================================================
   DESCARGAR CSV
========================================================= */

function descargarCSV(
    contenido,
    nombreArchivo
) {

    const blob =
        new Blob(
            [
                contenido
            ],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const enlace =
        document.createElement(
            "a"
        );


    enlace.href =
        url;


    enlace.download =
        nombreArchivo;


    document.body.appendChild(
        enlace
    );


    enlace.click();


    enlace.remove();


    setTimeout(
        function () {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );

}


/* =========================================================
   NOMBRE ARCHIVO
========================================================= */

function generarNombreArchivo(
    prefijo,
    extension
) {

    extension =
        extension ||
        "csv";


    const fecha =
        new Date();


    const año =
        fecha.getFullYear();


    const mes =
        String(
            fecha.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );


    const dia =
        String(
            fecha.getDate()
        )
        .padStart(
            2,
            "0"
        );


    const hora =
        String(
            fecha.getHours()
        )
        .padStart(
            2,
            "0"
        );


    const minuto =
        String(
            fecha.getMinutes()
        )
        .padStart(
            2,
            "0"
        );


    return (
        "Newsroom_" +
        prefijo +
        "_" +
        año +
        mes +
        dia +
        "_" +
        hora +
        minuto +
        "." +
        extension
    );

}


/* =========================================================
   LIMPIAR FILTROS
========================================================= */

function limpiarFiltrosReportes() {

    const ids = [

        "fechaInicio",

        "fechaFin",

        "reporteEstatus",

        "reportePrioridad",

        "reporteDivision",

        "reporteArea",

        "reporteCategoria",

        "reporteTecnico",

        "reporteBusqueda"

    ];


    ids.forEach(
        function (id) {

            const elemento =
                document.getElementById(
                    id
                );


            if (!elemento) {

                return;

            }


            elemento.value =
                "";

        }
    );


    aplicarFiltrosReportes();


    mostrarEstadoReporte(
        "Filtros restablecidos.",
        "success"
    );

}


/* =========================================================
   ACTUALIZAR TEXTO
========================================================= */

function actualizarTextoReporte(
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
   MOSTRAR STATUS
========================================================= */

function mostrarEstadoReporte(
    mensaje,
    tipo
) {

    const elemento =
        document.getElementById(
            "reportesStatus"
        );


    if (!elemento) {

        return;

    }


    elemento.hidden =
        false;


    elemento.className =
        "reportes-status " +
        (
            tipo ||
            "info"
        );


    const icono =
        tipo === "error"
            ? "fa-circle-exclamation"
            : tipo === "success"
                ? "fa-circle-check"
                : "fa-circle-info";


    elemento.innerHTML = `

        <i
            class="
                fa-solid
                ${icono}
            "
        ></i>

        ${escapeHTMLReporte(
            mensaje
        )}

    `;


    clearTimeout(
        elemento._timeout
    );


    elemento._timeout =
        setTimeout(
            function () {

                elemento.hidden =
                    true;

            },
            5000
        );

}


/* =========================================================
   OBTENER NOMBRE TÉCNICO
========================================================= */

function obtenerNombreTecnicoReporte(
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
        ).trim();

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
   NORMALIZAR ESTATUS
========================================================= */

function normalizarEstatusReporte(
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

function normalizarPrioridadReporte(
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
   NORMALIZAR CLASE
========================================================= */

function normalizarClaseReporte(
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
   OBTENER FECHA
========================================================= */

function obtenerFechaReporte(
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
        fecha !==
            null &&
        fecha !==
            undefined &&
        fecha !==
            ""
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
   FECHA FORMATEADA
========================================================= */

function formatearFechaReporte(
    fecha
) {

    const fechaObj =
        obtenerFechaReporte(
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
   FECHA ISO
========================================================= */

function obtenerFechaISOReporte(
    fecha
) {

    const fechaObj =
        obtenerFechaReporte(
            fecha
        );


    if (
        fechaObj.getTime() ===
        0
    ) {

        return "";

    }


    return fechaObj.toISOString();

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTMLReporte(
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
