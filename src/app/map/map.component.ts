import { Component, AfterViewInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { toLonLat } from 'ol/proj';
import DragRotateAndZoom from 'ol/interaction/DragRotateAndZoom';
import { defaults as defaultInteractions } from 'ol/interaction/defaults';
import Select from 'ol/interaction/Select';
import { click } from 'ol/events/condition';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import Geolocation from 'ol/Geolocation';
import { CreateMemoryComponent } from '../create-memory/create-memory.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CreateMemoryComponent, CommonModule],
  template: `
      <div class="relative">
  <!-- Map container -->
  <div id="map" class="map"></div>

  <!-- Buttons (z-indexed above map) -->
  <button
    (click)="goToMyLocation()"
    class="absolute z-10 top-2 left-2 bg-blue-600 text-white px-4 py-2 rounded shadow"
  >
    Go to My Location
  </button>
  <button
    (click)="openCreateMemoryForm()"
    class="absolute top-14 left-2 z-10 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
  >
    Create Memory
  </button>
</div>

<!-- Modal lives outside map stacking context -->
<div
  *ngIf="showCreateMemoryForm"
  class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
>
  <div class="relative bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
    <!-- Close button -->
    <button
      (click)="closeCreateMemoryForm()"
      class="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
    >
      &times;
    </button>

    <!-- CreateMemoryComponent shown as a popup -->
    <app-create-memory></app-create-memory>
  </div>
</div>
  `,
  styles: [`
    .map {
      width: 100%;
      height: 400px;
      object-fit: contain;
      position: relative;
      z-index: 0;
    }
  `]
})
export class MapComponent implements AfterViewInit {

  map!: Map;
  noDrag: boolean = true;
  selectInteraction!: Select;

  showCreateMemoryForm = false;

  openCreateMemoryForm() {
    this.showCreateMemoryForm = true;
  }

  closeCreateMemoryForm() {
    this.showCreateMemoryForm = false;
  }

  vectorSource = new VectorSource();
  vectorLayer = new VectorLayer({
    source: this.vectorSource,
    style: new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: 'blue' }),
        stroke: new Stroke({ color: 'white', width: 2 })
      })
    })
  });

  // Default blue style
defaultStyle = new Style({
  image: new CircleStyle({
    radius: 6,
    fill: new Fill({ color: 'blue' }),
    stroke: new Stroke({ color: 'white', width: 2 })
  })
});

// Red style for selected
selectedStyle = new Style({
  image: new CircleStyle({
    radius: 6,
    fill: new Fill({ color: 'red' }),
    stroke: new Stroke({ color: 'white', width: 2 })
  })
});

  ngAfterViewInit(): void {
    this.map = new Map({
      target: 'map',
      interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        this.vectorLayer
      ],
      view: new View({
        center: [500000, 6000000],
        zoom: 7,
      }),
    });

    // Add a feature at clicked coordinate
    this.map.on('click', (event) => {
  if (!this.noDrag) return;

  // Check if there's a feature at the click location
  const featureAtPixel = this.map.forEachFeatureAtPixel(event.pixel, (feature) => feature);

  if (featureAtPixel) {
    // Don't add a new point if an existing one was clicked
    return;
  }

  const coord = event.coordinate;
  const lonLat = toLonLat(coord);

  const feature = new Feature({
    geometry: new Point(coord)
  });
  feature.setStyle(this.defaultStyle);
  this.vectorSource.addFeature(feature);

  console.log('Feature created at:', lonLat);
  alert(`Created point\nLongitude: ${lonLat[0]}, Latitude: ${lonLat[1]}`);
});


    // Select interaction — only triggers when clicking existing features
    this.selectInteraction = new Select({
      condition: (event) => this.noDrag && click(event),
      layers: [this.vectorLayer]
    });

    this.selectInteraction.on('select', (e) => {
  // Reset style of deselected features
  e.deselected.forEach((f) => f.setStyle(this.defaultStyle));

  // Apply selected style
  const selected = e.selected;
  if (selected.length > 0) {
    const feature = selected[0];
    feature.setStyle(this.selectedStyle);

    const coords = (feature.getGeometry() as Point).getCoordinates();
    const lonLat = toLonLat(coords);
    alert(`Selected point\nLongitude: ${lonLat[0]}, Latitude: ${lonLat[1]}`);
  }
});

    this.map.addInteraction(this.selectInteraction);
  }

  // ✅ Moved outside of ngAfterViewInit()
  goToMyLocation(): void {
  const geolocation = new Geolocation({
    tracking: true,
    projection: this.map.getView().getProjection(),
  });

  const onLocationChange = () => {
    const position = geolocation.getPosition();
    if (position) {
      this.map.getView().animate({
        center: position,
        zoom: 16,
        duration: 1000,
      });

      const feature = new Feature({
        geometry: new Point(position),
      });
      feature.setStyle(this.defaultStyle);

      // Optional: keep or remove this.vectorSource.clear() based on your intent
      this.vectorSource.addFeature(feature);

      this.selectInteraction.getFeatures().clear();
      this.selectInteraction.getFeatures().push(feature);

      const [lon, lat] = toLonLat(position);
      alert(`You are here:\nLongitude: ${lon}, Latitude: ${lat}`);

      // ✅ Stop listening + tracking after first update
      geolocation.un('change', onLocationChange);
      geolocation.setTracking(false);
    }
  };

  geolocation.on('change', onLocationChange);

  geolocation.on('error', (err) => {
    console.error('Geolocation error:', err.message);
    alert('Geolocation failed: ' + err.message);
  });
}
}



