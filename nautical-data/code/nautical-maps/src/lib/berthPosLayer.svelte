<script lang="ts">
	import { mapState } from '$lib/mapState.svelte';
	import type { GeoJSONSourceSpecification } from 'mapbox-gl';

	let map = $derived(mapState.map);

	let { berthPos }: { berthPos: Array<any> } = $props();

	const features: GeoJSON.Feature<GeoJSON.Point, GeoJSON.GeoJsonProperties>[] = berthPos.map(
		(b: any) => {
			return {
				type: 'Feature',
				properties: {
					name: b.name,
					terminalGln: b.terminalGln,
					berthGln: b.berthGln
				},
				geometry: {
					type: 'Point',
					coordinates: [b.lng, b.lat]
				}
			};
		}
	);

	const geojson: GeoJSONSourceSpecification = {
		type: 'geojson',
		data: {
			type: 'FeatureCollection',
			features: features
		}
	};

	$effect(() => {
		if (map) {
			map.on('load', () => {
				try {
					map.addSource('berth-pos-source', geojson);

					for (let bp of berthPos) {
						const layerName = `berth-pos-layer-${bp.terminalGln}`;
						if (!map.getLayer(layerName)) {
							map.addLayer({
								id: layerName,
								type: 'circle',
								source: 'berth-pos-source',
								layout: {},
								paint: {
									'circle-color': 'yellow',
									'circle-radius': [
										'interpolate',
										['linear'],
										['zoom'],
										// zoom is 10 (or less) -> circle radius will be 1px
										12,
										1,
										// zoom is 14 (or greater) -> circle radius will be 5px
										18,
										5
									]
								},
								filter: ['==', 'terminalGln', bp.terminalGln],
								minzoom: 12
								//ref: bp.terminalGln
							});
						}
					}
				} catch (error) {
					console.error(error);
				}
			});
		}
	});
</script>
