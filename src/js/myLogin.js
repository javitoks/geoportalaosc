login = (function () {
    const bcrypt = window.dcodeIO.bcrypt;

    async function process() {
        const errorMessage = document.getElementById("loginErrorMessage");

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
            const res = await fetch("src/config/user.json");
            const users = await res.json();

            const user = users.find(u => u.name === username);

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

            // Guardar cookies
            setCookie("name", user.name);
            setCookie("rol", user.rol);
            setCookie("lat", user.lat_4326);
            setCookie("lon", user.lon_4326);
            setCookie("zoom", user.zoom ?? 13);
            setCookie("isLogged", true);
            setCookie("autologin", recuerdame ? "1" : "0");

            // Redirigir a index.html
            window.location.href = "index.html";

        } catch (err) {
            console.error("Error al verificar usuario:", err);
            errorMessage.textContent = "Error en el login. Intente nuevamente.";
            errorMessage.style.display = "block";
            setTimeout(() => {
                errorMessage.style.display = "none";
            }, 5000);
        }
    }

    function setCookie(name, value, days = 1) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = date.toUTCString();

        const encodedName = encodeURIComponent(name);
        const encodedValue = encodeURIComponent(value);

        let cookieString = `${encodedName}=${encodedValue}; expires=${expires}; path=/;`;

        if (location.protocol === 'https:') {
            cookieString += ' Secure; SameSite=Lax';
        } else {
            cookieString += ' SameSite=Lax';
        }

        document.cookie = cookieString;
    }

    return {
        process
    };
})();
