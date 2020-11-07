import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import * as helmet from "helmet";
import * as bearerToken from "express-bearer-token";

const serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sign-in-at.firebaseio.com",
});

import { ApiRequest } from "./typings/ApiRequest";
import { ApiResponse } from "./typings/ApiResponse";
import { ApiError } from "./models/ApiError";
import { App } from "./models/App";
import { User } from "./models/User";
import { Session } from "./models/Session";
import { Account } from "./models/Account";

const app = express();

app.use(cors());
app.use(helmet());
app.use(bearerToken());

app.use(express.json());

app.post("/api/users", async (req, res) =>
{
  const data: ApiRequest.Users.Create = req.body;

  const response: ApiResponse.Users.Create = {
    result: { valid: true },
    errors: {
      name: { first: { error: "" }, last: { error: "" } },
      email: { error: "" },
      password: { error: "" },
    },
  };

  try
  {
    const user = await User.create(data);

    response.result.data = user.json();
  }
  catch (e)
  {
    const { id, message } = e as ApiError;

    response.result.valid = false;

    switch (id)
    {
      case "user/name/first/empty": response.errors.name.first.error = message; break;
      case "user/name/last/empty": response.errors.name.last.error = message; break;
      case "user/email/empty": response.errors.email.error = message; break;
      case "user/email/already-exists": response.errors.email.error = message; break;
      case "user/password/empty": response.errors.password.error = message; break;
      case "user/password/weak": response.errors.password.error = message; break;
    }
  }

  res.send(response);
});

app.get("/api/accounts", async (req, res) =>
{
  if (!req.token)
  {
    res.sendStatus(403);

    return;
  }

  const session = await Session.withToken(req.token);

  if (!session)
  {
    res.sendStatus(403);

    return;
  }

  const accounts = await Account.list(session);

  res.send(accounts.map(account => account.json()));
});

app.get("/api/accounts/:id", async (req, res) =>
{
  if (!req.token)
  {
    res.sendStatus(403);

    return;
  }

  const session = await Session.withToken(req.token);

  if (!session)
  {
    res.sendStatus(403);

    return;
  }

  const account = await Account.retrieve(session, req.params.id);

  if (!account) res.sendStatus(404);
  else res.send(account.json());
});

app.delete("/api/accounts/:id/unlink", async (req, res) =>
{
  if (!req.token)
  {
    res.sendStatus(403);

    return;
  }

  const session = await Session.withToken(req.token);

  if (!session)
  {
    res.sendStatus(403);

    return;
  }

  await Account.unlink(session, req.params.id);

  res.sendStatus(200);
});

app.delete("/api/accounts/:id", async (req, res) =>
{
  if (!req.token)
  {
    res.sendStatus(403);

    return;
  }

  const session = await Session.withToken(req.token);

  if (!session)
  {
    res.sendStatus(403);

    return;
  }

  await Account.delete(session, req.params.id);

  res.sendStatus(200);
});

app.get("/api/apps", async (req, res) =>
{
  if (!req.token)
  {
    res.sendStatus(403);

    return;
  }

  const session = await Session.withToken(req.token);

  if (!session)
  {
    res.sendStatus(403);

    return;
  }

  const apps = await App.list(session);

  res.send(apps.map(app => app.json()));
});

app.get("/api/apps/:id", async (req, res) =>
{
  if (!req.token)
  {
    res.sendStatus(403);

    return;
  }

  const session = await Session.withToken(req.token);

  if (!session)
  {
    res.sendStatus(403);

    return;
  }

  const app = await App.retrieve(req.params.id);

  if (!app) res.sendStatus(404);
  else res.send(app.json());
});

app.post("/api/apps", async (req, res) =>
{
  if (!req.token)
  {
    res.sendStatus(403);

    return;
  }

  const session = await Session.withToken(req.token);

  if (!session)
  {
    res.sendStatus(403);

    return;
  }

  const data: ApiRequest.Apps.Create = req.body;

  const response: ApiResponse.Apps.Create = {
    result: { valid: true },
    errors: {
      name: { error: "" },
      url: { error: ""},
    },
  };

  try
  {
    const app = await App.create(session, data);

    response.result.data = app.json();
  }
  catch (e)
  {
    const { id, message } = e as ApiError;

    response.result.valid = false;

    switch (id)
    {
      case "app/name/empty": response.errors.name.error = message; break;
      case "app/url/already-exists": response.errors.url.error = message; break;
    }
  }

  res.send(response);
});

app.delete("/api/apps/:id", async (req, res) =>
{
  if (!req.token)
  {
    res.sendStatus(403);

    return;
  }

  const session = await Session.withToken(req.token);

  if (!session)
  {
    res.sendStatus(403);

    return;
  }

  if (!(await App.isOwnedBy(req.params.id, session.user)))
  {
    res.sendStatus(403);

    return;
  }

  await App.delete(req.params.id);

  res.sendStatus(200);
});

app.get("/api/sessions/:id", async (req, res) =>
{
  const id = req.params.id;

  const session = await Session.withToken(id);

  if (!session) res.sendStatus(404);
  else res.send(session.json());
});

app.post("/api/sessions", async (req, res) =>
{
  const data: ApiRequest.Sessions.Create = req.body;

  const response: ApiResponse.Sessions.Create = {
    result: { valid: true },
    errors: {
      email: { error: "" },
      password: { error: "" },
    },
  };

  try
  {
    const session = await Session.create(data);

    response.result.data = session.json();
  }
  catch (e)
  {
    const { id, message } = e as ApiError;

    response.result.valid = false;

    switch (id)
    {
      case "user/email/empty": response.errors.email.error = message; break;
      case "user/email/inexistent": response.errors.email.error = message; break;
      case "user/password/empty": response.errors.password.error = message; break;
      case "user/password/wrong": response.errors.password.error = message; break;
    }
  }

  res.send(response);
});

app.delete("/api/sessions/:id", async (req, res) =>
{
  if (!req.token)
  {
    res.sendStatus(403);

    return;
  }

  const id = req.params.id;

  if (id !== req.token.split(";")[1])
  {
    res.sendStatus(403);

    return;
  }

  const session = await Session.withToken(req.token);

  if (!session)
  {
    res.sendStatus(403);
  }
  else
  {
    await session.delete();

    res.sendStatus(200);
  }
});

app.listen(3000);