import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, addDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// ============================
// FIREBASE
// ============================
const firebaseConfig = {
  apiKey: "SUA_KEY",
  authDomain: "portal-doacoes.firebaseapp.com",
  projectId: "portal-doacoes",
  storageBucket: "portal-doacoes.firebasestorage.app",
  messagingSenderId: "883191007180",
  appId: "1:883191007180:web:ce474633f93ead4a83ff69"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================
// ELEMENTOS
// ============================
const form = document.getElementById("form");
const telefone = document.getElementById("telefone");
const bairroSelect = document.getElementById("bairro");
const bairroOutro = document.getElementById("bairroOutro");

// ============================
// ESTADO GLOBAL
// ============================
let todasDoacoes = [];
let tipoSelecionado = "todos";

// ============================
// TELEFONE (MÁSCARA)
// ============================
if (telefone) {
  telefone.addEventListener("input", () => {
    let v = telefone.value.replace(/\D/g, "").slice(0, 11);

    if (v.length > 6) {
      telefone.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    } else if (v.length > 2) {
      telefone.value = `(${v.slice(0,2)}) ${v.slice(2)}`;
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
    const isOutro = bairroSelect.value === "outro";

    bairroOutro.style.display = isOutro ? "block" : "none";
    bairroOutro.required = isOutro;

    if (!isOutro) bairroOutro.value = "";
  });
}

// ============================
// FORMULÁRIO
// ============================
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const telefoneValor = telefone.value.replace(/\D/g, "");

    if (telefoneValor.length < 10) {
      alert("Digite um telefone válido com DDD");
      return;
    }

    const tiposSelecionados = Array.from(
      document.querySelectorAll('input[name="tipo"]:checked')
    ).map(el => el.value);

    if (!tiposSelecionados.length) {
      alert("Selecione pelo menos um tipo de doação");
      return;
    }

    let bairroFinal = bairroSelect?.value || "";

    if (bairroFinal === "outro") {
      if (!bairroOutro.value.trim()) {
        alert("Digite o bairro");
        return;
      }
      bairroFinal = bairroOutro.value;
    }

    await addDoc(collection(db, "doacoes"), {
      nome: nome.value,
      telefone: telefone.value,
      tipo: tiposSelecionados,
      descricao: descricao.value,
      bairro: bairroFinal,
      data: new Date()
    });

    alert("Doação enviada com sucesso!");
    form.reset();

    if (bairroOutro) {
      bairroOutro.style.display = "none";
    }
  });
}

// ============================
// CARREGAR DOAÇÕES
// ============================
async function carregarDoacoes() {
  const snapshot = await getDocs(collection(db, "doacoes"));

  todasDoacoes = [];

  snapshot.forEach((doc) => {
    todasDoacoes.push(doc.data());
  });

  // 🔥 AGORA USA O FILTRO SEMPRE
  filtrarTudo();
}

// ============================
// RENDER
// ============================
function renderizarDoacoes(lista) {
  const container = document.getElementById("cards");
  if (!container) return;

  container.innerHTML = "";

  if (lista.length === 0) {
    container.innerHTML = "<p>Nenhuma doação encontrada.</p>";
    return;
  }

  lista.forEach((d) => {
    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <h3>${d.nome}</h3>
      <p><strong>Telefone:</strong> ${d.telefone}</p>
      <p><strong>Tipo:</strong> ${d.tipo?.join(", ") || ""}</p>
      <p><strong>Bairro:</strong> ${d.bairro}</p>
    `;

    container.appendChild(card);
  });
}

// ============================
// FILTROS
// ============================
window.filtrarTipo = function (tipo) {
  tipoSelecionado = tipo;
  filtrarTudo();
};

window.filtrarTudo = function () {
  const input = document.getElementById("filtroBairro");
  const texto = input?.value?.trim().toLowerCase() || "";

  const filtradas = todasDoacoes.filter((d) => {

    const matchTipo =
      tipoSelecionado === "todos" ||
      d.tipo?.includes(tipoSelecionado);

    const matchBairro =
      texto === "" ||
      d.bairro?.toLowerCase().includes(texto);

    return matchTipo && matchBairro;
  });

  renderizarDoacoes(filtradas);
};

// ============================
// LOGIN
// ============================
window.login = function () {
  const senha = document.getElementById("senha")?.value;

  if (senha === "mancha123") {
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("painel").style.display = "block";

    carregarDoacoes();
  } else {
    alert("Senha incorreta!");
  }
};

// ============================
// MOSTRAR SENHA
// ============================
window.toggleSenha = function () {
  const input = document.getElementById("senha");
  if (!input) return;

  input.type = input.type === "password" ? "text" : "password";
};

// ============================
// ENTER LOGIN
// ============================
const senhaInput = document.getElementById("senha");

if (senhaInput) {
  senhaInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") login();
  });
}