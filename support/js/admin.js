/* =========================================================
   NEWSROOM PORTAL
   ADMINISTRACIÓN DE USUARIOS
   ========================================================= */


/* =========================================================
   INICIALIZACIÓN
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =================================================
           VERIFICAR SESIÓN
        ================================================== */

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
            obtenerSesion();


        if (!session) {
            return;
        }



        /* =================================================
           VERIFICAR ROL ADMINISTRADOR
        ================================================== */

        if (
            Number(session.rol_id) !== 1
        ) {

            alert(
                "No tienes permisos para acceder a esta sección."
            );


            window.location.href =
                "../dashboard/index.html";


            return;

        }



        /* =================================================
           INFORMACIÓN DEL USUARIO
        ================================================== */

        actualizarUsuario();


        /* =================================================
           CARGAR DATOS
        ================================================== */

        renderizarUsuarios();

        actualizarKPIs();


        /* =================================================
           EVENTOS
        ================================================== */

        configurarEventos();

    }
);



/* =========================================================
   ACTUALIZAR USUARIO EN TOPBAR
========================================================= */

function actualizarUsuario() {

    const session =
        obtenerSesion();


    if (!session) {
        return;
    }


    const nombre =
        session.nombre ||
        session.usuario ||
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
   OBTENER USUARIOS
========================================================= */

function obtenerUsuariosAdmin() {

    if (
        typeof obtenerUsuarios ===
        "function"
    ) {

        return obtenerUsuarios();

    }


    return [];

}



/* =========================================================
   RENDERIZAR TABLA
========================================================= */

function renderizarUsuarios() {

    const tbody =
        document.getElementById(
            "usuariosTableBody"
        );


    if (!tbody) {
        return;
    }


    const usuarios =
        obtenerUsuariosAdmin();


    tbody.innerHTML =
        "";



    if (
        usuarios.length ===
        0
    ) {

        tbody.innerHTML = `

            <tr>

                <td
                    colspan="7"
                    style="text-align:center;"
                >

                    No existen usuarios registrados.

                </td>

            </tr>

        `;


        return;

    }



    usuarios.forEach(
        usuario => {

            const tr =
                document.createElement(
                    "tr"
                );


            const rolClase =
                String(
                    usuario.rol ||
                    ""
                )
                .toLowerCase()
                .replace(
                    /\s+/g,
                    "-"
                );


            const estadoClase =
                String(
                    usuario.estado ||
                    ""
                )
                .toLowerCase();


            tr.innerHTML = `

                <td>
                    #${usuario.id}
                </td>


                <td>
                    ${escapeHTML(
                        usuario.nombre
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        usuario.usuario
                    )}
                </td>


                <td>
                    ${escapeHTML(
                        usuario.correo ||
                        ""
                    )}
                </td>


                <td>

                    <span
                        class="role-badge role-${rolClase}"
                    >

                        ${escapeHTML(
                            usuario.rol
                        )}

                    </span>

                </td>


                <td>

                    <span
                        class="status-badge status-${estadoClase}"
                    >

                        ${escapeHTML(
                            usuario.estado
                        )}

                    </span>

                </td>


                <td>

                    <div class="action-group">


                        <button
                            type="button"
                            class="btn-admin btn-edit"
                            data-action="edit"
                            data-id="${usuario.id}"
                        >
                            Editar
                        </button>



                        <button
                            type="button"
                            class="btn-admin btn-reset"
                            data-action="reset"
                            data-id="${usuario.id}"
                        >
                            Reset Password
                        </button>


                        ${
                            Number(
                                usuario.rol_id
                            ) !== 1

                            ?

                            usuario.estado ===
                            "Activo"

                            ?

                            `

                            <button
                                type="button"
                                class="btn-admin btn-suspend"
                                data-action="suspend"
                                data-id="${usuario.id}"
                            >
                                Suspender
                            </button>

                            `

                            :

                            `

                            <button
                                type="button"
                                class="btn-admin btn-activate"
                                data-action="activate"
                                data-id="${usuario.id}"
                            >
                                Activar
                            </button>

                            `

                            :

                            ""
                        }


                        ${
                            Number(
                                usuario.rol_id
                            ) !== 1

                            ?

                            `

                            <button
                                type="button"
                                class="btn-admin btn-delete"
                                data-action="delete"
                                data-id="${usuario.id}"
                            >
                                Eliminar
                            </button>

                            `

                            :

                            ""
                        }


                    </div>

                </td>

            `;


            tbody.appendChild(
                tr
            );

        }
    );

}



/* =========================================================
   KPIs
========================================================= */

function actualizarKPIs() {

    const usuarios =
        obtenerUsuariosAdmin();


    const total =
        usuarios.length;


    const activos =
        usuarios.filter(
            usuario =>
                usuario.estado ===
                "Activo"
        ).length;


    const suspendidos =
        usuarios.filter(
            usuario =>
                usuario.estado ===
                "Suspendido"
        ).length;



    actualizarTexto(
        "totalUsuarios",
        total
    );


    actualizarTexto(
        "usuariosActivos",
        activos
    );


    actualizarTexto(
        "usuariosSuspendidos",
        suspendidos
    );

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
   EVENTOS
========================================================= */

function configurarEventos() {


    /* =================================================
       NUEVO USUARIO
    ================================================== */

    const nuevoUsuarioBtn =
        document.getElementById(
            "nuevoUsuarioBtn"
        );


    if (nuevoUsuarioBtn) {

        nuevoUsuarioBtn.addEventListener(
            "click",
            () => {

                abrirModalUsuario();

            }
        );

    }



    /* =================================================
       CERRAR MODAL USUARIO
    ================================================== */

    const cerrarModal =
        document.getElementById(
            "cerrarModal"
        );


    const cancelarUsuario =
        document.getElementById(
            "cancelarUsuario"
        );


    if (cerrarModal) {

        cerrarModal.addEventListener(
            "click",
            cerrarModalUsuario
        );

    }


    if (cancelarUsuario) {

        cancelarUsuario.addEventListener(
            "click",
            cerrarModalUsuario
        );

    }



    /* =================================================
       FORMULARIO USUARIO
    ================================================== */

    const usuarioForm =
        document.getElementById(
            "usuarioForm"
        );


    if (usuarioForm) {

        usuarioForm.addEventListener(
            "submit",
            guardarUsuario
        );

    }



    /* =================================================
       CERRAR PASSWORD
    ================================================== */

    const cerrarPasswordModal =
        document.getElementById(
            "cerrarPasswordModal"
        );


    const cancelarPassword =
        document.getElementById(
            "cancelarPassword"
        );


    if (cerrarPasswordModal) {

        cerrarPasswordModal.addEventListener(
            "click",
            cerrarModalPassword
        );

    }


    if (cancelarPassword) {

        cancelarPassword.addEventListener(
            "click",
            cerrarModalPassword
        );

    }



    /* =================================================
       FORM PASSWORD
    ================================================== */

    const passwordForm =
        document.getElementById(
            "passwordForm"
        );


    if (passwordForm) {

        passwordForm.addEventListener(
            "submit",
            guardarPassword
        );

    }



    /* =================================================
       ACCIONES TABLA
    ================================================== */

    const tbody =
        document.getElementById(
            "usuariosTableBody"
        );


    if (tbody) {

        tbody.addEventListener(
            "click",
            manejarAccionUsuario
        );

    }



    /* =================================================
       CERRAR MODAL HACIENDO CLICK FUERA
    ================================================== */

    const usuarioModal =
        document.getElementById(
            "usuarioModal"
        );


    const passwordModal =
        document.getElementById(
            "passwordModal"
        );


    if (usuarioModal) {

        usuarioModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    usuarioModal
                ) {

                    cerrarModalUsuario();

                }

            }
        );

    }


    if (passwordModal) {

        passwordModal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    passwordModal
                ) {

                    cerrarModalPassword();

                }

            }
        );

    }

}



