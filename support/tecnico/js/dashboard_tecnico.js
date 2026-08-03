/* =========================================================
   NEWSROOM PORTAL
   DASHBOARD TÉCNICO
   FIRESTORE
========================================================= */


/* =========================================================
   VARIABLES
========================================================= */

let tecnicoActual = null;

let ticketsTecnico = [];

let graficaRendimiento = null;

let graficaCategorias = null;

let listenerTickets = null;


/* =========================================================
   INICIO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    iniciarDashboardTecnico
);


/* =========================================================
   INICIAR
========================================================= */

function iniciarDashboardTecnico(){

    console.log(
        "Newsroom Portal: Dashboard Técnico iniciado."
    );


    mostrarFecha();


    const periodo =
        document.getElementById(
            "periodoGrafica"
        );


    if(periodo){

        periodo.addEventListener(
            "change",
            actualizarGraficaRendimiento
        );

    }


    esperarFirebase();

}


/* =========================================================
   ESPERAR FIREBASE
========================================================= */

function esperarFirebase(){

    if(
        window.newsroomAuth &&
        window.newsroomDB
    ){

        iniciarAutenticacion();

        return;

    }


    let intentos = 0;


    const intervalo =
        setInterval(
            () => {

                intentos++;


                if(
                    window.newsroomAuth &&
                    window.newsroomDB
                ){

                    clearInterval(
                        intervalo
                    );


                    iniciarAutenticacion();

                }


                if(
                    intentos >= 50
                ){

                    clearInterval(
                        intervalo
                    );


                    mostrarErrorFirebase();

                }

            },
            200
        );

}


/* =========================================================
   AUTENTICACIÓN
========================================================= */

function iniciarAutenticacion(){

    console.log(
        "Newsroom Portal: Firebase disponible."
    );


    window.newsroomAuth.onAuthStateChanged(
        async usuario => {

            if(!usuario){

                console.warn(
                    "No existe una sesión autenticada."
                );


                window.location.href =
                    "../../login.html";

                return;

            }


            tecnicoActual =
                usuario;


            console.log(
                "Usuario autenticado:",
                usuario.uid,
                usuario.email
            );


            mostrarNombreTecnico(
                usuario
            );


            comenzarEscuchaTickets();

        }
    );

}


/* =========================================================
   ESCUCHAR TICKETS
========================================================= */

function comenzarEscuchaTickets(){

    try{

        const db =
            window.newsroomDB;


        /*
         * Se utiliza la API modular de Firestore
         * expuesta por la instancia existente.
         */


        const ticketsRef =
            window.newsroomTicketsCollection ||
            null;


        if(
            typeof window.newsroomListenTickets ===
            "function"
        ){

            listenerTickets =
                window.newsroomListenTickets(
                    actualizarTickets
                );


            return;

        }


        /*
         * Compatibilidad con Firestore modular.
         */

        if(
            typeof window.newsroomFirestoreCollection ===
            "function"
        ){

            const ref =
                window.newsroomFirestoreCollection(
                    db,
                    "tickets"
                );


            listenerTickets =
                window.newsroomFirestoreOnSnapshot(
                    ref,
                    snapshot => {

                        const tickets =
                            snapshot.docs.map(
                                doc => ({
                                    id:doc.id,
                                    ...doc.data()
                                })
                            );


                        actualizarTickets(
                            tickets
                        );

                    }
                );


            return;

        }


        /*
         * Si el proyecto ya expone
         * firebase.firestore() en window.firebase.
         */

        if(
            window.firebase &&
            typeof window.firebase.firestore ===
            "function"
        ){

            const firestore =
                window.firebase.firestore();


            listenerTickets =
                firestore
                    .collection("tickets")
                    .onSnapshot(
                        snapshot => {

                            const tickets =
                                snapshot.docs.map(
                                    doc => ({
                                        id:doc.id,
                                        ...doc.data()
                                    })
                                );


                            actualizarTickets(
                                tickets
                            );

                        },
                        error => {

                            console.error(
                                "Error Firestore:",
                                error
                            );

                        }
                    );


            return;

        }


        /*
         * No encontramos una API Firestore
         * disponible.
         */

        console.error(
            "No se encontró una instancia Firestore compatible."
        );


        mostrarErrorFirestore();


    }catch(error){

        console.error(
            "Error iniciando Firestore:",
            error
        );


        mostrarErrorFirestore();

    }

}


