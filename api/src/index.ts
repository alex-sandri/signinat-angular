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
import { Account } from "./models/Account";
import { Scope } from "./models/Scope";
import { AuthToken } from "./models/AuthToken";

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
      case "user/name/first/empty":
        response.errors.name.first.error = message;
        break;
      case "user/name/last/empty":
        response.errors.name.last.error = message;
        break;
      case "user/email/empty":
      case "user/email/already-exists":
        response.errors.email.error = message;
        break;
      case "user/password/empty":
      case "user/password/weak":
        response.errors.password.error = message;
        break;
    }
  }

  res.send(response);
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
  const id: string = req.body.id;

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

  await Account.create(token.user, id);

  res.status(200).send({ status: 200 });
});

app.delete("/api/accounts/:id/unlink", async (req, res) =>
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

  await Account.unlink(req.params.id);

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
    const app = await App.create(token.user, data);

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

  const data: ApiRequest.Apps.Update = req.body;

  const response: ApiResponse.Apps.Update = {
    result: { valid: true },
    errors: {
      api: {
        webhook: { error: "" },
      },
    },
  };

  try
  {
    const app = await App.retrieve(req.params.id);

    if (app)
    {
      app.update(data);

      response.result.data = app.json();
    }
  }
  catch (e)
  {
    const { id, message } = e as ApiError;

    response.result.valid = false;

    switch (id)
    {
      case "app/webhook/empty":
      case "app/webhook/invalid":
        response.errors.api.webhook.error = message;
        break;
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

  const response: ApiResponse.Tokens.Create = {
    result: { valid: true },
    errors: {
      user: {
        email: "",
        password: "",
      },
    },
  };

  try
  {
    const userToken = await AuthToken.user(data.user!.email, data.user!.password);

    response.result.data = userToken.json();
  }
  catch (e)
  {
    const { id, message } = e as ApiError;

    response.result.valid = false;

    if (id.startsWith("user/email/"))
    {
      response.errors.user.email = message;
    }
    else if (id.startsWith("user/password/"))
    {
      response.errors.user.password = message;
    }
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