/* =========================================================
   MANEJAR ACCIONES
========================================================= */

function manejarAccionUsuario(
    event
) {

    const button =
        event.target.closest(
            "[data-action]"
        );


    if (!button) {
        return;
    }


    const action =
        button.dataset.action;


    const id =
        Number(
            button.dataset.id
        );


    const usuario =
        buscarUsuario(
            id
        );


    if (!usuario) {

        alert(
            "Usuario no encontrado."
        );

        return;

    }



    switch (
        action
    ) {


        case "edit":

            abrirModalUsuario(
                usuario
            );

            break;



        case "reset":

            abrirModalPassword(
                usuario
            );

            break;



        case "suspend":

            cambiarEstado(
                usuario,
                "Suspendido"
            );

            break;



        case "activate":

            cambiarEstado(
                usuario,
                "Activo"
            );

            break;



        case "delete":

            eliminarUsuario(
                usuario
            );

            break;

    }

}



/* =========================================================
   BUSCAR USUARIO
========================================================= */

function buscarUsuario(
    id
) {

    return obtenerUsuariosAdmin()
        .find(
            usuario =>
                Number(
                    usuario.id
                ) ===
                Number(id)
        );

}



/* =========================================================
   ABRIR MODAL USUARIO
========================================================= */

function abrirModalUsuario(
    usuario = null
) {

    const modal =
        document.getElementById(
            "usuarioModal"
        );


    const title =
        document.getElementById(
            "modalTitle"
        );


    const id =
        document.getElementById(
            "usuarioId"
        );


    const nombre =
        document.getElementById(
            "nombre"
        );


    const usuarioInput =
        document.getElementById(
            "usuario"
        );


    const correo =
        document.getElementById(
            "correo"
        );


    const password =
        document.getElementById(
            "password"
        );


    const passwordGroup =
        document.getElementById(
            "passwordGroup"
        );


    const rol =
        document.getElementById(
            "rolId"
        );


    ocultarError(
        "formError"
    );


    if (usuario) {


        title.textContent =
            "Editar Usuario";


        id.value =
            usuario.id;


        nombre.value =
            usuario.nombre || "";


        usuarioInput.value =
            usuario.usuario || "";


        correo.value =
            usuario.correo || "";


        rol.value =
            usuario.rol_id || "";


        password.value =
            "";


        password.removeAttribute(
            "required"
        );


        passwordGroup.style.display =
            "none";


    } else {


        title.textContent =
            "Nuevo Usuario";


        id.value =
            "";


        nombre.value =
            "";


        usuarioInput.value =
            "";


        correo.value =
            "";


        rol.value =
            "2";


        password.value =
            "";


        password.setAttribute(
            "required",
            "required"
        );


        passwordGroup.style.display =
            "";


    }


    modal.style.display =
        "flex";

}



