login = (function () {
    const bcrypt = window.dcodeIO.bcrypt;
    const errorMessage = document.getElementById("loginErrorMessage");

    function setCookie(name, value, days = 1) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = date.toUTCString();

        // Encode name and value to handle special characters
        const encodedName = encodeURIComponent(name);
        const encodedValue = encodeURIComponent(value);

        // Build the cookie string
        let cookieString = `${encodedName}=${encodedValue}; expires=${expires}; path=/;`;

        // Add SameSite and Secure attributes for modern browsers
        // Consider your use case for SameSite.
        // 'Lax' is a good default for same-site cookies.
        // Use 'None; Secure' only if you explicitly need cross-site cookies AND are on HTTPS.
        if (location.protocol === 'https:') {
            cookieString += ' Secure; SameSite=Lax'; // Or SameSite=None if cross-site is needed (and HTTPS)
        } else {
            cookieString += ' SameSite=Lax'; // Use Lax for http as well
        }

        document.cookie = cookieString;
    }

    async function process() {
        const username = document.getElementById("input-user").value.trim();
        const password = document.getElementById("input-pwd").value.trim();
        const recuerdame = document.getElementById("inp-recuerdame").checked;

        if (!username || !password) {
            errorMessage.textContent = "Campo vacío, ingrese su usuario y contraseña.";
            errorMessage.style.display = "block";
            return;
        }

        try {
            const res = await fetch("src/config/user.json");
            const users = await res.json();

            const user = users.find(u => u.name === username);

            if (!user) {
                errorMessage.textContent = "Usuario no encontrado.";
                errorMessage.style.display = "block";
                return;
            }

            const passwordOk = await bcrypt.compare(password, user.clave);
            if (!passwordOk) {
                errorMessage.textContent = "Contraseña no válida, intente nuevamente.";
                errorMessage.style.display = "block";
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
        }
    }

    return {
        process
    };
})();