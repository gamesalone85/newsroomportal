/* =========================================================
   NEWSROOM PORTAL
   MESA DE AYUDA PÚBLICA
   CREAR TICKETS SIN AUTENTICACIÓN
========================================================= */


/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Newsroom Portal: Mesa de Ayuda pública iniciada."
        );


        inicializarMesaAyuda();

    }
);



/* =========================================================
   INICIALIZAR
========================================================= */

function inicializarMesaAyuda() {

    /* =====================================================
       VERIFICAR FIRESTORE
    ===================================================== */

    if (
        typeof newsroomPublicDB ===
        "undefined" ||
        !newsroomPublicDB
    ) {

        console.error(
            "Newsroom Portal: Firestore público no está disponible."
        );

        mostrarMensaje(
            "No fue posible conectar con la Mesa de Ayuda.",
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
       INICIAR WIZARD
    ===================================================== */

    inicializarWizard();


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
            crearTicket
        );

    }


    /* =====================================================
       NUEVO TICKET
    ===================================================== */

    const nuevoTicketBtn =
        document.getElementById(
            "nuevoTicketBtn"
        );


    if (nuevoTicketBtn) {

        nuevoTicketBtn.addEventListener(
            "click",
            nuevoTicket
        );

    }

}



/* =========================================================
   WIZARD
========================================================= */

let pasoActual = 1;


function inicializarWizard() {

    const nextButtons =
        document.querySelectorAll(
            ".next-btn"
        );


    const prevButtons =
        document.querySelectorAll(
            ".prev-btn"
        );


    nextButtons.forEach(
        boton => {

            boton.addEventListener(
                "click",
                function () {

                    if (
                        validarPaso(
                            pasoActual
                        )
                    ) {

                        cambiarPaso(
                            pasoActual + 1
                        );

                    }

                }
            );

        }
    );


    prevButtons.forEach(
        boton => {

            boton.addEventListener(
                "click",
                function () {

                    cambiarPaso(
                        pasoActual - 1
                    );

                }
            );

        }
    );


    cambiarPaso(1);

}



/* =========================================================
   VALIDAR PASO
========================================================= */

function validarPaso(
    paso
) {

    const contenedor =
        document.querySelector(
            `.form-step[data-step="${paso}"]`
        );


    if (!contenedor) {

        return true;

    }


    const campos =
        contenedor.querySelectorAll(
            "input, select, textarea"
        );


    for (
        const campo of campos
    ) {

        if (
            !campo.checkValidity()
        ) {

            campo.reportValidity();

            return false;

        }

    }


    return true;

}



/* =========================================================
   CAMBIAR PASO
========================================================= */

function cambiarPaso(
    nuevoPaso
) {

    if (
        nuevoPaso < 1 ||
        nuevoPaso > 3
    ) {

        return;

    }


    pasoActual =
        nuevoPaso;


    const pasos =
        document.querySelectorAll(
            ".form-step"
        );


    pasos.forEach(
        paso => {

            const numero =
                Number(
                    paso.dataset.step
                );


            paso.classList.toggle(
                "active",
                numero === nuevoPaso
            );

        }
    );


    const indicadores =
        document.querySelectorAll(
            ".step"
        );


    indicadores.forEach(
        indicador => {

            const numero =
                Number(
                    indicador.dataset.step
                );


            indicador.classList.toggle(
                "active",
                numero === nuevoPaso
            );


            indicador.classList.toggle(
                "completed",
                numero < nuevoPaso
            );

        }
    );


    const progressFill =
        document.getElementById(
            "progressFill"
        );


    if (progressFill) {

        const porcentaje =
            ((nuevoPaso - 1) / 2) * 100;


        progressFill.style.width =
            `${porcentaje}%`;

    }

}



/* =========================================================
   DIVISIONES
========================================================= */

