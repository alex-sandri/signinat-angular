import { ActivatedRoute, Router } from "@angular/router";
import { FormConfig } from "src/app/components/form/form.component";
import { ApiService } from "src/app/services/api/api.service";
import { SettingsService } from "src/app/services/settings/settings.service";

export default class Forms
{
    public static readonly signIn: (api: ApiService, router: Router, route: ActivatedRoute) => FormConfig = (api: ApiService, router: Router, route: ActivatedRoute) =>
    ({
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
                SettingsService.set("session.token", response.data.id);
                SettingsService.set("session.userId", response.data.user.id);

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
    })
}