/* =========================================================
   CERRAR MODAL USUARIO
========================================================= */

function cerrarModalUsuario() {

    const modal =
        document.getElementById(
            "usuarioModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}



/* =========================================================
   GUARDAR USUARIO
========================================================= */

function guardarUsuario(
    event
) {

    event.preventDefault();


    const id =
        document.getElementById(
            "usuarioId"
        ).value;


    const nombre =
        document.getElementById(
            "nombre"
        ).value.trim();


    const usuario =
        document.getElementById(
            "usuario"
        ).value.trim();


    const correo =
        document.getElementById(
            "correo"
        ).value.trim();


    const password =
        document.getElementById(
            "password"
        ).value;


    const rolId =
        Number(
            document.getElementById(
                "rolId"
            ).value
        );


    /* =================================================
       VALIDACIÓN
    ================================================== */

    if (
        !nombre ||
        !usuario
    ) {

        mostrarError(
            "formError",
            "Nombre y usuario son obligatorios."
        );

        return;

    }


    if (
        !id &&
        !password
    ) {

        mostrarError(
            "formError",
            "La contraseña es obligatoria para un nuevo usuario."
        );

        return;

    }


    const usuarios =
        obtenerUsuariosAdmin();


    const duplicado =
        usuarios.find(
            item =>

                item.usuario
                    .toLowerCase() ===
                usuario.toLowerCase()

                &&

                Number(item.id) !==
                Number(id || 0)
        );


    if (duplicado) {

        mostrarError(
            "formError",
            "El nombre de usuario ya existe."
        );

        return;

    }



    /*
     * =====================================================
     * CAPA DE DATOS
     * =====================================================
     *
     * POR AHORA:
     *
     * No se envía a MySQL.
     *
     * Aquí posteriormente conectaremos:
     *
     * Firebase
     * Supabase
     * API
     * Base de datos propia
     *
     * =====================================================
     */


    if (id) {

        actualizarUsuarioTemporal(
            Number(id),
            {
                nombre,
                usuario,
                correo,
                rol_id: rolId
            }
        );


    } else {


        crearUsuarioTemporal(
            {
                nombre,
                usuario,
                correo,
                password,
                rol_id: rolId
            }
        );

    }


    cerrarModalUsuario();


    renderizarUsuarios();


    actualizarKPIs();


    alert(
        id
            ? "Usuario actualizado correctamente."
            : "Usuario creado correctamente."
    );

}



/* =========================================================
   CREAR USUARIO TEMPORAL
========================================================= */

function crearUsuarioTemporal(
    datos
) {

    /*
     * Esta función será sustituida posteriormente
     * por la conexión con nuestra base de datos.
     */

    if (
        typeof NEWSROOM_USERS ===
        "undefined"
    ) {

        return;

    }


    const nuevoId =
        NEWSROOM_USERS.length
            ? Math.max(
                ...NEWSROOM_USERS.map(
                    usuario =>
                        Number(
                            usuario.id
                        )
                )
            ) + 1
            : 1;


    const roles = {

        1: "Administrador",

        2: "Support",

        3: "Rooms",

        4: "Rooms Admin",

        5: "Vehicular",

        7: "Credencialización",

        8: "Capital Humano"

    };


    NEWSROOM_USERS.push({

        id:
            nuevoId,

        usuario:
            datos.usuario,

        nombre:
            datos.nombre,

        correo:
            datos.correo,

        rol_id:
            datos.rol_id,

        rol:
            roles[
                datos.rol_id
            ] ||
            "Usuario",

        estado:
            "Activo",

        password:
            datos.password

    });

}



/* =========================================================
   ACTUALIZAR USUARIO TEMPORAL
========================================================= */

function actualizarUsuarioTemporal(
    id,
    datos
) {

    if (
        typeof NEWSROOM_USERS ===
        "undefined"
    ) {

        return;

    }


    const usuario =
        NEWSROOM_USERS.find(
            item =>
                Number(item.id) ===
                Number(id)
        );


    if (!usuario) {
        return;
    }


    const roles = {

        1: "Administrador",

        2: "Support",

        3: "Rooms",

        4: "Rooms Admin",

        5: "Vehicular",

        7: "Credencialización",

        8: "Capital Humano"

    };


    usuario.nombre =
        datos.nombre;


    usuario.usuario =
        datos.usuario;


    usuario.correo =
        datos.correo;


    usuario.rol_id =
        datos.rol_id;


    usuario.rol =
        roles[
            datos.rol_id
        ] ||
        "Usuario";

}



/* =========================================================
   CAMBIAR ESTADO
========================================================= */

function cambiarEstado(
    usuario,
    nuevoEstado
) {


    if (
        Number(
            usuario.rol_id
        ) === 1
    ) {

        alert(
            "El administrador principal no puede ser suspendido."
        );

        return;

    }


    const accion =
        nuevoEstado ===
        "Activo"

            ? "activar"

            : "suspender";


    const confirmar =
        confirm(
            `¿Deseas ${accion} al usuario "${usuario.nombre}"?`
        );


    if (!confirmar) {
        return;
    }



    /*
     * CAPA DE DATOS TEMPORAL
     */

    usuario.estado =
        nuevoEstado;


    renderizarUsuarios();


    actualizarKPIs();

}



/* =========================================================
   ELIMINAR USUARIO
========================================================= */

function eliminarUsuario(
    usuario
) {


    if (
        Number(
            usuario.rol_id
        ) === 1
    ) {

        alert(
            "El administrador principal no puede eliminarse."
        );

        return;

    }


    const confirmar =
        confirm(
            `¿Eliminar definitivamente al usuario "${usuario.nombre}"?`
        );


    if (!confirmar) {
        return;
    }



    /*
     * CAPA DE DATOS TEMPORAL
     */

    const index =
        NEWSROOM_USERS.findIndex(
            item =>
                Number(
                    item.id
                ) ===
                Number(
                    usuario.id
                )
        );


    if (
        index !== -1
    ) {

        NEWSROOM_USERS.splice(
            index,
            1
        );

    }


    renderizarUsuarios();


    actualizarKPIs();


    alert(
        "Usuario eliminado correctamente."
    );

}



/* =========================================================
   ABRIR PASSWORD
========================================================= */

function abrirModalPassword(
    usuario
) {

    const modal =
        document.getElementById(
            "passwordModal"
        );


    document.getElementById(
        "passwordUserId"
    ).value =
        usuario.id;


    document.getElementById(
        "passwordUserName"
    ).textContent =
        usuario.nombre;


    document.getElementById(
        "newPassword"
    ).value =
        "";


    document.getElementById(
        "confirmPassword"
    ).value =
        "";


    ocultarError(
        "passwordError"
    );


    modal.style.display =
        "flex";

}



/* =========================================================
   CERRAR PASSWORD
========================================================= */

function cerrarModalPassword() {

    const modal =
        document.getElementById(
            "passwordModal"
        );


    if (modal) {

        modal.style.display =
            "none";

    }

}



/* =========================================================
   GUARDAR PASSWORD
========================================================= */

function guardarPassword(
    event
) {

    event.preventDefault();


    const id =
        Number(
            document.getElementById(
                "passwordUserId"
            ).value
        );


    const password =
        document.getElementById(
            "newPassword"
        ).value;


    const confirmar =
        document.getElementById(
            "confirmPassword"
        ).value;



    if (
        !password ||
        !confirmar
    ) {

        mostrarError(
            "passwordError",
            "Todos los campos son obligatorios."
        );

        return;

    }


    if (
        password !==
        confirmar
    ) {

        mostrarError(
            "passwordError",
            "Las contraseñas no coinciden."
        );

        return;

    }


    const usuario =
        buscarUsuario(
            id
        );


    if (!usuario) {

        mostrarError(
            "passwordError",
            "Usuario no encontrado."
        );

        return;

    }



    /*
     * CAPA DE DATOS TEMPORAL
     */

    usuario.password =
        password;


    cerrarModalPassword();


    alert(
        "Contraseña actualizada correctamente."
    );

}



/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    valor
) {

    return String(
        valor ??
        ""
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
   ERRORES
========================================================= */

function mostrarError(
    id,
    mensaje
) {

    const elemento =
        document.getElementById(
            id
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        mensaje;


    elemento.style.display =
        "block";

}



function ocultarError(
    id
) {

    const elemento =
        document.getElementById(
            id
        );


    if (!elemento) {
        return;
    }


    elemento.textContent =
        "";


    elemento.style.display =
        "none";

}
