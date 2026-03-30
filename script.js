import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, addDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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


// ELEMENTOS
const form = document.getElementById("form");
const telefone = document.getElementById("telefone");
const bairroSelect = document.getElementById("bairro");
const bairroOutro = document.getElementById("bairroOutro");


// FORMATAÇÃO TELEFONE
if (telefone) {
  telefone.addEventListener("input", () => {
    let v = telefone.value.replace(/\D/g, "");

    if (v.length > 11) v = v.slice(0, 11);

    if (v.length > 6) {
      telefone.value = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    } else if (v.length > 2) {
      telefone.value = `(${v.slice(0,2)}) ${v.slice(2)}`;
    } else {
      telefone.value = v;
    }
  });
}

// BAIRRO "OUTRO"
if (bairroSelect) {
  bairroSelect.addEventListener("change", () => {
    if (bairroSelect.value === "outro") {
      bairroOutro.style.display = "block";
      bairroOutro.required = true;
    } else {
      bairroOutro.style.display = "none";
      bairroOutro.required = false;
      bairroOutro.value = "";
    }
  });
}

// ENVIO DO FORMULÁRIO
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    //  VALIDAR TELEFONE
    const telefoneValor = telefone.value.replace(/\D/g, "");

    if (telefoneValor.length < 10 || telefoneValor.length > 11) {
      alert("Digite um telefone válido com DDD");
      return;
    }

    //  DEFINIR BAIRRO FINAL
    let bairroFinal = bairroSelect.value;

    if (bairroSelect.value === "outro") {
      if (!bairroOutro.value.trim()) {
        alert("Digite o bairro");
        return;
      }
      bairroFinal = bairroOutro.value;
    }

    // SALVAR
    await addDoc(collection(db, "doacoes"), {
      nome: nome.value,
      telefone: telefone.value,
      tipo: tipo.value,
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

// LISTAR DOAÇÕES (ADMIN)
const container = document.getElementById("cards");

if (container) {
  const querySnapshot = await getDocs(collection(db, "doacoes"));

  querySnapshot.forEach((doc) => {
    const d = doc.data();

    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
      <h3>${d.nome}</h3>
      <p><strong>Telefone:</strong> ${d.telefone}</p>
      <p><strong>Tipo:</strong> ${d.tipo}</p>
      <p><strong>Bairro:</strong> ${d.bairro}</p>
    `;

    container.appendChild(card);
  });
}