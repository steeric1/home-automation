<script lang="ts">
    import type { HTMLInputAttributes } from "svelte/elements";

    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import ClockIcon from "./ClockIcon.svelte";

    interface Props extends Omit<HTMLInputAttributes, "type"> {
        description?: string;
        currentMinTime?: boolean;
    }

    type $$Props = Props;

    export let description = "";
    export let value = "";
    export let currentMinTime = false;

    function getCurrentMinTime() {
        const currentTime = new Date();
        const currentHours = currentTime.getHours().toString().padStart(2, "0");
        const currentMinutes = currentTime.getMinutes().toString().padStart(2, "0");

        return `${currentHours}:${currentMinutes}`;
    }

    let minTime = currentMinTime ? getCurrentMinTime() : "00:00";
    if (currentMinTime) {
        setTimeout(
            () => {
                minTime = getCurrentMinTime();
                setInterval(() => {
                    minTime = getCurrentMinTime();
                }, 60000);
            },
            60000 - new Date().getSeconds() * 1000
        );
    }
</script>

<Label for="nearDepartureTime" class="flex flex-col space-y-2 ">
    <slot />

    <div class="flex flex-row">
        <ClockIcon />
        <Input
            type="time"
            bind:value
            class="rounded-l-none border-l-0 border-gray-400"
            min={minTime}
            {...$$restProps}
        />
    </div>

    {#if description}
        <p class="text-xs text-muted-foreground">{description}</p>
    {/if}
</Label>
