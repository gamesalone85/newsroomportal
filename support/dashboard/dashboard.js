/* =========================================================
   NEWSROOM PORTAL
   EXECUTIVE DASHBOARD
   FIRESTORE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Newsroom Portal: Dashboard Ejecutivo iniciado."
        );


        /* =================================================
           VERIFICAR SESIÓN
        ================================================= */

        if (
            typeof verificarSesion !== "function"
        ) {

            console.error(
                "Newsroom Portal: auth.js no está disponible."
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
           FIREBASE
        ================================================= */

        if (
            typeof firebase === "undefined"
        ) {

            console.error(
                "Newsroom Portal: Firebase no está cargado."
            );

            return;

        }


        if (
            typeof newsroomDB === "undefined" ||
            !newsroomDB
        ) {

            console.error(
                "Newsroom Portal: newsroomDB no está disponible."
            );

            return;

        }


        console.log(
            "Newsroom Portal: Firestore disponible."
        );


        /* =================================================
           INICIAR DASHBOARD
        ================================================= */

        iniciarDashboardFirestore();

    }
);



/* =========================================================
   LISTENER
========================================================= */

let dashboardTicketsUnsubscribe =
    null;



/* =========================================================
   INICIAR FIRESTORE
========================================================= */

function iniciarDashboardFirestore() {

    console.log(
        "Newsroom Portal: escuchando tickets de Firestore..."
    );


    if (
        typeof dashboardTicketsUnsubscribe ===
        "function"
    ) {

        dashboardTicketsUnsubscribe();

        dashboardTicketsUnsubscribe =
            null;

    }


    dashboardTicketsUnsubscribe =
        newsroomDB
            .collection("tickets")
            .onSnapshot(

                function (snapshot) {

                    console.log(
                        "Newsroom Portal: tickets recibidos:",
                        snapshot.size
                    );


                    const tickets = [];


                    snapshot.forEach(
                        function (doc) {

                            tickets.push({

                                id:
                                    doc.id,

                                ...(
                                    doc.data() || {}
                                )

                            });

                        }
                    );


                    procesarDashboard(
                        tickets
                    );

                },


                function (error) {

                    console.error(
                        "Newsroom Portal: error Firestore:",
                        error
                    );


                    mostrarErrorDashboard(
                        "No se pudieron cargar los datos de operación."
                    );

                }

            );

}



/* =========================================================
   PROCESAR DASHBOARD
========================================================= */

