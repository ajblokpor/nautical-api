<script lang="ts">
	import type { LngLatBoundsLike } from 'mapbox-gl';	
	import { mapState } from '$lib/mapState.svelte';

	let { terminals, berths, bounds }: { terminals: any[]; berths: any[]; bounds: LngLatBoundsLike } =
		$props();

	let map = $derived(mapState.map);

	let selectedTerminal = $state<any | null>(null);
	let berthsForSelectedTerminal = $state<any | null>(null);
	let selectedBerth = $state<any | null>(null);

	const onChangeSelectTerminal = () => {
		if (selectedTerminal) {
			var lats = selectedTerminal.gps.map((g) => g.latitude);
			var lons = selectedTerminal.gps.map((g) => g.longitude);
			var minLat = Math.min(...lats);
			var maxLat = Math.max(...lats);
			var minLong = Math.min(...lons);
			var maxLong = Math.max(...lons);
			console.log('terminal found', selectedTerminal, lats, minLat, maxLat, minLong, maxLong, map);

			for (let terminal of terminals) {
				const layerBerthName = `berth-layer-${terminal.gln}`;
				const layerBerthPosName = `berth-pos-layer-${terminal.gln}`;
				if (terminal.gln == selectedTerminal.gln) {
					map?.setPaintProperty(layerBerthName, 'line-color', `red`);
				} else {
					map?.setPaintProperty(layerBerthName, 'line-color', `gray`);
				}
				if (map?.getLayer(layerBerthPosName)) {
					if (terminal.gln == selectedTerminal.gln) {
						map?.setPaintProperty(layerBerthPosName, 'circle-color', `green`);
					} else {
						map?.setPaintProperty(layerBerthPosName, 'circle-color', 'yellow');
					}
				}
			}

			map?.fitBounds([
				[minLong - 0.001, minLat - 0.001],
				[maxLong + 0.001, maxLat + 0.001]
			]);

			berthsForSelectedTerminal = berths.filter((b) => b.terminalGln == selectedTerminal.gln);
			selectedBerth = null;
		} else {
			for (let terminal of terminals) {
				const layerBerthName = `berth-layer-${terminal.gln}`;
				const layerBerthPosName = `berth-pos-layer-${terminal.gln}`;
				map?.setPaintProperty(layerBerthName, 'line-color', `darkred`);
				if (map?.getLayer(layerBerthPosName)) {
					map?.setPaintProperty(layerBerthPosName, 'circle-color', 'yellow');
				}
			}

			map?.fitBounds(bounds);
			berthsForSelectedTerminal = null;
			selectedBerth = null;
		}
	};

	const onChangeSelectBerth = () => {
		if (selectedBerth) {
			var minLat = Math.min(selectedBerth.latA, selectedBerth.latB);
			var maxLat = Math.max(selectedBerth.latA, selectedBerth.latB);
			var minLong = Math.min(selectedBerth.lngA, selectedBerth.lngB);
			var maxLong = Math.max(selectedBerth.lngA, selectedBerth.lngB);
			console.log('berth found', selectedBerth, minLat, maxLat, minLong, maxLong);

			map?.fitBounds([
				[minLong - 0.001, minLat - 0.001],
				[maxLong + 0.001, maxLat + 0.001]
			]);
		}
		else {
			map?.fitBounds(bounds);
		};
	};
</script>

<select bind:value={selectedTerminal} onchange={onChangeSelectTerminal}>
	<option value={null}> ALLE </option>
	{#each terminals as terminal}
		<option value={terminal}>
			{terminal.name}-{terminal.gln}
		</option>
	{/each}
</select>

<select bind:value={selectedBerth} onchange={onChangeSelectBerth}>
	<option value={null}> ALLE </option>
	{#each berthsForSelectedTerminal as berth}
		<option value={berth}>
			{berth.name}-{berth.gln}
		</option>
	{/each}
</select>
