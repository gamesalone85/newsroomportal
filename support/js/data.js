/* =========================================================
   NEWSROOM PORTAL
   DATA / CATÁLOGOS
   =========================================================

   ESTE ARCHIVO CONTIENE CATÁLOGOS GENERALES DEL SISTEMA.

   IMPORTANTE:

   Estos catálogos NO dependen de que existan tickets.

   Por ejemplo:

   Aunque actualmente no exista ningún ticket
   del área "Capital Humano", el área seguirá
   disponible en los filtros.

   Posteriormente estos catálogos podrán migrarse
   también a Firebase / Firestore.

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
   USUARIOS
========================================================= */

function obtenerUsuarios() {

    return NEWSROOM_USERS;

}


function obtenerUsuarioPorId(id) {

    return NEWSROOM_USERS.find(
        usuario =>
            Number(usuario.id) ===
            Number(id)
    );

}


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


function obtenerUsuariosActivos() {

    return NEWSROOM_USERS.filter(
        usuario =>
            usuario.estado ===
            "Activo"
    );

}


function obtenerUsuariosSuspendidos() {

    return NEWSROOM_USERS.filter(
        usuario =>
            usuario.estado ===
            "Suspendido"
    );

}


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
   DIVISIONES
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
    },

    {
        id: 5,
        nombre: "Operaciones"
    },

    {
        id: 6,
        nombre: "Recursos Humanos"
    },

    {
        id: 7,
        nombre: "Tecnología"
    },

    {
        id: 8,
        nombre: "Dirección"
    }

];



/* =========================================================
   ÁREAS
========================================================= */

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
    },

    {
        id: 5,
        nombre: "Administración"
    },

    {
        id: 6,
        nombre: "Contabilidad"
    },

    {
        id: 7,
        nombre: "Finanzas"
    },

    {
        id: 8,
        nombre: "Compras"
    },

    {
        id: 9,
        nombre: "Operaciones"
    },

    {
        id: 10,
        nombre: "Noticias"
    },

    {
        id: 11,
        nombre: "Editorial"
    },

    {
        id: 12,
        nombre: "Video"
    },

    {
        id: 13,
        nombre: "Audio"
    },

    {
        id: 14,
        nombre: "Fotografía"
    },

    {
        id: 15,
        nombre: "Diseño"
    },

    {
        id: 16,
        nombre: "Investigación"
    },

    {
        id: 17,
        nombre: "Digital"
    },

    {
        id: 18,
        nombre: "Marketing"
    },

    {
        id: 19,
        nombre: "Comunicación"
    },

    {
        id: 20,
        nombre: "Logística"
    },

    {
        id: 21,
        nombre: "Seguridad"
    },

    {
        id: 22,
        nombre: "Mantenimiento"
    },

    {
        id: 23,
        nombre: "Recepción"
    },

    {
        id: 24,
        nombre: "Credencialización"
    },

    {
        id: 25,
        nombre: "Administración Vehicular"
    },

    {
        id: 26,
        nombre: "Capital Humano"
    },

    {
        id: 27,
        nombre: "Dirección"
    }

];



/* =========================================================
   CATEGORÍAS
========================================================= */

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
        nombre: "Telefonía"
    },

    {
        id: 8,
        nombre: "Internet"
    },

    {
        id: 9,
        nombre: "Sistemas"
    },

    {
        id: 10,
        nombre: "Seguridad"
    },

    {
        id: 11,
        nombre: "Cuentas"
    },

    {
        id: 12,
        nombre: "Equipos"
    },

    {
        id: 13,
        nombre: "Aplicaciones"
    },

    {
        id: 14,
        nombre: "Permisos"
    },

    {
        id: 15,
        nombre: "Otro"
    }

];



/* =========================================================
   TICKETS TEMPORALES
========================================================= */

const NEWSROOM_TICKETS = [];



/* =========================================================
   ACCESO A CATÁLOGOS
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
