<script lang="ts" context="module">
    import TimeAgo from "javascript-time-ago";
    import fi from "javascript-time-ago/locale/fi";

    TimeAgo.addDefaultLocale(fi);
    const timeAgo = new TimeAgo("fi-FI");

    const midNight = new Date();
    midNight.setHours(24, 0, 0, 0);
</script>

<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import { enhance } from "$app/forms";

    import ClockStart from "svelte-material-icons/ClockStart.svelte";
    import MapMarkerDistance from "svelte-material-icons/MapMarkerDistance.svelte";
    import DeleteForever from "svelte-material-icons/TrashCan.svelte";

    import * as Tooltip from "$lib/components/ui/tooltip";
    import { toast } from "svelte-sonner";

    export let timestamp: string;
    export let poi: string;

    const dispatch = createEventDispatcher();

    $: date = new Date(timestamp);
    $: hours = date.getHours().toString().padStart(2, "0");
    $: mins = date.getMinutes().toString().padStart(2, "0");

    $: displayDay = `${date < midNight ? "Tänään" : "Huomenna"}`;
    $: displayTime = `${hours}.${mins}`;
    $: displayTimeago = timeAgo.format(date);

    async function removeDeparture() {
        const promise = fetch("/api/departure", {
            method: "DELETE",
            body: JSON.stringify({ timestamp, poi })
        }).then((res) => {
            if (res.ok) dispatch("delete");
            else throw new Error("Failed to delete departure.");
        });

        toast.promise(promise, {
            loading: "Poistetaan",
            success: () => "Lähtöaika poistettiin.",
            error: "Lähtöaikaa ei voitu poistaa.",
            action: {
                label: "Kumoa",
                onClick: () => dispatch("undoDelete")
            }
        });
    }
</script>

<div class="flex flex-row items-center justify-between gap-5 text-sm">
    <div class="flex w-full flex-row items-center gap-3">
        <ClockStart size="1.6em" />
        <div class="flex flex-col">
            <div class="font-semibold">
                {displayDay}
                {displayTime}
            </div>
            <span class="text-xs">{displayTimeago}</span>
        </div>
    </div>
    <div class="flex w-full flex-row items-center gap-3">
        <MapMarkerDistance size="1.6em" />
        <span class="font-semibold">
            {poi}
        </span>
    </div>
    <div class="w-1/6">
        <Tooltip.Root>
            <Tooltip.Trigger>
                <button
                    on:click={removeDeparture}
                    class="h-10 rounded-xl text-destructive hover:text-destructive/30"
                >
                    <DeleteForever size="1.5em" />
                </button>
            </Tooltip.Trigger>
            <Tooltip.Content sideOffset={0}>
                <p class="text-xs">Poista</p>
            </Tooltip.Content>
        </Tooltip.Root>
    </div>
</div>
