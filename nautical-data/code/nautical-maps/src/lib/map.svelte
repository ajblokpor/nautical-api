<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import mapboxgl from 'mapbox-gl';
	import { mapState } from './mapState.svelte';
	import { PUBLIC_MAPBOX_ACCESS_TOKEN } from '$env/static/public';

    let { lat , lon, zoom, children } : { lat: number, lon: number, zoom: number, children: any } = $props();

	let container: HTMLDivElement;
	let map: mapboxgl.Map | undefined = $state(undefined);

	onMount(() => {
		console.log('Mounting Map');

        mapboxgl.accessToken = PUBLIC_MAPBOX_ACCESS_TOKEN;
		map = new mapboxgl.Map({
			container,
			style: 'mapbox://styles/mapbox/streets-v9',
			center: [lon, lat],
			zoom
		});

        mapState.map = map; // Update the shared state with the map instance
	});

	onDestroy(() => {
		if (map) map.remove();
	});
</script>

<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/mapbox-gl/dist/mapbox-gl.css" />
</svelte:head>

<div class="map-children" bind:this={container}>
	<!-- Map will be rendered here -->
	{@render children?.()}
</div>

<style>
	div {
		width: 100%;
		height: 800px;
	}
</style>
