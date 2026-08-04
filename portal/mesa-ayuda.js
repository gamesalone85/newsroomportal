/* =========================================================
   NEWSROOM PORTAL
   MESA DE AYUDA PÚBLICA
   FIREBASE / FIRESTORE

   IMPORTANTE:

   Este módulo NO utiliza:

       auth.js
       verificarSesion()
       obtenerSesion()
       data.js
       sidebar.js

   Es un portal independiente para usuarios libres.

   Se comunica con la plataforma interna únicamente
   mediante la colección:

       tickets
========================================================= */


document.addEventListener(
    "DOMContentLoaded",
    iniciarMesaAyuda
);


/* =========================================================
   VARIABLES
========================================================= */

let pasoActual = 1;


/* =========================================================
   CATÁLOGOS
========================================================= */

const DIVISIONES = [

    {
        id: "DNI",
        nombre: "DNI"
    },

    {
        id: "DUCTER",
        nombre: "DUCTER"
    },

    {
        id: "FSN",
        nombre: "FSN"
    }

];


const AREAS = [

    ["CONT", "Contabilidad"],
    ["TES", "Tesorería"],
    ["SIST", "Sistemas"],
    ["ACT", "Activo Fijo"],
    ["ARCH", "Archivo"],
    ["COMP", "Compras"],
    ["CXP", "Cuentas por Pagar"],
    ["CXC", "Cuentas por Cobrar"],
    ["REG", "Regulación"],
    ["DIR", "Dirección"],
    ["RH", "Recursos Humanos"],
    ["JUR", "Jurídico"],
    ["ADM", "Administración"],
    ["FIN", "Finanzas"],
    ["AUD", "Auditoría"],
    ["CONTR", "Contraloría"],
    ["OPER", "Operaciones"],
    ["LOG", "Logística"],
    ["ALM", "Almacén"],
    ["MANT", "Mantenimiento"],
    ["CAL", "Calidad"],
    ["PROY", "Proyectos"],
    ["PLANE", "Planeación"],
    ["PROC", "Procesos"],
    ["CUM", "Cumplimiento"],
    ["SEG", "Seguridad"],
    ["COMEX", "Comercio Exterior"],
    ["IMP", "Impuestos"],
    ["NOM", "Nómina"],
    ["CAP", "Capacitación"],
    ["DES", "Desarrollo Organizacional"],
    ["RECEP", "Recepción"],
    ["ATC", "Atención a Clientes"],
    ["DOC", "Documentación"],
    ["INFRA", "Infraestructura"],
    ["DAT", "Datos / BI"],
    ["SOP", "Soporte"],
    ["PRES", "Presupuesto"],
    ["RIES", "Riesgos"],
    ["CONTROL", "Control Interno"],
    ["COMERCIAL", "Comercial / Ventas"],
    ["MKT", "Marketing"]

];


const CATEGORIAS = [

    ["HARDWARE", "Hardware"],
    ["SOFTWARE", "Software"],
    ["RED", "Red / Conectividad"],
    ["IMPRESORAS", "Impresoras"],
    ["CORREO", "Correo Electrónico"],
    ["ACCESOS", "Accesos y Permisos"],
    ["CUENTAS", "Cuentas de Usuario"],
    ["INTERNET", "Internet"],
    ["TELEFONIA", "Telefonía"],
    ["SERVIDORES", "Servidores"],
    ["SISTEMAS", "Sistemas / Aplicaciones"],
    ["SEGURIDAD", "Seguridad Informática"],
    ["BACKUP", "Respaldos"],
    ["DATOS", "Datos / Información"],
    ["PERIFERICOS", "Periféricos"],
    ["EQUIPOS", "Equipos de Cómputo"],
    ["MANTENIMIENTO", "Mantenimiento"],
    ["INSTALACION", "Instalación / Configuración"],
    ["ACTUALIZACION", "Actualización"],
    ["SOLICITUD", "Solicitud de Servicio"],
    ["OTRO", "Otro"]

];


/* =========================================================
   INICIO
========================================================= */

