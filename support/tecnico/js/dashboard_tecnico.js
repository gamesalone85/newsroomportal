/* =========================================================
   NEWSROOM PORTAL
   DASHBOARD TÉCNICO
   FIRESTORE
   =========================================================

   FUNCIONES:

   - Obtener usuario autenticado
   - Obtener datos del técnico
   - Obtener tickets desde Firestore
   - Identificar tickets asignados al técnico
   - Mostrar tickets atendidos
   - Mostrar tickets en proceso
   - Mostrar tickets pendientes
   - Mostrar tickets que requieren seguimiento
   - Gráfica de tickets por día
   - Gráfica de categorías
   - Resumen anual
   - Compatibilidad con diferentes estructuras
     históricas de tickets

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
                    "Newsroom Portal: Firebase no está cargado."
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
                    "Newsroom Portal: Firebase no está inicializado."
                );


                mostrarError(
                    "Firebase no está inicializado."
                );


                return false;

            }


            try {

                db =
                    firebase.firestore();


                console.log(
                    "Newsroom Portal: Firestore conectado correctamente."
                );


                return true;


            } catch (error) {


                console.error(
                    "Error inicializando Firestore:",
                    error
                );


                mostrarError(
                    "No fue posible conectar con Firestore."
                );


                return false;

            }

        }


        /* =====================================================
           ESPERAR USUARIO AUTH
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


                    let resuelto = false;


                    const unsubscribe =
                        firebase
                            .auth()
                            .onAuthStateChanged(
                                function (user) {


                                    if (
                                        resuelto
                                    ) {

                                        return;

                                    }


                                    resuelto = true;


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
                        .doc(
                            currentUser.uid
                        )
                        .get();


                if (
                    doc.exists
                ) {


                    tecnico = {

                        id: doc.id,

                        ...doc.data()

                    };


                    console.log(
                        "Datos del técnico encontrados en usuarios:",
                        tecnico
                    );


                } else {


                    console.warn(
                        "No existe documento en usuarios para:",
                        currentUser.uid
                    );


                }


            } catch (error) {


                console.warn(
                    "No se pudo obtener el usuario desde usuarios:",
                    error
                );


            }


            /* =================================================
               FALLBACK AUTH
            ================================================= */


            if (!tecnico) {


                tecnico = {


                    id:
                        currentUser.uid,


                    uid:
                        currentUser.uid,


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

                technicianData.nombreTecnico ||

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


            if (
                nombreElemento
            ) {

                nombreElemento.textContent =
                    nombre;

            }


            if (
                avatar
            ) {

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


            if (
                !ticket
            ) {

                return "";

            }


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
           EXTRAER VALOR DE ASIGNACIÓN
        ===================================================== */

        function extraerValor(
            valor
        ) {


            if (
                valor === null ||
                valor === undefined
            ) {

                return "";

            }


            /* ---------------------------------------------
               STRING
            --------------------------------------------- */


            if (
                typeof valor === "string"
            ) {

                return normalizar(
                    valor
                );

            }


            /* ---------------------------------------------
               NUMBER
            --------------------------------------------- */


            if (
                typeof valor === "number"
            ) {

                return normalizar(
                    valor
                );

            }


            /* ---------------------------------------------
               OBJETO
            --------------------------------------------- */


            if (
                typeof valor === "object"
            ) {


                return (

                    normalizar(
                        valor.uid
                    ) ||

                    normalizar(
                        valor.id
                    ) ||

                    normalizar(
                        valor.tecnico_id
                    ) ||

                    normalizar(
                        valor.tecnicoId
                    ) ||

                    normalizar(
                        valor.nombre
                    ) ||

                    normalizar(
                        valor.nombreCompleto
                    ) ||

                    normalizar(
                        valor.displayName
                    ) ||

                    normalizar(
                        valor.usuario
                    ) ||

                    normalizar(
                        valor.correo
                    ) ||

                    normalizar(
                        valor.email
                    ) ||

                    ""

                );

            }


            return "";

        }


        /* =====================================================
           CONVERTIR FECHA FIREBASE
        ===================================================== */

        function convertirFecha(
            valor
        ) {


            if (
                !valor
            ) {

                return null;

            }


            /* ---------------------------------------------
               FIRESTORE TIMESTAMP
            --------------------------------------------- */


            if (
                typeof valor.toDate ===
                "function"
            ) {

                try {

                    const fecha =
                        valor.toDate();


                    return isNaN(
                        fecha.getTime()
                    )
                        ? null
                        : fecha;


                } catch (error) {

                    return null;

                }

            }


            /* ---------------------------------------------
               DATE
            --------------------------------------------- */


            if (
                valor instanceof Date
            ) {

                return isNaN(
                    valor.getTime()
                )
                    ? null
                    : valor;

            }


            /* ---------------------------------------------
               FIRESTORE TIMESTAMP SERIALIZADO
            --------------------------------------------- */


            if (
                typeof valor === "object"
            ) {


                if (
                    typeof valor.seconds ===
                    "number"
                ) {

                    const fecha =
                        new Date(
                            valor.seconds *
                            1000
                        );


                    return isNaN(
                        fecha.getTime()
                    )
                        ? null
                        : fecha;

                }


                if (
                    typeof valor._seconds ===
                    "number"
                ) {

                    const fecha =
                        new Date(
                            valor._seconds *
                            1000
                        );


                    return isNaN(
                        fecha.getTime()
                    )
                        ? null
                        : fecha;

                }

            }


            /* ---------------------------------------------
               NUMBER
            --------------------------------------------- */


            if (
                typeof valor === "number"
            ) {


                const fecha =
                    new Date(
                        valor
                    );


                return isNaN(
                    fecha.getTime()
                )
                    ? null
                    : fecha;

            }


            /* ---------------------------------------------
               STRING
            --------------------------------------------- */


            if (
                typeof valor === "string"
            ) {


                const fecha =
                    new Date(
                        valor
                    );


                return isNaN(
                    fecha.getTime()
                )
                    ? null
                    : fecha;

            }


            return null;

        }


        /* =====================================================
           FECHA DEL TICKET
        ===================================================== */

        function obtenerFechaTicket(
            ticket
        ) {


            const valor =
                obtenerCampo(
                    ticket,
                    [

                        "fecha_creacion",

                        "fechaCreacion",

                        "fecha",

                        "createdAt",

                        "created_at",

                        "fechaRegistro",

                        "fecha_registro",

                        "timestamp",

                        "created"

                    ]
                );


            return convertirFecha(
                valor
            );

        }


        /* =====================================================
           IDENTIFICAR TÉCNICO
        ===================================================== */

        function ticketPerteneceTecnico(
            ticket
        ) {


            if (
                !technicianData ||
                !currentUser
            ) {


                console.warn(
                    "No hay información suficiente del técnico actual."
                );


                return false;

            }


            /* =================================================
               DATOS DEL TÉCNICO ACTUAL
            ================================================= */


            const uid =
                normalizar(
                    currentUser.uid
                );


            const email =
                normalizar(
                    currentUser.email
                );


            const tecnicoId =
                extraerValor(
                    obtenerCampo(
                        technicianData,
                        [

                            "uid",

                            "id",

                            "usuarioId",

                            "usuario_id",

                            "tecnicoId",

                            "tecnico_id"

                        ]
                    )
                );


            const tecnicoCorreo =
                extraerValor(
                    obtenerCampo(
                        technicianData,
                        [

                            "correo",

                            "email"

                        ]
                    )
                );


            const tecnicoNombre =
                extraerValor(
                    obtenerCampo(
                        technicianData,
                        [

                            "nombre",

                            "nombreCompleto",

                            "displayName",

                            "usuario",

                            "nombreTecnico",

                            "nombre_tecnico"

                        ]
                    )
                );


            /* =================================================
               ASIGNACIÓN DEL TICKET
            ================================================= */


            const asignadoId =
                extraerValor(
                    obtenerCampo(
                        ticket,
                        [

                            "tecnico_id",

                            "tecnicoId",

                            "usuarioTecnicoId",

                            "usuario_tecnico_id",

                            "usuarioTecnico",

                            "usuario_tecnico",

                            "asignadoId",

                            "asignado_id",

                            "assignedTo",

                            "assigned_to"

                        ]
                    )
                );


            const asignadoCorreo =
                extraerValor(
                    obtenerCampo(
                        ticket,
                        [

                            "tecnicoCorreo",

                            "tecnico_correo",

                            "tecnico_email",

                            "tecnicoEmail",

                            "asignadoCorreo",

                            "asignado_correo",

                            "assignedEmail",

                            "assigned_email"

                        ]
                    )
                );


            const asignadoNombre =
                extraerValor(
                    obtenerCampo(
                        ticket,
                        [

                            "tecnico",

                            "tecnico_nombre",

                            "tecnicoNombre",

                            "nombreTecnico",

                            "nombre_tecnico",

                            "asignado",

                            "asignadoA",

                            "asignado_a",

                            "assignedName",

                            "assigned_name"

                        ]
                    )
                );


            /* =================================================
               DEBUG
            ================================================= */


            console.log(
                "--------------------------------------------"
            );


            console.log(
                "Ticket:",
                ticket.folio ||
                ticket.numero ||
                ticket.id
            );


            console.log(
                "Técnico actual:",
                {

                    uid,

                    email,

                    tecnicoId,

                    tecnicoCorreo,

                    tecnicoNombre

                }
            );


            console.log(
                "Asignación del ticket:",
                {

                    asignadoId,

                    asignadoCorreo,

                    asignadoNombre

                }
            );


            /* =================================================
               COMPARAR UID
            ================================================= */


            if (
                uid &&
                asignadoId &&
                asignadoId === uid
            ) {


                console.log(
                    "✓ Ticket asignado por UID."
                );


                return true;

            }


            /* =================================================
               COMPARAR ID DEL TÉCNICO
            ================================================= */


            if (
                tecnicoId &&
                asignadoId &&
                asignadoId === tecnicoId
            ) {


                console.log(
                    "✓ Ticket asignado por ID del técnico."
                );


                return true;

            }


            /* =================================================
               COMPARAR CORREO
            ================================================= */


            if (
                email &&
                asignadoCorreo &&
                asignadoCorreo === email
            ) {


                console.log(
                    "✓ Ticket asignado por correo."
                );


                return true;

            }


            if (
                tecnicoCorreo &&
                asignadoCorreo &&
                asignadoCorreo === tecnicoCorreo
            ) {


                console.log(
                    "✓ Ticket asignado por correo del usuario."
                );


                return true;

            }


            /* =================================================
               COMPARAR NOMBRE
            ================================================= */


            if (
                tecnicoNombre &&
                asignadoNombre &&
                asignadoNombre === tecnicoNombre
            ) {


                console.log(
                    "✓ Ticket asignado por nombre."
                );


                return true;

            }


            /* =================================================
               CASO:
               EL CAMPO "tecnico" CONTIENE DIRECTAMENTE UID
            ================================================= */


            if (
                uid &&
                asignadoNombre === uid
            ) {


                console.log(
                    "✓ Ticket asignado directamente al UID."
                );


                return true;

            }


            /* =================================================
               CASO:
               TECNICO ES IGUAL AL CORREO
            ================================================= */


            if (
                email &&
                asignadoNombre === email
            ) {


                console.log(
                    "✓ Ticket asignado directamente al correo."
                );


                return true;

            }


            /* =================================================
               NO COINCIDE
            ================================================= */


            console.warn(
                "✗ Ticket NO pertenece al técnico actual."
            );


            return false;

        }


        /* =====================================================
           CARGAR TICKETS
        ===================================================== */

        async function cargarTickets() {


            try {


                console.log(
                    "============================================"
                );


                console.log(
                    "Consultando colección tickets..."
                );


                const snapshot =
                    await db
                        .collection("tickets")
                        .get();


                console.log(
                    "Tickets encontrados en Firestore:",
                    snapshot.size
                );


                tickets = [];


                snapshot.forEach(
                    function (doc) {


                        const data =
                            doc.data();


                        const ticket = {


                            id:
                                doc.id,


                            ...data


                        };


                        console.log(
                            "Ticket Firestore:",
                            ticket
                        );


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
                    "============================================"
                );


                console.log(
                    "TOTAL TICKETS FIRESTORE:",
                    snapshot.size
                );


                console.log(
                    "TOTAL TICKETS DEL TÉCNICO:",
                    tickets.length
                );


                console.log(
                    "TICKETS DEL TÉCNICO:",
                    tickets
                );


                console.log(
                    "============================================"
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

        function obtenerEstatus(
            ticket
        ) {


            return normalizar(
                obtenerCampo(
                    ticket,
                    [

                        "estatus",

                        "estado",

                        "status",

                        "estadoTicket",

                        "estado_ticket"

                    ]
                )
            );

        }


        /* =====================================================
           ESTADO CERRADO / RESUELTO
        ===================================================== */

        function esTicketAtendido(
            ticket
        ) {


            const estado =
                obtenerEstatus(
                    ticket
                );


            return (

                estado === "resuelto" ||

                estado === "cerrado" ||

                estado === "finalizado" ||

                estado === "completado"

            );

        }


        /* =====================================================
           ESTADO EN PROCESO
        ===================================================== */

        function esTicketEnProceso(
            ticket
        ) {


            const estado =
                obtenerEstatus(
                    ticket
                );


            return (

                estado === "en proceso" ||

                estado === "en_proceso" ||

                estado === "proceso" ||

                estado === "en-proceso" ||

                estado === "trabajando"

            );

        }


        /* =====================================================
           ESTADO PENDIENTE
        ===================================================== */

        function esTicketPendiente(
            ticket
        ) {


            const estado =
                obtenerEstatus(
                    ticket
                );


            return (

                estado === "pendiente" ||

                estado === "registrado" ||

                estado === "abierto" ||

                estado === "nuevo"

            );

        }


        /* =====================================================
           ACTUALIZAR KPIs
        ===================================================== */

        function actualizarKPIs() {


            const total =
                tickets.length;


            const atendidos =
                tickets.filter(
                    function (ticket) {

                        return esTicketAtendido(
                            ticket
                        );

                    }
                ).length;


            const proceso =
                tickets.filter(
                    function (ticket) {

                        return esTicketEnProceso(
                            ticket
                        );

                    }
                ).length;


            const pendientes =
                tickets.filter(
                    function (ticket) {

                        return esTicketPendiente(
                            ticket
                        );

                    }
                ).length;


            const alertados =
                obtenerTicketsAlertados()
                    .length;


            /* =================================================
               TICKETS ATENDIDOS
               
               Se consideran todos los tickets asignados
               al técnico para mantener compatibilidad con
               el significado original del KPI.
            ================================================= */


            const totalElemento =
                document.getElementById(
                    "totalTickets"
                );


            const procesoElemento =
                document.getElementById(
                    "ticketsProceso"
                );


            const pendientesElemento =
                document.getElementById(
                    "ticketsPendientes"
                );


            const alertadosElemento =
                document.getElementById(
                    "ticketsAlertados"
                );


            if (
                totalElemento
            ) {

                totalElemento.textContent =
                    total;

            }


            if (
                procesoElemento
            ) {

                procesoElemento.textContent =
                    proceso;

            }


            if (
                pendientesElemento
            ) {

                pendientesElemento.textContent =
                    pendientes;

            }


            if (
                alertadosElemento
            ) {

                alertadosElemento.textContent =
                    alertados;

            }


            console.log(
                "KPIs:",
                {

                    total,

                    atendidos,

                    proceso,

                    pendientes,

                    alertados

                }
            );

        }


        /* =====================================================
           GRÁFICA TICKETS POR DÍA
        ===================================================== */

        function generarGraficaDiaria() {


            const añoActual =
                new Date()
                    .getFullYear();


            const labels = [];

            const valores = [];


            const mapa = {};


            tickets.forEach(
                function (ticket) {


                    const fecha =
                        obtenerFechaTicket(
                            ticket
                        );


                    if (
                        !fecha
                    ) {

                        return;

                    }


                    if (
                        fecha.getFullYear() !==
                        añoActual
                    ) {

                        return;

                    }


                    const clave =
                        obtenerClaveFecha(
                            fecha
                        );


                    mapa[clave] =
                        (
                            mapa[clave] ||
                            0
                        ) + 1;


                }
            );


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
                    obtenerClaveFecha(
                        fecha
                    );


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
                    mapa[clave] ||
                    0
                );


            }


            const canvas =
                document.getElementById(
                    "ticketsDailyChart"
                );


            if (
                !canvas
            ) {

                return;

            }


            if (
                typeof Chart ===
                "undefined"
            ) {


                console.error(
                    "Chart.js no está disponible."
                );


                return;

            }


            if (
                dailyChart
            ) {

                dailyChart.destroy();

            }


            dailyChart =
                new Chart(
                    canvas,
                    {

                        type:
                            "line",


                        data:
                        {

                            labels:
                                labels,


                            datasets:
                            [

                                {

                                    label:
                                        "Tickets",


                                    data:
                                        valores,


                                    borderColor:
                                        "#c8102e",


                                    backgroundColor:
                                        "rgba(200,16,46,.10)",


                                    borderWidth:
                                        2,


                                    pointRadius:
                                        2,


                                    pointHoverRadius:
                                        5,


                                    fill:
                                        true,


                                    tension:
                                        .35

                                }

                            ]

                        },


                        options:
                        {

                            responsive:
                                true,


                            maintainAspectRatio:
                                false,


                            interaction:
                            {

                                intersect:
                                    false,


                                mode:
                                    "index"

                            },


                            plugins:
                            {

                                legend:
                                {

                                    display:
                                        false

                                }

                            },


                            scales:
                            {

                                x:
                                {

                                    grid:
                                    {

                                        display:
                                            false

                                    },


                                    ticks:
                                    {

                                        maxTicksLimit:
                                            12,


                                        font:
                                        {

                                            size:
                                                10

                                        }

                                    }

                                },


                                y:
                                {

                                    beginAtZero:
                                        true,


                                    ticks:
                                    {

                                        precision:
                                            0,


                                        font:
                                        {

                                            size:
                                                10

                                        }

                                    }

                                }

                            }

                        }

                    }
                );


        }


        /* =====================================================
           CLAVE DE FECHA
        ===================================================== */

        function obtenerClaveFecha(
            fecha
        ) {


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


            return (
                año +
                "-" +
                mes +
                "-" +
                dia
            );

        }


        /* =====================================================
           CATEGORÍA
        ===================================================== */

        function obtenerCategoria(
            ticket
        ) {


            return (

                obtenerCampo(
                    ticket,
                    [

                        "categoria",

                        "categoría",

                        "tipo",

                        "tipoReporte",

                        "tipo_reporte",

                        "categoriaTicket",

                        "categoria_ticket"

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
                        String(
                            obtenerCategoria(
                                ticket
                            )
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
                .slice(
                    0,
                    6
                );


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


            if (
                !canvas
            ) {

                return;

            }


            if (
                typeof Chart ===
                "undefined"
            ) {

                return;

            }


            if (
                categoriesChart
            ) {

                categoriesChart.destroy();

            }


            if (
                categorias.length ===
                0
            ) {


                categorias.push(
                    "Sin datos"
                );


                valores.push(
                    1
                );


            }


            categoriesChart =
                new Chart(
                    canvas,
                    {

                        type:
                            "doughnut",


                        data:
                        {

                            labels:
                                categorias,


                            datasets:
                            [

                                {

                                    data:
                                        valores,


                                    backgroundColor:
                                    [

                                        "#c8102e",

                                        "#54565a",

                                        "#00ae42",

                                        "#f59e0b",

                                        "#2563eb",

                                        "#7c3aed"

                                    ],


                                    borderWidth:
                                        3,


                                    borderColor:
                                        "#ffffff"

                                }

                            ]

                        },


                        options:
                        {

                            responsive:
                                true,


                            maintainAspectRatio:
                                false,


                            cutout:
                                "65%",


                            plugins:
                            {

                                legend:
                                {

                                    display:
                                        false

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
           LEYENDA CATEGORÍAS
        ===================================================== */

        function generarLeyendaCategorias(
            categorias,
            valores
        ) {


            const container =
                document.getElementById(
                    "categoryLegend"
                );


            if (
                !container
            ) {

                return;

            }


            const colores =
            [

                "#c8102e",

                "#54565a",

                "#00ae42",

                "#f59e0b",

                "#2563eb",

                "#7c3aed"

            ];


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
                                        ${colores[index] || "#54565a"};
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


            return tickets
                .filter(
                    function (ticket) {


                        const estado =
                            obtenerEstatus(
                                ticket
                            );


                        /* -------------------------------------
                           ESTADOS QUE NO REQUIEREN SEGUIMIENTO
                        ------------------------------------- */


                        if (
                            estado === "resuelto" ||
                            estado === "cerrado" ||
                            estado === "cancelado" ||
                            estado === "finalizado" ||
                            estado === "completado"
                        ) {

                            return false;

                        }


                        const fecha =
                            obtenerFechaTicket(
                                ticket
                            );


                        /* -------------------------------------
                           SIN FECHA
                        ------------------------------------- */


                        if (
                            !fecha
                        ) {

                            return true;

                        }


                        /* -------------------------------------
                           MÁS DE 48 HORAS
                        ------------------------------------- */


                        return (
                            fecha <=
                            limite
                        );


                    }
                )
                .sort(
                    function (a, b) {


                        const fechaA =
                            obtenerFechaTicket(
                                a
                            );


                        const fechaB =
                            obtenerFechaTicket(
                                b
                            );


                        if (
                            !fechaA &&
                            !fechaB
                        ) {

                            return 0;

                        }


                        if (
                            !fechaA
                        ) {

                            return 1;

                        }


                        if (
                            !fechaB
                        ) {

                            return -1;

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


            if (
                counter
            ) {

                counter.textContent =
                    alertas.length;

            }


            if (
                !container
            ) {

                return;

            }


            if (
                alertas.length ===
                0
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
                .slice(
                    0,
                    10
                )
                .forEach(
                    function (ticket) {


                        const folio =
                            obtenerCampo(
                                ticket,
                                [

                                    "folio",

                                    "numero",

                                    "ticket",

                                    "idTicket",

                                    "id_ticket"

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

                                    "problema",

                                    "detalle"

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


                        if (
                            fecha
                        ) {


                            fechaTexto =
                                fecha.toLocaleDateString(
                                    "es-MX",
                                    {

                                        day:
                                            "2-digit",

                                        month:
                                            "short",

                                        year:
                                            "numeric"

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


                        const prioridadNormalizada =
                            normalizar(
                                prioridad
                            );


                        const esCritico =
                            prioridadNormalizada ===
                                "crítica" ||

                            prioridadNormalizada ===
                                "critica" ||

                            prioridadNormalizada ===
                                "alta";


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
                                            String(
                                                folio
                                            )
                                        )}

                                    </div>


                                    <div class="alert-title">

                                        ${escapeHtml(
                                            String(
                                                titulo
                                            )
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
                alertas.length >
                10
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

                        Hay ${
                            alertas.length - 10
                        }
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


            if (
                !mensaje
            ) {

                return;

            }


            if (
                tickets.length ===
                0
            ) {


                mensaje.textContent =
                    "Todavía no tienes tickets registrados.";


                return;

            }


            const añoActual =
                new Date()
                    .getFullYear();


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


            const ticketsCerrados =
                tickets.filter(
                    function (ticket) {

                        return esTicketAtendido(
                            ticket
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
                `Has atendido ${ticketsCerrados} tickets cerrados o resueltos durante ${añoActual}, de ${ticketsEsteAño} tickets registrados este año, con un promedio de ${promedio.toFixed(1)} tickets por día.`;


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


            return (
                Math.floor(
                    diferencia /
                    (
                        1000 *
                        60 *
                        60 *
                        24
                    )
                ) + 1
            );

        }


        /* =====================================================
           ESCAPE HTML
        ===================================================== */

        function escapeHtml(
            valor
        ) {


            return String(
                valor
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


        /* =====================================================
           MOSTRAR ERROR
        ===================================================== */

        function mostrarError(
            mensaje
        ) {


            const container =
                document.getElementById(
                    "alertsContainer"
                );


            if (
                container
            ) {


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


            console.log(
                "Newsroom Portal: iniciando Dashboard Técnico..."
            );


            /* ---------------------------------------------
               FIREBASE
            --------------------------------------------- */


            if (
                !iniciarFirebase()
            ) {

                return;

            }


            /* ---------------------------------------------
               AUTH
            --------------------------------------------- */


            currentUser =
                await esperarUsuario();


            if (
                !currentUser
            ) {


                console.warn(
                    "No hay usuario autenticado."
                );


                window.location.href =
                    "../../login.html";


                return;

            }


            console.log(
                "Usuario autenticado:",
                {

                    uid:
                        currentUser.uid,

                    email:
                        currentUser.email

                }
            );


            /* ---------------------------------------------
               DATOS DEL TÉCNICO
            --------------------------------------------- */


            technicianData =
                await cargarTecnico();


            if (
                !technicianData
            ) {


                console.warn(
                    "No se pudieron obtener datos adicionales del técnico."
                );


            }


            console.log(
                "Técnico utilizado por el dashboard:",
                technicianData
            );


            /* ---------------------------------------------
               TOPBAR
            --------------------------------------------- */


            actualizarUsuario();


            /* ---------------------------------------------
               TICKETS
            --------------------------------------------- */


            await cargarTickets();


        }


        /* =====================================================
           ARRANCAR
        ===================================================== */

        iniciar();


    }

);
