/* =========================================================
   NEWSROOM PORTAL
   TICKETS
   CREAR TICKET
   FIREBASE / FIRESTORE
========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =================================================
           VERIFICAR SESIÓN
        ================================================= */

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
           VERIFICAR FIREBASE
        ================================================= */

        if (
            typeof firebase ===
            "undefined"
        ) {

            console.error(
                "Newsroom Portal: Firebase SDK no disponible."
            );

            mostrarMensaje(
                "Firebase no está disponible.",
                "error"
            );

            return;

        }


        if (
            typeof newsroomDB ===
            "undefined"
        ) {

            console.error(
                "Newsroom Portal: Firestore no está disponible."
            );

            mostrarMensaje(
                "No fue posible conectar con Firebase.",
                "error"
            );

            return;

        }



        /* =================================================
           USUARIO
        ================================================= */

        actualizarUsuario(
            session
        );



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

async function crearTicket(
    event
) {

    event.preventDefault();


    /* =====================================================
       SESIÓN
    ===================================================== */

    const session =
        obtenerSesion();


    if (!session) {

        mostrarMensaje(
            "La sesión no es válida.",
            "error"
        );

        return;

    }



    /* =====================================================
       FIRESTORE
    ===================================================== */

    if (
        typeof newsroomDB ===
        "undefined"
    ) {

        mostrarMensaje(
            "Firestore no está disponible.",
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



        /* =================================================
           CATÁLOGOS
        ================================================= */

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
        ================================================= */

        const folio =
            generarFolio();



        /* =================================================
           IDENTIDAD DEL USUARIO
        ================================================= */

        const usuarioId =
            session.uid ||
            session.user_id ||
            session.id ||
            null;


        if (!usuarioId) {

            mostrarMensaje(
                "No fue posible identificar al usuario.",
                "error"
            );

            restaurarBoton();

            return;

        }



        /* =================================================
           OBJETO TICKET
        ================================================= */

        const ticket = {

            folio:
                folio,


            titulo:
                titulo,


            descripcion:
                descripcion,


            prioridad:
                prioridad ||
                "Media",


            usuario_id:
                usuarioId,


            usuario:
                session.usuario ||
                "",


            nombre_usuario:
                session.nombre ||
                "",


            correo_usuario:
                session.correo ||
                "",


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


            tecnico:
                null,


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
           GUARDAR EN FIRESTORE
        ================================================= */

        console.log(
            "Newsroom Portal: guardando ticket...",
            ticket
        );


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
            `Ticket ${folio} creado correctamente.`,
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
        ================================================= */

        setTimeout(
            () => {

                window.location.href =
                    "mis_reportes.html";

            },
            1200
        );


    } catch (error) {


        /* =================================================
           ERROR
        ================================================= */

        console.error(
            "Newsroom Portal: error creando ticket.",
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
                "Firebase rechazó la operación por permisos de Firestore.";

        }


        if (
            error &&
            error.code ===
            "unavailable"
        ) {

            mensaje =
                "Firebase no está disponible en este momento.";

        }


        mostrarMensaje(
            mensaje,
            "error"
        );


        restaurarBoton();

    }

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
