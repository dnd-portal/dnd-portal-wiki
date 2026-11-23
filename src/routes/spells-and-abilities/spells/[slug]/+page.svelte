<script lang="ts">
    import { page } from '$app/state';
    import { redirect } from '@sveltejs/kit';

    throw redirect(308, `/spells/${page.params.slug}/`);
</script>
