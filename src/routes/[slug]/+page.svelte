<script lang="ts" context="module">
    import type { PageServerData } from "./$types";

    export type PageForm = PageServerData["form"];
</script>

<script lang="ts">
    import BMWForm from "./BMWForm.svelte";

    export let data: PageServerData;
</script>

<svelte:head>
    <title>Kotiautomaatio</title>
</svelte:head>

<div class="m-4 space-y-6 text-base">
    <h1 class="text-4xl font-bold tracking-wide">Kotiautomaatio</h1>
    <hr class=" border-gray-400" />

    <div class="mx-auto max-w-md space-y-6">
        <h2 class="text-2xl font-semibold tracking-wide">BMW</h2>
        <BMWForm form={data.form} departures={data.departures} class="space-y-6" />
    </div>
</div>
