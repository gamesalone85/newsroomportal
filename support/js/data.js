/* =========================================================
   NEWSROOM PORTAL
   TEMPORARY DATA STORE
   =========================================================

   ESTE ARCHIVO ES TEMPORAL.

   Actualmente sustituye la información que antes
   obteníamos desde MySQL.

   Posteriormente esta información podrá venir desde:

       Firebase
       Supabase
       API propia
       Base de datos externa

   NO almacenar contraseñas reales aquí.

   ========================================================= */


/* =========================================================
   USUARIOS TEMPORALES
========================================================= */

const NEWSROOM_USERS = [

    {
        id: 1,
        usuario: "admin",
        nombre: "Administrador",
        correo: "admin@newsroomportal.com",
        rol_id: 1,
        rol: "Administrador",
        estado: "Activo"
    },

    {
        id: 2,
        usuario: "support",
        nombre: "Support",
        correo: "support@newsroomportal.com",
        rol_id: 2,
        rol: "Support",
        estado: "Activo"
    },

    {
        id: 3,
        usuario: "rooms",
        nombre: "Rooms",
        correo: "rooms@newsroomportal.com",
        rol_id: 3,
        rol: "Rooms",
        estado: "Activo"
    },

    {
        id: 4,
        usuario: "roomsadmin",
        nombre: "Administrador Rooms",
        correo: "roomsadmin@newsroomportal.com",
        rol_id: 4,
        rol: "Rooms Admin",
        estado: "Activo"
    },

    {
        id: 5,
        usuario: "vehicular",
        nombre: "Administración Vehicular",
        correo: "vehicular@newsroomportal.com",
        rol_id: 5,
        rol: "Vehicular",
        estado: "Activo"
    },

    {
        id: 6,
        usuario: "credencializacion",
        nombre: "Credencialización",
        correo: "credencializacion@newsroomportal.com",
        rol_id: 7,
        rol: "Credencialización",
        estado: "Activo"
    },

    {
        id: 7,
        usuario: "capitalhumano",
        nombre: "Capital Humano",
        correo: "capitalhumano@newsroomportal.com",
        rol_id: 8,
        rol: "Capital Humano",
        estado: "Activo"
    }

];


/* =========================================================
   OBTENER TODOS LOS USUARIOS
========================================================= */

function obtenerUsuarios() {

    return NEWSROOM_USERS;

}


/* =========================================================
   OBTENER USUARIO POR ID
========================================================= */

function obtenerUsuarioPorId(id) {

    return NEWSROOM_USERS.find(
        usuario =>
            Number(usuario.id) ===
            Number(id)
    );

}


/* =========================================================
   OBTENER USUARIO POR NOMBRE
========================================================= */

function obtenerUsuarioPorNombre(usuario) {

    if (!usuario) {

        return null;

    }

    return NEWSROOM_USERS.find(
        item =>
            item.usuario
                .toLowerCase() ===
            String(usuario)
                .trim()
                .toLowerCase()
    );

}


/* =========================================================
   OBTENER USUARIOS ACTIVOS
========================================================= */

function obtenerUsuariosActivos() {

    return NEWSROOM_USERS.filter(
        usuario =>
            usuario.estado ===
            "Activo"
    );

}


/* =========================================================
   OBTENER USUARIOS SUSPENDIDOS
========================================================= */

function obtenerUsuariosSuspendidos() {

    return NEWSROOM_USERS.filter(
        usuario =>
            usuario.estado ===
            "Suspendido"
    );

}


/* =========================================================
   CONTADORES
========================================================= */

function obtenerEstadisticasUsuarios() {

    const total =
        NEWSROOM_USERS.length;

    const activos =
        NEWSROOM_USERS.filter(
            usuario =>
                usuario.estado ===
                "Activo"
        ).length;

    const suspendidos =
        NEWSROOM_USERS.filter(
            usuario =>
                usuario.estado ===
                "Suspendido"
        ).length;

    return {

        total:
            total,

        activos:
            activos,

        suspendidos:
            suspendidos

    };

}


/* =========================================================
   CATÁLOGO DE DIVISIONES
=========================================================

   ESTRUCTURA ORGANIZACIONAL

   DNI
   DUCTER
   FSN

========================================================= */