function procesarDashboard(
    tickets
) {

    tickets =
        Array.isArray(tickets)
            ? tickets
            : [];


    console.log(
        "Newsroom Portal: procesando",
        tickets.length,
        "tickets."
    );


    const ahora =
        new Date();


    /* =====================================================
       TICKETS ACTIVOS
    ===================================================== */

    const ticketsActivos =
        tickets.filter(
            function (ticket) {

                return [
                    "Registrado",
                    "Pendiente",
                    "En Proceso"
                ].includes(
                    normalizarEstatus(
                        ticket.estatus
                    )
                );

            }
        );


    /* =====================================================
       CRÍTICOS
    ===================================================== */

    const ticketsCriticos =
        tickets.filter(
            function (ticket) {

                return (
                    normalizarPrioridad(
                        ticket.prioridad
                    ) === "Crítica"
                );

            }
        );


    /* =====================================================
       TICKETS VENCIDOS
    ===================================================== */

    const ticketsVencidos =
        tickets.filter(
            function (ticket) {

                return ticketFueraSLA(
                    ticket,
                    ahora
                );

            }
        );


    /* =====================================================
       TIEMPO PROMEDIO
    ===================================================== */

    const promedioResolucion =
        calcularPromedioResolucion(
            tickets
        );


    /* =====================================================
       TICKETS MES ACTUAL
    ===================================================== */

    const ticketsMes =
        obtenerTicketsMesActual(
            tickets,
            ahora
        );


    /* =====================================================
       TICKETS MES ANTERIOR
    ===================================================== */

    const ticketsMesPasado =
        obtenerTicketsMesPasado(
            tickets,
            ahora
        );


    /* =====================================================
       TENDENCIA
    ===================================================== */

    const tendencia =
        calcularTendencia(
            ticketsMes.length,
            ticketsMesPasado.length
        );


    /* =====================================================
       SLA GLOBAL
    ===================================================== */

    const slaGlobal =
        calcularSLAGlobal(
            tickets
        );


    /* =====================================================
       TÉCNICOS
    ===================================================== */

    const tecnicos =
        obtenerTecnicosDesdeTickets(
            tickets
        );


    /* =====================================================
       ACTUALIZAR HERO
    ===================================================== */

    actualizarTexto(
        "ticketsAbiertos",
        ticketsActivos.length
    );


    actualizarTexto(
        "ticketsCriticos",
        ticketsCriticos.length
    );


    /* =====================================================
       ACTUALIZAR KPI EJECUTIVOS
    ===================================================== */

    actualizarTexto(
        "slaGlobal",
        `${slaGlobal}%`
    );


    actualizarTexto(
        "ticketsVencidos",
        ticketsVencidos.length
    );


    actualizarTexto(
        "promedioResolucion",
        `${formatearHoras(
            promedioResolucion
        )}`
    );


    actualizarTexto(
        "tendencia",
        `${tendencia >= 0 ? "+" : ""}${tendencia}%`
    );


    /* =====================================================
       MINI KPIS
    ===================================================== */

    actualizarTexto(
        "miniAbiertos",
        obtenerCantidadPorEstatus(
            tickets,
            [
                "Registrado"
            ]
        )
    );


    actualizarTexto(
        "miniProceso",
        obtenerCantidadPorEstatus(
            tickets,
            [
                "En Proceso"
            ]
        )
    );


    actualizarTexto(
        "miniPendientes",
        obtenerCantidadPorEstatus(
            tickets,
            [
                "Pendiente"
            ]
        )
    );


    actualizarTexto(
        "miniCerrados",
        obtenerCantidadPorEstatus(
            tickets,
            [
                "Cerrado"
            ]
        )
    );


    actualizarTexto(
        "miniCriticos",
        ticketsCriticos.length
    );


    actualizarTexto(
        "miniTecnicos",
        tecnicos.length
    );


    /*
     * No inventamos inventario.
     * Si posteriormente existe colección equipos,
     * podremos conectarla directamente.
     */

    actualizarTexto(
        "miniEquipos",
        "—"
    );


    actualizarTexto(
        "miniTicketsMes",
        ticketsMes.length
    );


    /* =====================================================
       SLA HISTÓRICO
    ===================================================== */

    generarSLAHistorico(
        tickets
    );

}



/* =========================================================
   USUARIO
========================================================= */