/* =========================================================
   ACTUALIZAR TICKETS
========================================================= */

function actualizarTickets(
    todosLosTickets
){

    ticketsTecnico =
        todosLosTickets.filter(
            ticket =>
                perteneceAlTecnico(
                    ticket,
                    tecnicoActual
                )
        );


    console.log(
        "Tickets del técnico:",
        ticketsTecnico.length
    );


    mostrarDashboard();


}


/* =========================================================
   VALIDAR TÉCNICO
========================================================= */

function perteneceAlTecnico(
    ticket,
    usuario
){

    if(
        !ticket ||
        !usuario
    ){

        return false;

    }


    const uid =
        normalizar(
            usuario.uid
        );


    const email =
        normalizar(
            usuario.email
        );


    const displayName =
        normalizar(
            usuario.displayName
        );


    /* =====================================================
       TECNICO_ID
    ====================================================== */

    if(
        ticket.tecnico_id
    ){

        if(
            normalizar(
                ticket.tecnico_id
            ) === uid
        ){

            return true;

        }

    }


    /* =====================================================
       TECNICO COMO STRING
    ====================================================== */

    if(
        typeof ticket.tecnico ===
        "string"
    ){

        const tecnico =
            normalizar(
                ticket.tecnico
            );


        if(
            tecnico === uid ||
            tecnico === email
        ){

            return true;

        }

    }


    /* =====================================================
       TECNICO COMO OBJETO
    ====================================================== */

    if(
        ticket.tecnico &&
        typeof ticket.tecnico ===
        "object"
    ){

        const tecnicoUid =
            normalizar(
                ticket.tecnico.uid ||
                ticket.tecnico.id
            );


        const tecnicoEmail =
            normalizar(
                ticket.tecnico.email
            );


        if(
            tecnicoUid === uid ||
            tecnicoEmail === email
        ){

            return true;

        }

    }


    /* =====================================================
       TECNICO_NOMBRE
    ====================================================== */

    if(
        ticket.tecnico_nombre &&
        displayName
    ){

        if(
            normalizar(
                ticket.tecnico_nombre
            ) === displayName
        ){

            return true;

        }

    }


    return false;

}


/* =========================================================
   DASHBOARD
========================================================= */

function mostrarDashboard(){

    document
        .getElementById(
            "dashboardLoading"
        )
        .style.display =
        "none";


    document
        .getElementById(
            "dashboardContent"
        )
        .style.display =
        "block";


    actualizarKPIs();

    actualizarEstados();

    actualizarGraficaRendimiento();

    actualizarGraficaCategorias();

    actualizarAlertas();

    actualizarUltimosTickets();

}


/* =========================================================
   KPIs
========================================================= */

function actualizarKPIs(){

    const asignados =
        ticketsTecnico.length;


    const proceso =
        ticketsTecnico.filter(
            ticket =>
                normalizarEstatus(
                    ticket.estatus
                ) ===
                "en proceso"
        ).length;


    const cerrados =
        ticketsTecnico.filter(
            ticket =>
                esCerrado(
                    ticket.estatus
                )
        ).length;


    const alertas =
        obtenerAlertas().length;


    ponerTexto(
        "kpiAsignados",
        asignados
    );


    ponerTexto(
        "kpiProceso",
        proceso
    );


    ponerTexto(
        "kpiCerrados",
        cerrados
    );


    ponerTexto(
        "kpiAlertas",
        alertas
    );


    ponerTexto(
        "totalHistorico",
        asignados
    );


    ponerTexto(
        "totalPendientes",
        ticketsTecnico.filter(
            ticket =>
                !esCerrado(
                    ticket.estatus
                )
        ).length
    );

}


/* =========================================================
   ESTADOS
========================================================= */

