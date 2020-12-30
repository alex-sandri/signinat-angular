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

import { ApiRequest } from "./typings/ApiRequest";
import { ApiResponse } from "./typings/ApiResponse";
import { ApiError } from "./models/ApiError";
import { App } from "./models/App";
import { User } from "./models/User";
import { Account } from "./models/Account";
import { Scope } from "./models/Scope";
import { AuthToken } from "./models/AuthToken";
import { IApp, IUser } from "./utilities/Validator";
import { SchemaValidationResult } from "./utilities/Schema";

const app = express();

app.use(cors());
app.use(helmet());
app.use(bearerToken());

app.use(express.json());

app.post("/api/users", async (req, res) =>
{
  const data: IUser = req.body;

  const response: ApiResponse = {
    result: { valid: true },
    errors: [],
  };

  try
  {
    const user = await User.create(data);

    response.result.data = user.json();
  }
  catch (e)
  {
    response.result.valid = false;

    if (e instanceof SchemaValidationResult)
    {
      response.errors = e.json().errors;
    }
  }

  res.send(response);
});

app.put("/api/users/:id", async (req, res) =>
{
  const token = await AuthToken.retrieve(req.token);

  if (!token)
  {
    res.status(401).send({ status: 401 });

    return;
  }

  if (token.type !== "user")
  {
    res.status(403).send({ status: 403 });

    return;
  }

  const data: IUser = req.body;

  const response: ApiResponse = {
    result: { valid: true },
    errors: [],
  };

  try
  {
    const user = await User.retrieve(req.params.id);

    if (user)
    {
      await user.update(data);

      response.result.data = user.json();
    }
  }
  catch (e)
  {
    response.result.valid = false;

    if (e instanceof SchemaValidationResult)
    {
      response.errors = e.json().errors;
    }
  }

  res
    .status(response.result.valid ? 200 : 400)
    .send(response);
});

app.delete("/api/users/:id", async (req, res) =>
{
  const token = await AuthToken.retrieve(req.token);

  if (!token)
  {
    res.status(401).send({ status: 401 });

    return;
  }

  if (token.type !== "user" || token.user.id !== req.params.id)
  {
    res.status(403).send({ status: 403 });

    return;
  }

  await token.user.delete();

  res.status(200).send({ status: 200 });
});

app.get("/api/accounts", async (req, res) =>
{
  const token = await AuthToken.retrieve(req.token);

  if (!token)
  {
    res.status(401).send({ status: 401 });

    return;
  }

  if (token.type !== "user")
  {
    res.status(403).send({ status: 403 });

    return;
  }

  const accounts = await Account.list(token.user);

  res.send(accounts.map(account => account.json()));
});

app.get("/api/accounts/:id", async (req, res) =>
{
  const token = await AuthToken.retrieve(req.token);

  if (!token)
  {
    res.status(401).send({ status: 401 });

    return;
  }

  if (token.type !== "user")
  {
    res.status(403).send({ status: 403 });

    return;
  }

  const account = await Account.retrieve(token.user, req.params.id);

  if (!account) res.status(404).send({ status: 404 });
  else res.send(account.json());
});

