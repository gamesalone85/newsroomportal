/* =========================================================
   NEWSROOM PORTAL
   TICKETS
   CREAR TICKET
   ========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =================================================
           VERIFICAR SESIÓN
        ================================================== */

        if (
            typeof verificarSesion !==
            "function"
        ) {

            console.error(
                "Newsroom Portal: auth.js no disponible."
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
            obtenerSesion();


        if (!session) {
            return;
        }



        /* =================================================
           USUARIO
        ================================================== */

        actualizarUsuario(
            session
        );



        /* =================================================
           CARGAR CATÁLOGOS
        ================================================== */

        cargarDivisiones();

        cargarAreas();

        cargarCategorias();



        /* =================================================
           FORMULARIO
        ================================================== */

        const formulario =
            document.getElementById(
                "ticketForm"
            );


        if (formulario) {

            formulario.addEventListener(
                "submit",
                crearTicket
            );

        }

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
        "Usuario";


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
   CARGAR DIVISIONES
========================================================= */

function cargarDivisiones() {

    const select =
        document.getElementById(
            "division"
        );


    if (!select) {
        return;
    }


    const divisiones =
        typeof obtenerDivisiones ===
        "function"

            ? obtenerDivisiones()

            : [];


    divisiones.forEach(
        division => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                division.id;


            option.textContent =
                division.nombre;


            select.appendChild(
                option
            );

        }
    );

}



/* =========================================================
   CARGAR ÁREAS
========================================================= */

function cargarAreas() {

    const select =
        document.getElementById(
            "area"
        );


    if (!select) {
        return;
    }


    const areas =
        typeof obtenerAreas ===
        "function"

            ? obtenerAreas()

            : [];


    areas.forEach(
        area => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                area.id;


            option.textContent =
                area.nombre;


            select.appendChild(
                option
            );

        }
    );

}



/* =========================================================
   CARGAR CATEGORÍAS
========================================================= */

function cargarCategorias() {

    const select =
        document.getElementById(
            "categoria"
        );


    if (!select) {
        return;
    }


    const categorias =
        typeof obtenerCategorias ===
        "function"

            ? obtenerCategorias()

            : [];


    categorias.forEach(
        categoria => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                categoria.id;


            option.textContent =
                categoria.nombre;


            select.appendChild(
                option
            );

        }
    );

}



/* =========================================================
   CREAR TICKET
========================================================= */