function actualizarEstados(){

    const estados = {

        registrados:0,

        proceso:0,

        espera:0,

        resueltos:0,

        cerrados:0

    };


    ticketsTecnico.forEach(
        ticket => {

            const estado =
                normalizarEstatus(
                    ticket.estatus
                );


            switch(estado){

                case "registrado":

                    estados.registrados++;

                    break;


                case "en proceso":

                    estados.proceso++;

                    break;


                case "en espera":

                    estados.espera++;

                    break;


                case "resuelto":

                    estados.resueltos++;

                    break;


                case "cerrado":

                    estados.cerrados++;

                    break;

            }

        }
    );


    ponerTexto(
        "estadoRegistrados",
        estados.registrados
    );


    ponerTexto(
        "estadoProceso",
        estados.proceso
    );


    ponerTexto(
        "estadoEspera",
        estados.espera
    );


    ponerTexto(
        "estadoResueltos",
        estados.resueltos
    );


    ponerTexto(
        "estadoCerrados",
        estados.cerrados
    );

}


/* =========================================================
   RENDIMIENTO
========================================================= */

function actualizarGraficaRendimiento(){

    if(
        typeof Chart ===
        "undefined"
    ){

        return;

    }


    const selector =
        document.getElementById(
            "periodoGrafica"
        );


    const periodo =
        selector
            ? selector.value
            : "30";


    const dias =
        obtenerDias(
            periodo
        );


    const cantidades =
        dias.map(
            dia => {

                return ticketsTecnico.filter(
                    ticket => {

                        /*
                         * Para rendimiento contamos
                         * tickets que hayan sido atendidos,
                         * resueltos o cerrados.
                         */

                        if(
                            !esTicketAtendido(
                                ticket
                            )
                        ){

                            return false;

                        }


                        const fecha =
                            obtenerFechaAtencion(
                                ticket
                            );


                        if(!fecha){

                            return false;

                        }


                        return mismoDia(
                            fecha,
                            dia
                        );

                    }
                ).length;

            }
        );


    const labels =
        dias.map(
            dia =>
                dia.toLocaleDateString(
                    "es-MX",
                    {
                        day:"2-digit",
                        month:"short"
                    }
                )
        );


    const canvas =
        document.getElementById(
            "graficaRendimiento"
        );


    if(!canvas){

        return;

    }


    if(graficaRendimiento){

        graficaRendimiento.destroy();

    }


    graficaRendimiento =
        new Chart(
            canvas,
            {

                type:"line",

                data:{

                    labels,

                    datasets:[

                        {

                            label:
                                "Tickets atendidos",

                            data:
                                cantidades,

                            borderColor:
                                "#c8102e",

                            backgroundColor:
                                "rgba(200,16,46,.10)",

                            borderWidth:3,

                            pointRadius:3,

                            pointHoverRadius:6,

                            fill:true,

                            tension:.35

                        }

                    ]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false,

                    interaction:{

                        intersect:false,

                        mode:"index"

                    },

                    plugins:{

                        legend:{

                            display:true

                        },

                        tooltip:{

                            callbacks:{

                                label:
                                    context =>
                                        ` ${context.parsed.y} ticket${
                                            context.parsed.y === 1
                                                ? ""
                                                : "s"
                                        }`

                            }

                        }

                    },

                    scales:{

                        y:{

                            beginAtZero:true,

                            ticks:{

                                precision:0

                            },

                            grid:{

                                color:
                                    "rgba(0,0,0,.06)"

                            }

                        },

                        x:{

                            grid:{

                                display:false

                            }

                        }

                    }

                }

            }
        );

}


/* =========================================================
   OBTENER DÍAS
========================================================= */

function obtenerDias(
    periodo
){

    const hoy =
        new Date();


    hoy.setHours(
        0,
        0,
        0,
        0
    );


    const dias = [];


    if(
        periodo ===
        "year"
    ){

        const inicio =
            new Date(
                hoy.getFullYear(),
                0,
                1
            );


        for(
            let fecha =
                new Date(inicio);

            fecha <= hoy;

            fecha.setDate(
                fecha.getDate() + 1
            )

        ){

            dias.push(
                new Date(fecha)
            );

        }


        return dias;

    }


    if(
        periodo ===
        "month"
    ){

        const inicio =
            new Date(
                hoy.getFullYear(),
                hoy.getMonth(),
                1
            );


        for(
            let fecha =
                new Date(inicio);

            fecha <= hoy;

            fecha.setDate(
                fecha.getDate() + 1
            )

        ){

            dias.push(
                new Date(fecha)
            );

        }


        return dias;

    }


    const cantidad =
        Number(periodo);


    for(
        let i =
            cantidad - 1;

        i >= 0;

        i--
    ){

        const fecha =
            new Date(hoy);


        fecha.setDate(
            hoy.getDate() - i
        );


        dias.push(
            fecha
        );

    }


    return dias;

}


