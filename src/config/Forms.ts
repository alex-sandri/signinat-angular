import { ActivatedRoute, Router } from "@angular/router";
import { ISerializedUser } from "api/src/models/User";
import { FormConfig } from "src/app/components/form/form.component";
import { ApiService } from "src/app/services/api/api.service";
import { SettingsService } from "src/app/services/settings/settings.service";

export default class Forms
{
    public static signIn(api: ApiService, router: Router, route: ActivatedRoute, settings: SettingsService): FormConfig
    {
        return {
            options: {
                name: "Sign In",
                groups: [
                    {
                        name: "default",
                        inputs: [
                            { label: "Email", name: "email", type: "email", required: true, autocomplete: "email" },
                            { label: "Password", name: "password", type: "password", required: true, autocomplete: "current-password" },
                        ],
                    },
                ],
                submitButtonText: "Sign In",
            },
            onSubmit: async (data, options, end) =>
            {
                const response = await api.createUserToken({
                    email: data["email"],
                    password: data["password"],
                });

                if (response.errors)
                {
                    options.groups[0].inputs[0].error = response.errors.find(e => e.id.startsWith("token/email/"))?.message;
                    options.groups[0].inputs[1].error = response.errors.find(e => e.id.startsWith("token/password/"))?.message;
                }
                else
                {
                    settings.set("session.token", response.data.id);
                    settings.set("session.userId", response.data.user.id);

                    if (route.snapshot.queryParams["ref"])
                    {
                        router.navigateByUrl(`/${route.snapshot.queryParams["ref"]}`)
                    }
                    else
                    {
                        router.navigateByUrl("/account");
                    }
                }

                end(options);
            },
        };
    }

    public static signUp(api: ApiService): FormConfig
    {
        return {
            options: {
                name: "Sign Up",
                groups: [
                    {
                        name: "default",
                        inputs: [
                            { label: "First Name", name: "first-name", type: "text", required: true, autocomplete: "given-name" },
                            { label: "Last Name", name: "last-name", type: "text", required: true, autocomplete: "family-name" },
                            { label: "Email", name: "email", type: "email", required: true, autocomplete: "email" },
                            { label: "Password", name: "password", type: "password", required: true, autocomplete: "new-password" },
                        ],
                    },
                    {
                        name: "Additional information",
                        inputs: [
                            { label: "Birthday", name: "birthday", type: "date", required: false, autocomplete: "bday" },
                        ],
                    },
                ],
                submitButtonText: "Sign Up",
            },
            onSubmit: async (data, options, end) =>
            {
                const birthday: Date = data["birthday"];

                const response = await api.createUser({
                    name: {
                        first: data["first-name"],
                        last: data["last-name"],
                    },
                    email: data["email"],
                    password: data["password"],
                    birthday: birthday && (`${
                        birthday.getFullYear()
                    }/${
                        (birthday.getMonth() + 1).toString().padStart(2, "0")
                    }/${
                        (birthday.getDate()).toString().padStart(2, "0")
                    }`),
                });

                if (response.errors)
                {
                    options.groups[0].inputs[0].error = response.errors.find(e => e.id.startsWith("user/name/first/"))?.message;
                    options.groups[0].inputs[1].error = response.errors.find(e => e.id.startsWith("user/name/last/"))?.message;
                    options.groups[0].inputs[2].error = response.errors.find(e => e.id.startsWith("user/email/"))?.message;
                    options.groups[0].inputs[3].error = response.errors.find(e => e.id.startsWith("user/password/"))?.message;

                    options.groups[1].inputs[0].error = response.errors.find(e => e.id.startsWith("user/birthday/"))?.message;
                }

                end(options);
            },
        };
    }

    public static createNewApp(api: ApiService): FormConfig
    {
        return {
            options: {
                name: "Create new App",
                groups: [
                    {
                        name: "default",
                        inputs: [
                            { label: "App Name", name: "name", type: "text", required: true },
                            { label: "URL", name: "url", type: "url", required: true },
                            { label: "Scopes", name: "scopes", type: "select", required: true, options: { multiple: true } },
                        ],
                    },
                ],
                submitButtonText: "Create",
                showCancelButton: true,
                hidden: true,
            },
            onSubmit: async (data, options, end) =>
            {
                const response = await api.createApp({
                    name: data["name"],
                    url: data["url"],
                    scopes: data["scopes"],
                });

                let hide = false;

                if (response.errors)
                {
                    options.groups[0].inputs[0].error = response.errors.find(e => e.id.startsWith("app/name/"))?.message;
                    options.groups[0].inputs[1].error = response.errors.find(e => e.id.startsWith("app/url/"))?.message;
                }
                else
                {
                    hide = true;
                }

                end(options, hide);
            },
        };
    }

    public static updateProfile(api: ApiService, user: ISerializedUser, birthdayAsDate?: Date): FormConfig
    {
        return {
            options: {
                name: "Profile",
                groups: [
                    {
                        name: "default",
                        inputs: [
                            { label: "First Name", name: "first-name", type: "text", required: true, autocomplete: "given-name", value: user.name.first },
                            { label: "Last Name", name: "last-name", type: "text", required: true, autocomplete: "family-name", value: user.name.last },
                            { label: "Email", name: "email", type: "email", required: true, autocomplete: "email", value: user.email },
                        ],
                    },
                    {
                        name: "Additional information",
                        inputs: [
                            { label: "Birthday", name: "birthday", type: "date", required: false, autocomplete: "bday", value: birthdayAsDate },
                        ],
                    },
                ],
                submitButtonText: "Update",
                showCancelButton: true,
                hidden: true,
            },
            onSubmit: async (data, options, end) =>
            {
                const birthday: Date = data["birthday"];

                const response = await api.updateUser({
                    name: {
                        first: data["first-name"],
                        last: data["last-name"],
                    },
                    email: data["email"],
                    birthday: birthday && (`${
                        birthday.getFullYear()
                    }/${
                        (birthday.getMonth() + 1).toString().padStart(2, "0")
                    }/${
                        (birthday.getDate()).toString().padStart(2, "0")
                    }`),
                });

                let hide = false;

                if (response.errors)
                {
                    options.groups[0].inputs[0].error = response.errors.find(e => e.id.startsWith("user/name/first/"))?.message;
                    options.groups[0].inputs[1].error = response.errors.find(e => e.id.startsWith("user/name/last/"))?.message;
                    options.groups[0].inputs[2].error = response.errors.find(e => e.id.startsWith("user/email/"))?.message;

                    options.groups[1].inputs[0].error = response.errors.find(e => e.id.startsWith("user/birthday/"))?.message;
                }
                else
                {
                    hide = true;
                }

                end(options, hide);
            },
        };
    }
}