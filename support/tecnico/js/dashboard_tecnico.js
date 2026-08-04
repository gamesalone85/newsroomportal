/* =========================================================
   NEWSROOM PORTAL
   DASHBOARD TÉCNICO
   FIRESTORE
   =========================================================

   VERSIÓN CORREGIDA

   CORRECCIONES PRINCIPALES:

   1. Reconoce asignaciones por:
      - UID
      - correo
      - tecnicoId
      - tecnico_id
      - usuarioTecnicoId
      - asignadoId
      - assignedTo
      - nombre del técnico
      - nombre del rol técnico
      - "Support" / "Soporte"

   2. Los tickets cerrados y resueltos permanecen
      dentro del total de tickets atendidos.

   3. La gráfica diaria utiliza FECHA LOCAL y no UTC.

   4. Los tickets creados hoy se contabilizan correctamente.

   5. Compatible con Timestamp de Firestore.

========================================================= */


/* =========================================================
   DOM READY
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
                    "Error conectando Firestore:",
                    error
                );


                mostrarError(
                    "No fue posible conectar con Firestore."
                );


                return false;

            }

        }


        /* =====================================================
           ESPERAR USUARIO
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
                        firebase.auth()
                            .onAuthStateChanged(
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


            /*
             * Si no existe documento en usuarios,
             * utilizamos Authentication.
             */

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


                console.warn(
                    "No existe documento en usuarios. Se utilizan datos de Authentication."
                );

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
                .toLowerCase()
                .normalize("NFD")
                .replace(
                    /[\u0300-\u036f]/g,
                    ""
                );

        }


        /* =====================================================
           OBTENER CAMPO
        ===================================================== */

        function obtenerCampo(
            objeto,
            campos
        ) {

            if (!objeto) {

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
           CONVERTIR FECHA FIREBASE
        ===================================================== */

        function convertirFecha(valor) {

            if (!valor) {

                return null;

            }


            /*
             * Firebase Timestamp
             */

            if (
                typeof valor.toDate ===
                "function"
            ) {

                const fecha =
                    valor.toDate();


                return isNaN(
                    fecha.getTime()
                )
                    ? null
                    : fecha;

            }


            /*
             * Firestore Timestamp serializado
             */

            if (
                typeof valor === "object" &&
                valor.seconds !== undefined
            ) {

                const fecha =
                    new Date(
                        Number(valor.seconds) *
                        1000
                    );


                return isNaN(
                    fecha.getTime()
                )
                    ? null
                    : fecha;

            }


            /*
             * Date
             */

            if (
                valor instanceof Date
            ) {

                return isNaN(
                    valor.getTime()
                )
                    ? null
                    : valor;

            }


            /*
             * Número / Unix timestamp
             */

            if (
                typeof valor === "number"
            ) {

                let numero =
                    valor;


                /*
                 * Si viene en segundos,
                 * convertir a milisegundos.
                 */

                if (
                    numero < 100000000000
                ) {

                    numero *= 1000;

                }


                const fecha =
                    new Date(numero);


                return isNaN(
                    fecha.getTime()
                )
                    ? null
                    : fecha;

            }


            /*
             * String
             */

            if (
                typeof valor === "string"
            ) {

                const texto =
                    valor.trim();


                if (!texto) {

                    return null;

                }


                const fecha =
                    new Date(texto);


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

        function obtenerFechaTicket(ticket) {

            /*
             * IMPORTANTE:
             *
             * Se prioriza fecha de creación.
             * No se utiliza fecha_actualizacion para
             * la gráfica de tickets creados por día.
             */

            const valor =
                obtenerCampo(
                    ticket,
                    [

                        "fecha_creacion",

                        "fechaCreacion",

                        "fecha_creado",

                        "fechaCreado",

                        "createdAt",

                        "created_at",

                        "fecha",

                        "timestamp",

                        "fecha_registro",

                        "fechaRegistro"

                    ]
                );


            return convertirFecha(
                valor
            );

        }


        /* =====================================================
           FECHA DE ACTUALIZACIÓN
        ===================================================== */

        function obtenerFechaActualizacion(
            ticket
        ) {

            const valor =
                obtenerCampo(
                    ticket,
                    [

                        "fecha_actualizacion",

                        "fechaActualizacion",

                        "updatedAt",

                        "updated_at",

                        "ultima_actualizacion",

                        "ultimaActualizacion"

                    ]
                );


            return convertirFecha(
                valor
            );

        }


        /* =====================================================
           FECHA LOCAL YYYY-MM-DD
        =====================================================

           NO utilizar toISOString() aquí.

           toISOString() convierte a UTC y puede cambiar
           el día para usuarios en México.

        ===================================================== */

        function obtenerClaveFechaLocal(
            fecha
        ) {

            if (!fecha) {

                return "";

            }


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
           ESTATUS
        ===================================================== */

        function obtenerEstatus(ticket) {

            return normalizar(
                obtenerCampo(
                    ticket,
                    [

                        "estatus",

                        "estado",

                        "status",

                        "estado_ticket",

                        "estadoTicket"

                    ]
                )
            );

        }


        /* =====================================================
           IDENTIFICAR ESTADOS CERRADOS
        ===================================================== */

        function esTicketCerrado(
            ticket
        ) {

            const estado =
                obtenerEstatus(
                    ticket
                );


            return (

                estado === "cerrado" ||

                estado === "resuelto" ||

                estado === "solucionado" ||

                estado === "finalizado" ||

                estado === "completado" ||

                estado === "completado"

            );

        }


        /* =====================================================
           IDENTIFICAR TÉCNICO
        ===================================================== */

        function ticketPerteneceTecnico(
            ticket
        ) {

            if (
                !technicianData
            ) {

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


            /*
             * ===============================================
             * DATOS DEL TÉCNICO
             * ===============================================
             */

            const tecnicoId =
                normalizar(
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

                            "usuario"

                        ]
                    )
                );


            /*
             * ===============================================
             * ROL DEL TÉCNICO
             * ===============================================
             */

            const rol =
                normalizar(
                    obtenerCampo(
                        technicianData,
                        [

                            "rol",

                            "rol_nombre",

                            "rolNombre",

                            "role",

                            "roleName"

                        ]
                    )
                );


            /*
             * ===============================================
             * ASIGNACIÓN DEL TICKET
             * ===============================================
             */

            const asignadoId =
                normalizar(
                    obtenerCampo(
                        ticket,
                        [

                            "tecnicoId",

                            "tecnico_id",

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

                            "tecnico_email",

                            "tecnicoCorreoElectronico",

                            "asignadoCorreo",

                            "asignado_email",

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

                            "tecnicoNombre",

                            "tecnico_nombre",

                            "nombreTecnico",

                            "nombre_tecnico",

                            "asignadoA",

                            "asignado",

                            "assignedName",

                            "assigned_name"

                        ]
                    )
                );


            /*
             * ===============================================
             * LOG DE DIAGNÓSTICO
             * ===============================================
             */

            console.log(
                "--------------------------------------------"
            );


            console.log(
                "Ticket:",
                obtenerCampo(
                    ticket,
                    [
                        "folio",
                        "numero",
                        "ticket"
                    ]
                ) || ticket.id
            );


            console.log(
                "Técnico actual:",
                {

                    uid:
                        uid,

                    email:
                        email,

                    tecnicoId:
                        tecnicoId,

                    tecnicoCorreo:
                        tecnicoCorreo,

                    tecnicoNombre:
                        tecnicoNombre,

                    rol:
                        rol

                }
            );


            console.log(
                "Asignación del ticket:",
                {

                    asignadoId:
                        asignadoId,

                    asignadoCorreo:
                        asignadoCorreo,

                    asignadoNombre:
                        asignadoNombre

                }
            );


            /*
             * ===============================================
             * 1. UID
             * ===============================================
             */

            if (
                uid &&
                asignadoId === uid
            ) {

                console.log(
                    "✓ Ticket pertenece al técnico por UID."
                );

                return true;

            }


            /*
             * ===============================================
             * 2. CORREO
             * ===============================================
             */

            if (
                email &&
                asignadoCorreo === email
            ) {

                console.log(
                    "✓ Ticket pertenece al técnico por correo."
                );

                return true;

            }


            /*
             * ===============================================
             * 3. ID DEL USUARIO
             * ===============================================
             */

            if (
                tecnicoId &&
                asignadoId === tecnicoId
            ) {

                console.log(
                    "✓ Ticket pertenece al técnico por tecnicoId."
                );

                return true;

            }


            /*
             * ===============================================
             * 4. CORREO DEL DOCUMENTO USUARIOS
             * ===============================================
             */

            if (
                tecnicoCorreo &&
                asignadoCorreo === tecnicoCorreo
            ) {

                console.log(
                    "✓ Ticket pertenece al técnico por correo del documento."
                );

                return true;

            }


            /*
             * ===============================================
             * 5. NOMBRE
             * ===============================================
             */

            if (
                tecnicoNombre &&
                asignadoNombre === tecnicoNombre
            ) {

                console.log(
                    "✓ Ticket pertenece al técnico por nombre."
                );

                return true;

            }


            /*
             * ===============================================
             * 6. TECNICO = UID
             * ===============================================
             */

            if (
                asignadoNombre === uid
            ) {

                console.log(
                    "✓ Ticket pertenece al técnico: tecnico contiene UID."
                );

                return true;

            }


            /*
             * ===============================================
             * 7. SOPORTE / SUPPORT
             * ===============================================

             * En la estructura actual de Newsroom Portal
             * Firestore está guardando:
             *
             * tecnico: "Support"
             * tecnicoId: "2"
             *
             * Mientras el usuario tiene:
             *
             * rol_nombre: "Soporte"
             *
             * Por lo tanto se reconoce la equivalencia.
             */

            const esRolSoporte =
                (

                    rol === "soporte" ||

                    rol === "support" ||

                    rol === "tecnico" ||

                    rol === "technical support"

                );


            const ticketEsSoporte =
                (

                    asignadoNombre === "soporte" ||

                    asignadoNombre === "support" ||

                    asignadoNombre === "technical support"

                );


            if (
                esRolSoporte &&
                ticketEsSoporte
            ) {

                console.log(
                    "✓ Ticket pertenece al área de Soporte."
                );

                return true;

            }


            /*
             * ===============================================
             * 8. ID LEGACY DEL ÁREA DE SOPORTE
             * ===============================================
             *
             * En los tickets actuales aparece:
             *
             * tecnicoId: "2"
             *
             * y:
             *
             * tecnico: "Support"
             *
             * El usuario autenticado pertenece a Soporte.
             */

            if (
                esRolSoporte &&
                asignadoId === "2"
            ) {

                console.log(
                    "✓ Ticket pertenece a Soporte por ID legacy 2."
                );

                return true;

            }


            /*
             * ===============================================
             * NO PERTENECE
             * ===============================================
             */

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
           KPIs
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

                            estado === "en-proceso" ||

                            estado === "proceso" ||

                            estado === "trabajando"

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

                            estado === "abierto" ||

                            estado === "nuevo" ||

                            estado === "por atender"

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


            if (totalElemento) {

                totalElemento.textContent =
                    total;

            }


            if (procesoElemento) {

                procesoElemento.textContent =
                    proceso;

            }


            if (pendientesElemento) {

                pendientesElemento.textContent =
                    pendientes;

            }


            if (alertadosElemento) {

                alertadosElemento.textContent =
                    alertados;

            }


            console.log(
                "KPIs:",
                {

                    total:
                        total,

                    atendidos:
                        total,

                    proceso:
                        proceso,

                    pendientes:
                        pendientes,

                    alertados:
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


            /*
             * ===============================================
             * CONTAR TICKETS POR FECHA LOCAL
             * ===============================================
             */

            tickets.forEach(
                function (ticket) {

                    const fecha =
                        obtenerFechaTicket(
                            ticket
                        );


                    if (!fecha) {

                        console.warn(
                            "Ticket sin fecha de creación:",
                            ticket.id,
                            ticket
                        );

                        return;

                    }


                    const año =
                        fecha.getFullYear();


                    if (
                        año !== añoActual
                    ) {

                        return;

                    }


                    /*
                     * IMPORTANTE:
                     *
                     * Se utiliza fecha LOCAL.
                     *
                     * NO:
                     *
                     * fecha.toISOString()
                     */

                    const clave =
                        obtenerClaveFechaLocal(
                            fecha
                        );


                    mapa[clave] =
                        (
                            mapa[clave] || 0
                        ) + 1;

                }
            );


            /*
             * ===============================================
             * GENERAR DÍAS DESDE 1 DE ENERO
             * HASTA HOY
             * ===============================================
             */

            const inicio =
                new Date(
                    añoActual,
                    0,
                    1
                );


            const hoy =
                new Date();


            /*
             * Eliminar horas para evitar
             * problemas durante el recorrido.
             */

            hoy.setHours(
                23,
                59,
                59,
                999
            );


            for (
                let fecha =
                    new Date(
                        inicio
                    );

                fecha <= hoy;

                fecha.setDate(
                    fecha.getDate() + 1
                )

            ) {

                const clave =
                    obtenerClaveFechaLocal(
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
                    mapa[clave] || 0
                );

            }


            /*
             * ===============================================
             * DIAGNÓSTICO
             * ===============================================
             */

            console.log(
                "Datos gráfica diaria:",
                mapa
            );


            console.log(
                "Tickets registrados hoy:",
                mapa[
                    obtenerClaveFechaLocal(
                        new Date()
                    )
                ] || 0
            );


            const canvas =
                document.getElementById(
                    "ticketsDailyChart"
                );


            if (!canvas) {

                console.warn(
                    "No existe ticketsDailyChart."
                );

                return;

            }


            if (dailyChart) {

                dailyChart.destroy();

            }


            dailyChart =
                new Chart(
                    canvas,
                    {

                        type:
                            "line",


                        data: {

                            labels:
                                labels,


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


                                    borderWidth:
                                        2,


                                    pointRadius:
                                        3,


                                    pointHoverRadius:
                                        6,


                                    fill:
                                        true,


                                    tension:
                                        .35

                                }

                            ]

                        },


                        options: {

                            responsive:
                                true,


                            maintainAspectRatio:
                                false,


                            interaction: {

                                intersect:
                                    false,


                                mode:
                                    "index"

                            },


                            plugins: {

                                legend: {

                                    display:
                                        false

                                }

                            },


                            scales: {

                                x: {

                                    grid: {

                                        display:
                                            false

                                    },


                                    ticks: {

                                        maxTicksLimit:
                                            12,


                                        font: {

                                            size:
                                                10

                                        }

                                    }

                                },


                                y: {

                                    beginAtZero:
                                        true,


                                    ticks: {

                                        precision:
                                            0,


                                        font: {

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

                        "categoriaId",

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


                        data: {

                            labels:
                                categorias,


                            datasets: [

                                {

                                    data:
                                        valores,


                                    backgroundColor: [

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


                        options: {

                            responsive:
                                true,


                            maintainAspectRatio:
                                false,


                            cutout:
                                "65%",


                            plugins: {

                                legend: {

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


            if (!container) {

                return;

            }


            const colores = [

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
                                        ${colores[index] || "#999999"};
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


                        /*
                         * Cerrados / resueltos /
                         * completados no requieren
                         * seguimiento.
                         */

                        if (
                            estado === "resuelto" ||

                            estado === "cerrado" ||

                            estado === "cancelado" ||

                            estado === "solucionado" ||

                            estado === "finalizado" ||

                            estado === "completado"
                        ) {

                            return false;

                        }


                        /*
                         * Utilizamos primero
                         * fecha de creación.
                         */

                        const fecha =
                            obtenerFechaTicket(
                                ticket
                            );


                        /*
                         * Si no existe fecha de creación,
                         * usamos actualización.
                         */

                        const fechaSeguimiento =
                            fecha ||
                            obtenerFechaActualizacion(
                                ticket
                            );


                        if (
                            !fechaSeguimiento
                        ) {

                            return true;

                        }


                        return (
                            fechaSeguimiento <=
                            limite
                        );

                    }
                )
                .sort(
                    function (a, b) {

                        const fechaA =
                            obtenerFechaTicket(
                                a
                            ) ||
                            obtenerFechaActualizacion(
                                a
                            );


                        const fechaB =
                            obtenerFechaTicket(
                                b
                            ) ||
                            obtenerFechaActualizacion(
                                b
                            );


                        if (
                            !fechaA &&
                            !fechaB
                        ) {

                            return 0;

                        }


                        if (!fechaA) {

                            return 1;

                        }


                        if (!fechaB) {

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


            if (counter) {

                counter.textContent =
                    alertas.length;

            }


            if (!container) {

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
                            ) ||
                            obtenerFechaActualizacion(
                                ticket
                            );


                        let fechaTexto =
                            "Sin fecha";


                        if (fecha) {

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
                                "critica" ||

                            prioridadNormalizada ===
                                "alta" ||

                            prioridadNormalizada ===
                                "urgente" ||

                            prioridadNormalizada ===
                                "critico";


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

            const ahora =
                new Date();


            const inicio =
                new Date(
                    ahora.getFullYear(),
                    0,
                    1
                );


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


            if (!container) {

                return;

            }


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


        /* =====================================================
           INICIALIZACIÓN
        ===================================================== */

        async function iniciar() {

            console.log(
                "Newsroom Portal: iniciando Dashboard Técnico..."
            );


            /*
             * Firebase
             */

            if (
                !iniciarFirebase()
            ) {

                return;

            }


            /*
             * Usuario autenticado
             */

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


            console.log(
                "Usuario autenticado:",
                {

                    uid:
                        currentUser.uid,

                    email:
                        currentUser.email

                }
            );


            /*
             * Datos del técnico
             */

            technicianData =
                await cargarTecnico();


            console.log(
                "Técnico utilizado por el dashboard:",
                technicianData
            );


            /*
             * Actualizar interfaz
             */

            actualizarUsuario();


            /*
             * Cargar tickets
             */

            await cargarTickets();

        }


        /* =====================================================
           EJECUTAR
        ===================================================== */

        iniciar();

    }

);
