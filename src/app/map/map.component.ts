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
import Overlay from 'ol/Overlay';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, CreateMemoryComponent],
  template: `
    <div class="relative">
      <div id="map" class="map"></div>

      <!-- Popup1: shows after map click, has Create Memory button -->
      <div id="popup" class="ol-popup">
        <a
          href="#"
          id="popup-closer"
          class="ol-popup-closer"
          (click)="hidePopup1($event)"
        ></a>
        <div id="popup-content">
          <button
            (click)="openCreateMemoryForm()"
            class="absolute top-14 left-2 z-300 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          >
            Create Memory
          </button>
        </div>
      </div>

      <!-- Popup2: overlay containing the form component -->
      <div id="popup2" class="ol-popup2">
        <a
          href="#2"
          id="popup-closer2"
          class="ol-popup-closer2"
          (click)="onMemoryFormClosed($event)"
        ></a>
        <div id="popup-content2" class = "z-305">
          <app-create-memory
            *ngIf="showMemoryForm"
            [coordinate]="lastClickedCoord"
            [lonLat]="lastClickedLonLat!"
            (closed)="onMemoryFormClosed()"
          ></app-create-memory>
          <button
            (click)="openCreateMemoryForm()"
            class="absolute top-14 left-2 z-305 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
          >
            Fun Button
          </button>
        </div>
      </div>

      <!-- Location button -->
      <button
        (click)="goToMyLocation()"
        class="absolute z-300 top-2 left-2 bg-blue-600 text-white px-4 py-2 rounded shadow"
      >
        Go to My Location
      </button>
    </div>
  `,
  styles: [`
    .map {
      width: 100%;
      height: 100vh;
      position: relative;
      z-index: 0;
    }
  `]
})
export class MapComponent implements AfterViewInit {
  map!: Map;
  overlay!: Overlay;   // popup1
  overlay2!: Overlay;  // popup2

  noDrag: boolean = true;
  selectInteraction!: Select;

  showMemoryForm = false;
  lastClickedCoord: any = null;
  lastClickedLonLat: [number, number] | null = null;

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

  defaultStyle = new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({ color: 'blue' }),
      stroke: new Stroke({ color: 'white', width: 2 })
    })
  });

  selectedStyle = new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({ color: 'red' }),
      stroke: new Stroke({ color: 'white', width: 2 })
    })
  });

  ngAfterViewInit(): void {
    const container = document.getElementById('popup')!;
    const container2 = document.getElementById('popup2')!;

    this.overlay = new Overlay({
      element: container,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });

    this.overlay2 = new Overlay({
      element: container2,
      autoPan: {
        animation: {
          duration: 250,
        },
      },
    });

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
      overlays: [this.overlay, this.overlay2],
    });

    // Map click: create feature, show popup1 with Create Memory button
    this.map.on('click', (event) => {
      if (!this.noDrag) return;

      const featureAtPixel = this.map.forEachFeatureAtPixel(event.pixel, (feature) => feature);
      const coord = event.coordinate;
      const lonLat = toLonLat(coord);

      if (featureAtPixel) {
        // Existing feature selected; you could handle selection here separately.
        return;
      }

      const feature = new Feature({
        geometry: new Point(coord)
      });
      feature.setStyle(this.defaultStyle);
      this.vectorSource.addFeature(feature);

      this.lastClickedCoord = coord;
      console.log(this.lastClickedCoord);
      this.lastClickedLonLat = [lonLat[0], lonLat[1]];

      // Show popup1 at the new point
      this.overlay.setPosition(coord);
    });

    // Select interaction for existing features
    this.selectInteraction = new Select({
      condition: (event) => this.noDrag && click(event),
      layers: [this.vectorLayer]
    });

    this.selectInteraction.on('select', (e) => {
      e.deselected.forEach((f) => f.setStyle(this.defaultStyle));
      if (e.selected.length > 0) {
        const feature = e.selected[0];
        feature.setStyle(this.selectedStyle);
        const coords = (feature.getGeometry() as Point).getCoordinates();
        const lonLat = toLonLat(coords);
        alert(`Selected point\nLongitude: ${lonLat[0]}, Latitude: ${lonLat[1]}`);
      }
    });

    this.map.addInteraction(this.selectInteraction);
  }

  openCreateMemoryForm() {
    if (!this.lastClickedCoord) return;
    // Position overlay2 at the same coordinate and show the embedded component
    this.overlay2.setPosition(this.lastClickedCoord);
    // Force re-creation to reset internal state
    this.showMemoryForm = false;
    setTimeout(() => {
      this.showMemoryForm = true;
    }, 0);
  }

  onMemoryFormClosed(event?: Event) {
    this.showMemoryForm = false;
    this.hideOverlay2(event as MouseEvent | undefined);
  }

  hidePopup1(event?: MouseEvent) {
    event?.preventDefault();
    this.overlay.setPosition(undefined);
  }

  hideOverlay2(event?: MouseEvent) {
    event?.preventDefault();
    this.overlay2.setPosition(undefined);
    this.showMemoryForm = false;
  }

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
        this.vectorSource.addFeature(feature);

        this.selectInteraction.getFeatures().clear();
        this.selectInteraction.getFeatures().push(feature);

        const [lon, lat] = toLonLat(position);
        alert(`You are here:\nLongitude: ${lon}, Latitude: ${lat}`);

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
