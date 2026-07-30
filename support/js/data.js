/* =========================================================
   NEWSROOM PORTAL
   TEMPORARY DATA STORE
   =========================================================

   ESTE ARCHIVO ES TEMPORAL.

   Actualmente sustituye la información que antes
   obteníamos desde MySQL.

   Posteriormente esta información vendrá de:

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

function obtenerUsuarioPorId(
    id
) {

    return NEWSROOM_USERS.find(
        usuario =>
            Number(usuario.id) ===
            Number(id)
    );

}



/* =========================================================
   OBTENER USUARIO POR NOMBRE
========================================================= */

function obtenerUsuarioPorNombre(
    usuario
) {

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
   CATÁLOGOS TEMPORALES
   ========================================================= */

const NEWSROOM_DIVISIONES = [

    {
        id: 1,
        nombre: "Administración"
    },

    {
        id: 2,
        nombre: "Noticias"
    },

    {
        id: 3,
        nombre: "Producción"
    },

    {
        id: 4,
        nombre: "Editorial"
    }

];


const NEWSROOM_AREAS = [

    {
        id: 1,
        nombre: "Sistemas"
    },

    {
        id: 2,
        nombre: "Recursos Humanos"
    },

    {
        id: 3,
        nombre: "Producción"
    },

    {
        id: 4,
        nombre: "Redacción"
    }

];


const NEWSROOM_CATEGORIAS = [

    {
        id: 1,
        nombre: "Hardware"
    },

    {
        id: 2,
        nombre: "Software"
    },

    {
        id: 3,
        nombre: "Red"
    },

    {
        id: 4,
        nombre: "Impresoras"
    },

    {
        id: 5,
        nombre: "Correo"
    },

    {
        id: 6,
        nombre: "Accesos"
    },

    {
        id: 7,
        nombre: "Otro"
    }

];


/* =========================================================
   TICKETS
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
