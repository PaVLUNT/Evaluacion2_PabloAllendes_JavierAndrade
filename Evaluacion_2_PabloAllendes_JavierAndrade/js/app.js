// ===================================
// app.js - Agenda de Contactos
// ===================================

// Variable para guardar el ID del contacto que se va a eliminar
var idAEliminar = null;

// ===================================
// CARGAR NAV Y FOOTER
// ===================================
function cargarComponentes() {
    // Si la pagina esta dentro de /pages necesito subir un nivel
    var ruta = window.location.pathname;
    var prefijo = ruta.includes("/pages/") ? "../" : "";

    fetch(prefijo + "components/nav.html")
        .then(function(respuesta) {
            return respuesta.text();
        })
        .then(function(html) {
            document.getElementById("nav-container").innerHTML = html;
        });

    fetch(prefijo + "components/footer.html")
        .then(function(respuesta) {
            return respuesta.text();
        })
        .then(function(html) {
            document.getElementById("footer-container").innerHTML = html;
        });
}

// ===================================
// LOCALSTORAGE
// ===================================

// Obtener contactos guardados
function obtenerContactos() {
    var datos = localStorage.getItem("contactos");
    if (datos == null) {
        return [];
    }
    return JSON.parse(datos);
}

// Guardar contactos
function guardarEnStorage(arreglo) {
    localStorage.setItem("contactos", JSON.stringify(arreglo));
}

// ===================================
// VALIDACIONES
// ===================================

function validarNombre(nombre) {
    if (nombre.trim() == "") {
        return false;
    }
    return true;
}

