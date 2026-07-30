/* =========================================================
   NEWSROOM PORTAL
   SIDEBAR CONTROLLER
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {


        /* =================================================
           CONTENEDOR
        ================================================== */

        const container =
            document.getElementById(
                "sidebarContainer"
            );


        if (!container) {

            console.error(
                "Newsroom Portal: No existe #sidebarContainer"
            );

            return;

        }



        /* =================================================
           DETERMINAR RUTA DEL SIDEBAR
        ================================================== */

        const sidebarPath =
            container.dataset.sidebar ||
            "../includes/sidebar.html";



        /* =================================================
           CARGAR SIDEBAR
        ================================================== */

        try {

            const response =
                await fetch(
                    sidebarPath
                );


            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }


            const html =
                await response.text();


            container.innerHTML =
                html;


        } catch (error) {

            console.error(
                "No fue posible cargar el sidebar:",
                error
            );

            return;

        }



        /* =================================================
           ELEMENTOS
        ================================================== */

        const sidebar =
            document.getElementById(
                "sidebar"
            );


        const toggle =
            document.getElementById(
                "sidebarToggle"
            );


        const logoutLink =
            document.getElementById(
                "logoutLink"
            );



        /* =================================================
           SESIÓN
        ================================================== */

        const session =
            typeof obtenerSesion ===
            "function"

                ? obtenerSesion()

                : null;



        /* =================================================
           ROL
        ================================================== */

        const rol =
            session
                ? Number(
                    session.rol_id
                )
                : null;



        /* =================================================
           ELEMENTOS SEGÚN ROL
        ================================================== */

        document
            .querySelectorAll(
                "[data-role]"
            )
            .forEach(
                group => {

                    const requiredRole =
                        Number(
                            group.dataset.role
                        );


                    if (
                        rol !==
                        requiredRole
                    ) {

                        group.style.display =
                            "none";

                    }

                }
            );



        /* =================================================
           COLAPSAR SIDEBAR
        ================================================== */

        if (toggle) {

            toggle.addEventListener(
                "click",
                () => {

                    if (!sidebar) {
                        return;
                    }

                    sidebar.classList.toggle(
                        "collapsed"
                    );

                }
            );

        }



        /* =================================================
           DROPDOWNS
        ================================================== */

        document
            .querySelectorAll(
                ".nav-group"
            )
            .forEach(
                group => {

                    const button =
                        group.querySelector(
                            ".nav-dropdown-btn"
                        );


                    if (!button) {
                        return;
                    }


                    button.addEventListener(
                        "click",
                        () => {

                            if (
                                sidebar &&
                                sidebar.classList
                                    .contains(
                                        "collapsed"
                                    )
                            ) {

                                return;
                            }


                            group.classList.toggle(
                                "open"
                            );

                        }
                    );

                }
            );



        /* =================================================
           PÁGINA ACTUAL
        ================================================== */

        const currentPath =
            window.location.pathname;


        const currentFile =
            currentPath
                .split("/")
                .pop()
                .replace(
                    ".html",
                    ""
                )
                .replace(
                    ".php",
                    ""
                );



        document
            .querySelectorAll(
                "[data-page]"
            )
            .forEach(
                link => {

                    const page =
                        link.dataset.page;


                    if (
                        page ===
                        currentFile
                    ) {

                        link.classList.add(
                            "active"
                        );

                    }

                }
            );



        /* =================================================
           ABRIR GRUPO ACTIVO
        ================================================== */

        document
            .querySelectorAll(
                ".nav-group"
            )
            .forEach(
                group => {

                    const active =
                        group.querySelector(
                            ".active"
                        );


                    if (active) {

                        group.classList.add(
                            "open"
                        );

                    }

                }
            );



        /* =================================================
           CERRAR SESIÓN
        ================================================== */

        if (logoutLink) {

            logoutLink.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    const confirmar =
                        confirm(
                            "¿Deseas cerrar la sesión?"
                        );


                    if (!confirmar) {
                        return;
                    }


                    /*
                     * login.html está en la raíz.
                     *
                     * Calculamos automáticamente
                     * cuántos niveles debemos subir.
                     */

                    const path =
                        window.location.pathname;


                    const segmentos =
                        path
                            .split("/")
                            .filter(Boolean);


                    /*
                     * Eliminamos el archivo actual.
                     */

                    if (
                        segmentos.length >
                        0
                    ) {

                        segmentos.pop();

                    }


                    /*
                     * Desde la carpeta actual
                     * regresamos a la raíz.
                     */

                    const niveles =
                        segmentos.length;


                    const loginUrl =
                        "../"
                            .repeat(
                                niveles
                            ) +
                        "login.html";


                    if (
                        typeof cerrarSesion ===
                        "function"
                    ) {

                        cerrarSesion(
                            loginUrl
                        );

                    }

                }
            );

        }

    }
);