const NEWSROOM_DIVISIONES = [

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


/* =========================================================
   CATÁLOGO DE ÁREAS
=========================================================

   La propiedad division_id permitirá posteriormente
   relacionar cada área con una división específica.

   Actualmente se utiliza:

       "TODAS"

   cuando el área puede pertenecer a cualquier división.

========================================================= */

const NEWSROOM_AREAS = [

    {
        id: "CONT",
        nombre: "Contabilidad",
        division_id: "TODAS"
    },

    {
        id: "TES",
        nombre: "Tesorería",
        division_id: "TODAS"
    },

    {
        id: "SIST",
        nombre: "Sistemas",
        division_id: "TODAS"
    },

    {
        id: "ACT",
        nombre: "Activo Fijo",
        division_id: "TODAS"
    },

    {
        id: "ARCH",
        nombre: "Archivo",
        division_id: "TODAS"
    },

    {
        id: "COMP",
        nombre: "Compras",
        division_id: "TODAS"
    },

    {
        id: "CXP",
        nombre: "Cuentas por Pagar",
        division_id: "TODAS"
    },

    {
        id: "CXC",
        nombre: "Cuentas por Cobrar",
        division_id: "TODAS"
    },

    {
        id: "REG",
        nombre: "Regulación",
        division_id: "TODAS"
    },

    {
        id: "DIR",
        nombre: "Dirección",
        division_id: "TODAS"
    },

    {
        id: "RH",
        nombre: "Recursos Humanos",
        division_id: "TODAS"
    },

    {
        id: "JUR",
        nombre: "Jurídico",
        division_id: "TODAS"
    },

    {
        id: "ADM",
        nombre: "Administración",
        division_id: "TODAS"
    },

    {
        id: "FIN",
        nombre: "Finanzas",
        division_id: "TODAS"
    },

    {
        id: "AUD",
        nombre: "Auditoría",
        division_id: "TODAS"
    },

    {
        id: "CONTR",
        nombre: "Contraloría",
        division_id: "TODAS"
    },

    {
        id: "OPER",
        nombre: "Operaciones",
        division_id: "TODAS"
    },

    {
        id: "LOG",
        nombre: "Logística",
        division_id: "TODAS"
    },

    {
        id: "ALM",
        nombre: "Almacén",
        division_id: "TODAS"
    },

    {
        id: "MANT",
        nombre: "Mantenimiento",
        division_id: "TODAS"
    },

    {
        id: "CAL",
        nombre: "Calidad",
        division_id: "TODAS"
    },

    {
        id: "PROY",
        nombre: "Proyectos",
        division_id: "TODAS"
    },

    {
        id: "PLANE",
        nombre: "Planeación",
        division_id: "TODAS"
    },

    {
        id: "PROC",
        nombre: "Procesos",
        division_id: "TODAS"
    },

    {
        id: "CUM",
        nombre: "Cumplimiento",
        division_id: "TODAS"
    },

    {
        id: "SEG",
        nombre: "Seguridad",
        division_id: "TODAS"
    },

    {
        id: "COMEX",
        nombre: "Comercio Exterior",
        division_id: "TODAS"
    },

    {
        id: "IMP",
        nombre: "Impuestos",
        division_id: "TODAS"
    },

    {
        id: "NOM",
        nombre: "Nómina",
        division_id: "TODAS"
    },

    {
        id: "CAP",
        nombre: "Capacitación",
        division_id: "TODAS"
    },

    {
        id: "DES",
        nombre: "Desarrollo Organizacional",
        division_id: "TODAS"
    },

    {
        id: "RECEP",
        nombre: "Recepción",
        division_id: "TODAS"
    },

    {
        id: "ATC",
        nombre: "Atención a Clientes",
        division_id: "TODAS"
    },

    {
        id: "DOC",
        nombre: "Documentación",
        division_id: "TODAS"
    },

    {
        id: "INFRA",
        nombre: "Infraestructura",
        division_id: "TODAS"
    },

    {
        id: "DAT",
        nombre: "Datos / BI",
        division_id: "TODAS"
    },

    {
        id: "SOP",
        nombre: "Soporte",
        division_id: "TODAS"
    },

    {
        id: "PRES",
        nombre: "Presupuesto",
        division_id: "TODAS"
    },

    {
        id: "RIES",
        nombre: "Riesgos",
        division_id: "TODAS"
    },

    {
        id: "CONTROL",
        nombre: "Control Interno",
        division_id: "TODAS"
    },

    {
        id: "COMERCIAL",
        nombre: "Comercial / Ventas",
        division_id: "TODAS"
    },

    {
        id: "MKT",
        nombre: "Marketing",
        division_id: "TODAS"
    }

];


/* =========================================================
   CATÁLOGO DE CATEGORÍAS
=========================================================

   Estas categorías corresponden al servicio de TI.

   Se mantienen los conceptos que ya existían y se
   amplía el catálogo para cubrir las incidencias y
   solicitudes más comunes.

========================================================= */

const NEWSROOM_CATEGORIAS = [

    {
        id: "HARDWARE",
        nombre: "Hardware"
    },

    {
        id: "SOFTWARE",
        nombre: "Software"
    },

    {
        id: "RED",
        nombre: "Red / Conectividad"
    },

    {
        id: "IMPRESORAS",
        nombre: "Impresoras"
    },

    {
        id: "CORREO",
        nombre: "Correo Electrónico"
    },

    {
        id: "ACCESOS",
        nombre: "Accesos y Permisos"
    },

    {
        id: "CUENTAS",
        nombre: "Cuentas de Usuario"
    },

    {
        id: "INTERNET",
        nombre: "Internet"
    },

    {
        id: "TELEFONIA",
        nombre: "Telefonía"
    },

    {
        id: "SERVIDORES",
        nombre: "Servidores"
    },

    {
        id: "SISTEMAS",
        nombre: "Sistemas / Aplicaciones"
    },

    {
        id: "SEGURIDAD",
        nombre: "Seguridad Informática"
    },

    {
        id: "BACKUP",
        nombre: "Respaldos"
    },

    {
        id: "DATOS",
        nombre: "Datos / Información"
    },

    {
        id: "PERIFERICOS",
        nombre: "Periféricos"
    },

    {
        id: "EQUIPOS",
        nombre: "Equipos de Cómputo"
    },

    {
        id: "MANTENIMIENTO",
        nombre: "Mantenimiento"
    },

    {
        id: "INSTALACION",
        nombre: "Instalación / Configuración"
    },

    {
        id: "ACTUALIZACION",
        nombre: "Actualización"
    },

    {
        id: "SOLICITUD",
        nombre: "Solicitud de Servicio"
    },

    {
        id: "OTRO",
        nombre: "Otro"
    }

];


/* =========================================================
   TICKETS TEMPORALES
========================================================= */

const NEWSROOM_TICKETS = [];


/* =========================================================
   FUNCIONES DE ACCESO
========================================================= */

function obtenerDivisiones() {

    return NEWSROOM_DIVISIONES;

}


function obtenerAreas() {

    return NEWSROOM_AREAS;

}


function obtenerCategorias() {

    return NEWSROOM_CATEGORIAS;

}


function obtenerTickets() {

    return JSON.parse(
        localStorage.getItem(
            "newsroomTickets"
        )
    ) || [];

}
