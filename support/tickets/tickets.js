/* =========================================================
   NEWSROOM PORTAL
   TICKETS
   CREAR TICKET
   FIREBASE / FIRESTORE / STORAGE
========================================================= */


/* =========================================================
   CONFIGURACIÓN DE EVIDENCIAS
========================================================= */

const MAX_ARCHIVOS = 5;

const MAX_TAMANO_ARCHIVO =
    5 * 1024 * 1024;

const TIPOS_PERMITIDOS = [
    "image/jpeg",
    "image/png",
    "application/pdf"
];

const EXTENSIONES_PERMITIDAS = [
    ".jpg",
    ".jpeg",
    ".png",
    ".pdf"
];


/* =========================================================
   ARCHIVOS SELECCIONADOS
========================================================= */

let archivosSeleccionados = [];


/* =========================================================
   INICIALIZACIÓN
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
           VERIFICAR STORAGE
        ================================================= */

        if (
            typeof firebase.storage !==
            "function"
        ) {

            console.error(
                "Newsroom Portal: Firebase Storage no está disponible."
            );

            mostrarMensaje(
                "Firebase Storage no está disponible.",
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
           CONFIGURAR EVIDENCIAS
        ================================================= */

        inicializarEvidencias();


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

   Todas las áreas están disponibles para:

   DNI
   DUCTER
   FSN
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
   INICIALIZAR EVIDENCIAS
========================================================= */

function inicializarEvidencias() {

    const input =
        document.getElementById(
            "evidencia"
        );


    const dropzone =
        document.getElementById(
            "evidenceDropzone"
        );


    if (!input) {

        return;

    }


    /* =================================================
       SELECCIÓN NORMAL
    ================================================= */

    input.addEventListener(
        "change",
        event => {

            procesarArchivos(
                Array.from(
                    event.target.files
                )
            );

            input.value = "";

        }
    );


    /* =================================================
       DRAG & DROP
    ================================================= */

    if (!dropzone) {

        return;

    }


    dropzone.addEventListener(
        "dragover",
        event => {

            event.preventDefault();

            dropzone.classList.add(
                "dragover"
            );

        }
    );


    dropzone.addEventListener(
        "dragleave",
        () => {

            dropzone.classList.remove(
                "dragover"
            );

        }
    );


    dropzone.addEventListener(
        "drop",
        event => {

            event.preventDefault();

            dropzone.classList.remove(
                "dragover"
            );


            procesarArchivos(
                Array.from(
                    event.dataTransfer.files
                )
            );

        }
    );

}


/* =========================================================
   PROCESAR ARCHIVOS
========================================================= */

function procesarArchivos(
    archivos
) {

    if (
        !Array.isArray(
            archivos
        )
    ) {

        return;

    }


    for (
        const archivo of archivos
    ) {


        /* =============================================
           LÍMITE DE ARCHIVOS
        ============================================= */

        if (
            archivosSeleccionados.length >=
            MAX_ARCHIVOS
        ) {

            mostrarMensaje(
                `Solo puedes adjuntar un máximo de ${MAX_ARCHIVOS} archivos.`,
                "error"
            );

            break;

        }


        /* =============================================
           VALIDAR TIPO
        ============================================= */

        const nombre =
            archivo.name ||
            "";


        const extension =
            obtenerExtension(
                nombre
            );


        const tipoValido =
            TIPOS_PERMITIDOS.includes(
                archivo.type
            );


        const extensionValida =
            EXTENSIONES_PERMITIDAS.includes(
                extension
            );


        if (
            !tipoValido &&
            !extensionValida
        ) {

            mostrarMensaje(
                `El archivo "${nombre}" no es válido. Solo se permiten JPG, JPEG, PNG o PDF.`,
                "error"
            );

            continue;

        }


        /* =============================================
           VALIDAR TAMAÑO
        ============================================= */

        if (
            archivo.size >
            MAX_TAMANO_ARCHIVO
        ) {

            mostrarMensaje(
                `El archivo "${nombre}" supera el límite de 5 MB.`,
                "error"
            );

            continue;

        }


        /* =============================================
           EVITAR DUPLICADOS
        ============================================= */

        const duplicado =
            archivosSeleccionados.some(
                item =>
                    item.name ===
                    archivo.name
                    &&
                    item.size ===
                    archivo.size
                    &&
                    item.lastModified ===
                    archivo.lastModified
            );


        if (duplicado) {

            continue;

        }


        archivosSeleccionados.push(
            archivo
        );

    }


    renderizarListaEvidencias();

}


/* =========================================================
   OBTENER EXTENSIÓN
========================================================= */

function obtenerExtension(
    nombre
) {

    const posicion =
        nombre.lastIndexOf(
            "."
        );


    if (
        posicion === -1
    ) {

        return "";

    }


    return nombre
        .substring(
            posicion
        )
        .toLowerCase();

}


/* =========================================================
   RENDERIZAR EVIDENCIAS
========================================================= */

function renderizarListaEvidencias() {

    const lista =
        document.getElementById(
            "evidenceList"
        );


    const contador =
        document.getElementById(
            "evidenceCounter"
        );


    if (!lista) {

        return;

    }


    lista.innerHTML =
        "";


    archivosSeleccionados.forEach(
        (
            archivo,
            indice
        ) => {


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "evidence-item";


            const icono =
                document.createElement(
                    "div"
                );


            icono.className =
                "evidence-icon";


            icono.innerHTML =
                obtenerIconoArchivo(
                    archivo
                );


            const info =
                document.createElement(
                    "div"
                );


            info.className =
                "evidence-info";


            const nombre =
                document.createElement(
                    "div"
                );


            nombre.className =
                "evidence-name";


            nombre.textContent =
                archivo.name;


            const tamaño =
                document.createElement(
                    "div"
                );


            tamaño.className =
                "evidence-size";


            tamaño.textContent =
                formatearTamano(
                    archivo.size
                );


            info.appendChild(
                nombre
            );

            info.appendChild(
                tamaño
            );


            const boton =
                document.createElement(
                    "button"
                );


            boton.type =
                "button";


            boton.className =
                "evidence-remove";


            boton.title =
                "Eliminar archivo";


            boton.innerHTML =
                '<i class="fa-solid fa-xmark"></i>';


            boton.addEventListener(
                "click",
                () => {

                    eliminarArchivo(
                        indice
                    );

                }
            );


            item.appendChild(
                icono
            );

            item.appendChild(
                info
            );

            item.appendChild(
                boton
            );


            lista.appendChild(
                item
            );

        }
    );


    if (contador) {

        contador.textContent =
            `${archivosSeleccionados.length} de ${MAX_ARCHIVOS} archivos seleccionados`;

    }

}


/* =========================================================
   ICONO DE ARCHIVO
========================================================= */

function obtenerIconoArchivo(
    archivo
) {

    const tipo =
        archivo.type ||
        "";


    if (
        tipo ===
        "application/pdf"
    ) {

        return '<i class="fa-solid fa-file-pdf"></i>';

    }


    if (
        tipo.startsWith(
            "image/"
        )
    ) {

        return '<i class="fa-solid fa-file-image"></i>';

    }


    return '<i class="fa-solid fa-file"></i>';

}


/* =========================================================
   ELIMINAR ARCHIVO
========================================================= */

function eliminarArchivo(
    indice
) {

    if (
        indice < 0 ||
        indice >=
        archivosSeleccionados.length
    ) {

        return;

    }


    archivosSeleccionados.splice(
        indice,
        1
    );


    renderizarListaEvidencias();

}


/* =========================================================
   FORMATEAR TAMAÑO
========================================================= */

function formatearTamano(
    bytes
) {

    if (
        bytes === 0
    ) {

        return "0 Bytes";

    }


    const unidades = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];


    const indice =
        Math.floor(
            Math.log(
                bytes
            ) /
            Math.log(
                1024
            )
        );


    return (
        parseFloat(
            (
                bytes /
                Math.pow(
                    1024,
                    indice
                )
            )
            .toFixed(2)
        )
        +
        " " +
        unidades[indice]
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
       STORAGE
    ===================================================== */

    if (
        typeof firebase.storage !==
        "function"
    ) {

        mostrarMensaje(
            "Firebase Storage no está disponible.",
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
            document
                .getElementById(
                    "division"
                )
                .value
                .trim();


        const areaId =
            document
                .getElementById(
                    "area"
                )
                .value
                .trim();


        const categoriaId =
            document
                .getElementById(
                    "categoria"
                )
                .value
                .trim();


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
           VALIDAR ARCHIVOS
        ================================================= */

        if (
            archivosSeleccionados.length >
            MAX_ARCHIVOS
        ) {

            mostrarMensaje(
                `Solo puedes adjuntar un máximo de ${MAX_ARCHIVOS} archivos.`,
                "error"
            );

            restaurarBoton();

            return;

        }


        for (
            const archivo of archivosSeleccionados
        ) {

            if (
                archivo.size >
                MAX_TAMANO_ARCHIVO
            ) {

                mostrarMensaje(
                    `El archivo "${archivo.name}" supera el límite de 5 MB.`,
                    "error"
                );

                restaurarBoton();

                return;

            }

        }


        /* =================================================
           CATÁLOGOS
        ================================================= */

        const division =
            obtenerDivisiones()
                .find(
                    item =>
                        String(item.id) ===
                        String(divisionId)
                );


        const area =
            obtenerAreas()
                .find(
                    item =>
                        String(item.id) ===
                        String(areaId)
                );


        const categoria =
            obtenerCategorias()
                .find(
                    item =>
                        String(item.id) ===
                        String(categoriaId)
                );


        /* =================================================
           VALIDAR CATÁLOGOS
        ================================================= */

        if (!division) {

            mostrarMensaje(
                "La división seleccionada no es válida.",
                "error"
            );

            restaurarBoton();

            return;

        }


        if (!area) {

            mostrarMensaje(
                "El área seleccionada no es válida.",
                "error"
            );

            restaurarBoton();

            return;

        }


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
           SUBIR EVIDENCIAS
        ================================================= */

        let adjuntos = [];


        if (
            archivosSeleccionados.length >
            0
        ) {

            mostrarMensaje(
                "Subiendo evidencias...",
                "success"
            );


            adjuntos =
                await subirEvidencias(
                    folio,
                    usuarioId
                );

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
               EVIDENCIAS
            ============================================= */

            total_adjuntos:
                adjuntos.length,


            adjuntos:
                adjuntos,


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


        archivosSeleccionados =
            [];


        renderizarListaEvidencias();


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
            "storage/unauthorized"
        ) {

            mensaje =
                "Firebase Storage rechazó la subida de la evidencia. Debemos revisar las reglas de Storage.";

        }


        else if (
            error &&
            error.code ===
            "storage/canceled"
        ) {

            mensaje =
                "La subida de una evidencia fue cancelada.";

        }


        else if (
            error &&
            error.code ===
            "storage/unknown"
        ) {

            mensaje =
                "Firebase Storage encontró un error inesperado.";

        }


        else if (
            error &&
            error.code ===
            "permission-denied"
        ) {

            mensaje =
                "Firebase rechazó la operación por permisos de Firestore.";

        }


        else if (
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
   SUBIR EVIDENCIAS A FIREBASE STORAGE
========================================================= */

async function subirEvidencias(
    folio,
    usuarioId
) {

    const storage =
        firebase.storage();


    const resultados = [];


    for (
        let indice = 0;
        indice <
        archivosSeleccionados.length;
        indice++
    ) {

        const archivo =
            archivosSeleccionados[
                indice
            ];


        /* =============================================
           NOMBRE SEGURO
        ============================================= */

        const nombreSeguro =
            crearNombreSeguro(
                archivo.name
            );


        const nombreFinal =
            `${Date.now()}_${indice}_${nombreSeguro}`;


        /* =============================================
           RUTA
        ============================================= */

        const ruta =
            `tickets/${folio}/${nombreFinal}`;


        console.log(
            "Newsroom Portal: subiendo evidencia:",
            ruta
        );


        /* =============================================
           REFERENCIA STORAGE
        ============================================= */

        const referencia =
            storage.ref(
                ruta
            );


        /* =============================================
           METADATA
        ============================================= */

        const metadata = {

            contentType:
                archivo.type ||
                obtenerTipoPorExtension(
                    archivo.name
                ),

            customMetadata: {

                ticketFolio:
                    folio,

                usuarioId:
                    String(
                        usuarioId
                    ),

                nombreOriginal:
                    archivo.name

            }

        };


        /* =============================================
           SUBIR
        ============================================= */

        await referencia.put(
            archivo,
            metadata
        );


        /* =============================================
           URL
        ============================================= */

        const url =
            await referencia.getDownloadURL();


        /* =============================================
           REGISTRAR RESULTADO
        ============================================= */

        resultados.push({

            nombre:
                archivo.name,

            nombreStorage:
                nombreFinal,

            tipo:
                archivo.type ||
                obtenerTipoPorExtension(
                    archivo.name
                ),

            extension:
                obtenerExtension(
                    archivo.name
                ),

            tamano:
                archivo.size,

            tamano_formateado:
                formatearTamano(
                    archivo.size
                ),

            url:
                url,

            storage_path:
                ruta,

            usuario_id:
                usuarioId,

            fecha_subida:
                new Date()

        });

    }


    return resultados;

}


/* =========================================================
   CREAR NOMBRE SEGURO
========================================================= */

function crearNombreSeguro(
    nombre
) {

    return nombre
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        )
        .replace(
            /[^a-zA-Z0-9._-]/g,
            "_"
        );

}


/* =========================================================
   OBTENER TIPO POR EXTENSIÓN
========================================================= */

function obtenerTipoPorExtension(
    nombre
) {

    const extension =
        obtenerExtension(
            nombre
        );


    if (
        extension ===
        ".jpg" ||
        extension ===
        ".jpeg"
    ) {

        return "image/jpeg";

    }


    if (
        extension ===
        ".png"
    ) {

        return "image/png";

    }


    if (
        extension ===
        ".pdf"
    ) {

        return "application/pdf";

    }


    return "application/octet-stream";

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


    return `TK-${year}${month}-${day}-${numero}`;

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
