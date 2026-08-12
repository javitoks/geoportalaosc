login = (function () {
    const bcrypt = window.dcodeIO.bcrypt;

    async function process() {
        const errorMessage = document.getElementById("loginErrorMessage");
        const loginButton = document.getElementById("loginButton");

        const username = document.getElementById("input-user").value.trim();
        const password = document.getElementById("input-pwd").value.trim();
        const recuerdame = document.getElementById("inp-recuerdame").checked;

        // Limpiar error previo
        errorMessage.textContent = "";
        errorMessage.style.display = "none";

        if (!username || !password) {
            errorMessage.textContent = "Campo vacío, ingrese su usuario y contraseña.";
            errorMessage.style.display = "block";
            setTimeout(() => {
                errorMessage.style.display = "none";
            }, 5000);
            return;
        }

        try {
            loginButton.disabled = true;
            loginButton.textContent = "Verificando…";

            if (!window.dcodeIO?.bcrypt) {
                throw new Error("No se pudo cargar el verificador de contraseñas.");
            }

            const res = await fetch("src/config/user.json", { cache: "no-store" });
            if (!res.ok) throw new Error(`No se pudo cargar la configuración de usuarios (${res.status}).`);
            const users = await res.json();

            const user = users.find(u => u.name.toLowerCase() === username.toLowerCase());

            if (!user) {
                errorMessage.textContent = "Usuario no encontrado.";
                errorMessage.style.display = "block";
                setTimeout(() => {
                    errorMessage.style.display = "none";
                }, 5000);
                return;
            }

            const passwordOk = await bcrypt.compare(password, user.clave);
            if (!passwordOk) {
                errorMessage.textContent = "Contraseña no válida, intente nuevamente.";
                errorMessage.style.display = "block";
                setTimeout(() => {
                    errorMessage.style.display = "none";
                }, 5000);
                return;
            }

            AuthSession.create(user, recuerdame);

            // Redirigir a index.html
            window.location.href = "index.html";

        } catch (err) {
            console.error("Error al verificar usuario:", err);
            errorMessage.textContent = "Error en el login. Intente nuevamente.";
            errorMessage.style.display = "block";
            setTimeout(() => {
                errorMessage.style.display = "none";
            }, 5000);
        } finally {
            loginButton.disabled = false;
            loginButton.textContent = "Ingresar";
        }
    }

    return {
        process
    };
})();