app.post("/api/accounts", async (req, res) =>
{
  const token = await AuthToken.retrieve(req.token);

  if (!token)
  {
    res.status(401).send({ status: 401 });

    return;
  }

  if (token.type !== "user")
  {
    res.status(403).send({ status: 403 });

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
  const token = await AuthToken.retrieve(req.token);

  if (!token)
  {
    res.status(401).send({ status: 401 });

    return;
  }

  if (token.type !== "user")
  {
    res.status(403).send({ status: 403 });

    return;
  }

  const account = await Account.retrieve(token.user, req.params.id);

  await account?.delete();

  res.status(200).send({ status: 200 });
});

app.get("/api/apps", async (req, res) =>
{
  const token = await AuthToken.retrieve(req.token);

  if (!token)
  {
    res.status(401).send({ status: 401 });

    return;
  }

  if (token.type !== "user")
  {
    res.status(403).send({ status: 403 });

    return;
  }

  const apps = await App.list(token.user);

  res.send(apps.map(app => app.json()));
});

app.get("/api/apps/:id", async (req, res) =>
{
  const token = await AuthToken.retrieve(req.token);

  if (!token)
  {
    res.status(401).send({ status: 401 });

    return;
  }

  if (token.type !== "user")
  {
    res.status(403).send({ status: 403 });

    return;
  }

  const app = await App.retrieve(req.params.id);

  if (!app) res.status(404).send({ status: 404 });
  else res.send(app.json());
});

app.post("/api/apps", async (req, res) =>
{
  const token = await AuthToken.retrieve(req.token);

  if (!token)
  {
    res.status(401).send({ status: 401 });

    return;
  }

  if (token.type !== "user")
  {
    res.status(403).send({ status: 403 });

    return;
  }

  const data: IApp = req.body;

  const response: ApiResponse = {
    result: { valid: true },
    errors: [],
  };

  try
  {
    const app = await App.create(token.user, data);

    response.result.data = app.json();
  }
  catch (e)
  {
    response.result.valid = false;

    if (e instanceof SchemaValidationResult)
    {
      response.errors = e.json().errors;
    }
  }

  res.send(response);
});

app.put("/api/apps/:id", async (req, res) =>
{
  const token = await AuthToken.retrieve(req.token);

  if (!token)
  {
    res.status(401).send({ status: 401 });

    return;
  }

  if (token.type !== "user")
  {
    res.status(403).send({ status: 403 });

    return;
  }

  if (!(await App.isOwnedBy(req.params.id, token.user)))
  {
    res.sendStatus(403);

    return;
  }

  const data: IApp = req.body;

  const response: ApiResponse = {
    result: { valid: true },
    errors: [],
  };

  try
  {
    const app = await App.retrieve(req.params.id);

    if (app)
    {
      await app.update(data);

      response.result.data = app.json();
    }
  }
  catch (e)
  {
    response.result.valid = false;

    if (e instanceof SchemaValidationResult)
    {
      response.errors = e.json().errors;
    }
  }

  if (response.result.valid) res.send(response);
  else res.status(400).send(response);
});

app.delete("/api/apps/:id", async (req, res) =>
{
  const token = await AuthToken.retrieve(req.token);

  if (!token)
  {
    res.status(401).send({ status: 401 });

    return;
  }

  if (!(await App.isOwnedBy(req.params.id, token.user)))
  {
    res.sendStatus(403);

    return;
  }

  const app = await App.retrieve(req.params.id);

  await app?.delete();

  res.status(200).send({ status: 200 });
});

app.get("/api/scopes", async (req, res) =>
{
  const token = await AuthToken.retrieve(req.token);

  if (!token)
  {
    res.status(401).send({ status: 401 });

    return;
  }

  res.send(Scope.all().map(scope => scope.json()));
});

app.get("/api/tokens/:id", async (req, res) =>
{
  const token = await AuthToken.retrieve(req.params.id);

  if (!token)
  {
    res.status(401).send({ status: 401 });

    return;
  }

  res.send(token.json());
});

app.post("/api/tokens/users", async (req, res) =>
{
  const data: ApiRequest.Tokens.Create = req.body;

  const response: ApiResponse = {
    result: { valid: true },
    errors: [],
  };

  try
  {
    const userToken = await AuthToken.user(data.user!.email, data.user!.password);

    response.result.data = userToken.json();
  }
  catch (e)
  {
    response.result.valid = false;

    response.errors.push((e as ApiError).json());
  }

  res.send(response);
});

app.post("/api/tokens/apps", async (req, res) =>
{
  const token = await AuthToken.retrieve(req.token);

  if (!token)
  {
    res.status(401).send({ status: 401 });

    return;
  }

  if (token.type !== "user")
  {
    res.status(403).send({ status: 403 });

    return;
  }

  const data: ApiRequest.Tokens.Create = req.body;

  const appToken = await AuthToken.app(data.app as string, token.user.id);

  res.send(appToken.json());
});

app.delete("/api/tokens/:id", async (req, res) =>
{
  const token = await AuthToken.retrieve(req.params.id);

  if (!token)
  {
    res.status(401).send({ status: 401 });

    return;
  }

  await token.delete();

  res.status(200).send({ status: 200 });
});

app.listen(3000);