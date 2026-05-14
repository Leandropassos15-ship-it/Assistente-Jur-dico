/* =========================
   SISTEMA LUZIA
========================= */

let audiencias = [];

let eventosGoogle = [];

let notificacoesEnviadas = [];



/* =========================
   FILTRAR AUDIÊNCIAS
========================= */

function filtrarAudiencias() {

  const texto =
    document
      .getElementById("pauta")
      .value;



  const linhas =
    texto.split("\n");



  audiencias = [];



  linhas.forEach((linhaOriginal) => {

    let linha =
      linhaOriginal.trim();



    if (!linha) return;



    linha = linha

      .replace(/–/g, "-")

      .replace(/—/g, "-")

      .replace(/\s+/g, " ")

      .trim();



    const horarioMatch =
      linha.match(/\d{2}:\d{2}/);



    if (!horarioMatch)
      return;



    const horario =
      horarioMatch[0];



    const linkMatch =
      linha.match(
        /(https?:\/\/[^\s]+)/gi
      );



    const link =
      linkMatch
        ? linkMatch[0]
        : "";



    linha = linha.replace(
      /^\d+\.\s*/,
      ""
    );



    linha = linha.replace(
      horario,
      ""
    ).trim();



    const indexTraco =
      linha.indexOf("-");



    if (indexTraco === -1)
      return;



    const processo =
      linha
        .substring(0, indexTraco)
        .trim();



    const participantes =
      linha
        .substring(indexTraco + 1)
        .trim();



    /* SOMENTE LUZIA */

    if (

      !participantes
        .toLowerCase()
        .includes("luzia")

    ) {

      return;

    }



    const lados =
      processo.split(/ x /i);



    const empresa =
      lados[0]
        ? lados[0].trim()
        : "Não encontrado";



    const cliente =
      lados[1]
        ? lados[1].trim()
        : "Não encontrado";



    const status =
      calcularStatus(
        horario
      );



    audiencias.push({

      id:
        Date.now() + Math.random(),

      horario,

      empresa,

      cliente,

      participantes,

      status:
        status.texto,

      classe:
        status.classe,

      finalizada: false,

      descricao:

        `${empresa} x ${cliente}`,

      link

    });

  });



 ordenarAudiencias();

vincularEventosGoogle();

atualizarCards();

mostrarAudiencias();
}



/* =========================
   ORDENAR
========================= */

function ordenarAudiencias() {

  audiencias.sort((a, b) =>

    a.horario.localeCompare(
      b.horario
    )

  );

}



/* =========================
   STATUS
========================= */

function calcularStatus(horario) {

  const agora =
    new Date();



  const agoraMin =

    agora.getHours() * 60 +

    agora.getMinutes();



  const [h, m] =
    horario.split(":");



  const audMin =

    parseInt(h) * 60 +

    parseInt(m);



  const diff =
    audMin - agoraMin;



  if (diff < 0) {

    return {

      texto: "Encerrada",

      classe: "passada"

    };

  }



  if (diff <= 15) {

    return {

      texto: "Muito próxima",

      classe: "urgente"

    };

  }



  if (diff <= 60) {

    return {

      texto: "Se aproximando",

      classe: "atencao"

    };

  }



  return {

    texto: "Ainda distante",

    classe: "normal"

  };

}



/* =========================
   MOSTRAR AUDIÊNCIAS
========================= */

function mostrarAudiencias(lista = audiencias) {

  const resultado =
    document.getElementById(
      "resultado"
    );



  resultado.innerHTML = "";



  if (lista.length === 0) {

    resultado.innerHTML = `

      <div class="audiencia">

        <strong>

          Nenhuma audiência encontrada

        </strong>

      </div>

    `;

    return;

  }



  const grupos = {

    manha: [],

    tarde: [],

    noite: []

  };



  lista.forEach((item) => {

    const hora =
      parseInt(
        item.horario.split(":")[0]
      );



    if (hora < 12) {

      grupos.manha.push(item);

    }

    else if (hora < 18) {

      grupos.tarde.push(item);

    }

    else {

      grupos.noite.push(item);

    }

  });



  renderGrupo(
    "MANHÃ",
    grupos.manha
  );



  renderGrupo(
    "TARDE",
    grupos.tarde
  );



  renderGrupo(
    "NOITE",
    grupos.noite
  );

}



/* =========================
   RENDER GRUPO
========================= */

