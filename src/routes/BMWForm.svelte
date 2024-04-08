<script lang="ts">
    import { invalidateAll } from "$app/navigation";
    import { enhance, applyAction, deserialize } from "$app/forms";
    import { writable, type Unsubscriber, type Writable } from "svelte/store";
    import type { ActionData } from "./$types";
    import type { ActionResult } from "@sveltejs/kit";

    import { toast } from "svelte-sonner";
    import { Button } from "$lib/components/ui/button";
    import * as Tabs from "$lib/components/ui/tabs";

    import Send from "svelte-material-icons/Send.svelte";

    import TimeInput from "$lib/components/TimeInput.svelte";
    import type { Departure } from "$lib/types";
    import DepartureItem from "./Departure.svelte";

    export let form: ActionData;
    export let departures: Departure[] | null;

    $: departuresWithId =
        departures?.map((dep) => {
            return { id: Math.floor(Math.random() * 1e9), ...dep };
        }) || [];

    let classes = "max-w-md space-y-6";
    export { classes as class };

    const formValid: Writable<{ success: boolean; message: string } | null> = writable(null);

    $: if (form) {
        formValid.set({ success: !!form.success, message: form.message });
    }

    let nearDepartureTime: string, farDepartureTime: string;
    $: bothEmpty = !nearDepartureTime && !farDepartureTime;

    function showSubmissionToast() {
        let unsubscribe: Unsubscriber;
        let promise = new Promise<void>((resolve, reject) => {
            unsubscribe = formValid.subscribe((val) => {
                if (val !== null) {
                    formValid.set(null);

                    if (val.success) {
                        resolve();
                    } else {
                        reject(new Error(val.message));
                    }
                }
            });
        });

        toast.promise(promise, {
            loading: "Lähetetään...",
            success: () => "Tiedot tallennettu.",
            error: (error) => {
                const message = (error as { message: string }).message;
                return message || "Tietoja ei voitu tallentaa.";
            },
            finally: () => {
                if (unsubscribe) unsubscribe();
            }
        });
    }

    function clearInputValues() {
        nearDepartureTime = "";
        farDepartureTime = "";
    }

    function getCurrentTime() {
        const currentTime = new Date();
        const currentHours = currentTime.getHours().toString().padStart(2, "0");
        const currentMinutes = currentTime.getMinutes().toString().padStart(2, "0");

        return `${currentHours}.${currentMinutes}`;
    }

    let currentTime = getCurrentTime();
    let now = new Date();
    setTimeout(
        () => {
            currentTime = getCurrentTime();
            setInterval(() => {
                currentTime = getCurrentTime();
            }, 60000);
        },
        60000 - (now.getSeconds() * 1000 + now.getMilliseconds())
    );

    function deleteDeparture(i: number) {
        if (departures) {
            departures = [...departures.slice(0, i), ...departures.slice(i + 1)];
        }
    }

    async function undoDelete(timestamp: string, poi: string) {
        console.log(timestamp, poi);
        const data = new FormData();
        data.append("rawDepartureTime", `${timestamp} ${poi}`);

        const response = await fetch("?/submitDepartures", {
            method: "POST",
            body: data,
            headers: {
                "x-sveltekit-action": "true"
            }
        });

        const result: ActionResult = deserialize(await response.text());

        if (result.type === "success") {
            await invalidateAll();
        }

        applyAction(result);
    }
</script>

<Tabs.Root value="list">
    <Tabs.List class="mb-4 w-full">
        <Tabs.Trigger value="form" class="w-full">Lisää aika</Tabs.Trigger>
        <Tabs.Trigger value="list" class="w-full">Lista</Tabs.Trigger>
    </Tabs.List>
    <Tabs.Content value="form">
        <form
            use:enhance
            class={classes}
            method="POST"
            action="?/submitDepartures"
            on:submit={showSubmissionToast}
            on:submit={clearInputValues}
        >
            <TimeInput
                bind:value={nearDepartureTime}
                name="nearDepartureTime"
                id="nearDepartureTime"
                description={`Matkan alun kellonaika. Ennen ${currentTime} annetut ajat viittaavat huomiseen.`}
                required={bothEmpty}
            >
                <p class="text-sm">
                    <span class="text-base font-semibold">Lähtöaika</span> (Pusula/Nummela)
                </p>
            </TimeInput>

            <TimeInput
                bind:value={farDepartureTime}
                name="farDepartureTime"
                id="farDepartureTime"
                description={`Matkan alun kellonaika. Ennen ${currentTime} annetut ajat viittaavat huomiseen.`}
                required={bothEmpty}
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
    </Tabs.Content>
    <Tabs.Content value="list">
        {#if departures}
            <ul class="flex flex-col gap-3 p-2">
                {#each departuresWithId as { timestamp, poi, id }, i (id)}
                    <li class="w-full rounded-md border-[1px] border-gray-400 bg-slate-100 p-3">
                        <DepartureItem
                            {timestamp}
                            {poi}
                            on:delete={() => deleteDeparture(i)}
                            on:undoDelete={(e) => undoDelete(timestamp, poi)}
                        />
                    </li>
                {/each}
            </ul>
        {:else}
            <div>Failed to fetch departures</div>
        {/if}
    </Tabs.Content>
</Tabs.Root>
