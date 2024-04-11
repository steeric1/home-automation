import { toast } from "svelte-sonner";
import { superForm, type FormOptions, type SuperValidated } from "sveltekit-superforms";

interface Result {
    type: "success" | "failure";
}

export function createForm<Out extends Record<string, unknown>, In extends Record<string, unknown>>(
    form: SuperValidated<Out, unknown, In>,
    options?: FormOptions<Out, unknown, In>
) {
    let toastId: string | number | undefined;
    let errorToastTimeout: NodeJS.Timeout;

    return superForm(form, {
        onSubmit: (event) => {
            ({ toastId, errorToastTimeout } = createSubmitToast());

            options?.onSubmit?.(event);
        },
        onUpdate: (event) => {
            if (toastId !== undefined && errorToastTimeout)
                updateToastWithResult(event.result, toastId, errorToastTimeout);

            options?.onUpdate?.(event);
        },
        onError: (event) => {
            if (toastId) {
                toast.error("Tietoja ei voitu tallentaa.", { id: toastId });
            }

            if (options?.onError instanceof Function) options?.onError(event);
        }
    });
}

function createSubmitToast() {
    let toastId: string | number | undefined = toast.loading("Tietoja lähetetään...", {
        duration: 30000
    });

    let errorToastTimeout = setTimeout(() => {
        toast.error("Tietojen lähetys ei onnistunut. Ehkä palvelimeen ei saada yhteyttä", {
            id: toastId
        });

        toastId = undefined;
    }, 30000);

    return { toastId, errorToastTimeout };
}

function updateToastWithResult<Res extends Result>(
    result: Res,
    toastId: string | number,
    errorToastTimeout: NodeJS.Timeout
) {
    clearTimeout(errorToastTimeout);
    if (result.type === "success") {
        toast.success("Tiedot tallennettu.", { id: toastId, duration: 5000 });
    } else if (result.type === "failure") {
        toast.error("Tiedoissa on virhe.", {
            id: toastId,
            duration: 5000
        });
    }
}
