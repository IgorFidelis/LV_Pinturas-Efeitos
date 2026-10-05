let g = document.getElementById("gal"),
  bs = g.querySelectorAll("button"),
  fs = document.querySelectorAll(".filters button");
fs.forEach(function (f) {
  f.onclick = function () {
    fs.forEach(function (o) {
      o.setAttribute("aria-pressed", o === f);
    });
    bs.forEach(function (b) {
      b.hidden = f.dataset.f !== "all" && b.dataset.c !== f.dataset.f;
    });
  };
});
let lb = document.getElementById("lb");
bs.forEach(function (b) {
  b.onclick = function () {
    let i = b.querySelector("img");
    lb.querySelector("img").src = i.src;
    lb.querySelector("img").alt = i.alt;
    lb.querySelector("p").textContent = b.dataset.t;
    lb.showModal();
  };
});
document.getElementById("x").onclick = function () {
  lb.close();
};
lb.onclick = function (e) {
  if (e.target === lb) lb.close();
};

/* ===== COMENTÁRIOS (Firebase / Firestore) =====
   Preencha as duas linhas abaixo com os dados do seu projeto no Firebase.
   Enquanto estiverem vazias, o formulário envia o comentário pelo WhatsApp. */
const FB_PROJECT = ""; // ex.: lv-pinturas-12345
const FB_KEY = ""; // ex.: AIzaSy...
const ZAP = "5511913304248";
const BASE =
  "https://firestore.googleapis.com/v1/projects/" +
  FB_PROJECT +
  "/databases/(default)/documents";
const lista = document.getElementById("lista"),
  cf = document.getElementById("cform"),
  msg = document.getElementById("msg");

function add(c) {
  const d = document.createElement("div");
  d.className = "cmt";
  const b = document.createElement("b");
  b.textContent = c.nome;
  const s = document.createElement("span");
  s.className = "st";
  s.setAttribute("aria-label", "Nota " + c.nota + " de 5");
  s.textContent = "\u2605".repeat(c.nota);
  const p = document.createElement("p");
  p.textContent = c.texto;
  d.appendChild(b);
  d.appendChild(s);
  d.appendChild(p);
  lista.appendChild(d);
}

function carregar() {
  fetch(BASE + ":runQuery?key=" + FB_KEY, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: "comentarios" }],
        where: {
          fieldFilter: {
            field: { fieldPath: "aprovado" },
            op: "EQUAL",
            value: { booleanValue: true },
          },
        },
        orderBy: [
          { field: { fieldPath: "criadoEm" }, direction: "DESCENDING" },
        ],
        limit: 20,
      },
    }),
  })
    .then(function (r) {
      return r.json();
    })
    .then(function (rows) {
      const l = [];
      rows.forEach(function (r) {
        if (!r.document) return;
        const f = r.document.fields;
        l.push({
          nome: f.nome.stringValue,
          nota: parseInt(f.nota.integerValue, 10),
          texto: f.texto.stringValue,
          t: (f.criadoEm && f.criadoEm.timestampValue) || "",
        });
      });
      l.sort(function (a, b) {
        return a.t < b.t ? 1 : -1;
      });
      l.forEach(add);
    })
    .catch(function () {});
}
if (FB_PROJECT && FB_KEY) carregar();

cf.onsubmit = function (e) {
  e.preventDefault();
  const f = new FormData(cf);
  const nome = String(f.get("nome")).trim(),
    nota = parseInt(f.get("nota"), 10),
    texto = String(f.get("texto")).trim();
  if (FB_PROJECT && FB_KEY) {
    msg.textContent = "Enviando...";
    fetch(BASE + "/comentarios?key=" + FB_KEY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fields: {
          nome: { stringValue: nome },
          nota: { integerValue: String(nota) },
          texto: { stringValue: texto },
          aprovado: { booleanValue: false },
          criadoEm: { timestampValue: new Date().toISOString() },
        },
      }),
    })
      .then(function (r) {
        if (!r.ok) throw 0;
        cf.reset();
        msg.textContent =
          "Obrigado! Seu comentário foi enviado e aparecerá no site após a aprovação.";
      })
      .catch(function () {
        msg.textContent = "Não foi possível enviar agora. Tente novamente.";
      });
  } else {
    const t =
      "Comentário para o site da LV (nota " +
      nota +
      "/5) de " +
      nome +
      ": " +
      texto;
    window.open(
      "https://wa.me/" + ZAP + "?text=" + encodeURIComponent(t),
      "_blank",
      "noopener",
    );
    msg.textContent =
      "Abrimos o WhatsApp para você enviar o comentário. Obrigado!";
  }
};