/* =========================================================
   CATEGORÍAS
========================================================= */

function actualizarGraficaCategorias(){

    if(
        typeof Chart ===
        "undefined"
    ){

        return;

    }


    const categorias = {};


    ticketsTecnico.forEach(
        ticket => {

            const categoria =
                obtenerCategoria(
                    ticket
                );


            categorias[categoria] =
                (
                    categorias[categoria] ||
                    0
                ) + 1;

        }
    );


    const nombres =
        Object.keys(
            categorias
        );


    const valores =
        Object.values(
            categorias
        );


    const canvas =
        document.getElementById(
            "graficaCategorias"
        );


    if(!canvas){

        return;

    }


    if(graficaCategorias){

        graficaCategorias.destroy();

    }


    if(
        nombres.length ===
        0
    ){

        nombres.push(
            "Sin datos"
        );

        valores.push(
            1
        );

    }


    graficaCategorias =
        new Chart(
            canvas,
            {

                type:"doughnut",

                data:{

                    labels:nombres,

                    datasets:[

                        {

                            data:valores,

                            backgroundColor:[

                                "#c8102e",

                                "#1570ef",

                                "#00ae42",

                                "#f79009",

                                "#7f56d9",

                                "#667085",

                                "#12b76a",

                                "#98a2b3"

                            ],

                            borderWidth:3,

                            borderColor:"#ffffff"

                        }

                    ]

                },

                options:{

                    responsive:true,

                    maintainAspectRatio:false,

                    cutout:"64%",

                    plugins:{

                        legend:{

                            display:false

                        }

                    }

                }

            }
        );


    actualizarLeyenda(
        categorias
    );

}


/* =========================================================
   LEYENDA
========================================================= */

function actualizarLeyenda(
    categorias
){

    const contenedor =
        document.getElementById(
            "leyendaCategorias"
        );


    if(!contenedor){

        return;

    }


    contenedor.innerHTML =
        "";


    const total =
        Object.values(
            categorias
        )
            .reduce(
                (
                    suma,
                    valor
                ) =>
                    suma + valor,
                0
            );


    Object.entries(
        categorias
    )
        .sort(
            (
                a,
                b
            ) =>
                b[1] - a[1]
        )
        .forEach(
            (
                [
                    categoria,
                    cantidad
                ]
            ) => {

                const porcentaje =
                    total
                        ? Math.round(
                            (
                                cantidad /
                                total
                            ) * 100
                        )
                        : 0;


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "category-item";


                item.innerHTML = `

                    <span>
                        ${escapeHTML(
                            categoria
                        )}
                    </span>

                    <strong>
                        ${porcentaje}%
                    </strong>

                `;


                contenedor.appendChild(
                    item
                );

            }
        );

}


/* =========================================================
   ALERTAS
========================================================= */

function obtenerAlertas(){

    const ahora =
        Date.now();


    return ticketsTecnico.filter(
        ticket => {

            if(
                esCerrado(
                    ticket.estatus
                )
            ){

                return false;

            }


            const fecha =
                obtenerFechaActualizacion(
                    ticket
                );


            if(!fecha){

                return false;

            }


            const horas =
                (
                    ahora -
                    fecha.getTime()
                ) /
                3600000;


            const prioridad =
                normalizar(
                    ticket.prioridad
                );


            /*
             * CRÍTICA
             */

            if(
                prioridad ===
                "critica"
            ){

                return horas >= 2;

            }


            /*
             * ALTA
             */

            if(
                prioridad ===
                "alta"
            ){

                return horas >= 4;

            }


            /*
             * MEDIA
             */

            if(
                prioridad ===
                "media"
            ){

                return horas >= 8;

            }


            /*
             * NORMAL / BAJA
             */

            return horas >= 24;

        }
    );

}