function crearTicket(
    event
) {

    event.preventDefault();



    /* =================================================
       SESIÓN
    ================================================== */

    const session =
        obtenerSesion();


    if (!session) {

        mostrarMensaje(
            "La sesión no es válida.",
            "error"
        );

        return;

    }



    /* =================================================
       DATOS DEL FORMULARIO
    ================================================== */

    const empleado =
        document
            .getElementById(
                "empleado"
            )
            .value
            .trim();


    const contacto =
        document
            .getElementById(
                "contacto"
            )
            .value
            .trim();


    const divisionId =
        Number(
            document
                .getElementById(
                    "division"
                )
                .value
        );


    const areaId =
        Number(
            document
                .getElementById(
                    "area"
                )
                .value
        );


    const categoriaId =
        Number(
            document
                .getElementById(
                    "categoria"
                )
                .value
        );


    const equipo =
        document
            .getElementById(
                "equipo"
            )
            .value
            .trim();


    const titulo =
        document
            .getElementById(
                "titulo"
            )
            .value
            .trim();


    const descripcion =
        document
            .getElementById(
                "descripcion"
            )
            .value
            .trim();


    const prioridad =
        document
            .getElementById(
                "prioridad"
            )
            .value;



    /* =================================================
       VALIDACIONES
    ================================================== */

    if (
        !empleado ||
        !contacto ||
        !divisionId ||
        !areaId ||
        !categoriaId ||
        !titulo ||
        !descripcion
    ) {

        mostrarMensaje(
            "Por favor completa todos los campos obligatorios.",
            "error"
        );

        return;

    }



    /* =================================================
       CATÁLOGOS
    ================================================== */

    const division =
        obtenerDivisiones()
            .find(
                item =>
                    Number(item.id) ===
                    divisionId
            );


    const area =
        obtenerAreas()
            .find(
                item =>
                    Number(item.id) ===
                    areaId
            );


    const categoria =
        obtenerCategorias()
            .find(
                item =>
                    Number(item.id) ===
                    categoriaId
            );



    /* =================================================
       GENERAR FOLIO
    ================================================== */

    const folio =
        generarFolio();



    /* =================================================
       OBJETO TICKET
    ================================================== */

    const ticket = {

        id:
            generarIdTicket(),

        folio:

            folio,

        titulo:

            titulo,

        descripcion:

            descripcion,

        prioridad:

            prioridad,

        usuario_id:

            session.id ||
            session.user_id,

        usuario:

            session.usuario,

        nombre_usuario:

            session.nombre,

        empleado:

            empleado,

        contacto:

            contacto,

        equipo:

            equipo,

        division_id:

            divisionId,

        division:

            division
                ? division.nombre
                : "",

        area_id:

            areaId,

        area:

            area
                ? area.nombre
                : "",

        categoria_id:

            categoriaId,

        categoria:

            categoria
                ? categoria.nombre
                : "",

        estatus:

            "Registrado",

        fecha_creacion:

            new Date()
                .toISOString(),

        tecnico:

            null

    };



    /* =================================================
       CAPA DE DATOS
    ==================================================

       IMPORTANTE:

       Actualmente no existe MySQL.

       Este punto es donde posteriormente
       conectaremos:

       Firebase
       Supabase
       API
       Base de datos propia

    ================================================== */


    guardarTicketTemporal(
        ticket
    );



    /* =================================================
       ÉXITO
    ================================================== */

    mostrarMensaje(
        `Ticket ${folio} creado correctamente.`,
        "success"
    );



    /* =================================================
       REDIRECCIÓN
    ================================================== */

    setTimeout(
        () => {

            window.location.href =
                "mis_reportes.html";

        },
        1200
    );

}



/* =========================================================
   GENERAR FOLIO
========================================================= */

function generarFolio() {

    const fecha =
        new Date();


    const year =
        fecha.getFullYear();


    const month =
        String(
            fecha.getMonth() + 1
        )
        .padStart(
            2,
            "0"
        );


    const day =
        String(
            fecha.getDate()
        )
        .padStart(
            2,
            "0"
        );


    const numero =
        Math.floor(
            1000 +
            Math.random() *
            9000
        );


    return `TK-${year}${month}${day}-${numero}`;

}



/* =========================================================
   GENERAR ID
========================================================= */

function generarIdTicket() {

    if (
        typeof NEWSROOM_TICKETS !==
        "undefined"
        &&
        NEWSROOM_TICKETS.length
    ) {

        return Math.max(
            ...NEWSROOM_TICKETS.map(
                ticket =>
                    Number(
                        ticket.id
                    )
            )
        ) + 1;

    }


    return 1;

}



/* =========================================================
   GUARDAR TICKET TEMPORAL
========================================================= */


    /*
     * =====================================================
     * CAPA TEMPORAL DE DATOS
     * =====================================================
     *
     * Actualmente los tickets viven
     * únicamente en memoria.
     *
     * Posteriormente sustituiremos
     * esta función por:
     *
     * Firebase
     * Supabase
     * API REST
     * Base de datos
     *
     * =====================================================
     */

   function guardarTicketTemporal(ticket) {

    const ticketsGuardados =
        JSON.parse(
            localStorage.getItem(
                "newsroomTickets"
            )
        ) || [];


    ticketsGuardados.push(
        ticket
    );


    localStorage.setItem(
        "newsroomTickets",
        JSON.stringify(
            ticketsGuardados
        )
    );

}
   
/* =========================================================
   MENSAJES
========================================================= */

function mostrarMensaje(
    mensaje,
    tipo
) {

    const elemento =
        document.getElementById(
            "ticketMessage"
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        mensaje;


    elemento.style.display =
        "block";


    if (
        tipo ===
        "success"
    ) {

        elemento.className =
            "success-message full-width";

    } else {

        elemento.className =
            "error-message full-width";

    }

}

