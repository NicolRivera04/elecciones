let candidatos = [];
let votos = [];
let eleccionesActivas = false;

const contenedorCandidatos = document.getElementById("candidatos");
const adminURL = "https://raw.githubusercontent.com/cesarmcuellar/Elecciones/refs/heads/main/administrador.json";

function guardarVotos() {
  localStorage.setItem("resultadoVotos", JSON.stringify(votos));
}

function cargarVotos() {
  try {
    const datos = localStorage.getItem("resultadoVotos");
    if (datos) votos = JSON.parse(datos);
  } catch (e) {
    votos = [];
    guardarVotos();
  }
}

function mostrarCandidatos() {
  if (!eleccionesActivas) return;

  contenedorCandidatos.removeAttribute("hidden");
  contenedorCandidatos.innerHTML = "";

  candidatos.forEach((candidato, index) => {
    const col = document.createElement("div");
    col.className = "col-sm-6 col-md-4 col-lg-3 mb-4";

    const card = document.createElement("div");
    card.className = "card h-100";

    const header = document.createElement("div");
    header.className = "card-header text-center fw-bold";
    header.textContent = candidato.curso;

    const body = document.createElement("div");
    body.className = "card-body text-center";

    const img = document.createElement("img");
    img.src = candidato.foto;
    img.className = "img-fluid rounded mb-3";
    img.style.height = "200px";
    img.style.cursor = "pointer";

    img.addEventListener("click", () => {
      if (!eleccionesActivas) return;
      Swal.fire({
        title: `¿Está seguro de votar por ${candidato.nombre}?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí",
        cancelButtonText: "No"
      }).then(res => {
        if (res.isConfirmed) {
          votos[index]++;
          guardarVotos();
          Swal.fire("Voto registrado", "Gracias por participar", "success");
        }
      });
    });

    const nombre = document.createElement("p");
    nombre.innerHTML = `<strong>Aprendiz:</strong> ${candidato.nombre} ${candidato.apellido}`;

    const ficha = document.createElement("p");
    ficha.innerHTML = `<strong>Ficha:</strong> ${candidato.ficha}`;

    body.appendChild(img);
    body.appendChild(nombre);
    body.appendChild(ficha);
    card.appendChild(header);
    card.appendChild(body);
    col.appendChild(card);
    contenedorCandidatos.appendChild(col);
  });
}

function obtenerCandidatos() {
  fetch("https://raw.githubusercontent.com/CesarMCuellarCha/apis/main/candidatos.json")
    .then(res => res.json())
    .then(data => {
      candidatos = data;
      if (votos.length !== data.length) {
        votos = new Array(data.length).fill(0);
        guardarVotos();
      }
      mostrarCandidatos();
    })
    .catch(() => {
      Swal.fire("Error", "No se pudieron cargar los candidatos.", "error");
    });
}

document.getElementById("btnAbrir").addEventListener("click", () => {
  Swal.fire({
    title: "Iniciar elecciones",
    html:
      '<input type="text" id="user" class="swal2-input" placeholder="Usuario">' +
      '<input type="password" id="pass" class="swal2-input" placeholder="Contraseña">',
    confirmButtonText: "Ingresar",
    preConfirm: () => {
      const user = document.getElementById("user").value;
      const pass = document.getElementById("pass").value;
      return fetch(adminURL)
        .then(r => r.json())
        .then(admin => {
          if (user === admin.username && pass === admin.password) {
            eleccionesActivas = true;
            obtenerCandidatos();
          } else {
            Swal.showValidationMessage("Credenciales incorrectas");
          }
        });
    }
  });
});

document.getElementById("btnCerrar").addEventListener("click", () => {
  Swal.fire({
    title: "Cerrar elecciones",
    html: '<input type="password" id="pass" class="swal2-input" placeholder="Contraseña">',
    confirmButtonText: "Confirmar",
    preConfirm: () => {
      const pass = document.getElementById("pass").value;
      return fetch(adminURL)
        .then(r => r.json())
        .then(admin => {
          if (pass === admin.password) {
            eleccionesActivas = false;
            votos = new Array(candidatos.length).fill(0);
            guardarVotos();
            contenedorCandidatos.setAttribute("hidden", "true");
            Swal.fire("Elecciones cerradas", "Completaste tus elecciones", "success");
          } else {
            Swal.showValidationMessage("Contraseña incorrecta");
          }
        });
    }
  });
});

cargarVotos();