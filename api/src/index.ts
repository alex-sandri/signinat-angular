import * as admin from "firebase-admin";
import * as express from "express";
import * as cors from "cors";
import * as helmet from "helmet";
import * as bearerToken from "express-bearer-token";
import * as dotenv from "dotenv";

dotenv.config();

const serviceAccount = require("./service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sign-in-at.firebaseio.com",
});

admin.firestore().settings({
  ignoreUndefinedProperties: true,
});

import { App } from "./models/App";
import { User } from "./models/User";
import { Account } from "./models/Account";
import { Scope } from "./models/Scope";
import { SchemaValidationResult } from "./utilities/Schema";
import Response from "./utilities/Response";
import { AuthToken } from "./models/AuthToken";

const app = express();

app.use(cors());
app.use(helmet());
app.use(bearerToken());

app.use(express.json());

app.post("/api/users", async (req, res) =>
{
  const response = Response.from(res);

  try
  {
    const user = await User.create(req.body);

    response.body.data = user.json();
  }
  catch (e)
  {
    if (e instanceof SchemaValidationResult)
    {
      response.body.errors = e.json().errors;
    }
  }

  if (response.body.errors)
  {
    response.send();
  }
  else
  {
    response.created();
  }
});

app.put("/api/users/:id", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth([ "user" ], req.token);

  if (!token)
  {
    return;
  }

  if (token.user.id !== req.params.id)
  {
    response.forbidden();

    return;
  }

  try
  {
    await token.user.update(req.body);

    response.body.data = token.user.json();
  }
  catch (e)
  {
    if (e instanceof SchemaValidationResult)
    {
      response.body.errors = e.json().errors;
    }
  }

  response.send();
});

app.delete("/api/users/:id", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth([ "user" ], req.token);

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

  response.noContent();
});

app.get("/api/accounts", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth([ "user" ], req.token);

  if (!token)
  {
    return;
  }

  const accounts = await Account.list(token.user);

  response.body.data = [];

  for (const account of accounts)
  {
    response.body.data.push(await account.json());
  }

  response.send();
});

app.get("/api/accounts/:id", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth([ "user" ], req.token);

  if (!token)
  {
    return;
  }

  const account = await Account.retrieve(token.user, req.params.id);

  if (!account)
  {
    response.notFound();

    return;
  }

  response.body.data = await account.json();

  response.send();
});

app.post("/api/accounts", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth([ "user" ], req.token);

  if (!token)
  {
    return;
  }

  try
  {
    const account = await Account.create(req.body, token.user);

    response.body.data = await account.json();
  }
  catch (e)
  {
    if (e instanceof SchemaValidationResult)
    {
      response.body.errors = e.json().errors;
    }
  }

  if (response.body.errors)
  {
    response.send();
  }
  else
  {
    response.created();
  }
});

app.delete("/api/accounts/:id", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth([ "user" ], req.token);

  if (!token)
  {
    return;
  }

  const account = await Account.retrieve(token.user, req.params.id);

  if (!account)
  {
    response.notFound();

    return;
  }

  await account.delete();

  response.noContent();
});

app.get("/api/apps", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth([ "user" ], req.token);

  if (!token)
  {
    return;
  }

  const apps = await App.list(token.user);

  response.body.data = [];

  for (const app of apps)
  {
    response.body.data.push(await app.json());
  }

  response.send();
});

app.get("/api/apps/:id", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth([ "user" ], req.token);

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

  response.body.data = await app.json();

  response.send();
});

app.post("/api/apps", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth([ "user" ], req.token);

  if (!token)
  {
    return;
  }

  try
  {
    const app = await App.create(token.user, req.body);

    response.body.data = await app.json();
  }
  catch (e)
  {
    if (e instanceof SchemaValidationResult)
    {
      response.body.errors = e.json().errors;
    }
  }

  if (response.body.errors)
  {
    response.send();
  }
  else
  {
    response.created();
  }
});

app.put("/api/apps/:id", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth([ "user" ], req.token);

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

  try
  {
    await app.update(req.body);

    response.body.data = await app.json();
  }
  catch (e)
  {
    if (e instanceof SchemaValidationResult)
    {
      response.body.errors = e.json().errors;
    }
  }

  response.send();
});

app.delete("/api/apps/:id", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth([ "user", "app" ], req.token);

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

  response.noContent();
});

app.get("/api/scopes", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth([ "user", "app" ], req.token);

  if (!token)
  {
    return;
  }

  response.body.data = Scope.all().map(scope => scope.json());

  response.send();
});

app.get("/api/tokens/:id", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth([ "user", "app" ], req.token);

  if (!token)
  {
    return;
  }

  const tokenToRetrieve = await AuthToken.retrieve(req.params.id);

  if (!tokenToRetrieve)
  {
    response.notFound();

    return;
  }

  if (tokenToRetrieve.user.id !== token.user.id)
  {
    response.forbidden();

    return;
  }

  response.body.data = await tokenToRetrieve.json();

  response.send();
});

app.post("/api/tokens/users", async (req, res) =>
{
  const response = Response.from(res);

  try
  {
    const userToken = await AuthToken.user(req.body);

    response.body.data = await userToken.json();
  }
  catch (e)
  {
    if (e instanceof SchemaValidationResult)
    {
      response.body.errors = e.json().errors;
    }
  }

  if (response.body.errors)
  {
    response.send();
  }
  else
  {
    response.created();
  }
});

app.post("/api/tokens/apps", async (req, res) =>
{
  const response = Response.from(res);

  const token = await response.checkAuth([ "user" ], req.token);

  if (!token)
  {
    return;
  }

  try
  {
    const appToken = await AuthToken.app(req.body, token.user);

    response.body.data = await appToken.json();
  }
  catch (e)
  {
    if (e instanceof SchemaValidationResult)
    {
      response.body.errors = e.json().errors;
    }
  }

  if (response.body.errors)
  {
    response.send();
  }
  else
  {
    response.created();
  }
});

app.listen(3000);