/* =========================================================
   MOSTRAR ALERTAS
========================================================= */

function actualizarAlertas(){

    const alertas =
        obtenerAlertas();


    ponerTexto(
        "contadorAlertas",
        alertas.length
    );


    const contenedor =
        document.getElementById(
            "ticketsAlertados"
        );


    if(!contenedor){

        return;

    }


    if(
        alertas.length ===
        0
    ){

        contenedor.innerHTML = `

            <div class="empty-state">

                <i class="fa-solid fa-circle-check"></i>

                <strong>
                    Todo está bajo control
                </strong>

                <span>
                    No tienes tickets que requieran atención.
                </span>

            </div>

        `;

        return;

    }


    contenedor.innerHTML =
        "";


    alertas
        .sort(
            (
                a,
                b
            ) =>
                obtenerFechaActualizacion(b) -
                obtenerFechaActualizacion(a)
        )
        .forEach(
            ticket => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "alert-ticket";


                const fecha =
                    obtenerFechaActualizacion(
                        ticket
                    );


                const prioridad =
                    normalizar(
                        ticket.prioridad ||
                        "normal"
                    );


                item.innerHTML = `

                    <div class="alert-ticket-main">

                        <strong>
                            ${escapeHTML(
                                ticket.folio ||
                                ticket.id
                            )}
                        </strong>

                        <span>
                            ${escapeHTML(
                                ticket.titulo ||
                                ticket.asunto ||
                                ticket.descripcion ||
                                "Sin título"
                            )}
                        </span>

                    </div>


                    <div class="alert-ticket-meta">

                        <span class="alert-priority priority-${prioridad}">

                            ${escapeHTML(
                                ticket.prioridad ||
                                "Normal"
                            )}

                        </span>


                        <small>

                            ${tiempoTranscurrido(
                                fecha
                            )}

                        </small>

                    </div>

                `;


                item.addEventListener(
                    "click",
                    () =>
                        abrirTicket(
                            ticket
                        )
                );


                contenedor.appendChild(
                    item
                );

            }
        );

}


/* =========================================================
   ÚLTIMOS TICKETS
========================================================= */

