<script lang="ts">
	import mapboxgl from 'mapbox-gl';
	import { mapState } from '$lib/mapState.svelte';

	let map = $derived(mapState.map);

	let { data, bpData=$bindable() } = $props();

	$effect(() => {
		if (map) {
			map?.fitBounds(data.bounds);

			map?.on('click', (e) => {
				// Set `bbox` as 5px reactangle area around clicked point.
				const bbox: [mapboxgl.PointLike, mapboxgl.PointLike] = [
					[e.point.x - 5, e.point.y - 5],
					[e.point.x + 5, e.point.y + 5]
				];
				// Find features intersecting the bounding box.
				const selectedFeatures = map!.queryRenderedFeatures(bbox);
				const berthPosLayers = selectedFeatures.filter((f) => f.layer?.id.startsWith('berth-pos'));
				if (berthPosLayers.length > 0) {
					const berthPosLayer = berthPosLayers[0];
					if (data) {
						const berthPos = data.berthPos.filter(
							(bp) =>
								bp.terminalGln == berthPosLayer.properties!.terminalGln &&
								bp.berthGln == berthPosLayer.properties!.berthGln &&
								bp.name == berthPosLayer.properties!.name
						)[0];
						const berth = data.berths.filter(
							(b) =>
								b.terminalGln == berthPosLayer.properties!.terminalGln &&
								b.gln == berthPosLayer.properties!.berthGln
						)[0];
						const terminal = data.terminals.filter(
							(t) => t.gln == berthPosLayer.properties!.terminalGln
						)[0];

						console.debug('Clicked on berth position:', berthPos, 'Berth:', berth, 'Terminal:', terminal);
						bpData = {
							terminal: terminal,
							berth: berth,
							berthPos: berthPos
						};
					}
				} else {
					const berthLayers = selectedFeatures.filter((f) => f.layer?.id.startsWith('berth-layer'));
					if (berthLayers.length > 0) {
						const berthLayer = berthLayers[0];
						if (data) {
							const berth = data.berths.filter(
								(b) =>
									b.terminalGln == berthLayer.properties!.terminalGln &&
									b.gln == berthLayer.properties!.berthGln
							)[0];
							const terminal = data.terminals.filter(
								(t) => t.gln == berthLayer.properties!.terminalGln
							)[0];

							console.debug('Clicked on berth:', berth, 'Terminal:', terminal);
							bpData = {
								terminal: terminal,
								berth: berth,
								berthPos: null
							};
						}
					}
				}
			});
		}
	});
</script>
