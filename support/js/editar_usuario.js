/* =========================================================
   NEWSROOM PORTAL
   EDITAR USUARIO
   =========================================================

   Sustituye:

   editar_usuario.php

   No utiliza MySQL.

   Los cambios se almacenan temporalmente
   mediante data.js + localStorage.

   ========================================================= */


/* =========================================================
   INICIALIZAR
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =================================================
           VALIDAR SESIÓN
        ================================================== */

        if (
            !verificarSesion(
                "../../login.html"
            )
        ) {

            return;

        }



        /* =================================================
           OBTENER SESIÓN
        ================================================== */

        const session =
            obtenerSesion();


        if (!session) {

            return;

        }



        /* =================================================
           VALIDAR PERMISOS
           
           PHP ORIGINAL:

           SOLO ADMIN

           rol_id = 1
        ================================================== */

        const rol =
            Number(
                session.rol_id
            );


        if (rol !== 1) {


            window.location.href =
                "../dashboard/index.html";


            return;

        }



        /* =================================================
           INFORMACIÓN DEL USUARIO ACTUAL
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
                session.usuario;

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
           OBTENER ID DESDE LA URL
        ==================================================

           Ejemplo:

           editar_usuario.html?id=5
        ================================================== */

        const params =
            new URLSearchParams(
                window.location.search
            );


        const id =
            Number(
                params.get("id")
            );


        if (!id) {


            mostrarError(
                "No se especificó el usuario que deseas editar."
            );


            return;

        }



        /* =================================================
           BUSCAR USUARIO
        ================================================== */

        const usuario =
            obtenerUsuarioPorId(
                id
            );


        if (!usuario) {


            mostrarError(
                "El usuario no existe."
            );


            return;

        }



        /* =================================================
           ELEMENTOS DEL FORMULARIO
        ================================================== */

        const form =
            document.getElementById(
                "editarUsuarioForm"
            );


        const usuarioId =
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


        const rolSelect =
            document.getElementById(
                "rol_id"
            );


        const message =
            document.getElementById(
                "formMessage"
            );


        const guardarButton =
            document.getElementById(
                "guardarCambios"
            );



        /* =================================================
           CARGAR ROLES
        ================================================== */

        NEWSROOM_ROLES.forEach(
            rol => {


                const option =
                    document.createElement(
                        "option"
                    );


                option.value =
                    rol.id;


                option.textContent =
                    rol.nombre;


                if (
                    Number(rol.id) ===
                    Number(usuario.rol_id)
                ) {

                    option.selected =
                        true;

                }


                rolSelect.appendChild(
                    option
                );

            }
        );



        /* =================================================
           CARGAR DATOS ACTUALES
        ================================================== */

        usuarioId.value =
            usuario.id;


        nombre.value =
            usuario.nombre;


        usuarioInput.value =
            usuario.usuario;


        correo.value =
            usuario.correo || "";



        /* =================================================
           MOSTRAR ERROR
        ================================================== */

        function mostrarError(
            texto
        ) {


            if (!message) {

                return;

            }


            message.textContent =
                texto;


            message.className =
                "form-message error";


            message.style.display =
                "block";

        }



        /* =================================================
           MOSTRAR ÉXITO
        ================================================== */

        function mostrarExito(
            texto
        ) {


            if (!message) {

                return;

            }


            message.textContent =
                texto;


            message.className =
                "form-message success";


            message.style.display =
                "block";

        }



        /* =================================================
           ACTUALIZAR USUARIO
        ================================================== */

        form.addEventListener(
            "submit",
            event => {


                event.preventDefault();



                /* =========================================
                   DATOS
                ========================================= */

                const nuevoNombre =
                    nombre.value.trim();


                const nuevoUsuario =
                    usuarioInput.value.trim();


                const nuevoCorreo =
                    correo.value.trim();


                const nuevoRol =
                    Number(
                        rolSelect.value
                    );



                /* =========================================
                   VALIDACIONES
                ========================================= */

                if (!nuevoNombre) {

                    mostrarError(
                        "El nombre es obligatorio."
                    );

                    return;

                }


                if (!nuevoUsuario) {

                    mostrarError(
                        "El usuario es obligatorio."
                    );

                    return;

                }


                if (!nuevoRol) {

                    mostrarError(
                        "Selecciona un rol."
                    );

                    return;

                }



                /* =========================================
                   COMPROBAR USUARIO DUPLICADO
                ========================================= */

                const usuarios =
                    obtenerUsuarios();


                const duplicado =
                    usuarios.find(
                        item =>
                            Number(item.id) !==
                                Number(id) &&
                            item.usuario
                                .toLowerCase() ===
                                nuevoUsuario
                                    .toLowerCase()
                    );


                if (duplicado) {


                    mostrarError(
                        "Ese nombre de usuario ya está registrado."
                    );


                    return;

                }



                /* =========================================
                   OBTENER ROL
                ========================================= */

                const rolSeleccionado =
                    obtenerRolPorId(
                        nuevoRol
                    );


                if (!rolSeleccionado) {


                    mostrarError(
                        "El rol seleccionado no es válido."
                    );


                    return;

                }



                /* =========================================
                   BOTÓN
                ========================================= */

                guardarButton.disabled =
                    true;


                guardarButton.textContent =
                    "Guardando...";



                /* =========================================
                   ACTUALIZAR
                ========================================= */

                const indice =
                    usuarios.findIndex(
                        item =>
                            Number(item.id) ===
                            Number(id)
                    );


                if (indice === -1) {


                    mostrarError(
                        "No fue posible encontrar el usuario."
                    );


                    guardarButton.disabled =
                        false;


                    guardarButton.textContent =
                        "Guardar Cambios";


                    return;

                }



                usuarios[indice] = {

                    ...usuarios[indice],

                    nombre:
                        nuevoNombre,

                    usuario:
                        nuevoUsuario,

                    correo:
                        nuevoCorreo,

                    rol_id:
                        nuevoRol,

                    rol:
                        rolSeleccionado.nombre

                };



                /* =========================================
                   GUARDAR
                ========================================= */

                guardarUsuarios(
                    usuarios
                );



                /* =========================================
                   MENSAJE
                ========================================= */

                mostrarExito(
                    "Los cambios se guardaron correctamente."
                );



                /* =========================================
                   REGRESAR
                ========================================= */

                setTimeout(
                    () => {

                        window.location.href =
                            "index.html";

                    },
                    900
                );


            }
        );


    }
);

