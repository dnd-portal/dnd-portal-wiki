<script lang="ts">
    import { serializeSchemaGraph, type SchemaGraph } from '#lib/typescript/pages/schema/index.js';

    let { graph }: { graph: SchemaGraph | null } = $props();
    let json = $derived(graph ? serializeSchemaGraph(graph) : null);
</script>

{#if json}
    {@html `<script type="application/ld+json">${json}</script>`}
{/if}
