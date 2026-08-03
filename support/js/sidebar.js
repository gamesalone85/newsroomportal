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
================================================= */

if (logoutLink) {

    logoutLink.addEventListener(
        "click",
        async event => {

            event.preventDefault();


            const confirmar =
                confirm(
                    "¿Deseas cerrar la sesión?"
                );


            if (!confirmar) {

                return;

            }


            console.log(
                "Newsroom Portal: cerrando sesión..."
            );


            /*
             * login.html se encuentra en la raíz
             * del proyecto.
             *
             * Las páginas de Support están
             * normalmente a dos niveles:
             *
             * support/dashboard/
             * support/tickets/
             * support/inventory/
             * support/admin/
             */

            const loginUrl =
                "../../login.html";


            if (
                typeof cerrarSesion ===
                "function"
            ) {

                await cerrarSesion(
                    loginUrl
                );

            }
            else {

                console.error(
                    "Newsroom Portal: cerrarSesion() no está disponible."
                );


                localStorage.removeItem(
                    "newsroomSession"
                );


                window.location.href =
                    loginUrl;

            }

        }
    );

}
