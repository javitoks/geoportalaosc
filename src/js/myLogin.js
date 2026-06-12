window.login = (function () {
  const bcrypt = window.dcodeIO.bcrypt;
  const ERROR_VISIBILITY_MS = 5000;

  let errorTimer;

  function showError(message) {
    const errorMessage = document.getElementById("loginErrorMessage");
    errorMessage.textContent = message;
    errorMessage.hidden = false;

    clearTimeout(errorTimer);
    errorTimer = setTimeout(() => {
      errorMessage.hidden = true;
    }, ERROR_VISIBILITY_MS);
  }

  function clearError() {
    const errorMessage = document.getElementById("loginErrorMessage");
    clearTimeout(errorTimer);
    errorMessage.textContent = "";
    errorMessage.hidden = true;
  }

  function setLoading(isLoading) {
    const loginButton = document.getElementById("loginButton");
    loginButton.disabled = isLoading;
    loginButton.textContent = isLoading ? "Validando..." : "Ingresar";
  }

  async function process() {
    const username = document.getElementById("input-user").value.trim();
    const password = document.getElementById("input-pwd").value.trim();
    const recuerdame = document.getElementById("inp-recuerdame").checked;

    clearError();

    if (!username || !password) {
      showError("Campo vacío, ingrese su usuario y contraseña.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("src/config/user.json");
      const users = await res.json();

      const user = users.find((u) => u.name === username);

      if (!user) {
        showError("Usuario no encontrado.");
        return;
      }

      const passwordOk = await bcrypt.compare(password, user.clave);
      if (!passwordOk) {
        showError("Contraseña no válida, intente nuevamente.");
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
      showError("Error en el login. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  function setCookie(name, value, days = 1) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = date.toUTCString();

    const encodedName = encodeURIComponent(name);
    const encodedValue = encodeURIComponent(value);

    let cookieString = `${encodedName}=${encodedValue}; expires=${expires}; path=/;`;

    if (location.protocol === "https:") {
      cookieString += " Secure; SameSite=Lax";
    } else {
      cookieString += " SameSite=Lax";
    }

    document.cookie = cookieString;
  }

  return {
    process,
  };
})();