function iniciarMesaAyuda() {

    console.log(
        "Newsroom Portal: Mesa de Ayuda pública iniciada."
    );


    /* =====================================================
       VERIFICAR FIREBASE
    ===================================================== */

    if (
        typeof firebase ===
        "undefined"
    ) {

        mostrarMensaje(
            "No fue posible cargar Firebase.",
            "error"
        );

        return;

    }


    if (
        typeof newsroomDB ===
        "undefined"
    ) {

        mostrarMensaje(
            "No fue posible conectar con Firebase.",
            "error"
        );

        return;

    }


    /* =====================================================
       CARGAR CATÁLOGOS
    ===================================================== */

    cargarDivisiones();

    cargarAreas();

    cargarCategorias();


    /* =====================================================
       NAVEGACIÓN
    ===================================================== */

    document
        .querySelectorAll(
            ".next-btn"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    avanzarPaso
                );

            }
        );


    document
        .querySelectorAll(
            ".prev-btn"
        )
        .forEach(
            boton => {

                boton.addEventListener(
                    "click",
                    retrocederPaso
                );

            }
        );


    /* =====================================================
       FORMULARIO
    ===================================================== */

    const formulario =
        document.getElementById(
            "ticketForm"
        );


    if (formulario) {

        formulario.addEventListener(
            "submit",
            crearTicketPublico
        );

    }


    /* =====================================================
       NUEVO TICKET
    ===================================================== */

    const nuevoTicket =
        document.getElementById(
            "nuevoTicketBtn"
        );


    if (nuevoTicket) {

        nuevoTicket.addEventListener(
            "click",
            reiniciarFormulario
        );

    }


    actualizarProgreso();

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


    DIVISIONES.forEach(
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


    AREAS.forEach(
        area => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                area[0];


            option.textContent =
                area[1];


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


    CATEGORIAS.forEach(
        categoria => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                categoria[0];


            option.textContent =
                categoria[1];


            select.appendChild(
                option
            );

        }
    );

}


/* =========================================================
   AVANZAR PASO
========================================================= */

function avanzarPaso() {

    if (
        !validarPaso(
            pasoActual
        )
    ) {

        return;

    }


    if (
        pasoActual < 3
    ) {

        pasoActual++;

        mostrarPaso();

    }

}


/* =========================================================
   RETROCEDER
========================================================= */

function retrocederPaso() {

    if (
        pasoActual > 1
    ) {

        pasoActual--;

        mostrarPaso();

    }

}


/* =========================================================
   MOSTRAR PASO
========================================================= */

function mostrarPaso() {

    document
        .querySelectorAll(
            ".form-step"
        )
        .forEach(
            step => {

                const numero =
                    Number(
                        step.dataset.step
                    );


                step.classList.toggle(
                    "active",
                    numero === pasoActual
                );

            }
        );


    document
        .querySelectorAll(
            ".step"
        )
        .forEach(
            step => {

                const numero =
                    Number(
                        step.dataset.step
                    );


                step.classList.toggle(
                    "active",
                    numero <= pasoActual
                );

            }
        );


    actualizarProgreso();


    ocultarMensaje();

}


/* =========================================================
   PROGRESO
========================================================= */

function actualizarProgreso() {

    const progreso =
        document.getElementById(
            "progressFill"
        );


    if (!progreso) {

        return;

    }


    progreso.style.width =
        `${(
            pasoActual / 3
        ) * 100}%`;

}


/* =========================================================
   VALIDAR PASO
========================================================= */

