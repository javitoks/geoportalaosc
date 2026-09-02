(function (global) {
  "use strict";

  const SESSION_TIMEOUT_MS = 2 * 60 * 60 * 1000;
  const ACTIVITY_WRITE_INTERVAL_MS = 60 * 1000;
  const SESSION_CHECK_INTERVAL_MS = 30 * 1000;
  const LAST_ACTIVITY_COOKIE = "lastActivityAt";
  const COOKIE_NAMES = [
    "autologin",
    "name",
    "rol",
    "lat",
    "lon",
    "zoom",
    "isLogged",
    LAST_ACTIVITY_COOKIE,
  ];

  function cookieOptions() {
    const options = ["Path=/", "SameSite=Lax"];
    if (global.location.protocol === "https:") options.push("Secure");
    return options.join("; ");
  }

  function setCookie(name, value) {
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; ${cookieOptions()}`;
  }

  function getCookie(name) {
    const encodedName = `${encodeURIComponent(name)}=`;
    const cookie = document.cookie
      .split(";")
      .map((item) => item.trim())
      .find((item) => item.startsWith(encodedName));

    return cookie ? decodeURIComponent(cookie.substring(encodedName.length)) : null;
  }

  function create(user) {
    setCookie("name", user.name);
    setCookie("rol", user.rol);
    setCookie("lat", user.lat_4326);
    setCookie("lon", user.lon_4326);
    setCookie("zoom", user.zoom ?? 13);
    setCookie("isLogged", "true");
    setCookie("autologin", "0");
    setCookie(LAST_ACTIVITY_COOKIE, String(Date.now()));
  }

  function clear() {
    COOKIE_NAMES.forEach((name) => {
      document.cookie = `${encodeURIComponent(name)}=; Path=/; SameSite=Lax; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    });
  }

  function hasIdentity() {
    return getCookie("isLogged") === "true" && Boolean(getCookie("name"));
  }

  function isAuthenticated() {
    if (!hasIdentity()) return false;

    const lastActivity = Number(getCookie(LAST_ACTIVITY_COOKIE));
    return Number.isFinite(lastActivity)
      && lastActivity > 0
      && Date.now() - lastActivity < SESSION_TIMEOUT_MS;
  }

  function redirectToLogin(loginUrl) {
    clear();
    global.location.replace(loginUrl || "login.html");
  }

  function logout(loginUrl) {
    redirectToLogin(loginUrl);
  }

  function requireAuthentication(loginUrl) {
    if (!isAuthenticated()) {
      redirectToLogin(loginUrl);
      return false;
    }
    return true;
  }

  function start(loginUrl) {
    if (!requireAuthentication(loginUrl)) return false;

    let lastActivityWrite = 0;

    const verifySession = () => {
      if (!isAuthenticated()) redirectToLogin(loginUrl);
    };

    const registerActivity = () => {
      const now = Date.now();
      if (now - lastActivityWrite < ACTIVITY_WRITE_INTERVAL_MS) return;

      if (!isAuthenticated()) {
        redirectToLogin(loginUrl);
        return;
      }

      setCookie(LAST_ACTIVITY_COOKIE, String(now));
      lastActivityWrite = now;
    };

    ["pointerdown", "keydown", "scroll", "touchstart", "wheel"].forEach((eventName) => {
      global.addEventListener(eventName, registerActivity, { passive: true });
    });

    global.addEventListener("focus", verifySession);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) verifySession();
    });
    global.setInterval(verifySession, SESSION_CHECK_INTERVAL_MS);

    const bindLogoutButtons = () => {
      document.querySelectorAll("[data-auth-logout]").forEach((button) => {
        button.addEventListener("click", () => logout(loginUrl));
      });
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bindLogoutButtons, { once: true });
    } else {
      bindLogoutButtons();
    }

    return true;
  }

  global.AuthSession = {
    SESSION_TIMEOUT_MS,
    clear,
    create,
    getCookie,
    isAuthenticated,
    logout,
    requireAuthentication,
    setCookie,
    start,
  };
})(window);
