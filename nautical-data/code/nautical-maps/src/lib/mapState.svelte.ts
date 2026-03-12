let map = $state<mapboxgl.Map | undefined>(undefined);

export const mapState = {
  get map() { return map },
  set map(value) { map = value }
}