function validarPaso(
    paso
) {

    let valido = true;


    if (
        paso === 1
    ) {

        const empleado =
            obtenerValor(
                "empleado"
            );


        const contacto =
            obtenerValor(
                "contacto"
            );


        const division =
            obtenerValor(
                "division"
            );


        if (!empleado) {

            marcarError(
                "empleado",
                "Ingresa tu nombre completo."
            );

            valido = false;

        }


        if (
            contacto &&
            !validarCorreo(contacto)
        ) {

            marcarError(
                "contacto",
                "Ingresa un correo válido."
            );

            valido = false;

        }
        else if (!contacto) {

            marcarError(
                "contacto",
                "Ingresa tu correo corporativo."
            );

            valido = false;

        }


        if (!division) {

            marcarError(
                "division",
                "Selecciona una división."
            );

            valido = false;

        }

    }



    if (
        paso === 2
    ) {

        const area =
            obtenerValor(
                "area"
            );


        const categoria =
            obtenerValor(
                "categoria"
            );


        const impacto =
            obtenerValor(
                "impacto"
            );


        const equipo =
            obtenerValor(
                "equipo"
            );


        if (!area) {

            marcarError(
                "area",
                "Selecciona un área."
            );

            valido = false;

        }


        if (!categoria) {

            marcarError(
                "categoria",
                "Selecciona una categoría."
            );

            valido = false;

        }


        if (!impacto) {

            marcarError(
                "impacto",
                "Selecciona el impacto."
            );

            valido = false;

        }


        if (!equipo) {

            marcarError(
                "equipo",
                "Indica el equipo afectado."
            );

            valido = false;

        }

    }



    if (
        paso === 3
    ) {

        const titulo =
            obtenerValor(
                "titulo"
            );


        const descripcion =
            obtenerValor(
                "descripcion"
            );


        if (!titulo) {

            marcarError(
                "titulo",
                "Ingresa un resumen del problema."
            );

            valido = false;

        }


        if (!descripcion) {

            marcarError(
                "descripcion",
                "Describe detalladamente el problema."
            );

            valido = false;

        }

    }


    return valido;

}


/* =========================================================
   CREAR TICKET
========================================================= */

async function crearTicketPublico(
    event
) {

    event.preventDefault();


    if (
        !validarPaso(1) ||
        !validarPaso(2) ||
        !validarPaso(3)
    ) {

        return;

    }


    const boton =
        document.getElementById(
            "crearTicketBtn"
        );


    if (boton) {

        boton.disabled =
            true;


        boton.innerHTML =
            '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

    }


    ocultarMensaje();


    try {


        /* =================================================
           DATOS
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


        const impacto =
            obtenerValor(
                "impacto"
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



        /* =================================================
           CATÁLOGOS
        ================================================= */

        const division =
            DIVISIONES.find(
                item =>
                    item.id ===
                    divisionId
            );


        const area =
            AREAS.find(
                item =>
                    item[0] ===
                    areaId
            );


        const categoria =
            CATEGORIAS.find(
                item =>
                    item[0] ===
                    categoriaId
            );


        if (
            !division ||
            !area ||
            !categoria
        ) {

            throw new Error(
                "Los datos de clasificación no son válidos."
            );

        }



        /* =================================================
           PRIORIDAD
        ================================================= */

        const prioridad =
            obtenerPrioridad(
                impacto
            );



        /* =================================================
           DOCUMENTO
        ================================================= */

        const referencia =
            newsroomDB
                .collection(
                    "tickets"
                )
                .doc();


        const fecha =
            firebase.firestore
                .FieldValue
                .serverTimestamp();


        /* =================================================
           FOLIO

           Se genera utilizando el ID único del
           documento para evitar depender de un
           contador local o de Math.random().
        ================================================= */

        const folio =
            generarFolio(
                referencia.id
            );



        /* =================================================
           TICKET
        ================================================= */

        const ticket = {

            folio:
                folio,


            titulo:
                titulo,


            descripcion:
                descripcion,


            prioridad:
                prioridad,


            /* =============================================
               USUARIO PÚBLICO
            ============================================= */

            usuario_id:
                null,


            usuario:
                "publico",


            nombre_usuario:
                empleado,


            correo_usuario:
                contacto,


            empleado:
                empleado,


            contacto:
                contacto,


            /* =============================================
               CLASIFICACIÓN
            ============================================= */

            division_id:
                division.id,


            division:
                division.nombre,


            area_id:
                area[0],


            area:
                area[1],


            categoria_id:
                categoria[0],


            categoria:
                categoria[1],


            /* =============================================
               EQUIPO
            ============================================= */

            equipo:
                equipo,


            /* =============================================
               IMPACTO
            ============================================= */

            impacto:
                impacto,


            /* =============================================
               ESTATUS
            ============================================= */

            estatus:
                "Registrado",


            /* =============================================
               TÉCNICO
            ============================================= */

            tecnico:
                null,


            tecnico_id:
                null,


            /* =============================================
               ORIGEN
            ============================================= */

            origen:
                "Mesa de Ayuda Pública",


            canal:
                "publico",


            /* =============================================
               FECHAS
            ============================================= */

            fecha_creacion:
                fecha,


            fecha_actualizacion:
                fecha

        };



        /* =================================================
           GUARDAR
        ================================================= */

        console.log(
            "Newsroom Portal: creando ticket público...",
            ticket
        );


        await referencia.set(
            ticket
        );


        console.log(
            "Newsroom Portal: ticket público creado.",
            folio
        );


        /* =================================================
           ÉXITO
        ================================================= */

        mostrarExito(
            folio
        );


    }
    catch (error) {


        console.error(
            "Newsroom Portal: error creando ticket público.",
            error
        );


        let mensaje =
            "No fue posible registrar el ticket.";


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
                "Firebase no está disponible en este momento.";

        }


        mostrarMensaje(
            mensaje,
            "error"
        );


        if (boton) {

            boton.disabled =
                false;


            boton.innerHTML =
                '<i class="fa-solid fa-paper-plane"></i> Enviar Ticket';

        }

    }

}


