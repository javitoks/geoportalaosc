loginatic = function () {
  this.currentLogin = false;
  this.notLoggedTxt =
    app.login.notLogged || "Contraseña no válida, intente nuevamente";
  this.noPassword = app.login.noPassword || "Campo vacío, ingrese su contraseña";
  this.external_link = null;
  this.init = (conf) => {
    if (getCookie("autologin") == null) {
      setCookie("autologin", 0);
    }
    if (getCookie("autologin") == "1") {
      this._addLogoutButton();
    }
  };

  this.check = () => {
    //setCookie("autologin", 0);
    if (getCookie("autologin") == 1) {
      let lat = getCookie("lat");
      let lon = getCookie("lon");
      let zoom = getCookie("zoom");

      setTimeout(function () {
        if (mapa.setView) {
          mapa.setView([lat, lon], zoom);
        }
      }, 500);
    } else {
      document.getElementById("login-wrapper").style.display = "flex";
    }
  };

  this.process = async () => {
    let pwd = document.getElementById("input-pwd").value;
    var bcrypt = window.dcodeIO.bcrypt;
    
    if (!pwd.length) {
      alert(this.noPassword);
      return;
    }
  
    let result = await fetch("src/config/user.json");
    let user = await result.json();
  
    if (user && user.length > 0) {
      let storedHash = user[0].clave; // Suponiendo que solo hay un usuario
      let isPasswordCorrect = await bcrypt.compare(pwd, storedHash); // Verificar el hash
  
      if (isPasswordCorrect) {
        let recuerdame = $("#inp-recuerdame").prop("checked") ? 1 : 0;
        this.currentLogin = user[0];
  
        let name = user[0].name;
        let lat = user[0].lat_4326;
        let lon = user[0].lon_4326;
        let zoom = user[0].zoom ?? 13;
  
        mapa.setView([lat, lon], zoom);
        document.getElementById("login-wrapper").style.display = "none";
  
        if ($("#btn-logout").length == 0) {
          this._addLogoutButton();
        }
  
        if (recuerdame == 1) {
          setCookie("name", name);
          setCookie("lat", lat);
          setCookie("lon", lon);
          setCookie("zoom", 10);
          setCookie("autologin", 1);
        }
  
      } else {
        alert(this.notLoggedTxt);
      }
  
      if (user[0].external_link) {
        let name = user[0].nam.replaceAll("_", " ");
        menu_ui.removeButton("external-link-li");
        menu_ui.addButton({
          id: "external-link-li",
          link: user[0].external_link,
          text: "Plataforma CONAE " + name,
          title: "Abrir visor Ordenamiento Territorial " + name,
          location: "top"
        });
      }
  
    } else {
      alert(this.notLoggedTxt);
    }
  };

  this.logout = () => {
    this.currentLogin = false;
    setCookie("autologin", 0);
    
    menu_ui.removeButton("external-link-li");
    /* 
        let lat = -40;
        let lon = -59;
        let zoom = 4; 
        mapa.setView([lat, lon], zoom);
        */
    mapa.resetView();
    location.reload();
  };

  this._addLoginWrapper = () => {
    const wrapperHtml = `
            <div class="container-fluid col-12 col-xs-12 col-sm-6 col-md-5 mt-5 text-center center-flex">
                <div class="login">
                    <img src="src/styles/images/aosc.png" width="30%">
                    <h3>Acceso al Visor de mapas</h3>
                    <div class="input-group">
                        <span class="input-group-addon" id="basic-addon1">
                        <i class="fas fa-lock"></i>
                        </span>
                        <input type="password" onkeyup="if (event.keyCode == 13) loginatic.process();" id="input-pwd" class="form-control ui-input-text" placeholder="Clave de Acceso" aria-describedby="basic-addon1" onfocus="if(this.value.trim()=='') this.placeholder='';" onblur="if(this.value.trim()=='') this.placeholder='Clave de Acceso';" required>
                    </div>
                    <div class="checkbox">
                        <label><input type="checkbox" id="inp-recuerdame" name="recuerdame">Recuérdame</label>
                    </div>
                    <button href="javascript:void(0);" class="ui-btn ui-btn-confirm" onclick="loginatic.process();">Ingresar</button>
    
                    <hr>
                    <button href="javascript:void(0);" onclick="document.getElementById('advice-wrapper').style.display = 'flex';" class="ui-btn ui-btn-primary filled">No poseo clave de acceso</button>
                </div>
            </div>

            <div id="advice-wrapper" class="justify-content-center">
                <div class="container-fluid col-12 col-xs-12 col-sm-6 col-md-6 mt-5 text-center" style="display: flex;align-items: center;">
                    <div class="white-modal" style="margin-top:150px;">
                        <a href="javascript:void(0) " class="closer " onclick="document.getElementById( 'advice-wrapper').style.display='none' ; ">
                            <i class="fa fa-times "></i>
                        </a>
                        <p style="margin-top:30px; " 2>Su municipio ya posee clave asignada, la misma ha sido enviada al mail de contacto informado a la Subsecretaría de Relaciones Municipales del Ministerio del Interior.<br> Por favor verifique con las autoridades de su Gobierno Local.</p>
                        <p>En caso de no poder solucionarlo, envíe un mail a: <a href="mailto:datosmunicipales@mininterior.gob.ar " target="_blank ">datosmunicipales@mininterior.gob.ar</a><br> indicando nombre del Gobierno Local, provincia, su nombre y apellido, cargo y teléfono de contacto oficial</p>
                    </div>
                </div>
            </div>
        `;
    $("#login-wrapper").append(wrapperHtml);
  };

  this._addLogoutButton = () => {
    const logoutButton = document.createElement("div");
    logoutButton.className = "leaflet-bar leaflet-control btn-logout";
    logoutButton.id = "btn-logout";
    logoutButton.title = "Cerrar sesión";
    logoutButton.onclick = function () {
      loginatic.logout();
    };
    logoutButton.innerHTML = `<a ><span class="fa fa-sign-out-alt" aria-hidden="true"></span></a>`;

    document.getElementById("mapa").append(logoutButton);
  };
};