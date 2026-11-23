<!--
	Location: src/lib/svelte/components/ContentAttribution.svelte
	Use: Compact attribution for official and homebrew content.
-->
<script lang="ts">
    export type ContentAttributionLink = {
        readonly label: string;
        readonly href: string;
    };

    let {
        creator,
        creatorUrl,
        publisher,
        publisherUrl,
        source,
        sourceVersion,
        sourceUrl,
        permissionsUrl,
        license,
        modifications,
    }: {
        creator: string;
        creatorUrl?: string;
        publisher?: string;
        publisherUrl?: string;
        source: string;
        sourceVersion?: string;
        sourceUrl?: string;
        permissionsUrl?: string;
        license?: string;
        modifications?: string;
    } = $props();
</script>

<aside class="content-attribution" aria-label="Content attribution">
    <dl class="content-attribution__fields">
        <dt>Creator</dt>
        <dd>
            {#if creatorUrl}<a href={creatorUrl}>{creator}</a>{:else}{creator}{/if}
        </dd>

        {#if publisher}
            <dt>Publisher</dt>
            <dd>
                {#if publisherUrl}<a href={publisherUrl}>{publisher}</a>{:else}{publisher}{/if}
            </dd>
        {/if}

        <dt>Source</dt>
        <dd>
            {#if sourceUrl}<a href={sourceUrl}>{source}</a>{:else}{source}{/if}{#if sourceVersion}
                <span class="content-attribution__version">(v{sourceVersion})</span>{/if}
        </dd>
    </dl>

    {#if permissionsUrl || license}
        <p class="content-attribution__links">
            {#if permissionsUrl}<a href={permissionsUrl}>Permissions and usage</a>{/if}
            {#if permissionsUrl && license}<span aria-hidden="true"> · </span>{/if}
            {#if license}<span>{license}</span>{/if}
        </p>
    {/if}

    {#if modifications}
        <p class="content-attribution__modifications">Changes by D&amp;D Portal: {modifications}</p>
    {/if}
</aside>