function renderGrupo(
  titulo,
  itens
) {

  const resultado =
    document.getElementById(
      "resultado"
    );



  if (itens.length === 0)
    return;



  const tituloDiv =
    document.createElement("div");



  tituloDiv.className =
    "periodo";



  tituloDiv.innerHTML = `

    <h2>

      ${titulo}

    </h2>

  `;



  resultado.appendChild(
    tituloDiv
  );



  itens.forEach((item) => {

    const div =
      document.createElement("div");



    div.className =
      `audiencia ${item.classe}`;



    div.innerHTML = `

      <div class="topo-audiencia">

        <div>

          <strong>

            ${item.horario}
            —
            ${item.empresa}

          </strong>

          <p>

            ${item.status}

          </p>

        </div>

      </div>



      <div class="conteudo-audiencia">

        <p>

          <strong>
            Autor:
          </strong>

          ${item.cliente}

        </p>



        <p>

          <strong>
            Participantes:
          </strong>

          ${item.participantes}

        </p>



        <p>

          <strong>
            Descrição:
          </strong>

          ${item.descricao}

        </p>



        <p>

          <strong>
            Status:
          </strong>

          ${item.status}

        </p>



        ${

          item.link

          ?

          `

          <a
            href="${item.link}"
            target="_blank"
          >

            <button>

              Entrar na Chamada

            </button>

          </a>

          `

          :

          ""

        }



        <button
          class="btn-finalizar"
          onclick="toggleFinalizada('${item.id}')"
        >

          ${

            item.finalizada

            ?

            "Desmarcar Finalizada"

            :

            "Marcar como Finalizada"

          }

        </button>

      </div>

    `;



    /* CLICK */

    div.addEventListener(
      "click",
      (e) => {

        if (

          e.target.tagName ===
            "BUTTON"

          ||

          e.target.tagName ===
            "A"

        ) {

          return;

        }



        const abertas =
          document.querySelectorAll(
            ".audiencia.aberta"
          );



        abertas.forEach((card) => {

          if (card !== div) {

            card.classList.remove(
              "aberta"
            );

          }

        });



        div.classList.toggle(
          "aberta"
        );

      }
    );



    resultado.appendChild(div);

  });

}



/* =========================
   FINALIZAR
========================= */

function toggleFinalizada(id) {

  const audiencia =
    audiencias.find((a) =>

      a.id == id

    );



  if (!audiencia)
    return;



  audiencia.finalizada =
    !audiencia.finalizada;



  if (audiencia.finalizada) {

    audiencia.status =
      "Finalizada";



    audiencia.classe =
      "passada";

  }

  else {

    const status =
      calcularStatus(
        audiencia.horario
      );



    audiencia.status =
      status.texto;



    audiencia.classe =
      status.classe;

  }



  atualizarCards();

  mostrarAudiencias();

}



/* =========================
   CARDS
========================= */

function atualizarCards() {

  document.getElementById(
    "totalAudiencias"
  ).innerText =
    audiencias.length;



const agora =
  new Date();

const agoraMin =

  agora.getHours() * 60 +

  agora.getMinutes();

const proxima =
  audiencias.find((a) => {

    if (a.finalizada)
      return false;

    const [h, m] =
      a.horario.split(":");

    const audMin =

      parseInt(h) * 60 +

      parseInt(m);

    return audMin >= agoraMin;

  });



  document.getElementById(
    "proximaAudiencia"
  ).innerText =

    proxima
      ? proxima.horario
      : "--:--";



  document.getElementById(
    "finalizadas"
  ).innerText =

    audiencias.filter((a) =>

      a.finalizada

    ).length;

}



/* =========================
   RELÓGIO
========================= */

function atualizarHorario() {

  const agora =
    new Date();



  const hora =
    agora.toLocaleTimeString(
      "pt-BR",
      {

        hour: "2-digit",

        minute: "2-digit"

      }
    );



  document.getElementById(
    "horarioAtual"
  ).innerText = hora;

}



setInterval(
  atualizarHorario,
  1000
);



/* =========================
   IA
========================= */

function perguntarIA() {

  const pergunta =
    document
      .getElementById(
        "perguntaIA"
      )
      .value
      .toLowerCase();



  const resposta =
    document.getElementById(
      "respostaIA"
    );



  if (

    pergunta.includes(
      "quantas"
    )

  ) {

    resposta.innerHTML = `

      Existem
      ${audiencias.length}
      audiências da Luzia.

    `;

    return;

  }



  if (

    pergunta.includes(
      "facta"
    )

  ) {

    const total =
      audiencias.filter((a) =>

        a.empresa
          .toLowerCase()
          .includes("facta")

      ).length;



    resposta.innerHTML = `

      Existem
      ${total}
      audiências da Facta.

    `;

    return;

  }



  resposta.innerHTML = `

    Ainda estou aprendendo 😄

  `;

}



/* =========================
   NOTIFICAÇÕES
========================= */

function verificarAudiencias() {

  const agora =
    new Date();



  const agoraMin =

    agora.getHours() * 60 +

    agora.getMinutes();



  audiencias.forEach((item) => {

    if (item.finalizada)
      return;



    const [h, m] =
      item.horario.split(":");



    const min =

      parseInt(h) * 60 +

      parseInt(m);



    const diff =
      min - agoraMin;



    if (

      diff <= 5

      &&

      diff >= 0

      &&

      !notificacoesEnviadas.includes(
        item.id
      )

    ) {

      notificacoesEnviadas.push(
        item.id
      );



      mostrarNotificacao(`

        <strong>

          Audiência em
          ${diff}
          minuto(s)

        </strong>

        <br><br>

        ${item.empresa}

      `);

    }

  });

}



