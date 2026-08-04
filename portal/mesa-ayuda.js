/* =========================================================
   NEWSROOM PORTAL
   MESA DE AYUDA PÚBLICA
   CREAR TICKET
   FIREBASE / FIRESTORE

   IMPORTANTE:

   Esta página NO requiere autenticación.

   El usuario público puede crear un ticket
   proporcionando sus datos de contacto.

========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    function () {


        console.log(
            "Newsroom Portal: Mesa de Ayuda pública iniciada."
        );


        /* =================================================
           VERIFICAR FIREBASE
        ================================================= */

        if (
            typeof firebase ===
            "undefined"
        ) {

            console.error(
                "Newsroom Portal: Firebase SDK no está disponible."
            );

            mostrarMensaje(
                "No fue posible cargar el servicio de soporte.",
                "error"
            );

            return;

        }


        /* =================================================
           VERIFICAR FIRESTORE
        ================================================= */

        if (
            typeof newsroomDB ===
            "undefined"
        ) {

            console.error(
                "Newsroom Portal: Firestore no está disponible."
            );

            mostrarMensaje(
                "No fue posible conectar con el servicio de soporte.",
                "error"
            );

            return;

        }


        /* =================================================
           IDENTIDAD PÚBLICA
        ================================================= */

        actualizarUsuarioPublico();


        /* =================================================
           CARGAR CATÁLOGOS
        ================================================= */

        cargarDivisiones();

        cargarAreas();

        cargarCategorias();


        /* =================================================
           FORMULARIO
        ================================================= */

        const formulario =
            document.getElementById(
                "ticketForm"
            );


        if (!formulario) {

            console.error(
                "Newsroom Portal: formulario ticketForm no encontrado."
            );

            return;

        }


        formulario.addEventListener(
            "submit",
            crearTicket
        );


    }
);



/* =========================================================
   ACTUALIZAR IDENTIDAD PÚBLICA
========================================================= */

