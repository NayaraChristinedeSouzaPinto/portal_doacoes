import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {
  getFirestore,
  addDoc,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// ============================
// FIREBASE
// ============================

const firebaseConfig = {
  apiKey: "AIzaSyDORZ-UASrTQfjGXmHgPQOTNZnVZYvSaww",
  authDomain: "portal-doacoes.firebaseapp.com",
  projectId: "portal-doacoes",
  storageBucket: "portal-doacoes.firebasestorage.app",
  messagingSenderId: "883191007180",
  appId: "1:883191007180:web:ce474633f93ead4a83ff69"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ============================
// ELEMENTOS
// ============================

const form = document.getElementById("form");

const telefone = document.getElementById("telefone");

const bairroSelect = document.getElementById("bairro");

const bairroOutro = document.getElementById("bairroOutro");

const valorPix = document.getElementById("valorPix");
if (valorPix) {

  valorPix.addEventListener("input", (e) => {

    let valor = e.target.value
      .replace(/\D/g, "");

    valor = (Number(valor) / 100)
      .toFixed(2)
      .replace(".", ",");

    valor = valor.replace(
      /\B(?=(\d{3})+(?!\d))/g,
      "."
    );

    e.target.value = `R$ ${valor}`;

  });

}

const entregar = document.getElementById("entregar");

const pixCheckbox = document.getElementById("pixCheckbox");

const pixBox = document.getElementById("pixBox");

const pixChave = document.getElementById("pixChave");


// ============================
// ESTADO GLOBAL
// ============================

let todasDoacoes = [];

let tipoSelecionado = "todos";

let filtroEntrega = "todos";


// ============================
// TELEFONE (MÁSCARA)
// ============================

if (telefone) {

  telefone.addEventListener("input", () => {

    let v = telefone.value
      .replace(/\D/g, "")
      .slice(0, 11);

    if (v.length > 6) {

      telefone.value =
        `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;

    } else if (v.length > 2) {

      telefone.value =
        `(${v.slice(0,2)}) ${v.slice(2)}`;

    } else {

      telefone.value = v;

    }

  });

}


// ============================
// BAIRRO "OUTRO"
// ============================

if (bairroSelect && bairroOutro) {

  bairroSelect.addEventListener("change", () => {

    const isOutro =
      bairroSelect.value === "outro";

    bairroOutro.style.display =
      isOutro ? "block" : "none";

    bairroOutro.required = isOutro;

    if (!isOutro) {
      bairroOutro.value = "";
    }

  });

}


// ============================
// MENU PIX
// ============================

if (pixCheckbox && pixBox) {

  pixCheckbox.addEventListener("change", () => {

    if (pixCheckbox.checked) {

      pixBox.classList.remove("hidden");

    } else {

      pixBox.classList.add("hidden");

    }

  });

}


// ============================
// COPIAR PIX
// ============================

if (pixChave) {

  pixChave.addEventListener("click", () => {

    navigator.clipboard.writeText(
      "mvctbasocial@gmail.com"
    );

    alert("Chave PIX copiada!");

  });

}


// ============================
// FORMULÁRIO
// ============================

if (form) {

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    // ============================
    // VALIDA TELEFONE
    // ============================

    const telefoneValor =
      telefone.value.replace(/\D/g, "");

    if (telefoneValor.length < 10) {

      alert("Digite um telefone válido com DDD");

      return;

    }

    // ============================
    // TIPOS DE DOAÇÃO
    // ============================

    const tiposSelecionados = Array.from(

      document.querySelectorAll(
        'input[name="tipo"]:checked'
      )

    ).map(el => el.value);

    if (!tiposSelecionados.length) {

      alert("Selecione pelo menos um tipo de doação");

      return;

    }

    // ============================
    // BAIRRO
    // ============================

    let bairroFinal =
      bairroSelect?.value || "";

    if (bairroFinal === "outro") {

      if (!bairroOutro.value.trim()) {

        alert("Digite o bairro");

        return;

      }

      bairroFinal = bairroOutro.value;

    }

    // ============================
    // SALVAR FIREBASE
    // ============================

    await addDoc(collection(db, "doacoes"), {

      nome: nome.value,

      telefone: telefone.value,

      tipo: tiposSelecionados,

      descricao: descricao.value,

      bairro: bairroFinal,

      valorPix: valorPix?.value || "",

      entregar: entregar?.value || "",

      data: new Date()

    });

    // ============================
    // SUCESSO
    // ============================

    alert("Doação enviada com sucesso!");

    form.reset();

    if (bairroOutro) {

      bairroOutro.style.display = "none";

    }

    if (pixBox) {

      pixBox.classList.add("hidden");

    }

  });

}


// ============================
// CARREGAR DOAÇÕES
// ============================

async function carregarDoacoes() {

  console.log("Entrou em carregarDoacoes");

  const snapshot =
    await getDocs(collection(db, "doacoes"));

    console.log("Quantidade de documentos:", snapshot.size);

  todasDoacoes = [];

  snapshot.forEach((doc) => {

    console.log(doc.data());

    todasDoacoes.push(doc.data());

  });

  filtrarTudo();

}


// ============================
// RENDERIZAR CARDS
// ============================

function renderizarDoacoes(lista) {

  console.log("Entrou em renderizarDoacoes");
  console.log("Lista recebida:", lista);

  const container =
    document.getElementById("cards");

    console.log("Container:", container);

  if (!container) return;

  container.innerHTML = "";

  if (lista.length === 0) {

    container.innerHTML =
      "<p>Nenhuma doação encontrada.</p>";

    return;

  }

  lista.forEach((d) => {

    const card =
      document.createElement("div");

    card.classList.add("card");

    // ============================
    // DESTACA PIX
    // ============================

    if (d.tipo?.includes("PIX")) {

      card.classList.add("pix");

    }

    // ============================
    // HTML CARD
    // ============================

    card.innerHTML = `

      <h3>${d.nome}</h3>

      <p>
        <strong>Telefone:</strong>

        <a 
          href="https://wa.me/55${d.telefone.replace(/\D/g, '')}"
          target="_blank"
        >
          ${d.telefone}
        </a>
      </p>

      <p>
        <strong>Tipo:</strong>
        ${d.tipo?.join(", ") || ""}
      </p>

      <p>
        <strong>Descrição:</strong>
        ${d.descricao || "Não informada"}
      </p>

      <p>
        <strong>Bairro:</strong>
        ${d.bairro}
      </p>

      <p>
        <strong>Entrega:</strong>
        ${d.entregar || "Não informado"}
      </p>

      ${
        d.tipo?.includes("PIX")

        ? `

          <p>
            <strong>Valor PIX:</strong>
            ${d.valorPix || "Não informado"}
          </p>

        `

        : ""
      }

    `;

    container.appendChild(card);

  });

}


// ============================
// FILTRO TIPO
// ============================

window.filtrarTipo = function (tipo) {

  tipoSelecionado = tipo;

  filtrarTudo();

};

// ============================
// FILTRO ENTREGA
// ============================

window.filtrarEntrega = function (tipo) {

  filtroEntrega = tipo;

  filtrarTudo();

};

// ============================
// LIMPAR FILTROS
// ============================

window.limparFiltros = function () {

  console.log("Filtros limpos");

  tipoSelecionado = "todos";

  filtroEntrega = "todos";

  const input =
    document.getElementById("filtroBairro");

  if (input) {
    input.value = "";
  }

  filtrarTudo();

};

// ============================
// FILTRAR TUDO
// ============================

window.filtrarTudo = function () {

  console.log("Entrou em filtrarTudo");
  console.log("Tipo:", tipoSelecionado);
console.log("Entrega:", filtroEntrega);

  const input =
    document.getElementById("filtroBairro");

  const texto =
    input?.value?.trim().toLowerCase() || "";

  const filtradas =
    todasDoacoes.filter((d) => {

      const matchTipo =

        tipoSelecionado === "todos"

        ||

        d.tipo?.includes(tipoSelecionado);

      const matchBairro =

        texto === ""

        ||

        d.bairro
          ?.toLowerCase()
          .includes(texto);

      const matchEntrega =

        filtroEntrega === "todos"

        ||

        d.entregar?.toLowerCase().includes(filtroEntrega);

      return matchTipo && matchBairro && matchEntrega;

    });

  console.log("Filtradas:", filtradas);

  renderizarDoacoes(filtradas);

};


// ============================
// LOGIN FIREBASE
// ============================

window.login = async function () {

  const email =
    document.getElementById("email")?.value;

  const senha =
    document.getElementById("senha")?.value;

  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      senha
    );

  } catch (erro) {

    alert("E-mail ou senha inválidos");

    console.error(erro);

  }

};

// ============================
// VERIFICA LOGIN
// ============================

onAuthStateChanged(auth, (user) => {

  console.log("onAuthStateChanged executou");

  const loginBox =
    document.getElementById("loginBox");

  const painel =
    document.getElementById("painel");

  if (!loginBox || !painel) return;

  if (user) {

    console.log("Usuário logado:", user.email);

    loginBox.style.display = "none";

    painel.style.display = "block";

    console.log("Chamando carregarDoacoes()");

    carregarDoacoes();

  } else {

    console.log("Usuário não logado");

    loginBox.style.display = "block";

    painel.style.display = "none";

  }

});

// ============================
// MOSTRAR SENHA
// ============================

window.toggleSenha = function () {

  const input =
    document.getElementById("senha");

  if (!input) return;

  input.type =

    input.type === "password"

    ? "text"

    : "password";

};


// ============================
// ENTER LOGIN
// ============================

const senhaInput =
  document.getElementById("senha");

if (senhaInput) {

  senhaInput.addEventListener("keypress", (e) => {

    if (e.key === "Enter") {

      login();

    }

  });

}