import type { LngLatBoundsLike } from 'mapbox-gl';
import type { PageLoad } from './$types';
import type { ArrayOfTerminalWithBerthsAndPositions, Coordinate } from '../types/types.gen.ts';

export const load: PageLoad = (async ({ fetch }) => {
	const response: Response = await fetch(`http://localhost:3000/fetchall`);
	const result = (await response.json()) as ArrayOfTerminalWithBerthsAndPositions;

	console.log('Processing', result.length, 'terminals');

	// determine terminals with GPS boundaries
	const terminals = result
		.map((item) => {
			let gps: Coordinate[] = [];
			for (const b of item.berths ?? []) {
				if (b?.geoCoordinates) gps.push(...b.geoCoordinates);

				const positions = b?.positions;
				if (!positions) continue;

				for (const bp of positions) {
					if (bp?.geoCoordinate) gps.push(bp.geoCoordinate);
				}
			}

			return {
				gln: item.gln,
				shortName: item.shortName,
				name: item.name,
				portFacilityNumber: item.portFacilityNumber,
				terminalType: item.terminalType,
				gps: gps
			};
		})
		.filter((t) => t.gps.length > 0)
		.sort((a, b) => a.name.localeCompare(b.name));

	// determine berths with GPS boundaries
	const berths = result
		.map((item) => {
			return item.berths.map((i) => {
				return {
					coordinates: i.geoCoordinates,
					gln: i.gln,
					name: i.name,
					berthType: i.berthType,
					unloCode: i.unloCode,
					terminalName: item.name,
					terminalGln: item.gln,
				};
			});
		})
		.reduce((a, b) => {
			return a.concat(b);
		})
		.map((berth) => {
			if(berth.coordinates.length !== 2) {
				console.warn(`Berth ${berth.name} has ${berth.coordinates.length} coordinates, expected 2. Skipping.`);
				return null;
			}

			return {
				lngA: berth.coordinates[0].longitude,
				latA: berth.coordinates[0].latitude,
				lngB: berth.coordinates[1]?.longitude,
				latB: berth.coordinates[1]?.latitude,
				gln: berth.gln,
				name: berth.name,
				type: berth.berthType,
				unloCode: berth.unloCode,
				terminalName: berth.terminalName,
				terminalGln: berth.terminalGln
			};
		})
		.filter((b) => b !== null);

	// determine berth positions with GPS boundaries
	const berthPos = result
		.map((t) =>
			t.berths.map((b) => {
				if(!b.positions) return [];
				return b.positions.map((bp) => {
					return {
						lng: bp.geoCoordinate?.longitude,
						lat: bp.geoCoordinate?.latitude,
						glnWithExt: bp.glnWithExt,
						name: bp.name,
						type: bp.type,
						terminalGln: t.gln,
						berthGln: b.gln
					};
				});
			})
		)
		.reduce((a, b) => a.concat(b))
		.reduce((a, b) => a.concat(b))
		.filter(g => g.lat)
		.filter(g => g.lng);

	// determine map bounds
	const lats = berthPos.map((g) => g.lat);
	const lons = berthPos.map((g) => g.lng);
	const minLat = Math.min(...lats);
	const maxLat = Math.max(...lats);
	const minLong = Math.min(...lons);
	const maxLong = Math.max(...lons);

	const bounds: LngLatBoundsLike = [
		[minLong - 0.05, minLat - 0.05],
		[maxLong + 0.05, maxLat + 0.05]
	];

	console.log('Bounds:', bounds);

	return {
		terminals: terminals,
		berths: berths,
		berthPos: berthPos,
		bounds: bounds
	};
}) satisfies PageLoad;
