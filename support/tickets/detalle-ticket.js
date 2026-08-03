/* =========================================================
   NEWSROOM PORTAL
   DETALLE DE TICKET
   FIRESTORE
   ========================================================= */


/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "Newsroom Portal: detalle-ticket.js cargado correctamente."
        );


        /* =================================================
           SESIÓN
        ================================================= */

        if (
            typeof verificarSesion !== "function"
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
            typeof obtenerSesion === "function"
                ? obtenerSesion()
                : null;


        if (!session) {

            console.error(
                "Newsroom Portal: no existe sesión activa."
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
           FIRESTORE
        ================================================= */

        if (
            typeof newsroomDB === "undefined"
        ) {

            mostrarErrorTicket(
                "Firebase Firestore no está disponible."
            );

            return;

        }


        /* =================================================
           ID DEL TICKET
        ================================================= */

        const params =
            new URLSearchParams(
                window.location.search
            );


        const ticketId =
            params.get("id");


        if (!ticketId) {

            window.location.href =
                "mis_reportes.html";

            return;

        }


        console.log(
            "Newsroom Portal: cargando ticket:",
            ticketId
        );


        /* =================================================
           CARGAR TICKET
        ================================================= */

        const ticket =
            await obtenerTicketPorId(
                ticketId
            );


        if (!ticket) {

            mostrarTicketNoEncontrado();

            return;

        }


        console.log(
            "Newsroom Portal: ticket encontrado:",
            ticket
        );


        /* =================================================
           MOSTRAR TICKET
        ================================================= */

        mostrarTicket(
            ticket
        );


        /* =================================================
           CONFIGURAR FORMULARIO
        ================================================= */

        await configurarFormulario(
            ticket,
            session
        );


        /* =================================================
           HISTORIAL
        ================================================= */

        await cargarHistorial(
            ticket.firestore_id ||
            ticket.id
        );


        /* =================================================
           KNOWLEDGE BASE
        ================================================= */

        configurarKnowledgeBase();

    }
);



/* =========================================================
   USUARIO
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
   OBTENER TICKET DESDE FIRESTORE
========================================================= */

async function obtenerTicketPorId(
    id
) {

    try {

        /* =========================================
           PRIMERO:
           Intentar como DOCUMENT ID
        ========================================= */

        const directRef =
            newsroomDB
                .collection("tickets")
                .doc(
                    String(id)
                );


        const directSnapshot =
            await directRef.get();


        if (
            directSnapshot.exists
        ) {

            return {

                ...directSnapshot.data(),

                firestore_id:
                    directSnapshot.id

            };

        }


        /* =========================================
           SEGUNDO:
           Buscar por campo "id"
        ========================================= */

        const querySnapshot =
            await newsroomDB
                .collection("tickets")
                .where(
                    "id",
                    "==",
                    String(id)
                )
                .limit(1)
                .get();


        if (
            !querySnapshot.empty
        ) {

            const doc =
                querySnapshot.docs[0];


            return {

                ...doc.data(),

                firestore_id:
                    doc.id

            };

        }


        /* =========================================
           TERCERO:
           Buscar por folio
        ========================================= */

        const folioSnapshot =
            await newsroomDB
                .collection("tickets")
                .where(
                    "folio",
                    "==",
                    String(id)
                )
                .limit(1)
                .get();


        if (
            !folioSnapshot.empty
        ) {

            const doc =
                folioSnapshot.docs[0];


            return {

                ...doc.data(),

                firestore_id:
                    doc.id

            };

        }


        return null;

    }
    catch(error) {

        console.error(
            "Newsroom Portal: error obteniendo ticket.",
            error
        );


        mostrarErrorTicket(
            "No fue posible consultar el ticket en Firestore."
        );


        return null;

    }

}



/* =========================================================
   MOSTRAR TICKET
========================================================= */

function mostrarTicket(
    ticket
) {

    const title =
        document.getElementById(
            "ticketTitle"
        );


    const description =
        document.getElementById(
            "ticketDescription"
        );


    const pageTitle =
        document.getElementById(
            "pageTitle"
        );


    /* =========================================
       TÍTULO
    ========================================= */

    if (title) {

        title.textContent =
            ticket.titulo ||
            "Sin título";

    }


    /* =========================================
       DESCRIPCIÓN
    ========================================= */

    if (description) {

        description.textContent =
            ticket.descripcion ||
            "Sin descripción";

    }


    /* =========================================
       PAGE TITLE
    ========================================= */

    if (pageTitle) {

        pageTitle.textContent =
            "Ticket #" +
            (
                ticket.folio ||
                ticket.id ||
                ticket.firestore_id
            );

    }


    /* =========================================
       INFORMACIÓN
    ========================================= */

    const info =
        document.getElementById(
            "ticketInfoGrid"
        );


    if (info) {

        info.innerHTML = `

            ${crearInfo(
                "Folio",
                ticket.folio ||
                ticket.id ||
                ticket.firestore_id
            )}

            ${crearInfo(
                "Empleado",
                ticket.empleado ||
                ticket.usuario_nombre ||
                ticket.usuario ||
                "No especificado"
            )}

            ${crearInfo(
                "Correo",
                ticket.correo ||
                ticket.email ||
                "No especificado"
            )}

            ${crearInfo(
                "Contacto",
                ticket.contacto ||
                ticket.telefono ||
                "No especificado"
            )}

            ${crearInfo(
                "División",
                ticket.division ||
                obtenerNombreDivision(
                    ticket.division_id
                )
            )}

            ${crearInfo(
                "Área",
                ticket.area ||
                obtenerNombreArea(
                    ticket.area_id
                )
            )}

            ${crearInfo(
                "Categoría",
                ticket.categoria ||
                obtenerNombreCategoria(
                    ticket.categoria_id
                )
            )}

            ${crearInfo(
                "Equipo",
                ticket.equipo ||
                ticket.equipo_nombre ||
                "No especificado"
            )}

            ${crearInfo(
                "Prioridad",
                ticket.prioridad ||
                "Media"
            )}

            ${crearInfo(
                "Estatus",
                ticket.estatus ||
                "Registrado"
            )}

            ${crearInfo(
                "Técnico",
                ticket.tecnico ||
                "Sin asignar"
            )}

            ${crearInfo(
                "Fecha de creación",
                formatearFecha(
                    ticket.fecha_creacion
                )
            )}

            ${crearInfo(
                "Última actualización",
                formatearFecha(
                    ticket.fecha_actualizacion
                )
            )}

            ${
                ticket.fecha_cierre
                    ?
                    crearInfo(
                        "Fecha de cierre",
                        formatearFecha(
                            ticket.fecha_cierre
                        )
                    )
                    :
                    ""
            }

            ${
                ticket.tiempo_resolucion
                    ?
                    crearInfo(
                        "Tiempo de resolución",
                        tiempoMinutos(
                            Number(
                                ticket.tiempo_resolucion
                            )
                        , false)
                    )
                    :
                    ""
            }

        `;

    }


    /* =========================================
       SOLUCIÓN
    ========================================= */

    const solutionBox =
        document.getElementById(
            "solutionBox"
        );


    const solution =
        document.getElementById(
            "ticketSolution"
        );


    const solucionTexto =
        ticket.solucion ||
        ticket.solucion_tecnica ||
        "";


    if (
        solutionBox &&
        solution &&
        solucionTexto.trim() !== ""
    ) {

        solutionBox.style.display =
            "block";

        solution.textContent =
            solucionTexto;

    }
    else if (solutionBox) {

        solutionBox.style.display =
            "none";

    }

}



/* =========================================================
   CREAR INFO
========================================================= */

function crearInfo(
    label,
    value
) {

    return `

        <div class="ticket-info-item">

            <span>
                ${escapeHTML(label)}
            </span>

            <strong>
                ${escapeHTML(
                    value ||
                    "No especificado"
                )}
            </strong>

        </div>

    `;

}



/* =========================================================
   CONFIGURAR FORMULARIO
========================================================= */

async function configurarFormulario(
    ticket,
    session
) {

    const form =
        document.getElementById(
            "ticketForm"
        );


    const updateContainer =
        document.getElementById(
            "updateContainer"
        );


    const lockedMessage =
        document.getElementById(
            "lockedMessage"
        );


    const adminActionGroup =
        document.getElementById(
            "adminActionGroup"
        );


    const statusGroup =
        document.getElementById(
            "statusGroup"
        );


    const technicianGroup =
        document.getElementById(
            "technicianGroup"
        );


    const status =
        document.getElementById(
            "ticketStatus"
        );


    const adminStatus =
        document.getElementById(
            "adminStatus"
        );


    const technician =
        document.getElementById(
            "technicianSelect"
        );


    const solution =
        document.getElementById(
            "solutionInput"
        );


    /* =========================================
       ROL
    ========================================= */

    const rol =
        Number(
            session.rol_id
        );


    const esAdmin =
        rol === 1;


    console.log(
        "Newsroom Portal: rol del usuario:",
        rol
    );


    /* =========================================
       TÉCNICOS
    ========================================= */

    await cargarTecnicos(
        technician
    );


    /* =========================================
       SOLUCIÓN ACTUAL
    ========================================= */

    if (solution) {

        solution.value =
            ticket.solucion ||
            ticket.solucion_tecnica ||
            "";

    }


    /* =========================================
       ESTATUS
    ========================================= */

    const estatusActual =
        String(
            ticket.estatus ||
            "Registrado"
        )
        .trim();


    /* =========================================
       TICKET BLOQUEADO
    ========================================= */

    const bloqueado =
        [
            "Cerrado",
            "Cancelado"
        ].includes(
            estatusActual
        );


    if (
        bloqueado &&
        !esAdmin
    ) {

        if (updateContainer) {

            updateContainer.style.display =
                "none";

        }


        if (lockedMessage) {

            lockedMessage.style.display =
                "block";

        }


        return;

    }


    /* =========================================
       MOSTRAR FORMULARIO
    ========================================= */

    if (updateContainer) {

        updateContainer.style.display =
            "block";

    }


    /* =========================================
       ADMIN REABRIENDO
    ========================================= */

    if (
        bloqueado &&
        esAdmin
    ) {

        if (adminActionGroup) {

            adminActionGroup.style.display =
                "block";

        }


        if (statusGroup) {

            statusGroup.style.display =
                "none";

        }


        if (technicianGroup) {

            technicianGroup.style.display =
                "none";

        }

    }


    /* =========================================
       ESTATUS ACTUAL
    ========================================= */

    if (status) {

        const valorValido =
            Array.from(
                status.options
            )
            .some(
                option =>
                    option.value ===
                    estatusActual
            );


        if (valorValido) {

            status.value =
                estatusActual;

        }

    }


    /* =========================================
       TÉCNICO ACTUAL
    ========================================= */

    if (technician) {

        technician.value =
            ticket.tecnico_id ||
            "";

    }


    /* =========================================
       SUBMIT
    ========================================= */

    if (form) {

        form.addEventListener(
            "submit",
            async event => {

                event.preventDefault();


                await actualizarTicket(
                    ticket,
                    session
                );

            }
        );

    }

}



/* =========================================================
   CARGAR TÉCNICOS
========================================================= */

async function cargarTecnicos(
    select
) {

    if (!select) {

        return;

    }


    select.innerHTML = `

        <option value="">
            Sin asignar
        </option>

    `;


    try {

        if (
            typeof newsroomDB !==
            "undefined"
        ) {

            const snapshot =
                await newsroomDB
                    .collection("usuarios")
                    .get();


            snapshot.forEach(
                doc => {

                    const usuario =
                        doc.data();


                    if (
                        Number(
                            usuario.rol_id
                        ) !== 2
                    ) {

                        return;

                    }


                    const option =
                        document.createElement(
                            "option"
                        );


                    option.value =
                        usuario.id ||
                        doc.id;


                    option.textContent =
                        usuario.nombre ||
                        usuario.usuario ||
                        "Técnico";


                    select.appendChild(
                        option
                    );

                }
            );


            return;

        }

    }
    catch(error) {

        console.warn(
            "No fue posible cargar técnicos desde Firestore.",
            error
        );

    }


    /* =========================================
       FALLBACK DATA.JS
    ========================================= */

    if (
        typeof obtenerUsuarios ===
        "function"
    ) {

        const usuarios =
            obtenerUsuarios();


        const tecnicos =
            usuarios.filter(
                usuario =>
                    Number(
                        usuario.rol_id
                    ) === 2
            );


        tecnicos.forEach(
            tecnico => {

                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    tecnico.id;


                option.textContent =
                    tecnico.nombre;


                select.appendChild(
                    option
                );

            }
        );

    }

}



/* =========================================================
   ACTUALIZAR TICKET
========================================================= */

async function actualizarTicket(
    ticket,
    session
) {

    const rol =
        Number(
            session.rol_id
        );


    const esAdmin =
        rol === 1;


    const status =
        document.getElementById(
            "ticketStatus"
        );


    const adminStatus =
        document.getElementById(
            "adminStatus"
        );


    const technician =
        document.getElementById(
            "technicianSelect"
        );


    const comment =
        document.getElementById(
            "commentInput"
        );


    const solution =
        document.getElementById(
            "solutionInput"
        );


    /* =========================================
       ESTATUS
    ========================================= */

    let nuevoEstatus;


    const ticketCerrado =
        [
            "Cerrado",
            "Cancelado"
        ].includes(
            String(
                ticket.estatus
            )
        );


    if (
        ticketCerrado &&
        esAdmin
    ) {

        nuevoEstatus =
            adminStatus
                ? adminStatus.value
                : "En Proceso";

    }
    else {

        nuevoEstatus =
            status
                ? status.value
                : ticket.estatus;

    }


    /* =========================================
       RESUELTO
       Técnicamente "Resuelto" se convierte
       en "Cerrado" al guardar.
    ========================================= */

    if (
        nuevoEstatus === "Resuelto"
    ) {

        nuevoEstatus =
            "Cerrado";

    }


    /* =========================================
       TÉCNICO
    ========================================= */

    const tecnicoId =
        technician
            ? technician.value
            : "";


    let tecnicoNombre =
        "Sin asignar";


    if (tecnicoId) {

        const option =
            technician
                ? technician.options[
                    technician.selectedIndex
                ]
                : null;


        if (option) {

            tecnicoNombre =
                option.textContent;

        }

    }


    /* =========================================
       COMENTARIO
    ========================================= */

    const comentarioTexto =
        comment &&
        comment.value
            ? comment.value.trim()
            : "";


    /* =========================================
       SOLUCIÓN
    ========================================= */

    const solucionTexto =
        solution &&
        solution.value
            ? solution.value.trim()
            : "";


    /* =========================================
       FECHA ACTUAL
    ========================================= */

    const ahora =
        new Date();


    /* =========================================
       DATOS PARA FIRESTORE
    ========================================= */

    const actualizacion = {

        estatus:
            nuevoEstatus,

        tecnico_id:
            tecnicoId || null,

        tecnico:
            tecnicoNombre,

        fecha_actualizacion:
            ahora

    };


    /* =========================================
       SOLUCIÓN
    ========================================= */

    if (solucionTexto) {

        actualizacion.solucion =
            solucionTexto;

    }


    /* =========================================
       CIERRE
    ========================================= */

    if (
        nuevoEstatus === "Cerrado" ||
        nuevoEstatus === "Cancelado"
    ) {

        actualizacion.fecha_cierre =
            ahora;


        const inicio =
            convertirFecha(
                ticket.fecha_creacion
            );


        if (inicio) {

            const minutos =
                Math.max(
                    0,
                    Math.round(
                        (
                            ahora.getTime() -
                            inicio.getTime()
                        ) / 60000
                    )
                );


            actualizacion.tiempo_resolucion =
                minutos;

        }

    }
    else {

        actualizacion.fecha_cierre =
            null;


        actualizacion.tiempo_resolucion =
            null;

    }


    /* =========================================
       REFERENCIA FIRESTORE
    ========================================= */

    const firestoreId =
        ticket.firestore_id ||
        ticket.id;


    if (!firestoreId) {

        alert(
            "No se encontró el identificador de Firestore del ticket."
        );

        return;

    }


    const ticketRef =
        newsroomDB
            .collection("tickets")
            .doc(
                String(
                    firestoreId
                )
            );


    /* =========================================
       GUARDAR TICKET
    ========================================= */

    try {

        await ticketRef.update(
            actualizacion
        );


        /* =====================================
           HISTORIAL
        ===================================== */

        if (
            String(
                ticket.tecnico_id ||
                ""
            ) !==
            String(
                tecnicoId ||
                ""
            )
        ) {

            await agregarHistorial(
                firestoreId,
                session,
                "Asignación",
                "Ticket asignado a: " +
                tecnicoNombre
            );

        }


        if (comentarioTexto) {

            await agregarHistorial(
                firestoreId,
                session,
                "Comentario",
                comentarioTexto
            );

        }


        if (
            String(
                ticket.estatus ||
                ""
            ) !==
            String(
                nuevoEstatus ||
                ""
            )
        ) {

            await agregarHistorial(
                firestoreId,
                session,
                "Estatus",
                "Estatus actualizado a: " +
                nuevoEstatus
            );

        }


        if (solucionTexto) {

            await agregarHistorial(
                firestoreId,
                session,
                "Solución",
                solucionTexto
            );

        }


        /* =====================================
           KNOWLEDGE BASE
        ===================================== */

        if (
            (
                nuevoEstatus ===
                "Cerrado" ||
                nuevoEstatus ===
                "Cancelado"
            ) &&
            solucionTexto
        ) {

            await guardarKnowledgeBase(
                {
                    ...ticket,
                    ...actualizacion,
                    solucion:
                        solucionTexto
                },
                session
            );

        }


        /* =====================================
           AVISO
        ===================================== */

        alert(
            "Ticket actualizado correctamente."
        );


        window.location.reload();

    }
    catch(error) {

        console.error(
            "Newsroom Portal: error actualizando ticket.",
            error
        );


        alert(
            "No fue posible actualizar el ticket.\n\n" +
            "Verifica los permisos de Firestore."
        );

    }

}



/* =========================================================
   HISTORIAL
========================================================= */

async function agregarHistorial(
    ticketId,
    session,
    tipo,
    detalle
) {

    try {

        const ticketRef =
            newsroomDB
                .collection("tickets")
                .doc(
                    String(
                        ticketId
                    )
                );


        const registro = {

            id:
                Date.now(),

            usuario_id:
                session.id ||
                session.uid ||
                null,

            usuario:
                session.nombre ||
                session.usuario ||
                "Sistema",

            tipo:
                tipo,

            comentario:
                detalle,

            fecha:
                new Date()

        };


        await ticketRef.update({

            historial:
                firebase.firestore.FieldValue.arrayUnion(
                    registro
                )

        });

    }
    catch(error) {

        console.error(
            "Newsroom Portal: error guardando historial.",
            error
        );

    }

}



/* =========================================================
   CARGAR HISTORIAL
========================================================= */

async function cargarHistorial(
    ticketId
) {

    const tbody =
        document.getElementById(
            "historyBody"
        );


    if (!tbody) {

        return;

    }


    tbody.innerHTML = `

        <tr>

            <td colspan="4">

                Cargando historial...

            </td>

        </tr>

    `;


    try {

        const snapshot =
            await newsroomDB
                .collection("tickets")
                .doc(
                    String(
                        ticketId
                    )
                )
                .get();


        if (!snapshot.exists) {

            throw new Error(
                "Ticket no encontrado."
            );

        }


        const ticket =
            snapshot.data();


        const registros =
            Array.isArray(
                ticket.historial
            )
                ? ticket.historial
                : [];


        registros.sort(
            (a,b) => {

                return convertirFecha(
                    b.fecha
                ) -
                convertirFecha(
                    a.fecha
                );

            }
        );


        tbody.innerHTML = "";


        if (
            registros.length ===
            0
        ) {

            tbody.innerHTML = `

                <tr>

                    <td colspan="4">

                        No existe historial
                        registrado para este ticket.

                    </td>

                </tr>

            `;

            return;

        }


        registros.forEach(
            registro => {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>

                        ${escapeHTML(
                            formatearFecha(
                                registro.fecha
                            )
                        )}

                    </td>


                    <td>

                        ${escapeHTML(
                            registro.usuario ||
                            "Sistema"
                        )}

                    </td>


                    <td>

                        <span
                            class="history-badge ${obtenerClaseBadge(
                                registro.tipo
                            )}"
                        >

                            ${escapeHTML(
                                registro.tipo ||
                                "Sistema"
                            )}

                        </span>

                    </td>


                    <td>

                        ${escapeHTML(
                            registro.comentario ||
                            ""
                        )}

                    </td>

                `;


                tbody.appendChild(
                    row
                );

            }
        );

    }
    catch(error) {

        console.error(
            "Newsroom Portal: error cargando historial.",
            error
        );


        tbody.innerHTML = `

            <tr>

                <td colspan="4">

                    No fue posible cargar el historial.

                </td>

            </tr>

        `;

    }

}



/* =========================================================
   BADGE HISTORIAL
========================================================= */

function obtenerClaseBadge(
    tipo
) {

    switch (
        String(
            tipo || ""
        )
        .trim()
        .toLowerCase()
    ) {

        case "comentario":

            return "badge-comentario";


        case "estatus":

            return "badge-estatus";


        case "solución":
        case "solucion":

            return "badge-solucion";


        case "asignación":
        case "asignacion":

            return "badge-asignacion";


        default:

            return "badge-sistema";

    }

}



/* =========================================================
   KNOWLEDGE BASE
========================================================= */

function configurarKnowledgeBase() {

    const input =
        document.getElementById(
            "kbSearch"
        );


    const results =
        document.getElementById(
            "kbResults"
        );


    if (
        !input ||
        !results
    ) {

        return;

    }


    let timer;


    input.addEventListener(
        "input",
        function () {

            clearTimeout(
                timer
            );


            const query =
                this.value
                    .trim()
                    .toLowerCase();


            if (
                query.length <
                3
            ) {

                results.innerHTML =
                    "";

                return;

            }


            timer =
                setTimeout(
                    async () => {

                        await buscarKnowledgeBase(
                            query,
                            results
                        );

                    },
                    300
                );

        }
    );

}



/* =========================================================
   BUSCAR KNOWLEDGE BASE
========================================================= */

async function buscarKnowledgeBase(
    query,
    results
) {

    try {

        const snapshot =
            await newsroomDB
                .collection(
                    "knowledge_base"
                )
                .get();


        const coincidencias = [];


        snapshot.forEach(
            doc => {

                const item =
                    doc.data();


                const texto = (

                    String(
                        item.titulo ||
                        ""
                    ) +

                    " " +

                    String(
                        item.problema ||
                        ""
                    ) +

                    " " +

                    String(
                        item.solucion ||
                        ""
                    ) +

                    " " +

                    String(
                        item.categoria ||
                        ""
                    )

                )
                .toLowerCase();


                if (
                    texto.includes(
                        query
                    )
                ) {

                    coincidencias.push(
                        {
                            ...item,
                            firestore_id:
                                doc.id
                        }
                    );

                }

            }
        );


        if (
            coincidencias.length ===
            0
        ) {

            results.innerHTML = `

                <p>
                    No hay coincidencias.
                </p>

            `;

            return;

        }


        results.innerHTML =
            coincidencias
                .map(
                    item => `

                        <div class="kb-result">

                            <strong>
                                ${escapeHTML(
                                    item.titulo
                                )}
                            </strong>

                            <p>
                                ${escapeHTML(
                                    item.problema
                                )}
                            </p>

                            <details>

                                <summary>
                                    Ver solución
                                </summary>

                                <p>
                                    ${escapeHTML(
                                        item.solucion
                                    )}
                                </p>

                            </details>

                        </div>

                    `
                )
                .join("");

    }
    catch(error) {

        console.error(
            "Newsroom Portal: error buscando Knowledge Base.",
            error
        );


        /* =====================================
           FALLBACK LOCAL
        ===================================== */

        const knowledge =
            JSON.parse(
                localStorage.getItem(
                    "newsroomKnowledgeBase"
                )
            ) || [];


        const coincidencias =
            knowledge.filter(
                item => {

                    const texto = (

                        item.titulo +
                        " " +
                        item.problema +
                        " " +
                        item.solucion

                    )
                    .toLowerCase();


                    return texto.includes(
                        query
                    );

                }
            );


        results.innerHTML =
            coincidencias.length
                ?
                coincidencias
                    .map(
                        item => `

                            <div class="kb-result">

                                <strong>
                                    ${escapeHTML(
                                        item.titulo
                                    )}
                                </strong>

                                <p>
                                    ${escapeHTML(
                                        item.problema
                                    )}
                                </p>

                                <details>

                                    <summary>
                                        Ver solución
                                    </summary>

                                    <p>
                                        ${escapeHTML(
                                            item.solucion
                                        )}
                                    </p>

                                </details>

                            </div>

                        `
                    )
                    .join("")
                :
                "<p>No hay coincidencias.</p>";

    }

}



/* =========================================================
   GUARDAR KNOWLEDGE BASE
========================================================= */

async function guardarKnowledgeBase(
    ticket,
    session
) {

    try {

        const ticketId =
            ticket.firestore_id ||
            ticket.id;


        /* =====================================
           EVITAR DUPLICADOS
        ===================================== */

        const existente =
            await newsroomDB
                .collection(
                    "knowledge_base"
                )
                .where(
                    "created_from_ticket_id",
                    "==",
                    String(
                        ticketId
                    )
                )
                .limit(1)
                .get();


        if (
            !existente.empty
        ) {

            return;

        }


        await newsroomDB
            .collection(
                "knowledge_base"
            )
            .add({

                titulo:
                    ticket.titulo ||
                    "Sin título",

                problema:
                    ticket.descripcion ||
                    "",

                solucion:
                    ticket.solucion ||
                    "",

                categoria:
                    ticket.categoria ||
                    obtenerNombreCategoria(
                        ticket.categoria_id
                    ) ||
                    "General",

                created_from_ticket_id:
                    String(
                        ticketId
                    ),

                created_by:
                    session.id ||
                    session.uid ||
                    null,

                created_by_name:
                    session.nombre ||
                    session.usuario ||
                    "Sistema",

                fecha:
                    new Date()

            });

    }
    catch(error) {

        console.error(
            "Newsroom Portal: error guardando Knowledge Base.",
            error
        );

    }

}



/* =========================================================
   DIVISIÓN
========================================================= */

function obtenerNombreDivision(
    id
) {

    if (
        !id ||
        typeof obtenerDivisiones !==
        "function"
    ) {

        return "";

    }


    try {

        const division =
            obtenerDivisiones()
                .find(
                    item =>
                        Number(
                            item.id
                        ) ===
                        Number(
                            id
                        )
                );


        return division
            ? division.nombre
            : "";

    }
    catch(error) {

        return "";

    }

}



/* =========================================================
   ÁREA
========================================================= */

function obtenerNombreArea(
    id
) {

    if (
        !id ||
        typeof obtenerAreas !==
        "function"
    ) {

        return "";

    }


    try {

        const area =
            obtenerAreas()
                .find(
                    item =>
                        Number(
                            item.id
                        ) ===
                        Number(
                            id
                        )
                );


        return area
            ? area.nombre
            : "";

    }
    catch(error) {

        return "";

    }

}



/* =========================================================
   CATEGORÍA
========================================================= */

function obtenerNombreCategoria(
    id
) {

    if (
        !id ||
        typeof obtenerCategorias !==
        "function"
    ) {

        return "";

    }


    try {

        const categoria =
            obtenerCategorias()
                .find(
                    item =>
                        Number(
                            item.id
                        ) ===
                        Number(
                            id
                        )
                );


        return categoria
            ? categoria.nombre
            : "";

    }
    catch(error) {

        return "";

    }

}



/* =========================================================
   TIEMPO
========================================================= */

function tiempoMinutos(
    minutos,
    incluirBadge = true
) {

    minutos =
        Number(
            minutos
        ) || 0;


    const horas =
        Math.floor(
            minutos / 60
        );


    const mins =
        minutos % 60;


    const texto =
        `${horas}h ${mins}m`;


    if (!incluirBadge) {

        return texto;

    }


    return `

        <span class="time-ok">

            ${escapeHTML(
                texto
            )}

        </span>

    `;

}



/* =========================================================
   CONVERTIR FECHA FIRESTORE
========================================================= */

function convertirFecha(
    fecha
) {

    if (!fecha) {

        return null;

    }


    /* =========================================
       FIRESTORE TIMESTAMP
    ========================================= */

    if (
        typeof fecha.toDate ===
        "function"
    ) {

        return fecha.toDate();

    }


    /* =========================================
       FIRESTORE TIMESTAMP SERIALIZADO
       { seconds, nanoseconds }
    ========================================= */

    if (
        typeof fecha === "object" &&
        fecha.seconds !== undefined
    ) {

        return new Date(
            Number(
                fecha.seconds
            ) * 1000
            +
            Math.floor(
                Number(
                    fecha.nanoseconds ||
                    0
                ) / 1000000
            )
        );

    }


    /* =========================================
       DATE
    ========================================= */

    if (
        fecha instanceof Date
    ) {

        return fecha;

    }


    /* =========================================
       STRING / NUMBER
    ========================================= */

    const date =
        new Date(
            fecha
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return null;

    }


    return date;

}



/* =========================================================
   FECHA
========================================================= */

function formatearFecha(
    fecha
) {

    const date =
        convertirFecha(
            fecha
        );


    if (!date) {

        return "Sin fecha";

    }


    return date.toLocaleString(
        "es-MX",
        {

            year:
                "numeric",

            month:
                "2-digit",

            day:
                "2-digit",

            hour:
                "2-digit",

            minute:
                "2-digit"

        }
    );

}



/* =========================================================
   ERROR
========================================================= */

function mostrarErrorTicket(
    mensaje
) {

    const detail =
        document.getElementById(
            "ticketDetail"
        );


    if (!detail) {

        return;

    }


    detail.innerHTML = `

        <div
            style="
                text-align:center;
                padding:50px;
            "
        >

            <i
                class="fa-solid fa-triangle-exclamation"
                style="
                    font-size:45px;
                    color:#c8102e;
                    margin-bottom:15px;
                "
            ></i>


            <h2>
                Error al cargar ticket
            </h2>


            <p>
                ${escapeHTML(
                    mensaje
                )}
            </p>


            <a
                href="mis_reportes.html"
                class="btn-primary"
                style="
                    margin-top:15px;
                "
            >

                Volver a Mis Reportes

            </a>

        </div>

    `;

}



/* =========================================================
   TICKET NO ENCONTRADO
========================================================= */

function mostrarTicketNoEncontrado() {

    const detail =
        document.getElementById(
            "ticketDetail"
        );


    if (!detail) {

        return;

    }


    detail.innerHTML = `

        <div
            style="
                text-align:center;
                padding:50px;
            "
        >

            <i
                class="fa-solid fa-ticket"
                style="
                    font-size:45px;
                    color:#c8102e;
                    margin-bottom:15px;
                "
            ></i>


            <h2>
                Ticket no encontrado
            </h2>


            <p>
                El ticket solicitado no existe
                o fue eliminado.
            </p>


            <a
                href="mis_reportes.html"
                class="btn-primary"
                style="
                    margin-top:15px;
                "
            >

                Volver a Mis Reportes

            </a>

        </div>

    `;

}



/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    valor
) {

    return String(
        valor ?? ""
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
