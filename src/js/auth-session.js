(function (global) {
  "use strict";

  const COOKIE_NAMES = ["autologin", "name", "rol", "lat", "lon", "zoom", "isLogged"];

  function cookieOptions(days) {
    const options = ["Path=/", "SameSite=Lax"];
    if (typeof days === "number") {
      const expires = new Date(Date.now() + days * 86400000);
      options.push(`Expires=${expires.toUTCString()}`);
    }
    if (global.location.protocol === "https:") options.push("Secure");
    return options.join("; ");
  }

  function setCookie(name, value, days) {
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; ${cookieOptions(days)}`;
  }

  function getCookie(name) {
    const encodedName = `${encodeURIComponent(name)}=`;
    const cookie = document.cookie
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(encodedName));

    return cookie ? decodeURIComponent(cookie.substring(encodedName.length)) : null;
  }

  function create(user, remember) {
    const days = remember ? 30 : undefined;
    setCookie("name", user.name, days);
    setCookie("rol", user.rol, days);
    setCookie("lat", user.lat_4326, days);
    setCookie("lon", user.lon_4326, days);
    setCookie("zoom", user.zoom ?? 13, days);
    setCookie("isLogged", "true", days);
    setCookie("autologin", remember ? "1" : "0", days);
  }

  function clear() {
    COOKIE_NAMES.forEach((name) => {
      document.cookie = `${encodeURIComponent(name)}=; Path=/; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
  }

  function isAuthenticated() {
    return getCookie("isLogged") === "true" && Boolean(getCookie("name"));
  }

  function requireAuthentication(loginUrl) {
    if (!isAuthenticated()) {
      clear();
      global.location.replace(loginUrl || "login.html");
      return false;
    }
    return true;
  }

  global.AuthSession = { clear, create, getCookie, isAuthenticated, requireAuthentication, setCookie };
})(window);
