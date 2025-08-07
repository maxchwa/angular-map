import Control from 'ol/control/Control';
import Geolocation from 'ol/Geolocation';
import { toLonLat } from 'ol/proj';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Map from 'ol/Map';

export interface GoToLocationOptions {
  map: Map;
  vectorSource: VectorSource;
  defaultStyle: Style;
  selectInteraction: any; // your Select interaction instance
}

export class GoToMyLocationControl extends Control {
  private geolocation: Geolocation | null = null;
  private button: HTMLButtonElement;
  private statusEl: HTMLSpanElement;
  private options: GoToLocationOptions;

  constructor(options: GoToLocationOptions) {
    // create DOM structure
    const container = document.createElement('div');
    container.className = 'ol-unselectable ol-control';

    // button
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.title = 'Go to my location';
    btn.innerText = '📍'; // or use icon SVG
    btn.className = 'p-2 bg-white rounded shadow';

    // optional status text
    const status = document.createElement('span');
    status.style.marginLeft = '4px';
    status.style.fontSize = '0.75rem';
    status.textContent = '';

    container.appendChild(btn);
    container.appendChild(status);

    super({
      element: container
    });

    this.button = btn;
    this.statusEl = status;
    this.options = options;

    this.button.addEventListener('click', this.handleClick.bind(this));
  }

  private handleClick() {
    const { map, vectorSource, defaultStyle, selectInteraction } = this.options;

    // Clear any previous geolocation to avoid double listeners
    if (this.geolocation) {
      this.geolocation.setTracking(false);
      this.geolocation = null;
    }

    this.statusEl.textContent = 'Locating…';

    this.geolocation = new Geolocation({
      tracking: true,
      projection: map.getView().getProjection(),
    });

    const onLocationChange = () => {
      const position = this.geolocation?.getPosition();
      if (position) {
        map.getView().animate({
          center: position,
          zoom: 16,
          duration: 1000,
        });

        const feature = new Feature({
          geometry: new Point(position),
        });
        feature.setStyle(defaultStyle);
        vectorSource.addFeature(feature);

        selectInteraction.getFeatures().clear();
        selectInteraction.getFeatures().push(feature);

        const [lon, lat] = toLonLat(position);
        // You can replace alert with something less disruptive if desired
        alert(`You are here:\nLongitude: ${lon}, Latitude: ${lat}`);

        this.statusEl.textContent = '';
        // cleanup
        this.geolocation?.un('change', onLocationChange);
        this.geolocation?.setTracking(false);
      }
    };

    this.geolocation.on('change', onLocationChange);

    this.geolocation.on('error', (err) => {
      console.error('Geolocation error:', err.message);
      this.statusEl.textContent = 'Failed';
      alert('Geolocation failed: ' + err.message);
      this.geolocation?.setTracking(false);
    });
  }
}