function actualizarUsuarioPublico() {


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
            "Usuario";

    }


    if (userAvatar) {

        userAvatar.textContent =
            "U";

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


    if (
        typeof obtenerDivisiones !==
        "function"
    ) {

        console.error(
            "Newsroom Portal: obtenerDivisiones() no está disponible."
        );

        return;

    }


    const divisiones =
        obtenerDivisiones();


    divisiones.forEach(
        function (division) {


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


    if (
        typeof obtenerAreas !==
        "function"
    ) {

        console.error(
            "Newsroom Portal: obtenerAreas() no está disponible."
        );

        return;

    }


    const areas =
        obtenerAreas();


    areas.forEach(
        function (area) {


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


    if (
        typeof obtenerCategorias !==
        "function"
    ) {

        console.error(
            "Newsroom Portal: obtenerCategorias() no está disponible."
        );

        return;

    }


    const categorias =
        obtenerCategorias();


    categorias.forEach(
        function (categoria) {


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

async function crearTicket(
    event
) {


    event.preventDefault();


    console.log(
        "Newsroom Portal: iniciando creación de ticket público."
    );


    /* =====================================================
       VERIFICAR FIRESTORE
    ===================================================== */

    if (
        typeof newsroomDB ===
        "undefined"
    ) {

        mostrarMensaje(
            "El servicio de soporte no está disponible.",
            "error"
        );

        return;

    }


    /* =====================================================
       BOTÓN
    ===================================================== */

    const boton =
        document.getElementById(
            "crearTicketBtn"
        );


    if (boton) {

        boton.disabled =
            true;


        boton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Creando Ticket...';

    }


    try {


        /* =================================================
           DATOS DEL FORMULARIO
        ================================================= */

        const empleado =
            obtenerValor(
                "empleado"
            );


        const contacto =
            obtenerValor(
                "contacto"
            );


        const divisionId =
            obtenerValor(
                "division"
            );


        const areaId =
            obtenerValor(
                "area"
            );


        const categoriaId =
            obtenerValor(
                "categoria"
            );


        const equipo =
            obtenerValor(
                "equipo"
            );


        const titulo =
            obtenerValor(
                "titulo"
            );


        const descripcion =
            obtenerValor(
                "descripcion"
            );


        const prioridad =
            obtenerValor(
                "prioridad"
            ) ||
            "Media";


        /* =================================================
           VALIDACIONES
        ================================================= */

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

            restaurarBoton();

            return;

        }


        if (
            empleado.length >
            120
        ) {

            mostrarMensaje(
                "El nombre del empleado es demasiado largo.",
                "error"
            );

            restaurarBoton();

            return;

        }


        if (
            contacto.length >
            150
        ) {

            mostrarMensaje(
                "El contacto es demasiado largo.",
                "error"
            );

            restaurarBoton();

            return;

        }


        if (
            titulo.length >
            200
        ) {

            mostrarMensaje(
                "El título es demasiado largo.",
                "error"
            );

            restaurarBoton();

            return;

        }


        if (
            descripcion.length >
            3000
        ) {

            mostrarMensaje(
                "La descripción es demasiado larga.",
                "error"
            );

            restaurarBoton();

            return;

        }


        /* =================================================
           VALIDAR PRIORIDAD
        ================================================= */

        const prioridadesPermitidas = [

            "Baja",
            "Media",
            "Alta",
            "Crítica"

        ];


        if (
            !prioridadesPermitidas.includes(
                prioridad
            )
        ) {

            mostrarMensaje(
                "La prioridad seleccionada no es válida.",
                "error"
            );

            restaurarBoton();

            return;

        }


        /* =================================================
           CATÁLOGOS
        ================================================= */

        const divisiones =
            obtenerDivisiones();


        const areas =
            obtenerAreas();


        const categorias =
            obtenerCategorias();


        const division =
            divisiones.find(
                function (item) {

                    return String(
                        item.id
                    ) === String(
                        divisionId
                    );

                }
            );


        const area =
            areas.find(
                function (item) {

                    return String(
                        item.id
                    ) === String(
                        areaId
                    );

                }
            );


        const categoria =
            categorias.find(
                function (item) {

                    return String(
                        item.id
                    ) === String(
                        categoriaId
                    );

                }
            );


        /* =================================================
           VALIDAR DIVISIÓN
        ================================================= */

        if (!division) {

            mostrarMensaje(
                "La división seleccionada no es válida.",
                "error"
            );

            restaurarBoton();

            return;

        }


        /* =================================================
           VALIDAR ÁREA
        ================================================= */

        if (!area) {

            mostrarMensaje(
                "El área seleccionada no es válida.",
                "error"
            );

            restaurarBoton();

            return;

        }


        /* =================================================
           VALIDAR CATEGORÍA
        ================================================= */

        if (!categoria) {

            mostrarMensaje(
                "La categoría seleccionada no es válida.",
                "error"
            );

            restaurarBoton();

            return;

        }


        /* =================================================
           GENERAR FOLIO
        ================================================= */

        const folio =
            generarFolio();


        /* =================================================
           OBJETO TICKET PÚBLICO
        ================================================= */

        const ticket = {

            /* =============================================
               IDENTIFICACIÓN
            ============================================= */

            folio:
                folio,


            origen:
                "mesa_ayuda_publica",


            /* =============================================
               SOLICITANTE
            ============================================= */

            solicitante_nombre:
                empleado,


            solicitante_contacto:
                contacto,


            /* =============================================
               DATOS DEL TICKET
            ============================================= */

            titulo:
                titulo,


            descripcion:
                descripcion,


            prioridad:
                prioridad,


            equipo:
                equipo,


            /* =============================================
               DIVISIÓN
            ============================================= */

            division_id:
                divisionId,


            division:
                division.nombre,


            /* =============================================
               ÁREA
            ============================================= */

            area_id:
                areaId,


            area:
                area.nombre,


            /* =============================================
               CATEGORÍA
            ============================================= */

            categoria_id:
                categoriaId,


            categoria:
                categoria.nombre,


            /* =============================================
               ESTATUS
            ============================================= */

            estatus:
                "Registrado",


            tecnico:
                null,


            /* =============================================
               FECHAS
            ============================================= */

            fecha_creacion:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp(),


            fecha_actualizacion:
                firebase.firestore
                    .FieldValue
                    .serverTimestamp()

        };


        /* =================================================
           LOG
        ================================================= */

        console.log(
            "Newsroom Portal: ticket público preparado.",
            ticket
        );


        /* =================================================
           GUARDAR EN FIRESTORE
        ================================================= */

        const referencia =
            await newsroomDB
                .collection(
                    "tickets"
                )
                .add(
                    ticket
                );


        /* =================================================
           ÉXITO
        ================================================= */

        console.log(
            "Newsroom Portal: ticket creado correctamente.",
            referencia.id
        );


        mostrarMensaje(
            `Ticket ${folio} creado correctamente. Guarda este folio para futuras consultas.`,
            "success"
        );


        /* =================================================
           LIMPIAR FORMULARIO
        ================================================= */

        const formulario =
            document.getElementById(
                "ticketForm"
            );


        if (formulario) {

            formulario.reset();

        }


        /* =================================================
           REDIRECCIÓN

           Dejamos un pequeño tiempo para que el usuario
           pueda ver el folio generado.

        ================================================= */

        setTimeout(
            function () {

                restaurarBoton();

            },
            3000
        );


    }
    catch (error) {


        /* =================================================
           ERROR
        ================================================= */

        console.error(
            "Newsroom Portal: error creando ticket público.",
            error
        );


        let mensaje =
            "No fue posible crear el ticket.";


        if (
            error &&
            error.code ===
            "permission-denied"
        ) {

            mensaje =
                "Firebase rechazó la solicitud. Revisa las reglas de Firestore.";

        }


        if (
            error &&
            error.code ===
            "unavailable"
        ) {

            mensaje =
                "El servicio de soporte no está disponible temporalmente.";

        }


        if (
            error &&
            error.code ===
            "failed-precondition"
        ) {

            mensaje =
                "La configuración de Firebase requiere atención.";

        }


        mostrarMensaje(
            mensaje,
            "error"
        );


        restaurarBoton();

    }

}



/* =========================================================
   OBTENER VALOR
========================================================= */

function obtenerValor(
    id
) {


    const elemento =
        document.getElementById(
            id
        );


    if (!elemento) {

        return "";

    }


    return String(
        elemento.value ||
        ""
    )
        .trim();

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


    const hora =
        String(
            fecha.getHours()
        )
        .padStart(
            2,
            "0"
        );


    const minutos =
        String(
            fecha.getMinutes()
        )
        .padStart(
            2,
            "0"
        );


    const segundos =
        String(
            fecha.getSeconds()
        )
        .padStart(
            2,
            "0"
        );


    const numero =
        Math.floor(
            100 +
            Math.random() *
            900
        );


    return (
        `TK-${year}${month}${day}-` +
        `${hora}${minutos}${segundos}-` +
        `${numero}`
    );

}



/* =========================================================
   RESTAURAR BOTÓN
========================================================= */

function restaurarBoton() {


    const boton =
        document.getElementById(
            "crearTicketBtn"
        );


    if (!boton) {

        return;

    }


    boton.disabled =
        false;


    boton.innerHTML =
        '<i class="fa-solid fa-ticket"></i> Crear Ticket';

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

    }
    else {

        elemento.className =
            "error-message full-width";

    }


    elemento.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}
