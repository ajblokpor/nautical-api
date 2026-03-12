<script lang="ts">
	import type { PageProps } from './$types';
	import Map from '$lib/map.svelte';
	import BerthLayer from '$lib/berthLayer.svelte';
	import BerthPosLayer from '$lib/berthPosLayer.svelte';
	import ClickHandler from '$lib/clickHandler.svelte';
	import Search from '$lib/search.svelte';

	let { data }: PageProps = $props();

	let bpData : {terminal: any, berth: any, berthPos: any} = $state({
		terminal: null,
		berth: null,
		berthPos: null
	});

	const close = () => {
		bpData.berthPos  = null;
		bpData.berth = null;
		bpData.terminal = null;
	}
</script>

<h1>Welcome to Nautical Data Maps</h1>
<p>This shows the output of the Nautical Data Maps</p>

<Search terminals={data.terminals} berths={data.berths} bounds={data.bounds} />

<Map lat={51.953} lon={4.0169} zoom={12}>
	<BerthLayer berths={data.berths} />
	<BerthPosLayer berthPos={data.berthPos} />
	<ClickHandler data={data} bind:bpData={bpData} />
</Map>

<div id="info" class:hasinfo="{bpData.terminal}" >
	{#if bpData.terminal && bpData.berth}
		<h4>Terminal</h4>
		Gln:  {bpData.terminal.gln}<br/>
		Short Name: {bpData.terminal.shortName}<br/>
		Name: {bpData.terminal.name}<br/>
		Type: {bpData.terminal.terminalType}<br/>
		Port Facility Number: {bpData.terminal.portFacilityNumber}<br/>

		<h4>Berth</h4>
		Gln:  {bpData.berth.gln}<br/>
		Name: {bpData.berth.name}<br/>
		Type: {bpData.berth.type}<br/>
		UnloCode: {bpData.berth.unloCode}<br/>
		Type: MultiLine<br/>
		Coordinates: <br/>
		- {bpData.berth.latA} {bpData.berth.lngA}<br/>
		- {bpData.berth.latB} {bpData.berth.lngB}<br/>

		{#if bpData.terminal && bpData.berth && bpData.berthPos}
			<h4>Berth Position</h4>
			Gln:  {bpData.berthPos.glnWithExt}<br/>
			Name: {bpData.berthPos.name}<br/>
			Type: {bpData.berthPos.type}<br/>
			Coordinate: {bpData.berthPos.lat} {bpData.berthPos.lng}<br/>
		{/if}
	{/if}
	<button onclick={close}>Close</button>
</div>

<style>
	#info {
		background-color: darkblue;
		color: white;
		position: absolute;
		top: -2000px;
		right: 0;
		width: 260px;
		height: 2000px;
		padding: 0 16px;
	}

	#info.hasinfo {
		top: 0px;
	}

	button {
		width: 250px;
		margin-top: 16px;
	}
</style>