/* =========================================================
   PRIORIDAD
========================================================= */

function obtenerPrioridad(
    impacto
) {

    switch (
        impacto
    ) {

        case "No puedo trabajar":

            return "Crítica";


        case "Trabajo limitado":

            return "Alta";


        case "Consulta":

            return "Media";


        default:

            return "Media";

    }

}


/* =========================================================
   GENERAR FOLIO
========================================================= */

function generarFolio(
    documentId
) {

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


    const codigo =
        String(
            documentId
        )
        .substring(
            0,
            6
        )
        .toUpperCase();


    return `TK-${year}${month}${day}-${codigo}`;

}


/* =========================================================
   MOSTRAR ÉXITO
========================================================= */

function mostrarExito(
    folio
) {

    const formulario =
        document.getElementById(
            "ticketForm"
        );


    const progreso =
        document.querySelector(
            ".progress-wrapper"
        );


    const resultado =
        document.getElementById(
            "successContainer"
        );


    const folioElemento =
        document.getElementById(
            "folioResultado"
        );


    if (formulario) {

        formulario.style.display =
            "none";

    }


    if (progreso) {

        progreso.style.display =
            "none";

    }


    if (folioElemento) {

        folioElemento.textContent =
            folio;

    }


    if (resultado) {

        resultado.classList.add(
            "active"
        );

    }


    ocultarMensaje();

}


/* =========================================================
   REINICIAR
========================================================= */

function reiniciarFormulario() {

    const formulario =
        document.getElementById(
            "ticketForm"
        );


    const progreso =
        document.querySelector(
            ".progress-wrapper"
        );


    const resultado =
        document.getElementById(
            "successContainer"
        );


    if (formulario) {

        formulario.reset();

        formulario.style.display =
            "";

    }


    if (progreso) {

        progreso.style.display =
            "";

    }


    if (resultado) {

        resultado.classList.remove(
            "active"
        );

    }


    pasoActual = 1;


    mostrarPaso();


    const boton =
        document.getElementById(
            "crearTicketBtn"
        );


    if (boton) {

        boton.disabled =
            false;


        boton.innerHTML =
            '<i class="fa-solid fa-paper-plane"></i> Enviar Ticket';

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
        elemento.value || ""
    )
    .trim();

}


/* =========================================================
   CORREO
========================================================= */

function validarCorreo(
    correo
) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(
            correo
        );

}


/* =========================================================
   MARCAR ERROR
========================================================= */

function marcarError(
    id,
    mensaje
) {

    const elemento =
        document.getElementById(
            id
        );


    if (!elemento) {

        return;

    }


    elemento.classList.add(
        "input-error"
    );


    elemento.focus();


    mostrarMensaje(
        mensaje,
        "error"
    );


    setTimeout(
        () => {

            elemento.classList.remove(
                "input-error"
            );

        },
        2500
    );

}


/* =========================================================
   MENSAJE
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


    elemento.className =
        `message-box ${tipo}`;


    elemento.style.display =
        "block";

}


/* =========================================================
   OCULTAR MENSAJE
========================================================= */

function ocultarMensaje() {

    const elemento =
        document.getElementById(
            "ticketMessage"
        );


    if (!elemento) {

        return;

    }


    elemento.style.display =
        "none";


    elemento.textContent =
        "";

}
