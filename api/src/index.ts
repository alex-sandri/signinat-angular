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
import { SchemaValidationResult } from "./utilities/Schema";
import Response from "./utilities/Response";
import AuthToken from "./models/AuthToken";
import AuthMiddleware from "./utilities/AuthMiddleware";

const app = express();

app.use(cors());
app.use(helmet());
app.use(bearerToken());

app.use(express.json());

app.get("/api/users/:id", AuthMiddleware.init([ "user", "app" ], async (request, response, token) =>
{
  if (token.user.id !== request.params.id)
  {
    response.forbidden();

    return;
  }

  response.body.data = token.user.json();

  response.send();
}));

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

app.put("/api/users/:id", AuthMiddleware.init([ "user" ], async (request, response, token) =>
{
  if (token.user.id !== request.params.id)
  {
    response.forbidden();

    return;
  }

  try
  {
    await token.user.update(request.body);

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
}));

app.delete("/api/users/:id", AuthMiddleware.init([ "user" ], async (request, response, token) =>
{
  if (token.user.id !== request.params.id)
  {
    response.forbidden();

    return;
  }

  await token.user.delete();

  response.noContent();
}));

app.get("/api/apps", AuthMiddleware.init([ "user" ], async (request, response, token) =>
{
  const apps = await App.list(token.user);

  response.body.data = [];

  for (const app of apps)
  {
    response.body.data.push(app.json());
  }

  response.send();
}));

app.get("/api/apps/:id", AuthMiddleware.init([ "user" ], async (request, response, token) =>
{
  const app = await App.retrieve(request.params.id);

  if (!app)
  {
    response.notFound();

    return;
  }

  response.body.data = app.json();

  response.send();
}));

app.post("/api/apps", AuthMiddleware.init([ "user" ], async (request, response, token) =>
{
  try
  {
    const app = await App.create(token.user, request.body);

    response.body.data = app.json();
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
}));

app.put("/api/apps/:id", AuthMiddleware.init([ "user" ], async (request, response, token) =>
{
  const app = await App.retrieve(request.params.id);

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
    await app.update(request.body);

    response.body.data = app.json();
  }
  catch (e)
  {
    if (e instanceof SchemaValidationResult)
    {
      response.body.errors = e.json().errors;
    }
  }

  response.send();
}));

app.delete("/api/apps/:id", AuthMiddleware.init([ "user", "app" ], async (request, response, token) =>
{
  const app = await App.retrieve(request.params.id);

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
}));

app.post("/api/tokens/users", async (req, res) =>
{
  const response = Response.from(res);

  try
  {
    const userToken = await AuthToken.user(req.body);

    response.body.data = userToken.json();
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

app.post("/api/tokens/apps", AuthMiddleware.init([ "user" ], async (request, response, token) =>
{
  try
  {
    const appToken = await AuthToken.app(request.body, token.user);

    response.body.data = appToken.json();
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
}));

app.listen(3000);