function validarEmail(email) {
    // Verifico que tenga @ y un punto despues
    var regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

function validarTelefono(telefono) {
    // Solo numeros
    var regex = /^[0-9]+$/;
    return regex.test(telefono);
}

function validarFormulario() {
    var nombre   = document.getElementById("input-nombre").value;
    var email    = document.getElementById("input-email").value;
    var telefono = document.getElementById("input-telefono").value;

    var hayError = false;

    // Valido nombre
    if (!validarNombre(nombre)) {
        document.getElementById("error-nombre").style.display = "block";
        hayError = true;
    } else {
        document.getElementById("error-nombre").style.display = "none";
    }

    // Valido email
    if (!validarEmail(email)) {
        document.getElementById("error-email").style.display = "block";
        hayError = true;
    } else {
        document.getElementById("error-email").style.display = "none";
    }

    // Valido telefono
    if (telefono.trim() == "" || !validarTelefono(telefono)) {
        document.getElementById("error-telefono").style.display = "block";
        hayError = true;
    } else {
        document.getElementById("error-telefono").style.display = "none";
    }

    return !hayError;
}

// ===================================
// CRUD - AGREGAR, EDITAR, ELIMINAR
// ===================================

// Preparar formulario para contacto nuevo
function prepararNuevo() {
    document.getElementById("titulo-modal").textContent  = "Agregar Contacto";
    document.getElementById("input-nombre").value        = "";
    document.getElementById("input-email").value         = "";
    document.getElementById("input-telefono").value      = "";
    document.getElementById("input-categoria").value     = "Personal";
    document.getElementById("input-id").value            = "";

    // Oculto errores
    document.getElementById("error-nombre").style.display   = "none";
    document.getElementById("error-email").style.display    = "none";
    document.getElementById("error-telefono").style.display = "none";
}

// Guardar (nuevo o editado)
function guardarContacto() {
    // Si hay errores no guardo
    if (!validarFormulario()) {
        return;
    }

    var nombre    = document.getElementById("input-nombre").value.trim();
    var email     = document.getElementById("input-email").value.trim();
    var telefono  = document.getElementById("input-telefono").value.trim();
    var categoria = document.getElementById("input-categoria").value;
    var id        = document.getElementById("input-id").value;

    var contactos = obtenerContactos();

    if (id == "") {
        // Contacto nuevo
        var nuevo = {
            id:        Date.now(),
            nombre:    nombre,
            email:     email,
            telefono:  telefono,
            categoria: categoria,
            favorito:  false
        };
        contactos.push(nuevo);
    } else {
        // Editar contacto existente
        for (var i = 0; i < contactos.length; i++) {
            if (contactos[i].id == id) {
                contactos[i].nombre    = nombre;
                contactos[i].email     = email;
                contactos[i].telefono  = telefono;
                contactos[i].categoria = categoria;
                break;
            }
        }
    }

    guardarEnStorage(contactos);

    // Cerrar modal
    var modal = bootstrap.Modal.getInstance(document.getElementById("modalContacto"));
    modal.hide();

    // Actualizar pantalla
    renderizarContactos(contactos);
    actualizarContadores(contactos);
}

// Cargar datos en el formulario para editar
function editarContacto(id) {
    var contactos = obtenerContactos();
    var contacto  = null;

    for (var i = 0; i < contactos.length; i++) {
        if (contactos[i].id == id) {
            contacto = contactos[i];
            break;
        }
    }

    if (contacto == null) return;

    document.getElementById("titulo-modal").textContent  = "Editar Contacto";
    document.getElementById("input-nombre").value        = contacto.nombre;
    document.getElementById("input-email").value         = contacto.email;
    document.getElementById("input-telefono").value      = contacto.telefono;
    document.getElementById("input-categoria").value     = contacto.categoria;
    document.getElementById("input-id").value            = contacto.id;

    document.getElementById("error-nombre").style.display   = "none";
    document.getElementById("error-email").style.display    = "none";
    document.getElementById("error-telefono").style.display = "none";

    var modal = new bootstrap.Modal(document.getElementById("modalContacto"));
    modal.show();
}

// Mostrar modal de confirmacion para eliminar
function prepararEliminar(id) {
    var contactos = obtenerContactos();

    for (var i = 0; i < contactos.length; i++) {
        if (contactos[i].id == id) {
            idAEliminar = id;
            document.getElementById("nombre-eliminar").textContent = contactos[i].nombre;
            break;
        }
    }

    var modal = new bootstrap.Modal(document.getElementById("modalEliminar"));
    modal.show();
}

// Confirmar y eliminar
function confirmarEliminar() {
    var contactos    = obtenerContactos();
    var nuevo        = [];

    for (var i = 0; i < contactos.length; i++) {
        if (contactos[i].id != idAEliminar) {
            nuevo.push(contactos[i]);
        }
    }

    guardarEnStorage(nuevo);
    idAEliminar = null;

    var modal = bootstrap.Modal.getInstance(document.getElementById("modalEliminar"));
    modal.hide();

    renderizarContactos(nuevo);
    actualizarContadores(nuevo);
}

// Marcar o desmarcar favorito
function toggleFavorito(id) {
    var contactos = obtenerContactos();

    for (var i = 0; i < contactos.length; i++) {
        if (contactos[i].id == id) {
            contactos[i].favorito = !contactos[i].favorito;
            break;
        }
    }

    guardarEnStorage(contactos);
    renderizarContactos(contactos);
    actualizarContadores(contactos);
}

// ===================================
// RENDERIZADO DEL DOM
// ===================================

// Obtener las iniciales del nombre
function obtenerIniciales(nombre) {
    var partes = nombre.trim().split(" ");
    if (partes.length >= 2) {
        return partes[0][0].toUpperCase() + partes[1][0].toUpperCase();
    }
    return partes[0][0].toUpperCase();
}

// Crear el HTML de una tarjeta de contacto
function crearTarjetaHTML(contacto) {
    var iniciales    = obtenerIniciales(contacto.nombre);
    var textoFav     = contacto.favorito ? "Quitar favorito" : "Favorito";
    var claseTarjeta = contacto.favorito ? "card card-contacto card-favorita" : "card card-contacto";
    var claseAvatar  = "avatar avatar-" + contacto.categoria;

    var html = '<div class="col-md-6 col-lg-4">';
    html += '<div class="' + claseTarjeta + '">';
    html += '<div class="card-body d-flex gap-3 align-items-start">';

    // Avatar
    html += '<div class="' + claseAvatar + '">' + iniciales + '</div>';

    // Info
    html += '<div class="info-contacto flex-grow-1">';
    html += '<p class="fw-bold mb-1">' + contacto.nombre + '</p>';
    html += '<p>' + contacto.email + '</p>';
    html += '<p>' + contacto.telefono + '</p>';
    html += '<span class="badge bg-secondary">' + contacto.categoria + '</span>';
    html += '</div>';

    // Botones
    html += '<div class="botones-accion d-flex flex-column gap-1">';
    html += '<button class="btn btn-sm btn-outline-warning" onclick="toggleFavorito(' + contacto.id + ')">' + textoFav + '</button>';
    html += '<button class="btn btn-sm btn-outline-primary" onclick="editarContacto(' + contacto.id + ')">Editar</button>';
    html += '<button class="btn btn-sm btn-outline-danger" onclick="prepararEliminar(' + contacto.id + ')">Eliminar</button>';
    html += '</div>';

    html += '</div></div></div>';

    return html;
}

// Mostrar contactos en la pagina
function renderizarContactos(arreglo) {
    var contenedor   = document.getElementById("lista-contactos");
    var sinContactos = document.getElementById("sin-contactos");

    contenedor.innerHTML = "";

    if (arreglo.length == 0) {
        sinContactos.style.display = "block";
        return;
    }

    sinContactos.style.display = "none";

    for (var i = 0; i < arreglo.length; i++) {
        contenedor.innerHTML += crearTarjetaHTML(arreglo[i]);
    }
}

// Actualizar los numeros de los contadores
function actualizarContadores(arreglo) {
    document.getElementById("total-contactos").textContent = arreglo.length;

    var favoritos = 0;
    for (var i = 0; i < arreglo.length; i++) {
        if (arreglo[i].favorito == true) {
            favoritos++;
        }
    }
    document.getElementById("total-favoritos").textContent = favoritos;
}

// ===================================
// BUSQUEDA
// ===================================

function buscarContacto() {
    var texto     = document.getElementById("input-buscar").value.toLowerCase();
    var contactos = obtenerContactos();
    var resultados = [];

    for (var i = 0; i < contactos.length; i++) {
        var nombre = contactos[i].nombre.toLowerCase();
        if (nombre.indexOf(texto) !== -1) {
            resultados.push(contactos[i]);
        }
    }

    renderizarContactos(resultados);
}

function mostrarTodos() {
    document.getElementById("input-buscar").value = "";
    var contactos = obtenerContactos();
    renderizarContactos(contactos);
}

// ===================================
// FAVORITOS (usado en favoritos.html)
// ===================================
function mostrarFavoritos() {
    var datos     = localStorage.getItem("contactos");
    var contactos = datos ? JSON.parse(datos) : [];
    var favoritos = [];

    for (var i = 0; i < contactos.length; i++) {
        if (contactos[i].favorito == true) {
            favoritos.push(contactos[i]);
        }
    }

    var contenedor = document.getElementById("lista-favoritos");
    var sinFav     = document.getElementById("sin-favoritos");

    if (favoritos.length == 0) {
        sinFav.style.display = "block";
        return;
    }

    sinFav.style.display = "none";

    for (var i = 0; i < favoritos.length; i++) {
        var c         = favoritos[i];
        var iniciales = obtenerIniciales(c.nombre);

        contenedor.innerHTML += '<div class="col-md-6 col-lg-4">' +
            '<div class="card card-contacto card-favorita">' +
            '<div class="card-body d-flex gap-3 align-items-start">' +
            '<div class="avatar avatar-' + c.categoria + '">' + iniciales + '</div>' +
            '<div class="info-contacto">' +
            '<p class="fw-bold mb-1">' + c.nombre + ' (favorito)</p>' +
            '<p>' + c.email + '</p>' +
            '<p>' + c.telefono + '</p>' +
            '<span class="badge bg-secondary">' + c.categoria + '</span>' +
            '</div></div></div></div>';
    }
}

// ===================================
// INICIO
// ===================================
function iniciarApp() {
    cargarComponentes();

    // Si estoy en favoritos.html cargo los favoritos
    if (document.getElementById("lista-favoritos")) {
        mostrarFavoritos();
        return;
    }

    // Si estoy en index.html cargo los contactos
    var contactos = obtenerContactos();
    renderizarContactos(contactos);
    actualizarContadores(contactos);
}

window.onload = iniciarApp;
