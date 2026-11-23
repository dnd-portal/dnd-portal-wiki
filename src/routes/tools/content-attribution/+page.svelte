<script lang="ts">
    import ContentAttribution from '#lib/svelte/components/ContentAttribution.svelte';
</script>

<svelte:head>
    <title>Content Attribution Example | D&amp;D Portal Wiki</title>
</svelte:head>

<article class="wiki-article tools-page">
    <h1>Content attribution example</h1>
    <p>
        This page demonstrates the compact attribution component used for source and homebrew
        references.
    </p>
    <ContentAttribution
        creator="KibblesTasty"
        creatorUrl="https://www.kthomebrew.com/"
        source="Psion"
        sourceVersion="1.5.3"
        sourceUrl="https://www.kthomebrew.com/psion"
        permissionsUrl="https://www.kthomebrew.com/permissions"
    />
</article>