setInterval(() => {

  verificarAudiencias();

}, 30000);



/* =========================
   NOTIFICAÇÃO VISUAL
========================= */

function mostrarNotificacao(texto) {

  let notif =
    document.getElementById(
      "notificacao"
    );



  if (!notif) {

    notif =
      document.createElement("div");



    notif.id =
      "notificacao";



    document.body.appendChild(
      notif
    );

  }



  notif.innerHTML = texto;



  notif.classList.add(
    "mostrar"
  );



  tocarSom();



  setTimeout(() => {

    notif.classList.remove(
      "mostrar"
    );

  }, 5000);

}



/* =========================
   SOM
========================= */

function tocarSom() {

  const audioContext =

    new (

      window.AudioContext ||

      window.webkitAudioContext

    )();



  const oscillator =
    audioContext.createOscillator();



  const gainNode =
    audioContext.createGain();



  oscillator.type =
    "sine";



  oscillator.frequency.setValueAtTime(
    880,
    audioContext.currentTime
  );



  gainNode.gain.setValueAtTime(
    0.0001,
    audioContext.currentTime
  );



  gainNode.gain.exponentialRampToValueAtTime(
    0.12,
    audioContext.currentTime + 0.01
  );



  gainNode.gain.exponentialRampToValueAtTime(
    0.0001,
    audioContext.currentTime + 0.8
  );



  oscillator.connect(
    gainNode
  );



  gainNode.connect(
    audioContext.destination
  );



  oscillator.start();



  oscillator.stop(
    audioContext.currentTime + 0.8
  );

}



/* =========================
   GOOGLE
========================= */

function googleConectado() {

  const botao =
    document.getElementById(
      "googleBtn"
    );

  botao.innerHTML =
    "🟢 Google Conectado";

}

function loginGoogle() {

  window.open(
    "http://localhost:3000/google/login",
    "_blank"
  );

  googleConectado();

}

/* =========================
   GOOGLE EVENTOS
========================= */

async function carregarEventosGoogle() {

  try {

    const resposta =
      await fetch(
        "http://localhost:3000/eventos"
      );

    eventosGoogle =
      await resposta.json();

    console.log(
      "Eventos Google:",
      eventosGoogle
    );

  }

  catch (erro) {

    console.log(
      "Erro ao buscar eventos:",
      erro
    );

  }

}

/* =========================
   MATCH GOOGLE
========================= */

function vincularEventosGoogle() {

  audiencias.forEach((audiencia) => {

    const eventoEncontrado =
      eventosGoogle.find((evento) => {

        const titulo =
          evento.titulo.toLowerCase();

        const empresa =
          audiencia.empresa.toLowerCase();

        const cliente =
          audiencia.cliente.toLowerCase();

        const horarioEvento =
          new Date(evento.inicio)
            .toLocaleTimeString(
              "pt-BR",
              {
                hour: "2-digit",
                minute: "2-digit"
              }
            );

        const horarioIgual =
          horarioEvento === audiencia.horario;

        const empresaIgual =
          titulo.includes(empresa);

        const clienteIgual =
          titulo.includes(cliente);

        return (
          horarioIgual &&
          (
            empresaIgual ||
            clienteIgual
          )
        );

      });

    if (
      eventoEncontrado &&
      eventoEncontrado.link
    ) {

      audiencia.link =
        eventoEncontrado.link;

    }

  });

}

/* =========================
   PERSONALIZAR TEMA
========================= */

const corPrincipal =
  document.getElementById(
    "corPrincipal"
  );

const corFundo1 =
  document.getElementById(
    "corFundo1"
  );

const corFundo2 =
  document.getElementById(
    "corFundo2"
  );

const corGlass =
  document.getElementById(
    "corGlass"
  );

/* PRINCIPAL */

corPrincipal.addEventListener(
  "input",
  (e) => {

    document.documentElement
      .style.setProperty(
        "--roxo",
        e.target.value
      );

  }
);

/* FUNDO 1 */

corFundo1.addEventListener(
  "input",
  (e) => {

    document.documentElement
      .style.setProperty(
        "--fundo1",
        e.target.value
      );

  }
);

/* FUNDO 2 */

corFundo2.addEventListener(
  "input",
  (e) => {

    document.documentElement
      .style.setProperty(
        "--fundo2",
        e.target.value
      );

  }
);

/* GLASS */

corGlass.addEventListener(
  "input",
  (e) => {

    const hex =
      e.target.value;

    const rgb =
      hexToRgb(hex);

    document.documentElement
      .style.setProperty(
        "--glass",
        `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.18)`
      );

  }
);

/* HEX PARA RGB */

function hexToRgb(hex) {

  const bigint =
    parseInt(
      hex.replace("#", ""),
      16
    );

  return {

    r:
      (bigint >> 16) & 255,

    g:
      (bigint >> 8) & 255,

    b:
      bigint & 255

  };

}
atualizarHorario();

carregarEventosGoogle();