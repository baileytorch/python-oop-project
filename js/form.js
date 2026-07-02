window.onload = function () {
    cargarOpciones();
    cargarComunas();
    $('#alertNombre').hide();
    $('#alertEmail').hide();
    $('#alertContrasena').hide();
    $('#alertRepetirContrasena').hide();
    $('#alertFoto').hide();
};

function validarFormulario() {
    const nombre = $("#inputNombre");
    const email = $("#inputEmail");
    const fechaNacimiento = $("#inputFechaNacimiento");
    const nacionalidad = $("#selectNacionalidad");
    const direccion = $("#inputDireccion");
    const genero = $('#selectGenero');
    const contrasena = $("#inputContrasena");
    const repetirContrasena = $("#inputRepetirContrasena");
    const foto = $("#inputFoto");
    let formularioValido = true;

    if (!validarInput(nombre, $('#alertNombre'), "El campo NOMBRE es obligatorio.")) {
        formularioValido = false;
    }
    if (!validarEmail(email, $('#alertEmail'), "El campo EMAIL es obligatorio.")) {
        formularioValido = false;
    }
    if (!validarContrasena(contrasena, $('#alertContrasena'), "El campo CONTRASEÑA es obligatorio.")) {
        formularioValido = false;
    }
    if (!validarInput(repetirContrasena, $('#alertRepetirContrasena'), "El campo REPETIR CONTRASEÑA es obligatorio.")) {
        formularioValido = false;
    }
    if (!validarInput(foto, $('#alertFoto'), "Debe seleccionar una imagen para cargar.")) {
        formularioValido = false;
    }

    return formularioValido;
};

function validarInput(input, alert, mensaje) {
    const valor = input.val()?.trim() ?? '';
    if (valor === '') {
        input.addClass("is-invalid");
        alert.text(mensaje);
        alert.show();
        return false;
    } else {
        input.removeClass("is-invalid");
        input.addClass("is-valid");
        alert.hide();
        return true;
    }
};

function validarEmail(input, alert, mensaje) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (validarInput(input, alert, mensaje)) {
        if (!emailRegex.test(input.val())) {
            input.addClass("is-invalid");
            input.removeClass("is-valid");
            alert.text('El formato del EMAIL es incorrecto.');
            alert.show();
            return false;
        } else {
            input.removeClass("is-invalid");
            input.addClass("is-valid");
            alert.hide();
            return true;
        }
    }
    return false;
};

function validarContrasena(contrasena, alert, mensaje) {
    const contrasenaRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (validarInput(contrasena, alert, mensaje)) {
        if (!contrasenaRegex.test(contrasena.val())) {
            contrasena.addClass("is-invalid");
            contrasena.removeClass("is-valid");
            alert.text('La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un carácter especial.');
            alert.show();
            return false;
        } else {
            contrasena.removeClass("is-invalid");
            contrasena.addClass("is-valid");
            alert.hide();
            return true;
        }
    }
    return false;
};

function validarRepetirContrasena(contrasena, repetirContrasena, alert, mensaje) {
    if (validarInput(repetirContrasena, alert, mensaje)) {
        if (contrasena.val() !== repetirContrasena.val()) {
            repetirContrasena.addClass("is-invalid");
            repetirContrasena.removeClass("is-valid");
            alert.text('Las contraseñas no coinciden.');
            alert.show();
            return false;
        } else {
            repetirContrasena.removeClass("is-invalid");
            repetirContrasena.addClass("is-valid");
            alert.hide();
            return true;
        }
    }
    return false;
};

async function enviarFormulario() {
    if (validarFormulario()) {
        const formulario = $('#formularioRegistro')[0];
        const formData = new FormData(formulario);

        const contrasena = formData.get('contrasena');
        const hashContrasena = await hashPassword(contrasena);
        formData.set('contrasena', hashContrasena);

        const direccion = {
            comuna: formData.get('comuna'),
            calle: formData.get('calle'),
            numero: formData.get('numero'),
            departamento: formData.get('departamento')
        };
        formData.set('direccion', JSON.stringify(direccion));

        const archivoFoto = formData.get('foto');
        const nombreArchivo = archivoFoto.name;
        formData.set('foto', nombreArchivo);

        const datos = Object.fromEntries(formData.entries());

        try {
            const respuesta = await fetch("http://localhost:3000/guardar", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(datos),
            });
            const data = await respuesta.text();
            console.log(data);
            if (respuesta.ok) {
                window.location.href = './index.html';
            }

        } catch (err) {
            console.error("Error:", err);
        }
    } else {
        $('#modalErrores').modal('show');
    }
};

function limpiarFormulario() {
    $('#formularioRegistro')[0].reset();
    $('.is-invalid').removeClass('is-invalid');
    $('.is-valid').removeClass('is-valid');
    $('.alert').alert('close');
}

async function cargarOpciones() {
    try {
        const respuesta = await fetch('http://localhost:3000/paises');
        const datos = await respuesta.json();

        const select = document.getElementById('selectNacionalidad');

        datos.forEach(item => {
            const opcion = document.createElement('option');
            opcion.value = item.iso_2; // Valor interno
            opcion.textContent = item.nombre; // Texto visible para el usuario
            select.appendChild(opcion);
        });
    } catch (error) {
        console.error('Error cargando opciones:', error);
    }
};

async function cargarComunas() {
    try {
        const respuesta = await fetch('http://localhost:3000/comunas');
        const datos = await respuesta.json();

        const select = document.getElementById('selectComuna');

        datos.forEach(item => {
            const opcion = document.createElement('option');
            opcion.value = item.COMUNA_INE; // Valor interno
            opcion.textContent = item.N_COMUNA; // Texto visible para el usuario
            select.appendChild(opcion);
        });
    } catch (error) {
        console.error('Error cargando opciones:', error);
    }
};

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Validar Contraseña al escribir
// https://www.google.com/search?q=jquery+validar+contraseña+segura+al+escribir+un+texto&client=opera&hs=beM&sca_esv=9e14c540528a302f&sxsrf=APpeQnvACidEdIOkbk7KoKvfcOqW5hm0gQ%3A1782840494465&ei=rvxDaqqCHJKf5OUP65iioAQ&oq=jquery+validar+contraseña+segura+al+escribir&gs_lp=Egxnd3Mtd2l6LXNlcnAiLWpxdWVyeSB2YWxpZGFyIGNvbnRyYXNlw7FhIHNlZ3VyYSBhbCBlc2NyaWJpcioCCAEyBRAhGKABMgUQIRigAUjUNVD8B1jjHXABeACQAQCYAZwBoAGdDKoBBDAuMTK4AQPIAQD4AQGYAgugAvALwgIFECEYnwXCAgcQIRgKGKABwgIEECEYFZgDAIgGAZIHBDAuMTGgB68xsgcEMC4xMbgH8AvCBwcwLjYuMy4yyAcygAgB&sclient=gws-wiz-serp