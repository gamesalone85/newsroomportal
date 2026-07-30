/* =========================================================
   NEWSROOM PORTAL
   ADMINISTRACIÓN DE USUARIOS
   =========================================================

   ESTA VERSIÓN NO UTILIZA:

   - PHP
   - MySQL
   - SQL
   - Backend

   Los datos utilizados actualmente son DEMO.

   FUTURA FUENTE DE DATOS:

   - Firebase
   - Supabase
   - Google
   - API propia
   - Otra base de datos

   ========================================================= */


document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       SESIÓN
    ===================================================== */

    const sessionData =
        localStorage.getItem("newsroomSession");


    if (!sessionData) {

        window.location.href = "../../login.html";

        return;

    }


    let session;


    try {

        session = JSON.parse(sessionData);

    } catch (error) {

        console.error(
            "Sesión inválida:",
            error
        );

        localStorage.removeItem("newsroomSession");

        window.location.href = "../../login.html";

        return;

    }



    /* =====================================================
       VALIDACIÓN DE ADMINISTRADOR
    ===================================================== */

    if (
        !session.autenticado ||
        Number(session.rol_id) !== 1
    ) {

        /*
         * El usuario no tiene permisos administrativos.
         */

        window.location.href =
            "../dashboard/index.html";

        return;

    }



    /* =====================================================
       INFORMACIÓN DEL USUARIO
    ===================================================== */

    const userName =
        document.getElementById("userName");

    const userAvatar =
        document.getElementById("userAvatar");


    if (userName) {

        userName.textContent =
            session.nombre || session.usuario;

    }


    if (userAvatar) {

        const nombre =
            session.nombre ||
            session.usuario ||
            "A";


        userAvatar.textContent =
            nombre.charAt(0).toUpperCase();

    }



    /* =====================================================
       DATOS TEMPORALES
       =====================================================

       ESTOS DATOS REEMPLAZAN TEMPORALMENTE:

       SELECT
       u.*,
       r.id AS rol_id,
       r.nombre AS rol
       FROM usuarios u
       INNER JOIN roles r ...

    ===================================================== */

    let usuarios = [


        {
            id: 8,

            nombre:
                "Capital Humano",

            usuario:
                "capitalhumano",

            correo:
                "capital@newsroom.local",

            rol_id: 8,

            rol:
                "Capital Humano",

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

            rol_id: 7,

            rol:
                "Credencialización",

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

            rol_id: 5,

            rol:
                "Vehicular",

            estado:
                "Activo"

        },


        {
            id: 4,

            nombre:
                "Administrador Rooms",

            usuario:
                "roomsadmin",

            correo:
                "roomsadmin@newsroom.local",

            rol_id: 4,

            rol:
                "Rooms Admin",

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

            rol_id: 3,

            rol:
                "Rooms",

            estado:
                "Suspendido"

        },


        {
            id: 2,

            nombre:
                "Usuario Support",

            usuario:
                "support",

            correo:
                "support@newsroom.local",

            rol_id: 2,

            rol:
                "Support",

            estado:
                "Activo"

        },


        {
            id: 1,

            nombre:
                "Administrador",

            usuario:
                "admin",

            correo:
                "admin@newsroom.local",

            rol_id: 1,

            rol:
                "Administrador",

            estado:
                "Activo"

        }

    ];



    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const tableBody =
        document.getElementById(
            "usuariosTableBody"
        );


    const totalUsuarios =
        document.getElementById(
            "totalUsuarios"
        );


    const usuariosActivos =
        document.getElementById(
            "usuariosActivos"
        );


    const usuariosSuspendidos =
        document.getElementById(
            "usuariosSuspendidos"
        );



    /* =====================================================
       RENDERIZAR USUARIOS
    ===================================================== */

    function renderUsuarios() {


        if (!tableBody) {

            return;

        }


        tableBody.innerHTML = "";



        usuarios.forEach(usuario => {


            const fila =
                document.createElement("tr");



            /* =================================================
               ACCIONES
            ================================================= */

            let acciones = `

                <div class="action-group">


                    <a
                        class="btn-admin btn-edit"
                        href="editar_usuario.html?id=${usuario.id}"
                    >
                        Editar
                    </a>


                    <a
                        class="btn-admin btn-reset"
                        href="reset_password.html?id=${usuario.id}"
                    >
                        Reset Password
                    </a>

            `;



            /*
             * El administrador principal no puede
             * suspenderse ni eliminarse.
             */

            if (Number(usuario.rol_id) !== 1) {


                if (usuario.estado === "Activo") {


                    acciones += `

                        <button
                            type="button"
                            class="btn-admin btn-suspend"
                            data-action="suspend"
                            data-id="${usuario.id}"
                        >
                            Suspender
                        </button>

                    `;


                } else {


                    acciones += `

                        <button
                            type="button"
                            class="btn-admin btn-activate"
                            data-action="activate"
                            data-id="${usuario.id}"
                        >
                            Activar
                        </button>

                    `;

                }



                acciones += `

                    <button
                        type="button"
                        class="btn-admin btn-delete"
                        data-action="delete"
                        data-id="${usuario.id}"
                    >
                        Eliminar
                    </button>

                `;

            }



            acciones += `

                </div>

            `;



            /* =================================================
               FILA
            ================================================= */

            fila.innerHTML = `

                <td>
                    #${usuario.id}
                </td>


                <td>
                    ${escapeHTML(usuario.nombre)}
                </td>


                <td>
                    ${escapeHTML(usuario.usuario)}
                </td>


                <td>
                    ${escapeHTML(usuario.correo)}
                </td>


                <td>

                    <span
                        class="role-badge role-${normalizarClase(usuario.rol)}"
                    >
                        ${escapeHTML(usuario.rol)}
                    </span>

                </td>


                <td>

                    <span
                        class="status-badge status-${normalizarClase(usuario.estado)}"
                    >
                        ${escapeHTML(usuario.estado)}
                    </span>

                </td>


                <td>

                    ${acciones}

                </td>

            `;



            tableBody.appendChild(fila);

        });



        actualizarKPIs();

    }



    /* =====================================================
       ACTUALIZAR KPIs
    ===================================================== */

    function actualizarKPIs() {


        const total =
            usuarios.length;


        const activos =
            usuarios.filter(
                usuario =>
                    usuario.estado === "Activo"
            ).length;


        const suspendidos =
            usuarios.filter(
                usuario =>
                    usuario.estado === "Suspendido"
            ).length;



        if (totalUsuarios) {

            totalUsuarios.textContent =
                total;

        }


        if (usuariosActivos) {

            usuariosActivos.textContent =
                activos;

        }


        if (usuariosSuspendidos) {

            usuariosSuspendidos.textContent =
                suspendidos;

        }

    }



    /* =====================================================
       ACCIONES DE TABLA
    ===================================================== */

    tableBody.addEventListener(
        "click",
        event => {


            const button =
                event.target.closest(
                    "button[data-action]"
                );


            if (!button) {

                return;

            }



            const action =
                button.dataset.action;


            const id =
                Number(button.dataset.id);



            const usuario =
                usuarios.find(
                    user =>
                        Number(user.id) === id
                );


            if (!usuario) {

                return;

            }



            /* =================================================
               SUSPENDER
            ================================================= */

            if (action === "suspend") {


                const confirmar =
                    confirm(
                        `¿Suspender al usuario "${usuario.nombre}"?`
                    );


                if (!confirmar) {

                    return;

                }


                usuario.estado =
                    "Suspendido";


                renderUsuarios();


                return;

            }



            /* =================================================
               ACTIVAR
            ================================================= */

            if (action === "activate") {


                const confirmar =
                    confirm(
                        `¿Activar al usuario "${usuario.nombre}"?`
                    );


                if (!confirmar) {

                    return;

                }


                usuario.estado =
                    "Activo";


                renderUsuarios();


                return;

            }



            /* =================================================
               ELIMINAR
            ================================================= */

            if (action === "delete") {


                const confirmar =
                    confirm(
                        `¿Eliminar al usuario "${usuario.nombre}"?`
                    );


                if (!confirmar) {

                    return;

                }


                usuarios =
                    usuarios.filter(
                        user =>
                            Number(user.id) !== id
                    );


                renderUsuarios();

            }

        }
    );



    /* =====================================================
       CERRAR SESIÓN
    ===================================================== */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {


        logoutButton.addEventListener(
            "click",
            () => {


                const confirmar =
                    confirm(
                        "¿Deseas cerrar la sesión?"
                    );


                if (!confirmar) {

                    return;

                }


                /*
                 * FUTURA AUTENTICACIÓN:
                 *
                 * Aquí podremos llamar a:
                 *
                 * Firebase Auth
                 * Supabase Auth
                 * API
                 *
                 */


                localStorage.removeItem(
                    "newsroomSession"
                );


                window.location.href =
                    "../../login.html";

            }
        );

    }



    /* =====================================================
       SEGURIDAD BÁSICA PARA HTML
    ===================================================== */

    function escapeHTML(text) {


        const div =
            document.createElement("div");


        div.textContent =
            text ?? "";


        return div.innerHTML;

    }



    /* =====================================================
       NORMALIZAR CLASE CSS
    ===================================================== */

    function normalizarClase(texto) {


        return String(texto || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-+|-+$/g,
                "");

    }



    /* =====================================================
       INICIALIZAR
    ===================================================== */

    renderUsuarios();


});
