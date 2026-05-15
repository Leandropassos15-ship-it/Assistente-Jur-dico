const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");

const fs = require("fs-extra");
const path = require("path");

require("dotenv").config();
console.log(process.env.GOOGLE_CLIENT_ID);
console.log(process.env.GOOGLE_CLIENT_SECRET);
console.log(process.env.GOOGLE_REDIRECT);

const app = express();

app.use(cors());
const TOKEN_PATH =
  path.join(
    __dirname,
    "tokens",
    "google-token.json"
  ); 
  
  fs.ensureDirSync(
  path.join(__dirname, "tokens")
);

/* =========================
   GOOGLE OAUTH
========================= */

const oauth2Client =
  new google.auth.OAuth2(

    process.env.GOOGLE_CLIENT_ID,

    process.env.GOOGLE_CLIENT_SECRET,

    process.env.GOOGLE_REDIRECT

  );

/* =========================
   HOME
========================= */

app.get("/", (req, res) => {

  res.send("Assistente Luzia API");

});

/* =========================
   LOGIN GOOGLE
========================= */

app.get("/google/login", (req, res) => {

  const url =
    oauth2Client.generateAuthUrl({

      access_type: "offline",

      scope: [
        "https://www.googleapis.com/auth/calendar.readonly"
      ]

    });

  res.redirect(url);

});

/* =========================
   CALLBACK GOOGLE
========================= */

app.get("/google/callback", async (req, res) => {

  console.log("CALLBACK GOOGLE OK");

  try {

    const code = req.query.code;

    const { tokens } =
      await oauth2Client.getToken(code);

      console.log(tokens);

    oauth2Client.setCredentials(tokens);

    await fs.writeJson(
      TOKEN_PATH,
      tokens
    );

    console.log(
      "TOKEN SALVO 😄"
    );

    res.send(`

      <h2>
        Google conectado com sucesso 😄
      </h2>

    `);

  }

  catch (erro) {

    console.log(erro);

    res.send(
      "Erro ao conectar Google"
    ); /* =========================
   EVENTOS CALENDAR
========================= */

app.get("/eventos", async (req, res) => {

  try {

    const calendar =
      google.calendar({

        version: "v3",
        auth: oauth2Client

      });

    const hoje = new Date();

    const inicioDoDia =
      new Date(
        hoje.setHours(0, 0, 0, 0)
      );

    const fimDoDia =
      new Date(
        hoje.setHours(23, 59, 59, 999)
      );

    const resposta =
      await calendar.events.list({

        calendarId: "primary",

        timeMin:
          inicioDoDia.toISOString(),

        timeMax:
          fimDoDia.toISOString(),

        singleEvents: true,

        orderBy: "startTime"

      });

    const eventos =
      resposta.data.items.map((evento) => ({

        titulo:
          evento.summary,

        inicio:
          evento.start.dateTime,

        link:
          evento.hangoutLink || ""

      }));

    res.json(eventos);

  }

  catch (erro) {

    console.log(erro);

    res.status(500).send(
      "Erro ao buscar eventos"
    );

  }

});

  }

}); /* =========================
   EVENTOS CALENDAR
========================= */

app.get("/eventos", async (req, res) => {

  try {

    const calendar =
      google.calendar({

        version: "v3",
        auth: oauth2Client

      });

    const hoje = new Date();

    const inicioDoDia =
      new Date(
        hoje.setHours(0, 0, 0, 0)
      );

    const fimDoDia =
      new Date(
        hoje.setHours(23, 59, 59, 999)
      );

    const resposta =
      await calendar.events.list({

        calendarId: "primary",

        timeMin:
          inicioDoDia.toISOString(),

        timeMax:
          fimDoDia.toISOString(),

        singleEvents: true,

        orderBy: "startTime"

      });

    const eventos =
      resposta.data.items.map((evento) => ({

        titulo:
          evento.summary,

        inicio:
          evento.start.dateTime,

        link:
          evento.hangoutLink || ""

      }));

    res.json(eventos);

  }

  catch (erro) {

    console.log(erro);

    res.status(500).send(
      "Erro ao buscar eventos"
    );

  }

});

/* =========================
   SERVIDOR
========================= */
async function carregarTokenSalvo() {

  const existe =
    await fs.pathExists(
      TOKEN_PATH
    );

  if (!existe) {

    console.log(
      "Nenhum token salvo"
    );

    return;

  }

  const tokens =
    await fs.readJson(
      TOKEN_PATH
    );

  oauth2Client.setCredentials(
    tokens
  );

  console.log(
    "Google reconectado automaticamente 😄"
  );

}

carregarTokenSalvo();
/* =========================
   USUÁRIO GOOGLE
========================= */

app.get("/usuario", async (req, res) => {

  try {

    const oauth2 =
      google.oauth2({

        auth: oauth2Client,
        version: "v2"
      });

    const usuario =
      await oauth2.userinfo.get();

    res.json({

      nome:
        usuario.data.name,

      email:
        usuario.data.email,

      foto:
        usuario.data.picture

    });

  }

  catch (erro) {

    console.log(erro);

    res.status(500).send(
      "Erro ao buscar usuário"
    );

  }

});
app.listen(3000, () => {

  console.log(
    "Servidor rodando na porta 3000"
  );

});