function actualizarUsuario(
    session
) {

    const nombre =
        session.nombre ||
        session.usuario ||
        session.correo ||
        "Administrador";


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
   ACTUALIZAR TEXTO
========================================================= */

function actualizarTexto(
    id,
    valor
) {

    const elemento =
        document.getElementById(
            id
        );


    if (elemento) {

        elemento.textContent =
            valor;

    }

}



/* =========================================================
   NORMALIZAR ESTATUS
========================================================= */

function normalizarEstatus(
    estatus
) {

    const valor =
        String(
            estatus ||
            ""
        )
        .trim()
        .toLowerCase();


    const mapa = {

        "registrado":
            "Registrado",

        "pendiente":
            "Pendiente",

        "en proceso":
            "En Proceso",

        "en-proceso":
            "En Proceso",

        "enproceso":
            "En Proceso",

        "resuelto":
            "Resuelto",

        "cancelado":
            "Cancelado",

        "cerrado":
            "Cerrado"

    };


    return (
        mapa[
            valor
        ] ||
        estatus ||
        "Registrado"
    );

}



/* =========================================================
   NORMALIZAR PRIORIDAD
========================================================= */

function normalizarPrioridad(
    prioridad
) {

    const valor =
        String(
            prioridad ||
            "Media"
        )
        .trim()
        .toLowerCase();


    const mapa = {

        "crítica":
            "Crítica",

        "critica":
            "Crítica",

        "alta":
            "Alta",

        "media":
            "Media",

        "baja":
            "Baja"

    };


    return (
        mapa[
            valor
        ] ||
        prioridad ||
        "Media"
    );

}



/* =========================================================
   SLA
========================================================= */

function obtenerLimiteSLA(
    prioridad
) {

    const limites = {

        "Crítica":
            4,

        "Alta":
            8,

        "Media":
            24,

        "Baja":
            48

    };


    return (
        limites[
            normalizarPrioridad(
                prioridad
            )
        ] ||
        48
    );

}



/* =========================================================
   TICKET FUERA SLA
========================================================= */

function ticketFueraSLA(
    ticket,
    ahora
) {

    const estatus =
        normalizarEstatus(
            ticket.estatus
        );


    /* =====================================================
       CANCELADOS NO PENALIZAN SLA
    ===================================================== */

    if (
        estatus ===
        "Cancelado"
    ) {

        return false;

    }


    const fechaInicio =
        obtenerFecha(
            ticket.fecha_creacion ||
            ticket.createdAt ||
            ticket.fecha
        );


    if (
        fechaInicio.getTime() ===
        0
    ) {

        return false;

    }


    let fechaFin =
        ahora;


    /* =====================================================
       CERRADOS / RESUELTOS
    ===================================================== */

    if (
        estatus === "Cerrado" ||
        estatus === "Resuelto"
    ) {

        const fechaCierre =
            obtenerFecha(
                ticket.fecha_cierre ||
                ticket.closedAt ||
                ticket.fecha_resolucion
            );


        if (
            fechaCierre.getTime() ===
            0
        ) {

            return false;

        }


        fechaFin =
            fechaCierre;

    }


    const horas =
        calcularHoras(
            fechaInicio,
            fechaFin
        );


    return (
        horas >
        obtenerLimiteSLA(
            ticket.prioridad
        )
    );

}



/* =========================================================
   CALCULAR HORAS
========================================================= */

function calcularHoras(
    inicio,
    fin
) {

    const fechaInicio =
        obtenerFecha(
            inicio
        );


    const fechaFin =
        obtenerFecha(
            fin
        );


    if (
        fechaInicio.getTime() ===
        0 ||
        fechaFin.getTime() ===
        0
    ) {

        return 0;

    }


    return (
        fechaFin.getTime() -
        fechaInicio.getTime()
    ) /
    (
        1000 *
        60 *
        60
    );

}



/* =========================================================
   PROMEDIO RESOLUCIÓN
========================================================= */

function calcularPromedioResolucion(
    tickets
) {

    const resueltos =
        tickets.filter(
            function (ticket) {

                const estatus =
                    normalizarEstatus(
                        ticket.estatus
                    );


                return (
                    (
                        estatus ===
                        "Cerrado" ||
                        estatus ===
                        "Resuelto"
                    ) &&

                    obtenerFecha(
                        ticket.fecha_creacion ||
                        ticket.createdAt
                    ).getTime() !== 0 &&

                    obtenerFecha(
                        ticket.fecha_cierre ||
                        ticket.closedAt ||
                        ticket.fecha_resolucion
                    ).getTime() !== 0
                );

            }
        );


    if (!resueltos.length) {

        return 0;

    }


    const total =
        resueltos.reduce(
            function (
                acumulado,
                ticket
            ) {

                return (
                    acumulado +
                    calcularHoras(
                        ticket.fecha_creacion ||
                        ticket.createdAt,

                        ticket.fecha_cierre ||
                        ticket.closedAt ||
                        ticket.fecha_resolucion
                    )
                );

            },
            0
        );


    return (
        total /
        resueltos.length
    );

}



/* =========================================================
   SLA GLOBAL
========================================================= */

function calcularSLAGlobal(
    tickets
) {

    const evaluables =
        tickets.filter(
            function (ticket) {

                const estatus =
                    normalizarEstatus(
                        ticket.estatus
                    );


                if (
                    estatus !==
                    "Cerrado" &&
                    estatus !==
                    "Resuelto"
                ) {

                    return false;

                }


                if (
                    estatus ===
                    "Cancelado"
                ) {

                    return false;

                }


                const inicio =
                    obtenerFecha(
                        ticket.fecha_creacion ||
                        ticket.createdAt
                    );


                const fin =
                    obtenerFecha(
                        ticket.fecha_cierre ||
                        ticket.closedAt ||
                        ticket.fecha_resolucion
                    );


                return (
                    inicio.getTime() !== 0 &&
                    fin.getTime() !== 0
                );

            }
        );


    if (!evaluables.length) {

        return 100;

    }


    const dentroSLA =
        evaluables.filter(
            function (ticket) {

                return !ticketFueraSLA(
                    ticket,
                    new Date()
                );

            }
        ).length;


    return Math.max(
        0,
        Math.min(
            100,
            Math.round(
                (
                    dentroSLA /
                    evaluables.length
                ) *
                100
            )
        )
    );

}



/* =========================================================
   CANTIDAD POR ESTATUS
========================================================= */

function obtenerCantidadPorEstatus(
    tickets,
    estatus
) {

    return tickets.filter(
        function (ticket) {

            return estatus.includes(
                normalizarEstatus(
                    ticket.estatus
                )
            );

        }
    ).length;

}



/* =========================================================
   TÉCNICOS DESDE TICKETS
========================================================= */

function obtenerTecnicosDesdeTickets(
    tickets
) {

    const tecnicos =
        new Set();


    tickets.forEach(
        function (ticket) {

            let tecnico =
                "";


            if (
                typeof ticket.tecnico ===
                "string"
            ) {

                tecnico =
                    ticket.tecnico.trim();

            }


            if (
                ticket.tecnico &&
                typeof ticket.tecnico ===
                "object"
            ) {

                tecnico =
                    String(
                        ticket.tecnico.nombre ||
                        ""
                    ).trim();

            }


            if (
                ticket.tecnico_nombre
            ) {

                tecnico =
                    String(
                        ticket.tecnico_nombre
                    ).trim();

            }


            if (
                tecnico &&
                tecnico !==
                "Sin asignar"
            ) {

                tecnicos.add(
                    tecnico
                );

            }

        }
    );


    return [
        ...tecnicos
    ];

}



/* =========================================================
   TICKETS MES ACTUAL
========================================================= */

function obtenerTicketsMesActual(
    tickets,
    ahora
) {

    return tickets.filter(
        function (ticket) {

            const fecha =
                obtenerFecha(
                    ticket.fecha_creacion ||
                    ticket.createdAt ||
                    ticket.fecha
                );


            return (
                fecha.getTime() !== 0 &&

                fecha.getMonth() ===
                ahora.getMonth() &&

                fecha.getFullYear() ===
                ahora.getFullYear()
            );

        }
    );

}



/* =========================================================
   TICKETS MES PASADO
========================================================= */

function obtenerTicketsMesPasado(
    tickets,
    ahora
) {

    const fecha =
        new Date(
            ahora.getFullYear(),
            ahora.getMonth() - 1,
            1
        );


    return tickets.filter(
        function (ticket) {

            const ticketFecha =
                obtenerFecha(
                    ticket.fecha_creacion ||
                    ticket.createdAt ||
                    ticket.fecha
                );


            return (
                ticketFecha.getTime() !== 0 &&

                ticketFecha.getMonth() ===
                fecha.getMonth() &&

                ticketFecha.getFullYear() ===
                fecha.getFullYear()
            );

        }
    );

}



/* =========================================================
   TENDENCIA
========================================================= */

function calcularTendencia(
    actual,
    anterior
) {

    if (
        anterior === 0
    ) {

        return actual > 0
            ? 100
            : 0;

    }


    return Math.round(
        (
            (
                actual -
                anterior
            ) /
            anterior
        ) *
        100
    );

}



/* =========================================================
   SLA HISTÓRICO
========================================================= */

function generarSLAHistorico(
    tickets
) {

    const meses = [

        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic"

    ];


    const ahora =
        new Date();


    const anio =
        ahora.getFullYear();


    const contenedor =
        document.getElementById(
            "slaGrid"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML =
        "";


    for (
        let mes = 0;
        mes < 12;
        mes++
    ) {

        const ticketsMes =
            tickets.filter(
                function (ticket) {

                    const fecha =
                        obtenerFecha(
                            ticket.fecha_creacion ||
                            ticket.createdAt ||
                            ticket.fecha
                        );


                    return (
                        fecha.getTime() !== 0 &&

                        fecha.getMonth() ===
                        mes &&

                        fecha.getFullYear() ===
                        anio
                    );

                }
            );


        if (
            !ticketsMes.length
        ) {

            continue;

        }


        const evaluables =
            ticketsMes.filter(
                function (ticket) {

                    const estatus =
                        normalizarEstatus(
                            ticket.estatus
                        );


                    return (
                        (
                            estatus ===
                            "Cerrado" ||

                            estatus ===
                            "Resuelto"
                        ) &&

                        obtenerFecha(
                            ticket.fecha_cierre ||
                            ticket.closedAt ||
                            ticket.fecha_resolucion
                        ).getTime() !== 0
                    );

                }
            );


        const fueraSLA =
            evaluables.filter(
                function (ticket) {

                    return ticketFueraSLA(
                        ticket,
                        ahora
                    );

                }
            ).length;


        let cumplimiento =
            100;


        if (
            evaluables.length
        ) {

            cumplimiento =
                Math.round(
                    (
                        (
                            evaluables.length -
                            fueraSLA
                        ) /
                        evaluables.length
                    ) *
                    100
                );

        }


        cumplimiento =
            Math.max(
                0,
                Math.min(
                    100,
                    cumplimiento
                )
            );


        const rotation =
            -90 +
            (
                cumplimiento *
                1.8
            );


        let color =
            "#16a34a";


        let status =
            "Óptimo";


        if (
            cumplimiento <
            90
        ) {

            color =
                "#f59e0b";

            status =
                "Precaución";

        }


        if (
            cumplimiento <
            70
        ) {

            color =
                "#dc2626";

            status =
                "Crítico";

        }


        const panel =
            document.createElement(
                "div"
            );


        panel.className =
            "gauge-panel";


        panel.innerHTML = `

            <div class="gauge-month">
                ${meses[mes]}
            </div>


            <div class="gauge-wrapper">

                <div class="gauge">

                    <div class="gauge-body"></div>

                    <div class="gauge-inner"></div>

                    <div
                        class="gauge-needle"
                        style="
                            transform:
                            translateX(-50%)
                            rotate(${rotation}deg);
                        "
                    ></div>

                    <div class="gauge-center"></div>

                </div>


                <div class="gauge-value">
                    ${cumplimiento}%
                </div>


                <div
                    class="gauge-status"
                    style="
                        background:${color};
                    "
                >
                    ${status}
                </div>


                <div class="gauge-mini-info">

                    <strong>
                        ${fueraSLA}
                    </strong>

                    fuera SLA

                    <br>

                    ${ticketsMes.length}
                    tickets

                </div>

            </div>

        `;


        contenedor.appendChild(
            panel
        );

    }

}



/* =========================================================
   FORMATEAR HORAS
========================================================= */

function formatearHoras(
    horas
) {

    if (
        !horas ||
        horas <= 0
    ) {

        return "0h";

    }


    if (
        horas < 1
    ) {

        return (
            Math.round(
                horas * 60
            ) +
            " min"
        );

    }


    return (
        Math.round(
            horas * 10
        ) / 10
    ) + "h";

}



/* =========================================================
   OBTENER FECHA
   COMPATIBLE CON FIRESTORE
========================================================= */

function obtenerFecha(
    fecha
) {

    if (
        fecha instanceof Date
    ) {

        return fecha;

    }


    /* =====================================================
       FIRESTORE TIMESTAMP
    ===================================================== */

    if (
        fecha &&
        typeof fecha.toDate ===
        "function"
    ) {

        const resultado =
            fecha.toDate();


        if (
            resultado instanceof Date &&
            !isNaN(
                resultado.getTime()
            )
        ) {

            return resultado;

        }

    }


    /* =====================================================
       TIMESTAMP SERIALIZADO
    ===================================================== */

    if (
        fecha &&
        typeof fecha ===
        "object" &&
        typeof fecha.seconds ===
        "number"
    ) {

        const resultado =
            new Date(
                fecha.seconds * 1000
            );


        if (
            !isNaN(
                resultado.getTime()
            )
        ) {

            return resultado;

        }

    }


    /* =====================================================
       STRING / NUMBER
    ===================================================== */

    if (
        fecha !== null &&
        fecha !== undefined &&
        fecha !== ""
    ) {

        const resultado =
            new Date(
                fecha
            );


        if (
            !isNaN(
                resultado.getTime()
            )
        ) {

            return resultado;

        }

    }


    return new Date(0);

}



/* =========================================================
   ERROR
========================================================= */

function mostrarErrorDashboard(
    mensaje
) {

    const contenedor =
        document.getElementById(
            "slaGrid"
        );


    if (!contenedor) {

        return;

    }


    contenedor.innerHTML = `

        <div
            style="
                padding:30px;
                text-align:center;
                color:#b91c1c;
            "
        >

            <i
                class="fa-solid fa-triangle-exclamation"
                style="
                    font-size:28px;
                    display:block;
                    margin-bottom:10px;
                "
            ></i>

            ${escapeHTML(
                mensaje
            )}

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
