<!-- Species listing sourced from the published D&D Portal Assets JSON. -->
<script lang="ts">
  import PageHeader from '#lib/svelte/components/page/PageHeader.svelte';
  let { data }: { data: import('./$types').PageData } = $props();
</script>

<article class="wiki-article">
  <PageHeader />
  <section class="wiki-article__section" aria-labelledby="species-list-heading">
    <h2 id="species-list-heading">Playable species</h2>
    <p>Explore species traits, rules editions and detailed answers to common character-creation questions.</p>
    <div class="wiki-article__cards wiki-article__cards--full">
      {#each data.species as species (species.id)}
        <a class="species-json-card" href={`/species/${species.slug}/`}>
          <strong>{species.name}</strong>
          <span>{species.summary}</span>
          <small>Rules: {species.editions.join(' · ')}</small>
        </a>
      {/each}
    </div>
  </section>
</article>

<style lang="scss">
  .species-json-card {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    min-width: 0;
    padding: 1.25rem;
    border: 1px solid rgba(160, 174, 195, 0.22);
    border-radius: 0.9rem;
    background: rgba(160, 174, 195, 0.045);
    color: inherit;
    text-decoration: none;
    transition: background 150ms ease, border-color 150ms ease;
  }
  .species-json-card strong { font-size: 1.25rem; }
  .species-json-card span { line-height: 1.55; }
  .species-json-card small { opacity: 0.75; }
  .species-json-card:hover, .species-json-card:focus-visible {
    background: rgba(160, 174, 195, 0.12);
    border-color: currentColor;
  }
  @media (prefers-reduced-motion: reduce) {
    .species-json-card { transition: none; }
  }
</style>
