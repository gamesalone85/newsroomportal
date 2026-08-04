/* =========================================================
   NEWSROOM PORTAL
   DASHBOARD TÉCNICO
   FIRESTORE
   =========================================================

   RELACIÓN DE TICKETS:

   1. UID DEL TÉCNICO
   2. ID DEL TÉCNICO
   3. CORREO DEL TÉCNICO
   4. NOMBRE DEL TÉCNICO
   5. ID DEL ROL / ÁREA
   6. NOMBRE DEL ROL / ÁREA

   IMPORTANTE:

   En Newsroom Portal los tickets actuales pueden estar
   asignados mediante:

       tecnico_id = 2
       tecnico    = "Support"

   mientras que el usuario autenticado puede tener:

       rol_id     = 2
       rol_nombre = "Soporte"

   Por ello el dashboard contempla ambas estructuras.

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
           NORMALIZAR TEXTO
        ===================================================== */

        function normalizar(
            valor
        ) {


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
            objeto,
            campos
        ) {


            if (
                !objeto
            ) {

                return "";

            }


            for (
                const campo of campos
            ) {


                if (
                    objeto[campo] !== undefined &&
                    objeto[campo] !== null &&
                    objeto[campo] !== ""
                ) {

                    return objeto[campo];

                }

            }


            return "";

        }


        /* =====================================================
           EXTRAER VALOR
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


            if (
                typeof valor === "string" ||
                typeof valor === "number"
            ) {

                return normalizar(
                    valor
                );

            }


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
                        valor.rol_id
                    ) ||

                    normalizar(
                        valor.rolId
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
           CARGAR DATOS DEL TÉCNICO
        ===================================================== */

        async function cargarTecnico() {


            if (
                !currentUser
            ) {

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

                        id:
                            doc.id,

                        ...doc.data()

                    };


                    console.log(
                        "Datos del técnico encontrados en usuarios:",
                        tecnico
                    );


                }


            } catch (error) {


                console.warn(
                    "No se pudo obtener el usuario:",
                    error
                );


            }


            /* =================================================
               FALLBACK AUTH
            ================================================= */


            if (
                !tecnico
            ) {


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
           NOMBRE DEL TÉCNICO
        ===================================================== */

        function obtenerNombreTecnico() {


            if (
                !technicianData
            ) {

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
           ACTUALIZAR USUARIO
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
           CONVERTIR FECHA
        ===================================================== */

        function convertirFecha(
            valor
        ) {


            if (
                !valor
            ) {

                return null;

            }


            if (
                typeof valor.toDate ===
                "function"
            ) {


                try {

                    return valor.toDate();

                } catch (error) {

                    return null;

                }

            }


            if (
                valor instanceof Date
            ) {

                return valor;

            }


            if (
                typeof valor === "object"
            ) {


                if (
                    typeof valor.seconds ===
                    "number"
                ) {


                    return new Date(
                        valor.seconds * 1000
                    );

                }


                if (
                    typeof valor._seconds ===
                    "number"
                ) {


                    return new Date(
                        valor._seconds * 1000
                    );

                }

            }


            if (
                typeof valor === "number"
            ) {

                return new Date(
                    valor
                );

            }


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

                        "fecha_actualizacion",

                        "timestamp"

                    ]
                );


            return convertirFecha(
                valor
            );

        }


        /* =====================================================
           OBTENER ID DEL ROL DEL TÉCNICO
        ===================================================== */

        function obtenerRolIdTecnico() {


            if (
                !technicianData
            ) {

                return "";

            }


            return extraerValor(
                obtenerCampo(
                    technicianData,
                    [

                        "rol_id",

                        "rolId",

                        "id_rol",

                        "idRol",

                        "role_id",

                        "roleId",

                        "rol"

                    ]
                )
            );

        }


        /* =====================================================
           OBTENER NOMBRE DEL ROL
        ===================================================== */

        function obtenerRolNombreTecnico() {


            if (
                !technicianData
            ) {

                return "";

            }


            return normalizar(
                obtenerCampo(
                    technicianData,
                    [

                        "rol_nombre",

                        "rolNombre",

                        "nombreRol",

                        "role_name",

                        "roleName",

                        "rol"

                    ]
                )
            );

        }


        /* =====================================================
           NORMALIZAR NOMBRE DE ÁREA / ROL
        ===================================================== */

        function normalizarArea(
            valor
        ) {


            const texto =
                normalizar(
                    valor
                );


            if (
                !texto
            ) {

                return "";

            }


            /* ---------------------------------------------
               SOPORTE
            --------------------------------------------- */


            if (
                texto === "support" ||
                texto === "soporte" ||
                texto === "technical support" ||
                texto === "soporte tecnico" ||
                texto === "soporte técnico"
            ) {

                return "soporte";

            }


            return texto;

        }


        /* =====================================================
           IDENTIFICAR TICKET DEL TÉCNICO
        ===================================================== */

        function ticketPerteneceTecnico(
            ticket
        ) {


            if (
                !currentUser ||
                !technicianData
            ) {

                return false;

            }


            /* =================================================
               DATOS DEL USUARIO
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

                            "usuario",

                            "nombreTecnico"

                        ]
                    )
                );


            /* =================================================
               DATOS DEL ROL
            ================================================= */


            const rolId =
                obtenerRolIdTecnico();


            const rolNombre =
                obtenerRolNombreTecnico();


            /* =================================================
               DATOS DEL TICKET
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

                            "asignadoId",

                            "asignado_id",

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
                normalizar(
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

                            "assignedName",

                            "assigned_name"

                        ]
                    )
            );


            /* =================================================
               NORMALIZAR ÁREAS
            ================================================= */


            const areaTicket =
                normalizarArea(
                    asignadoNombre
                );


            const areaTecnico =
                normalizarArea(
                    rolNombre
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
                ticket.id
            );


            console.log(
                "Técnico actual:",
                {

                    uid,

                    email,

                    tecnicoId,

                    tecnicoCorreo,

                    tecnicoNombre,

                    rolId,

                    rolNombre

                }
            );


            console.log(
                "Asignación del ticket:",
                {

                    asignadoId,

                    asignadoCorreo,

                    asignadoNombre,

                    areaTicket

                }
            );


            /* =================================================
               1. UID
            ================================================= */


            if (
                uid &&
                asignadoId &&
                asignadoId === uid
            ) {


                console.log(
                    "✓ MATCH: UID del técnico"
                );


                return true;

            }


            /* =================================================
               2. ID DEL TÉCNICO
            ================================================= */


            if (
                tecnicoId &&
                asignadoId &&
                asignadoId === tecnicoId
            ) {


                console.log(
                    "✓ MATCH: ID del técnico"
                );


                return true;

            }


            /* =================================================
               3. CORREO
            ================================================= */


            if (
                email &&
                asignadoCorreo &&
                email === asignadoCorreo
            ) {


                console.log(
                    "✓ MATCH: correo"
                );


                return true;

            }


            if (
                tecnicoCorreo &&
                asignadoCorreo &&
                tecnicoCorreo === asignadoCorreo
            ) {


                console.log(
                    "✓ MATCH: correo del usuario"
                );


                return true;

            }


            /* =================================================
               4. NOMBRE DEL TÉCNICO
            ================================================= */


            if (
                tecnicoNombre &&
                asignadoNombre &&
                tecnicoNombre === asignadoNombre
            ) {


                console.log(
                    "✓ MATCH: nombre del técnico"
                );


                return true;

            }


            /* =================================================
               5. NUEVO:
                  ID DEL ROL / ÁREA
            ================================================= */


            if (
                rolId &&
                asignadoId &&
                rolId === asignadoId
            ) {


                console.log(
                    "✓ MATCH: ID del rol/área",
                    {
                        rolId,
                        asignadoId
                    }
                );


                return true;

            }


            /* =================================================
               6. NUEVO:
                  NOMBRE DEL ROL / ÁREA
            ================================================= */


            if (
                areaTecnico &&
                areaTicket &&
                areaTecnico === areaTicket
            ) {


                console.log(
                    "✓ MATCH: nombre del rol/área",
                    {
                        areaTecnico,
                        areaTicket
                    }
                );


                return true;

            }


            /* =================================================
               7. TICKET CON UID EN TECNICO
            ================================================= */


            if (
                uid &&
                asignadoNombre === uid
            ) {


                console.log(
                    "✓ MATCH: UID dentro de tecnico"
                );


                return true;

            }


            /* =================================================
               8. TICKET CON CORREO EN TECNICO
            ================================================= */


            if (
                email &&
                asignadoNombre === email
            ) {


                console.log(
                    "✓ MATCH: correo dentro de tecnico"
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
           TICKET ATENDIDO
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
           EN PROCESO
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

                estado === "en-proceso" ||

                estado === "proceso" ||

                estado === "trabajando"

            );

        }


        /* =====================================================
           PENDIENTE
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

                    proceso,

                    pendientes,

                    alertados

                }
            );

        }


        /* =====================================================
           GRÁFICA DIARIA
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

                            day:
                                "2-digit",

                            month:
                                "short"

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
                !canvas ||
                typeof Chart === "undefined"
            ) {

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
           CLAVE FECHA
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

                        "categoria_id",

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


            let categorias =
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


            let valores =
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
                !canvas ||
                typeof Chart === "undefined"
            ) {

                return;

            }


            if (
                categoriesChart
            ) {

                categoriesChart.destroy();

            }


            if (
                categorias.length === 0
            ) {


                categorias = [
                    "Sin datos"
                ];


                valores = [
                    1
                ];

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


                        if (
                            !fecha
                        ) {

                            return true;

                        }


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
           ALERTAS
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


                        const fechaTexto =
                            fecha
                                ? fecha.toLocaleDateString(
                                    "es-MX",
                                    {

                                        day:
                                            "2-digit",

                                        month:
                                            "short",

                                        year:
                                            "numeric"

                                    }
                                )
                                : "Sin fecha";


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
                                "critica" ||

                            prioridadNormalizada ===
                                "crítica" ||

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
                tickets.length === 0
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
           ERROR
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
           INICIAR
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
               TÉCNICO
            --------------------------------------------- */


            technicianData =
                await cargarTecnico();


            console.log(
                "Técnico utilizado por el dashboard:",
                technicianData
            );


            console.log(
                "Rol ID detectado:",
                obtenerRolIdTecnico()
            );


            console.log(
                "Rol nombre detectado:",
                obtenerRolNombreTecnico()
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
