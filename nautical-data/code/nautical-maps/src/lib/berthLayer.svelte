<script lang="ts">
	import { mapState } from '$lib/mapState.svelte';
	import type { GeoJSONSourceSpecification } from 'mapbox-gl';

	let map = $derived(mapState.map);

	let { berths }: { berths: Array<any> } = $props();

	const features: GeoJSON.Feature<GeoJSON.LineString, GeoJSON.GeoJsonProperties>[] = berths.map(
		(b: any) => {
			return {
				type: 'Feature',
				geometry: {
					type: 'LineString',
					coordinates: [
						[b.lngA, b.latA],
						[b.lngB, b.latB]
					]
				},
				properties: {
					name: b.name,
					terminalGln: b.terminalGln,
					berthGln: b.gln
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
					map.addSource('berth-source', geojson);

					for (let berth of berths) {
						const layerName = `berth-layer-${berth.terminalGln}`;
						if (!map.getLayer(layerName)) {
							if (berth.terminalGln == '8719331161169') {
								console.debug(`adding berth layer ${layerName}`, berth);
							}

							map.addLayer({
								id: layerName,
								type: 'line',
								source: 'berth-source',
								layout: {
									'line-join': 'round',
									'line-cap': 'round'
								},
								paint: {
									'line-color': 'darkred',
									'line-width': 2
								},
								filter: ['==', 'terminalGln', berth.terminalGln]
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