function cargarDivisiones() {

    const select =
        document.getElementById(
            "division"
        );


    if (!select) {

        return;

    }


    const divisiones = [

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
   ÁREAS
========================================================= */

function cargarAreas() {

    const select =
        document.getElementById(
            "area"
        );


    if (!select) {

        return;

    }


    const areas = [

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


    areas.forEach(
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
   CATEGORÍAS
========================================================= */

function cargarCategorias() {

    const select =
        document.getElementById(
            "categoria"
        );


    if (!select) {

        return;

    }


    const categorias = [

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


    categorias.forEach(
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
   CREAR TICKET
========================================================= */

async function crearTicket(
    event
) {

    event.preventDefault();


    /* =====================================================
       VALIDAR PASO 3
    ===================================================== */

    if (
        !validarPaso(3)
    ) {

        return;

    }


    /* =====================================================
       VERIFICAR FIRESTORE
    ===================================================== */

    if (
        typeof newsroomPublicDB ===
        "undefined" ||
        !newsroomPublicDB
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
            '<i class="fa-solid fa-spinner fa-spin"></i> Enviando...';

    }


    try {


        /* =================================================
           DATOS
        ================================================= */

        const empleado =
            document
                .getElementById("empleado")
                .value
                .trim();


        const contacto =
            document
                .getElementById("contacto")
                .value
                .trim();


        const divisionId =
            document
                .getElementById("division")
                .value
                .trim();


        const areaId =
            document
                .getElementById("area")
                .value
                .trim();


        const categoriaId =
            document
                .getElementById("categoria")
                .value
                .trim();


        const impacto =
            document
                .getElementById("impacto")
                .value
                .trim();


        const equipo =
            document
                .getElementById("equipo")
                .value
                .trim();


        const titulo =
            document
                .getElementById("titulo")
                .value
                .trim();


        const descripcion =
            document
                .getElementById("descripcion")
                .value
                .trim();


        /* =================================================
           VALIDACIÓN
        ================================================= */

        if (
            !empleado ||
            !contacto ||
            !divisionId ||
            !areaId ||
            !categoriaId ||
            !impacto ||
            !equipo ||
            !titulo ||
            !descripcion
        ) {

            mostrarMensaje(
                "Completa todos los campos obligatorios.",
                "error"
            );


            restaurarBoton();

            return;

        }


        /* =================================================
           CATÁLOGOS
        ================================================= */

        const division =
            obtenerDivision(
                divisionId
            );


        const area =
            obtenerArea(
                areaId
            );


        const categoria =
            obtenerCategoria(
                categoriaId
            );


        if (
            !division ||
            !area ||
            !categoria
        ) {

            mostrarMensaje(
                "Uno de los valores seleccionados no es válido.",
                "error"
            );


            restaurarBoton();

            return;

        }


        /* =================================================
           FOLIO
        ================================================= */

        const folio =
            generarFolio();


        /* =================================================
           FECHA
        ================================================= */

        const ahora =
            firebase.firestore
                .Timestamp
                .now();


        /* =================================================
           TICKET PÚBLICO
        ================================================= */

        const ticket = {

            folio:
                folio,


            titulo:
                titulo,


            descripcion:
                descripcion,


            prioridad:
                calcularPrioridad(
                    impacto
                ),


            impacto:
                impacto,


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


            equipo:
                equipo,


            division_id:
                divisionId,


            division:
                division.nombre,


            area_id:
                areaId,


            area:
                area.nombre,


            categoria_id:
                categoriaId,


            categoria:
                categoria.nombre,


            estatus:
                "Registrado",


            tecnico:
                null,


            tecnico_id:
                null,


            origen:
                "Mesa de Ayuda Pública",


            fecha_creacion:
                ahora,


            fecha_actualizacion:
                ahora

        };


        /* =================================================
           GUARDAR
        ================================================= */

        console.log(
            "Newsroom Portal: creando ticket público...",
            ticket
        );


        const referencia =
            await newsroomPublicDB
                .collection("tickets")
                .add(ticket);


        console.log(
            "Newsroom Portal: ticket creado.",
            referencia.id
        );


        /* =================================================
           MOSTRAR RESULTADO
        ================================================= */

        mostrarResultado(
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
                "Firebase rechazó el ticket. Debemos revisar las reglas de Firestore.";

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
   PRIORIDAD
========================================================= */

function calcularPrioridad(
    impacto
) {

    if (
        impacto ===
        "No puedo trabajar"
    ) {

        return "Alta";

    }


    if (
        impacto ===
        "Trabajo limitado"
    ) {

        return "Media";

    }


    return "Baja";

}



/* =========================================================
   OBTENER DIVISIÓN
========================================================= */

function obtenerDivision(
    id
) {

    const divisiones = {

        DNI:
            "DNI",

        DUCTER:
            "DUCTER",

        FSN:
            "FSN"

    };


    if (
        !divisiones[id]
    ) {

        return null;

    }


    return {

        id:
            id,

        nombre:
            divisiones[id]

    };

}



/* =========================================================
   OBTENER ÁREA
========================================================= */

function obtenerArea(
    id
) {

    const areas = {

        CONT: "Contabilidad",
        TES: "Tesorería",
        SIST: "Sistemas",
        ACT: "Activo Fijo",
        ARCH: "Archivo",
        COMP: "Compras",
        CXP: "Cuentas por Pagar",
        CXC: "Cuentas por Cobrar",
        REG: "Regulación",
        DIR: "Dirección",
        RH: "Recursos Humanos",
        JUR: "Jurídico",
        ADM: "Administración",
        FIN: "Finanzas",
        AUD: "Auditoría",
        CONTR: "Contraloría",
        OPER: "Operaciones",
        LOG: "Logística",
        ALM: "Almacén",
        MANT: "Mantenimiento",
        CAL: "Calidad",
        PROY: "Proyectos",
        PLANE: "Planeación",
        PROC: "Procesos",
        CUM: "Cumplimiento",
        SEG: "Seguridad",
        COMEX: "Comercio Exterior",
        IMP: "Impuestos",
        NOM: "Nómina",
        CAP: "Capacitación",
        DES: "Desarrollo Organizacional",
        RECEP: "Recepción",
        ATC: "Atención a Clientes",
        DOC: "Documentación",
        INFRA: "Infraestructura",
        DAT: "Datos / BI",
        SOP: "Soporte",
        PRES: "Presupuesto",
        RIES: "Riesgos",
        CONTROL: "Control Interno",
        COMERCIAL: "Comercial / Ventas",
        MKT: "Marketing"

    };


    if (
        !areas[id]
    ) {

        return null;

    }


    return {

        id:
            id,

        nombre:
            areas[id]

    };

}



/* =========================================================
   OBTENER CATEGORÍA
========================================================= */

function obtenerCategoria(
    id
) {

    const categorias = {

        HARDWARE:
            "Hardware",

        SOFTWARE:
            "Software",

        RED:
            "Red / Conectividad",

        IMPRESORAS:
            "Impresoras",

        CORREO:
            "Correo Electrónico",

        ACCESOS:
            "Accesos y Permisos",

        CUENTAS:
            "Cuentas de Usuario",

        INTERNET:
            "Internet",

        TELEFONIA:
            "Telefonía",

        SERVIDORES:
            "Servidores",

        SISTEMAS:
            "Sistemas / Aplicaciones",

        SEGURIDAD:
            "Seguridad Informática",

        BACKUP:
            "Respaldos",

        DATOS:
            "Datos / Información",

        PERIFERICOS:
            "Periféricos",

        EQUIPOS:
            "Equipos de Cómputo",

        MANTENIMIENTO:
            "Mantenimiento",

        INSTALACION:
            "Instalación / Configuración",

        ACTUALIZACION:
            "Actualización",

        SOLICITUD:
            "Solicitud de Servicio",

        OTRO:
            "Otro"

    };


    if (
        !categorias[id]
    ) {

        return null;

    }


    return {

        id:
            id,

        nombre:
            categorias[id]

    };

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
   MOSTRAR RESULTADO
========================================================= */

function mostrarResultado(
    folio
) {

    const formulario =
        document.getElementById(
            "ticketForm"
        );


    const successContainer =
        document.getElementById(
            "successContainer"
        );


    const folioResultado =
        document.getElementById(
            "folioResultado"
        );


    if (formulario) {

        formulario.style.display =
            "none";

    }


    if (folioResultado) {

        folioResultado.textContent =
            folio;

    }


    if (successContainer) {

        successContainer.classList.add(
            "active"
        );

    }


    const message =
        document.getElementById(
            "ticketMessage"
        );


    if (message) {

        message.style.display =
            "none";

    }

}



/* =========================================================
   NUEVO TICKET
========================================================= */

function nuevoTicket() {

    const formulario =
        document.getElementById(
            "ticketForm"
        );


    const successContainer =
        document.getElementById(
            "successContainer"
        );


    if (formulario) {

        formulario.reset();

        formulario.style.display =
            "block";

    }


    if (successContainer) {

        successContainer.classList.remove(
            "active"
        );

    }


    pasoActual =
        1;


    cambiarPaso(1);


    restaurarBoton();

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
        '<i class="fa-solid fa-paper-plane"></i> Enviar Ticket';

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


    elemento.className =
        "message-box";


    elemento.classList.add(
        tipo
    );


    elemento.style.display =
        "block";


    elemento.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}
