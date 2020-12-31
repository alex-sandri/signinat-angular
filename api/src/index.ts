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

admin.firestore().settings({
  ignoreUndefinedProperties: true,
});

import { App, ISerializedApp } from "./models/App";
import { User } from "./models/User";
import { Account } from "./models/Account";
import { Scope } from "./models/Scope";
import { SchemaValidationResult } from "./utilities/Schema";
import Response, { IResponseData } from "./utilities/Response";
import { AuthToken } from "./models/AuthToken";

const app = express();

app.use(cors());
app.use(helmet());
app.use(bearerToken());

app.use(express.json());

app.post("/api/users", async (req, res) =>
{
  const response = Response.from(res);

  const data: IResponseData = {};

  try
  {
    const user = await User.create(req.body);

    data.resource = user.json();
  }
  catch (e)
  {
    if (e instanceof SchemaValidationResult)
    {
      data.errors = e.json().errors;
    }
  }

  response.send(data);
});

app.put("/api/users/:id", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth(req.token, [ "user" ]);

  if (!token)
  {
    return;
  }

  if (token.user.id !== req.params.id)
  {
    response.forbidden();

    return;
  }

  const data: IResponseData = {};

  try
  {
    await token.user.update(req.body);

    data.resource = token.user.json();
  }
  catch (e)
  {
    if (e instanceof SchemaValidationResult)
    {
      data.errors = e.json().errors;
    }
  }

  response.send(data);
});

app.delete("/api/users/:id", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth(req.token, [ "user" ]);

  if (!token)
  {
    return;
  }

  if (token.user.id !== req.params.id)
  {
    response.forbidden();

    return;
  }

  await token.user.delete();

  response.ok();
});

app.get("/api/accounts", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth(req.token, [ "user" ]);

  if (!token)
  {
    return;
  }

  const accounts = await Account.list(token.user);

  res.send(accounts.map(account => account.json()));
});

app.get("/api/accounts/:id", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth(req.token, [ "user" ]);

  if (!token)
  {
    return;
  }

  const account = await Account.retrieve(token.user, req.params.id);

  if (!account) res.status(404).send({ status: 404 });
  else res.send(account.json());
});

app.post("/api/accounts", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth(req.token, [ "user" ]);

  if (!token)
  {
    return;
  }

  const app = await App.retrieve(req.body.id);

  if (!app)
  {
    res.status(403).send({ status: 403 });

    return;
  }

  await Account.create(token.user, app);

  res.status(200).send({ status: 200 });
});

app.delete("/api/accounts/:id", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth(req.token, [ "user" ]);

  if (!token)
  {
    return;
  }

  const account = await Account.retrieve(token.user, req.params.id);

  await account?.delete();

  res.status(200).send({ status: 200 });
});

app.get("/api/apps", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth(req.token, [ "user" ]);

  if (!token)
  {
    return;
  }

  const apps = await App.list(token.user);

  const data: ISerializedApp[] = [];

  for (const app of apps)
  {
    data.push(await app.json());
  }

  res.send(data);
});

app.get("/api/apps/:id", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth(req.token, [ "user" ]);

  if (!token)
  {
    return;
  }

  const app = await App.retrieve(req.params.id);

  if (!app) res.status(404).send({ status: 404 });
  else res.send(await app.json());
});

app.post("/api/apps", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth(req.token, [ "user" ]);

  if (!token)
  {
    return;
  }

  const data: IResponseData = {};

  try
  {
    const app = await App.create(token.user, req.body);

    data.resource = app.json();
  }
  catch (e)
  {
    if (e instanceof SchemaValidationResult)
    {
      data.errors = e.json().errors;
    }
  }

  response.send(data);
});

app.put("/api/apps/:id", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth(req.token, [ "user" ]);

  if (!token)
  {
    return;
  }

  const app = await App.retrieve(req.params.id);

  if (!app)
  {
    response.notFound();

    return;
  }

  if (!app.isOwnedBy(token.user))
  {
    response.forbidden();

    return;
  }

  const data: IResponseData = {};

  try
  {
    await app.update(req.body);

    data.resource = app.json();
  }
  catch (e)
  {
    if (e instanceof SchemaValidationResult)
    {
      data.errors = e.json().errors;
    }
  }

  response.send(data);
});

app.delete("/api/apps/:id", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth(req.token);

  if (!token)
  {
    return;
  }

  const app = await App.retrieve(req.params.id);

  if (!app)
  {
    response.notFound();

    return;
  }

  if (!app.isOwnedBy(token.user))
  {
    response.forbidden();

    return;
  }

  await app.delete();

  response.ok();
});

app.get("/api/scopes", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth(req.token);

  if (!token)
  {
    return;
  }

  res.send(Scope.all().map(scope => scope.json()));
});

app.get("/api/tokens/:id", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth(req.params.id);

  if (!token)
  {
    return;
  }

  res.send(await token.json());
});

app.post("/api/tokens/users", async (req, res) =>
{
  const response = Response.from(res);

  const data: IResponseData = {};

  try
  {
    const userToken = await AuthToken.user(req.body.user.email, req.body.user.password);

    data.resource = await userToken.json();
  }
  catch (e)
  {
    if (e instanceof SchemaValidationResult)
    {
      data.errors = e.json().errors;
    }
  }

  response.send(data);
});

app.post("/api/tokens/apps", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth(req.token, [ "user" ]);

  if (!token)
  {
    return;
  }

  const data: IResponseData = {};

  try
  {
    const appToken = await AuthToken.app(req.body.app, token.user.id);

    data.resource = await appToken.json();
  }
  catch (e)
  {
    if (e instanceof SchemaValidationResult)
    {
      data.errors = e.json().errors;
    }
  }

  response.send(data);
});

app.delete("/api/tokens/:id", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth(req.token);

  if (!token)
  {
    return;
  }

  await token.delete();

  res.status(200).send({ status: 200 });
});

app.listen(3000);