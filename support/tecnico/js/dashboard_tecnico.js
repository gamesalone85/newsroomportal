/* =========================================================
NEWSROOM PORTAL
DASHBOARD TÉCNICO
FIRESTORE
========================================================= */

document.addEventListener(
"DOMContentLoaded",
function () {

    console.log(
        "Newsroom Portal: dashboard técnico cargado."
    );


    /* =====================================================
       VARIABLES
    ===================================================== */

    let db = null;

    let currentUser = null;

    let technicianData = null;

    let tickets = [];

    let dailyChart = null;

    let categoriesChart = null;


    /* =====================================================
       INICIAR FIREBASE
    ===================================================== */

    function iniciarFirebase() {

        if (
            typeof firebase === "undefined"
        ) {

            console.error(
                "Firebase no está cargado."
            );

            mostrarError(
                "Firebase no está disponible."
            );

            return false;

        }


        if (
            typeof firebase.apps === "undefined" ||
            firebase.apps.length === 0
        ) {

            console.error(
                "Firebase no está inicializado."
            );

            mostrarError(
                "Firebase no está inicializado."
            );

            return false;

        }


        db = firebase.firestore();

        return true;

    }


    /* =====================================================
       OBTENER USUARIO AUTH
    ===================================================== */

    function esperarUsuario() {

        return new Promise(
            function (resolve) {

                if (
                    typeof firebase === "undefined" ||
                    !firebase.auth
                ) {

                    resolve(null);

                    return;

                }


                const unsubscribe =
                    firebase.auth().onAuthStateChanged(
                        function (user) {

                            unsubscribe();

                            resolve(user);

                        }
                    );

            }
        );

    }


    /* =====================================================
       CARGAR DATOS DEL TÉCNICO
    ===================================================== */

    async function cargarTecnico() {

        if (!currentUser) {

            return null;

        }


        let tecnico = null;


        try {

            const doc =
                await db
                    .collection("usuarios")
                    .doc(currentUser.uid)
                    .get();


            if (doc.exists) {

                tecnico = {
                    id: doc.id,
                    ...doc.data()
                };

            }

        } catch (error) {

            console.warn(
                "No se pudo obtener el usuario:",
                error
            );

        }


        /*
         * Si no existe documento en usuarios,
         * utilizamos los datos de Authentication.
         */

        if (!tecnico) {

            tecnico = {

                id: currentUser.uid,

                uid: currentUser.uid,

                correo:
                    currentUser.email || "",

                email:
                    currentUser.email || "",

                nombre:
                    currentUser.displayName ||
                    currentUser.email ||
                    "Técnico"

            };

        }


        return tecnico;

    }


    /* =====================================================
       NOMBRE TÉCNICO
    ===================================================== */

    function obtenerNombreTecnico() {

        if (!technicianData) {

            return "Técnico";

        }


        return (
            technicianData.nombre ||
            technicianData.nombreCompleto ||
            technicianData.displayName ||
            technicianData.usuario ||
            technicianData.correo ||
            technicianData.email ||
            currentUser?.email ||
            "Técnico"
        );

    }


    /* =====================================================
       ACTUALIZAR TOPBAR
    ===================================================== */

    function actualizarUsuario() {

        const nombre =
            obtenerNombreTecnico();


        const nombreElemento =
            document.getElementById(
                "userName"
            );


        const avatar =
            document.getElementById(
                "userAvatar"
            );


        if (nombreElemento) {

            nombreElemento.textContent =
                nombre;

        }


        if (avatar) {

            avatar.textContent =
                nombre
                    .trim()
                    .charAt(0)
                    .toUpperCase();

        }

    }


    /* =====================================================
       NORMALIZAR TEXTO
    ===================================================== */

    function normalizar(valor) {

        if (
            valor === null ||
            valor === undefined
        ) {

            return "";

        }


        return String(valor)
            .trim()
            .toLowerCase();

    }


    /* =====================================================
       OBTENER CAMPO
    ===================================================== */

    function obtenerCampo(
        ticket,
        campos
    ) {

        for (
            const campo of campos
        ) {

            if (
                ticket[campo] !== undefined &&
                ticket[campo] !== null &&
                ticket[campo] !== ""
            ) {

                return ticket[campo];

            }

        }


        return "";

    }


    /* =====================================================
       CONVERTIR FECHA FIREBASE
    ===================================================== */

    function convertirFecha(valor) {

        if (!valor) {

            return null;

        }


        if (
            typeof valor.toDate ===
            "function"
        ) {

            return valor.toDate();

        }


        if (
            valor instanceof Date
        ) {

            return valor;

        }


        if (
            typeof valor === "number"
        ) {

            const fecha =
                new Date(valor);

            return isNaN(fecha.getTime())
                ? null
                : fecha;

        }


        if (
            typeof valor === "string"
        ) {

            const fecha =
                new Date(valor);

            return isNaN(fecha.getTime())
                ? null
                : fecha;

        }


        return null;

    }


    /* =====================================================
       FECHA DEL TICKET
    ===================================================== */

    function obtenerFechaTicket(ticket) {

        const valor =
            obtenerCampo(
                ticket,
                [
                    "fecha_creacion",
                    "fechaCreacion",
                    "fecha",
                    "createdAt",
                    "created_at",
                    "timestamp"
                ]
            );


        return convertirFecha(valor);

    }


    /* =====================================================
       IDENTIFICAR TÉCNICO
    ===================================================== */

    function ticketPerteneceTecnico(ticket) {

        if (!technicianData) {

            return false;

        }


        const uid =
            normalizar(
                currentUser?.uid
            );


        const email =
            normalizar(
                currentUser?.email
            );


        const tecnicoId =
            normalizar(
                obtenerCampo(
                    technicianData,
                    [
                        "uid",
                        "id",
                        "usuarioId"
                    ]
                )
            );


        const tecnicoCorreo =
            normalizar(
                obtenerCampo(
                    technicianData,
                    [
                        "correo",
                        "email"
                    ]
                )
            );


        const tecnicoNombre =
            normalizar(
                obtenerCampo(
                    technicianData,
                    [
                        "nombre",
                        "nombreCompleto",
                        "displayName",
                        "usuario"
                    ]
                )
            );


        /*
         * Campos posibles de asignación
         */

        const asignadoId =
            normalizar(
                obtenerCampo(
                    ticket,
                    [
                        "tecnicoId",
                        "tecnico_id",
                        "usuarioTecnicoId",
                        "asignadoId",
                        "assignedTo",
                        "assigned_to"
                    ]
                )
            );


        const asignadoCorreo =
            normalizar(
                obtenerCampo(
                    ticket,
                    [
                        "tecnicoCorreo",
                        "tecnico_email",
                        "asignadoCorreo",
                        "assignedEmail"
                    ]
                )
            );


        const asignadoNombre =
            normalizar(
                obtenerCampo(
                    ticket,
                    [
                        "tecnico",
                        "tecnicoNombre",
                        "nombreTecnico",
                        "asignadoA",
                        "asignado",
                        "assignedName"
                    ]
                )
            );


        /*
         * Comparación por UID
         */

        if (
            uid &&
            (
                asignadoId === uid ||
                asignadoCorreo === email
            )
        ) {

            return true;

        }


        /*
         * Comparación contra datos del usuario
         */

        if (
            tecnicoId &&
            asignadoId === tecnicoId
        ) {

            return true;

        }


        if (
            tecnicoCorreo &&
            asignadoCorreo === tecnicoCorreo
        ) {

            return true;

        }


        /*
         * Comparación por nombre
         */

        if (
            tecnicoNombre &&
            asignadoNombre === tecnicoNombre
        ) {

            return true;

        }


        /*
         * Algunos sistemas guardan directamente
         * el UID en "tecnico".
         */

        if (
            asignadoNombre === uid
        ) {

            return true;

        }


        return false;

    }


    /* =====================================================
       CARGAR TICKETS
    ===================================================== */

    async function cargarTickets() {

        try {

            const snapshot =
                await db
                    .collection("tickets")
                    .get();


            tickets = [];


            snapshot.forEach(
                function (doc) {

                    const data =
                        doc.data();


                    const ticket = {

                        id: doc.id,

                        ...data

                    };


                    if (
                        ticketPerteneceTecnico(
                            ticket
                        )
                    ) {

                        tickets.push(
                            ticket
                        );

                    }

                }
            );


            console.log(
                "Tickets del técnico:",
                tickets.length
            );


            procesarDashboard();


        } catch (error) {

            console.error(
                "Error obteniendo tickets:",
                error
            );


            mostrarError(
                "No fue posible cargar los tickets del técnico."
            );

        }

    }


    /* =====================================================
       PROCESAR DASHBOARD
    ===================================================== */

    function procesarDashboard() {

        actualizarKPIs();

        generarGraficaDiaria();

        generarGraficaCategorias();

        generarAlertas();

        generarResumen();

    }


    /* =====================================================
       ESTATUS
    ===================================================== */

    function obtenerEstatus(ticket) {

        return normalizar(
            obtenerCampo(
                ticket,
                [
                    "estatus",
                    "estado",
                    "status"
                ]
            )
        );

    }


    /* =====================================================
       ACTUALIZAR KPIs
    ===================================================== */

    function actualizarKPIs() {

        const total =
            tickets.length;


        const proceso =
            tickets.filter(
                function (ticket) {

                    const estado =
                        obtenerEstatus(
                            ticket
                        );

                    return (
                        estado === "en proceso" ||
                        estado === "en_proceso" ||
                        estado === "proceso"
                    );

                }
            ).length;


        const pendientes =
            tickets.filter(
                function (ticket) {

                    const estado =
                        obtenerEstatus(
                            ticket
                        );

                    return (
                        estado === "pendiente" ||
                        estado === "registrado" ||
                        estado === "abierto"
                    );

                }
            ).length;


        const alertados =
            obtenerTicketsAlertados()
                .length;


        document.getElementById(
            "totalTickets"
        ).textContent = total;


        document.getElementById(
            "ticketsProceso"
        ).textContent = proceso;


        document.getElementById(
            "ticketsPendientes"
        ).textContent = pendientes;


        document.getElementById(
            "ticketsAlertados"
        ).textContent = alertados;

    }


    /* =====================================================
       GRÁFICA TICKETS POR DÍA
    ===================================================== */

    function generarGraficaDiaria() {

        const añoActual =
            new Date().getFullYear();


        const diasDelAño =
            new Date(
                añoActual,
                11,
                31
            ).getDate() === 31
                ? (
                    new Date(
                        añoActual,
                        1,
                        29
                    ).getMonth() === 1
                        ? 366
                        : 365
                )
                : 365;


        const labels = [];

        const valores = [];


        const mapa =
            {};


        tickets.forEach(
            function (ticket) {

                const fecha =
                    obtenerFechaTicket(
                        ticket
                    );


                if (!fecha) {

                    return;

                }


                if (
                    fecha.getFullYear() !==
                    añoActual
                ) {

                    return;

                }


                const clave =
                    fecha
                        .toISOString()
                        .split("T")[0];


                mapa[clave] =
                    (
                        mapa[clave] || 0
                    ) + 1;

            }
        );


        /*
         * Generamos solamente los días
         * transcurridos hasta hoy.
         */

        const inicio =
            new Date(
                añoActual,
                0,
                1
            );


        const hoy =
            new Date();


        for (
            let fecha =
                new Date(inicio);

            fecha <= hoy;

            fecha.setDate(
                fecha.getDate() + 1
            )
        ) {

            const clave =
                fecha
                    .toISOString()
                    .split("T")[0];


            labels.push(
                fecha.toLocaleDateString(
                    "es-MX",
                    {
                        day: "2-digit",
                        month: "short"
                    }
                )
            );


            valores.push(
                mapa[clave] || 0
            );

        }


        const canvas =
            document.getElementById(
                "ticketsDailyChart"
            );


        if (!canvas) {

            return;

        }


        if (dailyChart) {

            dailyChart.destroy();

        }


        dailyChart =
            new Chart(
                canvas,
                {

                    type: "line",

                    data: {

                        labels: labels,

                        datasets: [

                            {

                                label:
                                    "Tickets",

                                data:
                                    valores,

                                borderColor:
                                    "#c8102e",

                                backgroundColor:
                                    "rgba(200,16,46,.10)",

                                borderWidth: 2,

                                pointRadius: 2,

                                pointHoverRadius: 5,

                                fill: true,

                                tension: .35

                            }

                        ]

                    },


                    options: {

                        responsive: true,

                        maintainAspectRatio:
                            false,

                        interaction: {

                            intersect: false,

                            mode: "index"

                        },


                        plugins: {

                            legend: {

                                display: false

                            }

                        },


                        scales: {

                            x: {

                                grid: {

                                    display: false

                                },

                                ticks: {

                                    maxTicksLimit: 12,

                                    font: {

                                        size: 10

                                    }

                                }

                            },


                            y: {

                                beginAtZero: true,

                                ticks: {

                                    precision: 0,

                                    font: {

                                        size: 10

                                    }

                                }

                            }

                        }

                    }

                }
            );

    }


    /* =====================================================
       CATEGORÍA
    ===================================================== */

    function obtenerCategoria(ticket) {

        return (
            obtenerCampo(
                ticket,
                [
                    "categoria",
                    "categoría",
                    "tipo",
                    "tipoReporte",
                    "tipo_reporte",
                    "categoriaTicket"
                ]
            ) ||
            "Sin categoría"
        );

    }


    /* =====================================================
       GRÁFICA CATEGORÍAS
    ===================================================== */

    function generarGraficaCategorias() {

        const contador = {};


        tickets.forEach(
            function (ticket) {

                const categoria =
                    obtenerCategoria(
                        ticket
                    );


                contador[categoria] =
                    (
                        contador[categoria] ||
                        0
                    ) + 1;

            }
        );


        const categorias =
            Object.keys(
                contador
            )
            .sort(
                function (a, b) {

                    return (
                        contador[b] -
                        contador[a]
                    );

                }
            )
            .slice(0, 6);


        const valores =
            categorias.map(
                function (categoria) {

                    return contador[
                        categoria
                    ];

                }
            );


        const canvas =
            document.getElementById(
                "categoriesChart"
            );


        if (!canvas) {

            return;

        }


        if (categoriesChart) {

            categoriesChart.destroy();

        }


        if (
            categorias.length === 0
        ) {

            categorias.push(
                "Sin datos"
            );

            valores.push(1);

        }


        categoriesChart =
            new Chart(
                canvas,
                {

                    type: "doughnut",

                    data: {

                        labels: categorias,

                        datasets: [

                            {

                                data: valores,

                                backgroundColor: [

                                    "#c8102e",

                                    "#54565a",

                                    "#00ae42",

                                    "#f59e0b",

                                    "#2563eb",

                                    "#7c3aed"

                                ],

                                borderWidth: 3,

                                borderColor:
                                    "#ffffff"

                            }

                        ]

                    },


                    options: {

                        responsive: true,

                        maintainAspectRatio:
                            false,

                        cutout: "65%",

                        plugins: {

                            legend: {

                                display: false

                            }

                        }

                    }

                }
            );


        generarLeyendaCategorias(
            categorias,
            valores
        );

    }


    /* =====================================================
       LEYENDA
    ===================================================== */

    function generarLeyendaCategorias(
        categorias,
        valores
    ) {

        const container =
            document.getElementById(
                "categoryLegend"
            );


        if (!container) {

            return;

        }


        let html = "";


        categorias.forEach(
            function (
                categoria,
                index
            ) {

                html += `

                    <div class="legend-item">

                        <div class="legend-name">

                            <span
                                class="legend-dot"
                                style="
                                    background:
                                    ${[
                                        "#c8102e",
                                        "#54565a",
                                        "#00ae42",
                                        "#f59e0b",
                                        "#2563eb",
                                        "#7c3aed"
                                    ][index]};
                                "
                            ></span>

                            <span>
                                ${escapeHtml(
                                    categoria
                                )}
                            </span>

                        </div>

                        <span class="legend-value">

                            ${valores[index]}

                        </span>

                    </div>

                `;

            }
        );


        container.innerHTML =
            html;

    }


    /* =====================================================
       TICKETS ALERTADOS
    ===================================================== */

    function obtenerTicketsAlertados() {

        const ahora =
            new Date();


        const limite =
            new Date(
                ahora.getTime() -
                (
                    48 *
                    60 *
                    60 *
                    1000
                )
            );


        return tickets.filter(
            function (ticket) {

                const estado =
                    obtenerEstatus(
                        ticket
                    );


                /*
                 * Resueltos y cancelados
                 * no requieren seguimiento.
                 */

                if (
                    estado === "resuelto" ||
                    estado === "cerrado" ||
                    estado === "cancelado"
                ) {

                    return false;

                }


                const fecha =
                    obtenerFechaTicket(
                        ticket
                    );


                /*
                 * Si no hay fecha,
                 * lo consideramos pendiente.
                 */

                if (!fecha) {

                    return true;

                }


                /*
                 * Ticket abierto/en proceso
                 * durante más de 48 horas.
                 */

                return fecha <= limite;

            }
        )
        .sort(
            function (a, b) {

                const fechaA =
                    obtenerFechaTicket(a);

                const fechaB =
                    obtenerFechaTicket(b);


                if (
                    !fechaA ||
                    !fechaB
                ) {

                    return 0;

                }


                return (
                    fechaA -
                    fechaB
                );

            }
        );

    }


    /* =====================================================
       MOSTRAR ALERTAS
    ===================================================== */

    function generarAlertas() {

        const alertas =
            obtenerTicketsAlertados();


        const container =
            document.getElementById(
                "alertsContainer"
            );


        const counter =
            document.getElementById(
                "alertCounter"
            );


        counter.textContent =
            alertas.length;


        if (
            alertas.length === 0
        ) {

            container.innerHTML = `

                <div class="no-alerts">

                    <i class="fa-solid fa-circle-check"></i>

                    <strong>
                        Todo está bajo control
                    </strong>

                    <span>
                        No tienes tickets pendientes
                        que requieran seguimiento.
                    </span>

                </div>

            `;

            return;

        }


        let html = "";


        alertas
            .slice(0, 10)
            .forEach(
                function (ticket) {

                    const folio =
                        obtenerCampo(
                            ticket,
                            [
                                "folio",
                                "numero",
                                "ticket",
                                "idTicket"
                            ]
                        ) ||
                        ticket.id;


                    const titulo =
                        obtenerCampo(
                            ticket,
                            [
                                "titulo",
                                "asunto",
                                "descripcion",
                                "problema"
                            ]
                        ) ||
                        "Ticket sin título";


                    const estado =
                        obtenerCampo(
                            ticket,
                            [
                                "estatus",
                                "estado",
                                "status"
                            ]
                        ) ||
                        "Pendiente";


                    const fecha =
                        obtenerFechaTicket(
                            ticket
                        );


                    let fechaTexto =
                        "Sin fecha";


                    if (fecha) {

                        fechaTexto =
                            fecha.toLocaleDateString(
                                "es-MX",
                                {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric"
                                }
                            );

                    }


                    const prioridad =
                        obtenerCampo(
                            ticket,
                            [
                                "prioridad",
                                "priority"
                            ]
                        );


                    const esCritico =
                        normalizar(
                            prioridad
                        ) ===
                        "crítica" ||
                        normalizar(
                            prioridad
                        ) ===
                        "critica";


                    html += `

                        <div
                            class="
                                alert-item
                                ${
                                    esCritico
                                        ? ""
                                        : "warning"
                                }
                            "
                        >

                            <div class="alert-info">

                                <div class="alert-ticket">

                                    #${escapeHtml(
                                        String(folio)
                                    )}

                                </div>

                                <div class="alert-title">

                                    ${escapeHtml(
                                        String(titulo)
                                    )}

                                </div>


                                <div class="alert-meta">

                                    <span class="alert-badge">

                                        ${escapeHtml(
                                            String(
                                                estado
                                            )
                                        )}

                                    </span>


                                    ${
                                        prioridad
                                            ? `
                                                <span
                                                    class="
                                                        alert-badge
                                                        ${
                                                            esCritico
                                                                ? "danger"
                                                                : "warning"
                                                        }
                                                    "
                                                >
                                                    ${escapeHtml(
                                                        String(
                                                            prioridad
                                                        )
                                                    )}
                                                </span>
                                            `
                                            : ""
                                    }

                                </div>

                            </div>


                            <div class="alert-date">

                                ${fechaTexto}

                            </div>

                        </div>

                    `;

                }
            );


        if (
            alertas.length > 10
        ) {

            html += `

                <div
                    style="
                        text-align:center;
                        padding:12px;
                        font-size:11px;
                        color:#6b7280;
                    "
                >

                    Hay ${alertas.length - 10}
                    tickets adicionales
                    que requieren seguimiento.

                </div>

            `;

        }


        container.innerHTML =
            html;

    }


    /* =====================================================
       RESUMEN
    ===================================================== */

    function generarResumen() {

        const mensaje =
            document.getElementById(
                "performanceMessage"
            );


        if (!mensaje) {

            return;

        }


        if (
            tickets.length === 0
        ) {

            mensaje.textContent =
                "Todavía no tienes tickets registrados.";

            return;

        }


        const añoActual =
            new Date().getFullYear();


        const ticketsEsteAño =
            tickets.filter(
                function (ticket) {

                    const fecha =
                        obtenerFechaTicket(
                            ticket
                        );


                    return (
                        fecha &&
                        fecha.getFullYear() ===
                        añoActual
                    );

                }
            ).length;


        const promedio =
            ticketsEsteAño /
            Math.max(
                1,
                obtenerDiasTranscurridos()
            );


        mensaje.textContent =
            `Has atendido ${ticketsEsteAño} tickets durante ${añoActual}, con un promedio de ${promedio.toFixed(1)} tickets por día.`;

    }


    /* =====================================================
       DÍAS TRANSCURRIDOS
    ===================================================== */

    function obtenerDiasTranscurridos() {

        const inicio =
            new Date(
                new Date().getFullYear(),
                0,
                1
            );


        const ahora =
            new Date();


        const diferencia =
            ahora.getTime() -
            inicio.getTime();


        return Math.floor(
            diferencia /
            (
                1000 *
                60 *
                60 *
                24
            )
        ) + 1;

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHtml(valor) {

        return String(valor)
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


    /* =====================================================
       ERROR
    ===================================================== */

    function mostrarError(
        mensaje
    ) {

        const container =
            document.getElementById(
                "alertsContainer"
            );


        if (container) {

            container.innerHTML = `

                <div class="no-alerts">

                    <i
                        class="
                            fa-solid
                            fa-triangle-exclamation
                        "
                        style="
                            color:#c8102e;
                        "
                    ></i>

                    <strong>
                        No se pudo cargar el dashboard
                    </strong>

                    <span>
                        ${escapeHtml(
                            mensaje
                        )}
                    </span>

                </div>

            `;

        }

    }


    /* =====================================================
       INICIALIZACIÓN
    ===================================================== */

    async function iniciar() {

        if (
            !iniciarFirebase()
        ) {

            return;

        }


        currentUser =
            await esperarUsuario();


        if (!currentUser) {

            console.warn(
                "No hay usuario autenticado."
            );

            window.location.href =
                "../../login.html";

            return;

        }


        technicianData =
            await cargarTecnico();


        actualizarUsuario();


        await cargarTickets();

    }


    iniciar();

}

);
