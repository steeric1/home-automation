<script lang="ts">
    import type { ActionData } from "./$types";
    import BMWForm from "./BMWForm.svelte";

    export let form: ActionData;
</script>

<div class="m-4 space-y-6 text-base">
    <h1 class="text-4xl font-bold tracking-wide">Kotiautomaatio</h1>
    <hr class=" border-gray-400" />

    <div class="mx-auto max-w-md space-y-6">
        <h2 class="text-2xl font-semibold">BMW-automatisaatio</h2>
        <BMWForm {form} class="space-y-6" />
    </div>
</div>
