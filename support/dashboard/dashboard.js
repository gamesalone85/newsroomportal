/* =========================================================
   NEWSROOM PORTAL
   EXECUTIVE DASHBOARD
   ========================================================= */


/* =========================================================
   INICIALIZAR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =================================================
           SESIÓN
        ================================================== */

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
           INFORMACIÓN DEL USUARIO
        ================================================== */

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
                session.nombre ||
                session.usuario ||
                "Administrador";

        }


        if (userAvatar) {

            const nombre =
                session.nombre ||
                session.usuario ||
                "A";

            userAvatar.textContent =
                nombre
                    .charAt(0)
                    .toUpperCase();

        }



        /* =================================================
           OBTENER DATOS
        ================================================== */

        const tickets =
            typeof obtenerTickets ===
            "function"

                ? obtenerTickets()

                : [];


        const equipos =
            typeof obtenerEquipos ===
            "function"

                ? obtenerEquipos()

                : [];


        const usuarios =
            typeof obtenerUsuarios ===
            "function"

                ? obtenerUsuarios()

                : [];



        /* =================================================
           FECHA ACTUAL
        ================================================== */

        const ahora =
            new Date();


        const mesActual =
            ahora.getMonth();


        const anioActual =
            ahora.getFullYear();



        /* =================================================
           TICKETS
        ================================================== */

        const ticketsAbiertos =
            tickets.filter(
                ticket =>
                    [
                        "Registrado",
                        "Pendiente",
                        "En Proceso"
                    ].includes(
                        ticket.estatus
                    )
            ).length;


        const ticketsProceso =
            tickets.filter(
                ticket =>
                    ticket.estatus ===
                    "En Proceso"
            ).length;


        const ticketsPendientes =
            tickets.filter(
                ticket =>
                    ticket.estatus ===
                    "Pendiente"
            ).length;


        const ticketsCerrados =
            tickets.filter(
                ticket =>
                    ticket.estatus ===
                    "Cerrado"
            ).length;


        const ticketsCriticos =
            tickets.filter(
                ticket =>
                    ticket.prioridad ===
                    "Crítica"
            ).length;



        /* =================================================
           EQUIPOS
        ================================================== */

        const equiposTotal =
            equipos.length;



        /* =================================================
           TÉCNICOS
        ================================================== */

        const tecnicos =
            usuarios.filter(
                usuario =>
                    Number(
                        usuario.rol_id
                    ) === 2
            ).length;



        /* =================================================
           TICKETS VENCIDOS
        ================================================== */

        const ticketsVencidos =
            tickets.filter(
                ticket => {

                    if (
                        ticket.estatus ===
                        "Cerrado"
                    ) {

                        return false;

                    }


                    const fecha =
                        new Date(
                            ticket.fecha_creacion
                        );


                    if (
                        Number.isNaN(
                            fecha.getTime()
                        )
                    ) {

                        return false;

                    }


                    const horas =
                        (
                            ahora -
                            fecha
                        ) /
                        (
                            1000 *
                            60 *
                            60
                        );


                    const limite =
                        obtenerLimiteSLA(
                            ticket.prioridad
                        );


                    return horas >
                        limite;

                }
            ).length;



        /* =================================================
           PROMEDIO RESOLUCIÓN
        ================================================== */

        const cerradosConFecha =
            tickets.filter(
                ticket =>
                    ticket.estatus ===
                    "Cerrado" &&
                    ticket.fecha_creacion &&
                    ticket.fecha_cierre
            );


        let promedioResolucion =
            0;


        if (
            cerradosConFecha.length >
            0
        ) {


            const tiempos =
                cerradosConFecha.map(
                    ticket => {

                        const inicio =
                            new Date(
                                ticket.fecha_creacion
                            );

                        const cierre =
                            new Date(
                                ticket.fecha_cierre
                            );


                        return (
                            cierre -
                            inicio
                        ) /
                        (
                            1000 *
                            60 *
                            60
                        );

                    }
                );


            const suma =
                tiempos.reduce(
                    (
                        total,
                        valor
                    ) =>
                        total + valor,
                    0
                );


            promedioResolucion =
                Math.round(
                    suma /
                    tiempos.length
                );

        }



        /* =================================================
           TICKETS DEL MES
        ================================================== */

        const ticketsMes =
            tickets.filter(
                ticket => {

                    const fecha =
                        new Date(
                            ticket.fecha_creacion
                        );


                    return (
                        fecha.getMonth() ===
                            mesActual &&

                        fecha.getFullYear() ===
                            anioActual
                    );

                }
            ).length;



        /* =================================================
           TICKETS MES PASADO
        ================================================== */

        const fechaMesPasado =
            new Date(
                anioActual,
                mesActual - 1,
                1
            );


        const ticketsMesPasado =
            tickets.filter(
                ticket => {

                    const fecha =
                        new Date(
                            ticket.fecha_creacion
                        );


                    return (
                        fecha.getMonth() ===
                            fechaMesPasado
                                .getMonth() &&

                        fecha.getFullYear() ===
                            fechaMesPasado
                                .getFullYear()
                    );

                }
            ).length;



        /* =================================================
           TENDENCIA
        ================================================== */

        let tendencia =
            0;


        if (
            ticketsMesPasado >
            0
        ) {

            tendencia =
                Math.round(
                    (
                        (
                            ticketsMes -
                            ticketsMesPasado
                        ) /
                        ticketsMesPasado
                    ) *
                    100
                );

        }



        /* =================================================
           SLA GLOBAL
        ================================================== */

        const ticketsCerradosSLA =
            tickets.filter(
                ticket =>
                    ticket.estatus ===
                    "Cerrado" &&
                    ticket.fecha_creacion &&
                    ticket.fecha_cierre
            );


        let slaGlobal =
            100;


        if (
            ticketsCerradosSLA.length >
            0
        ) {


            const fueraSLA =
                ticketsCerradosSLA.filter(
                    ticket =>
                        calcularHoras(
                            ticket.fecha_creacion,
                            ticket.fecha_cierre
                        ) >
                        obtenerLimiteSLA(
                            ticket.prioridad
                        )
                ).length;


            slaGlobal =
                100 -
                Math.round(
                    (
                        fueraSLA /
                        ticketsCerradosSLA.length
                    ) *
                    100
                );


            slaGlobal =
                Math.max(
                    0,
                    slaGlobal
                );

        }



        /* =================================================
           ACTUALIZAR DASHBOARD
        ================================================== */

        actualizarTexto(
            "ticketsAbiertos",
            ticketsAbiertos
        );


        actualizarTexto(
            "ticketsCriticos",
            ticketsCriticos
        );


        actualizarTexto(
            "slaGlobal",
            `${slaGlobal}%`
        );


        actualizarTexto(
            "ticketsVencidos",
            ticketsVencidos
        );


        actualizarTexto(
            "promedioResolucion",
            `${promedioResolucion}h`
        );


        actualizarTexto(
            "tendencia",
            `${tendencia >= 0 ? "+" : ""}${tendencia}%`
        );


        actualizarTexto(
            "miniAbiertos",
            ticketsAbiertos
        );


        actualizarTexto(
            "miniProceso",
            ticketsProceso
        );


        actualizarTexto(
            "miniPendientes",
            ticketsPendientes
        );


        actualizarTexto(
            "miniCerrados",
            ticketsCerrados
        );


        actualizarTexto(
            "miniCriticos",
            ticketsCriticos
        );


        actualizarTexto(
            "miniTecnicos",
            tecnicos
        );


        actualizarTexto(
            "miniEquipos",
            equiposTotal
        );


        actualizarTexto(
            "miniTicketsMes",
            ticketsMes
        );



        /* =================================================
           SLA HISTÓRICO
        ================================================== */

        generarSLAHistorico(
            tickets
        );

    }
);



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
   LÍMITES SLA
