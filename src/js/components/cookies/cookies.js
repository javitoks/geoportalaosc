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
function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}