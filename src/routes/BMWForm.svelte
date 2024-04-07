<script lang="ts">
    import { enhance } from "$app/forms";
    import { writable, type Writable } from "svelte/store";
    import type { ActionData } from "./$types";

    import { toast } from "svelte-sonner";

    import { Button } from "$lib/components/ui/button";
    import Send from "svelte-material-icons/Send.svelte";

    import TimeInput from "$lib/components/TimeInput.svelte";

    export let form: ActionData;

    let classes = "max-w-md space-y-6";
    export { classes as class };

    const formValid: Writable<boolean | null> = writable(null);

    $: if (form) {
        formValid.set(!!form.success);
    }

    let nearDepartureTime: string, farDepartureTime: string;
    $: bothEmpty = !nearDepartureTime && !farDepartureTime;

    function showSubmissionToast() {
        let promise = new Promise<boolean | null>((resolve) => {
            const unsubscribe = formValid.subscribe((val) => {
                if (val !== null) {
                    resolve(val);
                    unsubscribe();

                    formValid.set(null);
                }
            });
        });

        toast.promise(promise, {
            loading: "Lähetetään...",
            success: () => "Tiedot tallennettu.",
            error: "Tietoa ei voitu tallentaa."
        });
    }

    function clearInputValues() {
        nearDepartureTime = "";
        farDepartureTime = "";
    }
</script>

<form
    use:enhance
    class={classes}
    method="POST"
    on:submit={showSubmissionToast}
    on:submit={clearInputValues}
>
    <TimeInput
        bind:value={nearDepartureTime}
        name="nearDepartureTime"
        id="nearDepartureTime"
        description="Matkan alun kellonaika, tätä päivää"
        required={bothEmpty}
        currentMinTime
    >
        <p class="text-sm">
            <span class="text-base font-semibold">Lähtöaika</span> (Pusula/Nummela)
        </p>
    </TimeInput>

    <TimeInput
        bind:value={farDepartureTime}
        name="farDepartureTime"
        id="farDepartureTime"
        description="Matkan alun kellonaika, tätä päivää"
        required={bothEmpty}
        currentMinTime
    >
        <p class="text-sm">
            <span class="text-base font-semibold">Lähtöaika</span> (kauemmaksi)
        </p>
    </TimeInput>

    <Button type="submit" class="space-x-2 text-sm font-normal shadow-md">
        <div>Lähetä</div>
        <Send size="1.1em" />
    </Button>
</form>
