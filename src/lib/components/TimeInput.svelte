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
</script>

<Label for="nearDepartureTime" class="flex flex-col space-y-2 ">
    <slot />

    <div class="flex flex-row">
        <ClockIcon />
        <Input
            type="time"
            bind:value
            class="rounded-l-none border-l-0 border-gray-400"
            {...$$restProps}
        />
    </div>

    {#if description}
        <p class="text-xs text-muted-foreground">{description}</p>
    {/if}
</Label>