========================================================= */

function obtenerLimiteSLA(
    prioridad
) {

    const limites = {

        "Crítica": 4,

        "Alta": 8,

        "Media": 24,

        "Baja": 48

    };


    return (
        limites[
            prioridad
        ] ||
        48
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
        new Date(
            inicio
        );


    const fechaFin =
        new Date(
            fin
        );


    return (
        fechaFin -
        fechaInicio
    ) /
    (
        1000 *
        60 *
        60
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
                ticket => {

                    const fecha =
                        new Date(
                            ticket.fecha_creacion
                        );


                    return (
                        fecha.getMonth() ===
                            mes &&

                        fecha.getFullYear() ===
                            anio
                    );

                }
            );


        /*
         * Igual que el PHP:
         * no mostrar meses sin tickets.
         */

        if (
            ticketsMes.length ===
            0
        ) {

            continue;

        }



        const cerrados =
            ticketsMes.filter(
                ticket =>
                    ticket.estatus ===
                    "Cerrado" &&
                    ticket.fecha_cierre
            );


        const fueraSLA =
            cerrados.filter(
                ticket =>
                    calcularHoras(
                        ticket.fecha_creacion,
                        ticket.fecha_cierre
                    ) >
                    obtenerLimiteSLA(
                        ticket.prioridad
                    )
            ).length;



        let cumplimiento =
            100;


        if (
            ticketsMes.length >
            0
        ) {

            cumplimiento =
                100 -
                Math.round(
                    (
                        fueraSLA /
                        ticketsMes.length
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



        /* =================================================
           PANEL
        ================================================== */

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
