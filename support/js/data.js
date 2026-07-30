/* =========================================================
   NEWSROOM PORTAL
   TEMPORARY DATA STORE
   =========================================================

   Este archivo sustituye temporalmente la base de datos.

   Actualmente:

       localStorage

   Futuramente:

       Firebase
       Supabase
       Google
       API propia
       Otra base de datos

   IMPORTANTE:

   NO se almacenan contraseñas reales aquí.

   La contraseña solamente se utiliza durante el
   proceso temporal de autenticación.

   ========================================================= */


/* =========================================================
   ROLES DEL SISTEMA
========================================================= */

const NEWSROOM_ROLES = [

    {
        id: 1,
        nombre: "Administrador"
    },

    {
        id: 2,
        nombre: "Support"
    },

    {
        id: 3,
        nombre: "Rooms"
    },

    {
        id: 4,
        nombre: "Rooms Admin"
    },

    {
        id: 5,
        nombre: "Vehicular"
    },

    {
        id: 7,
        nombre: "Credencialización"
    },

    {
        id: 8,
        nombre: "Capital Humano"
    }

];



/* =========================================================
   USUARIOS INICIALES
========================================================= */

const NEWSROOM_DEFAULT_USERS = [

    {
        id: 1,

        nombre:
            "Administrador",

        usuario:
            "admin",

        correo:
            "admin@newsroom.local",

        rol_id:
            1,

        rol:
            "Administrador",

        estado:
            "Activo"
    },


    {
        id: 2,

        nombre:
            "Usuario Support",

        usuario:
            "support",

        correo:
            "support@newsroom.local",

        rol_id:
            2,

        rol:
            "Support",

        estado:
            "Activo"
    },


    {
        id: 3,

        nombre:
            "Usuario Rooms",

        usuario:
            "rooms",

        correo:
            "rooms@newsroom.local",

        rol_id:
            3,

        rol:
            "Rooms",

        estado:
            "Suspendido"
    },


    {
        id: 4,

        nombre:
            "Administrador Rooms",

        usuario:
            "roomsadmin",

        correo:
            "roomsadmin@newsroom.local",

        rol_id:
            4,

        rol:
            "Rooms Admin",

        estado:
            "Activo"
    },


    {
        id: 5,

        nombre:
            "Administrador Vehicular",

        usuario:
            "vehicular",

        correo:
            "vehicular@newsroom.local",

        rol_id:
            5,

        rol:
            "Vehicular",

        estado:
            "Activo"
    },


    {
        id: 7,

        nombre:
            "Credencialización",

        usuario:
            "credencializacion",

        correo:
            "credencializacion@newsroom.local",

        rol_id:
            7,

        rol:
            "Credencialización",

        estado:
            "Activo"
    },


    {
        id: 8,

        nombre:
            "Capital Humano",

        usuario:
            "capitalhumano",

        correo:
            "capital@newsroom.local",

        rol_id:
            8,

        rol:
            "Capital Humano",

        estado:
            "Activo"
    }

];



/* =========================================================
   OBTENER USUARIOS
========================================================= */

function obtenerUsuarios() {


    const data =
        localStorage.getItem(
            "newsroomUsuarios"
        );


    if (!data) {


        const iniciales =
            JSON.parse(
                JSON.stringify(
                    NEWSROOM_DEFAULT_USERS
                )
            );


        localStorage.setItem(
            "newsroomUsuarios",
            JSON.stringify(iniciales)
        );


        return iniciales;

    }


    try {

        return JSON.parse(data);

    } catch (error) {


        console.error(
            "Newsroom Portal: datos de usuarios inválidos.",
            error
        );


        localStorage.removeItem(
            "newsroomUsuarios"
        );


        return obtenerUsuarios();

    }

}



/* =========================================================
   GUARDAR USUARIOS
========================================================= */

function guardarUsuarios(
    usuarios
) {


    localStorage.setItem(
        "newsroomUsuarios",
        JSON.stringify(usuarios)
    );

}



/* =========================================================
   OBTENER USUARIO POR ID
========================================================= */

function obtenerUsuarioPorId(
    id
) {


    const usuarios =
        obtenerUsuarios();


    return usuarios.find(
        usuario =>
            Number(usuario.id) ===
            Number(id)
    ) || null;

}



/* =========================================================
   BUSCAR USUARIO
========================================================= */

function buscarUsuario(
    usuario
) {


    const usuarios =
        obtenerUsuarios();


    return usuarios.find(
        item =>
            item.usuario
                .toLowerCase() ===
            String(usuario)
                .trim()
                .toLowerCase()
    ) || null;

}



/* =========================================================
   OBTENER ROL
========================================================= */

function obtenerRolPorId(
    id
) {


    return NEWSROOM_ROLES.find(
        rol =>
            Number(rol.id) ===
            Number(id)
    ) || null;

}



/* =========================================================
   GENERAR ID
========================================================= */

function generarNuevoId() {


    const usuarios =
        obtenerUsuarios();


    if (!usuarios.length) {

        return 1;

    }


    return Math.max(
        ...usuarios.map(
            usuario =>
                Number(usuario.id) || 0
        )
    ) + 1;

}



/* =========================================================
   GUARDAR NUEVO USUARIO
========================================================= */

function crearUsuario(
    datos
) {


    const usuarios =
        obtenerUsuarios();


    const usuarioExistente =
        usuarios.find(
            usuario =>
                usuario.usuario
                    .toLowerCase() ===
                datos.usuario
                    .trim()
                    .toLowerCase()
        );


    if (usuarioExistente) {

        return {

            success: false,

            message:
                "El nombre de usuario ya existe."

        };

    }


    const rol =
        obtenerRolPorId(
            datos.rol_id
        );


    if (!rol) {

        return {

            success: false,

            message:
                "El rol seleccionado no es válido."

        };

    }


    const nuevoUsuario = {

        id:
            generarNuevoId(),

        nombre:
            datos.nombre.trim(),

        usuario:
            datos.usuario.trim(),

        correo:
            datos.correo
                ? datos.correo.trim()
                : "",

        rol_id:
            Number(datos.rol_id),

        rol:
            rol.nombre,

        estado:
            "Activo"

    };


    usuarios.unshift(
        nuevoUsuario
    );


    guardarUsuarios(
        usuarios
    );


    return {

        success: true,

        usuario:
            nuevoUsuario

    };

}