function actualizarUltimosTickets(){

    const cuerpo =
        document.getElementById(
            "ultimosTickets"
        );


    if(!cuerpo){

        return;

    }


    const tickets =
        [...ticketsTecnico]
            .sort(
                (
                    a,
                    b
                ) =>
                    obtenerFechaActualizacion(b) -
                    obtenerFechaActualizacion(a)
            )
            .slice(
                0,
                10
            );


    if(
        tickets.length ===
        0
    ){

        cuerpo.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="table-empty"
                >

                    No tienes tickets registrados.

                </td>

            </tr>

        `;

        return;

    }


    cuerpo.innerHTML =
        "";


    tickets.forEach(
        ticket => {

            const fila =
                document.createElement(
                    "tr"
                );


            const estado =
                normalizarEstatus(
                    ticket.estatus
                );


            const fecha =
                obtenerFechaActualizacion(
                    ticket
                );


            const prioridad =
                normalizar(
                    ticket.prioridad ||
                    "normal"
                );


            fila.innerHTML = `

                <td>

                    <span class="ticket-folio">

                        ${escapeHTML(
                            ticket.folio ||
                            ticket.id
                        )}

                    </span>

                </td>


                <td>

                    ${escapeHTML(
                        ticket.titulo ||
                        ticket.asunto ||
                        ticket.descripcion ||
                        "Sin título"
                    )}

                </td>


                <td>

                    ${escapeHTML(
                        obtenerCategoria(
                            ticket
                        )
                    )}

                </td>


                <td>

                    <span
                        class="ticket-priority priority-${prioridad}"
                    >

                        ${escapeHTML(
                            ticket.prioridad ||
                            "Normal"
                        )}

                    </span>

                </td>


                <td>

                    <span
                        class="ticket-status status-${estado.replace(
                            / /g,
                            "-"
                        )}"
                    >

                        ${escapeHTML(
                            ticket.estatus ||
                            "Registrado"
                        )}

                    </span>

                </td>


                <td>

                    ${
                        fecha
                            ? fecha.toLocaleString(
                                "es-MX",
                                {
                                    day:"2-digit",
                                    month:"2-digit",
                                    hour:"2-digit",
                                    minute:"2-digit"
                                }
                            )
                            : "--"
                    }

                </td>

            `;


            fila.addEventListener(
                "click",
                () =>
                    abrirTicket(
                        ticket
                    )
            );


            cuerpo.appendChild(
                fila
            );

        }
    );

}


/* =========================================================
   ABRIR TICKET
========================================================= */

function abrirTicket(
    ticket
){

    if(
        !ticket ||
        !ticket.id
    ){

        return;

    }


    /*
     * Ajustaremos esta ruta cuando
     * dejemos definido el detalle
     * definitivo de tickets.
     */

    window.location.href =
        `../tickets/ticket.html?id=${encodeURIComponent(
            ticket.id
        )}`;

}


/* =========================================================
   TICKET ATENDIDO
========================================================= */

function esTicketAtendido(
    ticket
){

    const estado =
        normalizarEstatus(
            ticket.estatus
        );


    return [

        "en proceso",

        "resuelto",

        "cerrado"

    ].includes(
        estado
    );

}


/* =========================================================
   FECHA DE ATENCIÓN
========================================================= */

function obtenerFechaAtencion(
    ticket
){

    return convertirFecha(

        ticket.fecha_resolucion ||

        ticket.fecha_resuelto ||

        ticket.fecha_cierre ||

        ticket.updatedAt ||

        ticket.fecha_actualizacion ||

        ticket.fecha_modificacion ||

        ticket.fecha_creacion ||

        ticket.createdAt ||

        ticket.fecha

    );

}


/* =========================================================
   FECHA ACTUALIZACIÓN
========================================================= */

function obtenerFechaActualizacion(
    ticket
){

    return convertirFecha(

        ticket.updatedAt ||

        ticket.fecha_actualizacion ||

        ticket.fecha_modificacion ||

        ticket.fecha_resolucion ||

        ticket.fecha_cierre ||

        ticket.fecha_creacion ||

        ticket.createdAt ||

        ticket.fecha

    );

}


/* =========================================================
   CATEGORÍA
========================================================= */

function obtenerCategoria(
    ticket
){

    if(
        typeof ticket.categoria ===
        "string"
    ){

        return (
            ticket.categoria ||
            "Sin categoría"
        );

    }


    if(
        ticket.categoria &&
        typeof ticket.categoria ===
        "object"
    ){

        return (

            ticket.categoria.nombre ||

            ticket.categoria.name ||

            ticket.categoria.id ||

            "Sin categoría"

        );

    }


    if(
        ticket.categoria_nombre
    ){

        return String(
            ticket.categoria_nombre
        );

    }


    if(
        ticket.categoria_id
    ){

        return String(
            ticket.categoria_id
        );

    }


    return "Sin categoría";

}


/* =========================================================
   ESTATUS
========================================================= */

function normalizarEstatus(
    estatus
){

    const estado =
        normalizar(
            estatus
        );


    if(
        [
            "registrado",
            "nuevo",
            "abierto"
        ].includes(
            estado
        )
    ){

        return "registrado";

    }


    if(
        [
            "en proceso",
            "proceso",
            "en progreso",
            "asignado"
        ].includes(
            estado
        )
    ){

        return "en proceso";

    }


    if(
        [
            "en espera",
            "espera",
            "pendiente"
        ].includes(
            estado
        )
    ){

        return "en espera";

    }


    if(
        [
            "resuelto",
            "solucionado"
        ].includes(
            estado
        )
    ){

        return "resuelto";

    }


    if(
        [
            "cerrado",
            "finalizado"
        ].includes(
            estado
        )
    ){

        return "cerrado";

    }


    return estado;

}


/* =========================================================
   CERRADO
========================================================= */

function esCerrado(
    estatus
){

    return [

        "resuelto",

        "cerrado"

    ].includes(
        normalizarEstatus(
            estatus
        )
    );

}


/* =========================================================
   FECHA
========================================================= */

function convertirFecha(
    valor
){

    if(!valor){

        return null;

    }


    if(
        valor instanceof Date
    ){

        return valor;

    }


    if(
        typeof valor.toDate ===
        "function"
    ){

        return valor.toDate();

    }


    if(
        typeof valor ===
        "number"
    ){

        const fecha =
            new Date(
                valor
            );


        return isNaN(
            fecha.getTime()
        )
            ? null
            : fecha;

    }


    if(
        typeof valor ===
        "string"
    ){

        const fecha =
            new Date(
                valor
            );


        return isNaN(
            fecha.getTime()
        )
            ? null
            : fecha;

    }


    return null;

}


/* =========================================================
   MISMO DÍA
========================================================= */

function mismoDia(
    fechaA,
    fechaB
){

    return (

        fechaA.getFullYear() ===
        fechaB.getFullYear()

        &&

        fechaA.getMonth() ===
        fechaB.getMonth()

        &&

        fechaA.getDate() ===
        fechaB.getDate()

    );

}


/* =========================================================
   TIEMPO TRANSCURRIDO
========================================================= */

function tiempoTranscurrido(
    fecha
){

    if(!fecha){

        return "Sin fecha";

    }


    const diferencia =
        Date.now() -
        fecha.getTime();


    const minutos =
        Math.floor(
            diferencia /
            60000
        );


    if(
        minutos < 60
    ){

        return `Hace ${minutos} min`;

    }


    const horas =
        Math.floor(
            minutos /
            60
        );


    if(
        horas < 24
    ){

        return `Hace ${horas} h`;

    }


    const dias =
        Math.floor(
            horas /
            24
        );


    return `Hace ${dias} ${
        dias === 1
            ? "día"
            : "días"
    }`;

}


/* =========================================================
   NOMBRE
========================================================= */

function mostrarNombreTecnico(
    usuario
){

    const nombre =
        usuario.displayName ||
        usuario.email ||
        "Técnico";


    ponerTexto(
        "tecnicoNombre",
        nombre
    );

}


/* =========================================================
   FECHA ACTUAL
========================================================= */

function mostrarFecha(){

    ponerTexto(

        "fechaActual",

        new Date()
            .toLocaleDateString(
                "es-MX",
                {
                    weekday:"long",
                    day:"numeric",
                    month:"long",
                    year:"numeric"
                }
            )

    );

}


/* =========================================================
   NORMALIZAR
========================================================= */

function normalizar(
    texto
){

    return String(
        texto || ""
    )
        .trim()
        .toLowerCase()
        .normalize(
            "NFD"
        )
        .replace(
            /[\u0300-\u036f]/g,
            ""
        );

}


/* =========================================================
   TEXTO SEGURO
========================================================= */

function escapeHTML(
    texto
){

    return String(
        texto || ""
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


/* =========================================================
   PONER TEXTO
========================================================= */

function ponerTexto(
    id,
    valor
){

    const elemento =
        document.getElementById(
            id
        );


    if(elemento){

        elemento.textContent =
            valor;

    }

}


/* =========================================================
   ERROR FIREBASE
========================================================= */

function mostrarErrorFirebase(){

    const loading =
        document.getElementById(
            "dashboardLoading"
        );


    if(!loading){

        return;

    }


    loading.innerHTML = `

        <div class="text-center">

            <i
                class="fa-solid fa-triangle-exclamation text-danger"
                style="font-size:40px;"
            ></i>

            <h4 class="mt-3">
                Firebase no está disponible
            </h4>

            <p class="text-muted">
                No se pudo inicializar la sesión del técnico.
            </p>

        </div>

    `;

}


/* =========================================================
   ERROR FIRESTORE
========================================================= */

function mostrarErrorFirestore(){

    const loading =
        document.getElementById(
            "dashboardLoading"
        );


    if(!loading){

        return;

    }


    loading.innerHTML = `

        <div class="text-center">

            <i
                class="fa-solid fa-database text-danger"
                style="font-size:40px;"
            ></i>

            <h4 class="mt-3">
                No se pudo conectar con Firestore
            </h4>

            <p class="text-muted">
                Revisa la configuración de Firebase y las reglas de Firestore.
            </p>

        </div>

    `;

}


/* =========================================================
   FIN
========================================================= */

console.log(
    "Newsroom Portal: dashboard_tecnico.js cargado."
);
