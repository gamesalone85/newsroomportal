```javascript
/* =========================================================
   NEWSROOM PORTAL
   LOGIN CENTRAL
   =========================================================

   Actualmente:
   - NO utiliza PHP
   - NO utiliza MySQL
   - NO realiza consultas a ninguna base de datos

   FUTURA CONEXIÓN:
   - Firebase
   - Supabase
   - Google
   - API propia
   - Otro servicio de autenticación

   ========================================================= */


document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       ELEMENTOS
    ===================================================== */

    const loginForm = document.getElementById("loginForm");

    const usuarioInput = document.getElementById("usuario");

    const passwordInput = document.getElementById("password");

    const loginButton = document.getElementById("loginButton");

    const loginError = document.getElementById("loginError");



    /* =====================================================
       VALIDACIÓN
    ===================================================== */

    if (!loginForm) {

        console.error(
            "Newsroom Portal: No se encontró el formulario de login."
        );

        return;

    }



    /* =====================================================
       ENVÍO DEL FORMULARIO
    ===================================================== */

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();


        const usuario = usuarioInput.value.trim();

        const password = passwordInput.value;



        /* =================================================
           LIMPIAR MENSAJE ANTERIOR
        ================================================= */

        ocultarError();



        /* =================================================
           VALIDACIÓN BÁSICA
        ================================================= */

        if (!usuario || !password) {

            mostrarError(
                "Ingresa tu usuario y contraseña."
            );

            return;

        }



        /* =================================================
           ESTADO DEL BOTÓN
        ================================================= */

        loginButton.disabled = true;

        loginButton.textContent = "Ingresando...";



        try {


            /* ==============================================
               AUTENTICACIÓN
               ==============================================

               ESTE ES EL PUNTO DONDE POSTERIORMENTE
               CONECTAREMOS:

               Firebase
               Supabase
               Google
               API
               etc.

               ============================================== */


            const resultado = await autenticarUsuario(
                usuario,
                password
            );



            /* =================================================
               LOGIN EXITOSO
            ================================================= */

            if (resultado.success) {

                guardarSesion(resultado.usuario);

                redireccionarUsuario(
                    resultado.usuario.rol_id
                );

                return;

            }



            /* =================================================
               LOGIN INCORRECTO
            ================================================= */

            mostrarError(
                resultado.message ||
                "Usuario o contraseña incorrectos."
            );


        } catch (error) {


            console.error(
                "Error durante el inicio de sesión:",
                error
            );


            mostrarError(
                "No fue posible iniciar sesión. Intenta nuevamente."
            );


        } finally {


            loginButton.disabled = false;

            loginButton.textContent = "Ingresar";


        }

    });



    /* =====================================================
       AUTENTICACIÓN TEMPORAL
       =====================================================

       IMPORTANTE:

       Esta función NO consulta ninguna base de datos.

       Es solamente una estructura temporal para que
       podamos desarrollar el portal.

       Posteriormente será sustituida por Firebase,
       Supabase o una API.

    ===================================================== */

    async function autenticarUsuario(usuario, password) {


        /*
         * ================================================
         * ZONA RESERVADA PARA AUTENTICACIÓN
         * ================================================
         *
         * Ejemplo futuro:
         *
         * const respuesta = await AuthService.login(
         *     usuario,
         *     password
         * );
         *
         * ================================================
         */


        /*
         * USUARIOS TEMPORALES
         *
         * SOLO PARA DESARROLLO.
         *
         * NO UTILIZAR EN PRODUCCIÓN.
         */

        const usuariosDemo = [

            {
                id: 1,
                usuario: "admin",
                password: "admin123",
                nombre: "Administrador",
                rol_id: 1,
                estado: "Activo"
            },

            {
                id: 3,
                usuario: "rooms",
                password: "rooms123",
                nombre: "Usuario Rooms",
                rol_id: 3,
                estado: "Activo"
            },

            {
                id: 4,
                usuario: "roomsadmin",
                password: "rooms123",
                nombre: "Administrador Rooms",
                rol_id: 4,
                estado: "Activo"
            },

            {
                id: 5,
                usuario: "vehicular",
                password: "vehicular123",
                nombre: "Administrador Vehicular",
                rol_id: 5,
                estado: "Activo"
            },

            {
                id: 7,
                usuario: "credencializacion",
                password: "credencial123",
                nombre: "Credencialización",
                rol_id: 7,
                estado: "Activo"
            },

            {
                id: 8,
                usuario: "capitalhumano",
                password: "capital123",
                nombre: "Capital Humano",
                rol_id: 8,
                estado: "Activo"
            }

        ];



        const usuarioEncontrado = usuariosDemo.find(
            user =>
                user.usuario === usuario &&
                user.password === password &&
                user.estado === "Activo"
        );



        if (!usuarioEncontrado) {

            return {

                success: false,

                message:
                    "Usuario o contraseña incorrectos."

            };

        }



        return {

            success: true,

            usuario: {

                id: usuarioEncontrado.id,

                usuario: usuarioEncontrado.usuario,

                nombre: usuarioEncontrado.nombre,

                rol_id: usuarioEncontrado.rol_id

            }

        };

    }



    /* =====================================================
       GUARDAR SESIÓN
       ===================================================== */

    function guardarSesion(usuario) {


        /*
         * ==================================================
         * SESIÓN TEMPORAL
         * ==================================================
         *
         * Posteriormente podremos reemplazar esto por:
         *
         * Firebase Authentication
         * Supabase Auth
         * JWT
         * API Session
         *
         * ==================================================
         */


        const sesion = {

            autenticado: true,

            id: usuario.id,

            usuario: usuario.usuario,

            nombre: usuario.nombre,

            rol_id: usuario.rol_id,

            fechaInicio:
                new Date().toISOString()

        };


        localStorage.setItem(
            "newsroomSession",
            JSON.stringify(sesion)
        );

    }



    /* =====================================================
       REDIRECCIÓN POR ROL
       ===================================================== */

    function redireccionarUsuario(rol) {


        const routes = {

            1: "support/dashboard/index.html",

            2: "support/dashboard/index.html",

            3: "rooms/index.html",

            4: "rooms_admin/index.html",

            5: "cvehicular/admin/index.html",

            7: "credencializacion/index.html",

            8: "capitalhumano/index.html"

        };



        const destination =
            routes[rol] || "index.html";



        window.location.href = destination;

    }



    /* =====================================================
       MOSTRAR ERROR
       ===================================================== */

    function mostrarError(mensaje) {


        loginError.textContent = mensaje;

        loginError.style.display = "block";

    }



    /* =====================================================
       OCULTAR ERROR
       ===================================================== */

    function ocultarError() {


        loginError.textContent = "";

        loginError.style.display = "none";

    }


});
```
