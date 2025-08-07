import { fromLonLat } from 'ol/proj';
import { Component, AfterViewInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import Control from 'ol/control/Control.js';
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
import { GoToMyLocationControl } from '../go-to-my-location/go-to-my-location.component';
import { MemoryService, Memory } from '../memory-service/memory-service.component';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, CreateMemoryComponent],
  template: `
    <div class="relative">
      <div id="map" class="map"></div>
      <div id="desc" #popupContent class="ol-popup z-305">
  <!-- content will be injected here -->
    </div>

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
            (click)="hidePopup1($event)"
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
        </div>
      </div>

      <!-- Location button -->
    </div>
  `,
  styles: [`
    .map {
      width: 100%;
      height: 100vh;
      position: relative;
      z-index: 0;
    }
    .ol-popup {
      background-color: white;
      padding: 10px;
      border-radius: 4px;
      border: 1px solid #ccc;
      min-width: 150px;
      position: absolute;
      bottom: 12px;
      left: -50px;
    }
  `]
})
export class MapComponent implements AfterViewInit {
  @ViewChild('popupContent', { static: false }) popupContent!: ElementRef;
  map!: Map;
  overlay!: Overlay;   // popup1
  overlay2!: Overlay;  // popup2
  overlay3!: Overlay;

  noDrag: boolean = true;
  selectInteraction!: Select;

  showMemoryForm = false;
  lastClickedCoord: any = null;
  lastClickedLonLat: [number, number] | null = null;

  memories: Memory[] = [];
  constructor(private memoryService: MemoryService) {}

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
    const container3 = document.getElementById('desc')!;

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

    this.overlay3 = new Overlay({
      element: container3,
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
      overlays: [this.overlay, this.overlay2, this.overlay3],
    });

    this.memoryService.getMemories().subscribe((data) => {
  this.memories = data;

  for (const item of this.memories) {
    const coordString = item.coords;

    // Convert string to coordinate array if needed
    const [lon, lat] = coordString.split(',').map(Number); // assuming "103.851,1.290"
    const coord = [lon, lat];

    // Create a new popup/feature/overlay here
    console.log('Add popup at:', coord);
    console.log('lon:', lon, 'lat:', lat);
    
    // e.g., create feature or set overlay
    const feature = new Feature({
      geometry: new Point(coord),
      memoryData: item
    });

    feature.setStyle(this.defaultStyle);
    this.vectorSource.addFeature(feature);

    // Optional: set overlay position (e.g., to show a popup with memory data)
    // const overlay = new Overlay({ ... });
    // overlay.setPosition(coord);
    // this.map.addOverlay(overlay);
  }

  console.log('Total features:', this.vectorSource.getFeatures().length);
  
  });

    // Map click: create feature, show popup1 with Create Memory button

    this.map.on('click', (event) => {

      this.onMemoryFormClosed();
      
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
        const memory = feature.get('memoryData');


const contentHtml = `
      <h3>${memory.title}</h3>
      <p>${memory.description}</p>
      <img src="${memory.image}" width="200" />
    `;

this.popupContent.nativeElement.innerHTML = contentHtml;
this.overlay3.setPosition(coords);
      }
      
    });

    this.map.addInteraction(this.selectInteraction);

    const goControl = new GoToMyLocationControl({
    map: this.map,
      vectorSource: this.vectorSource,
      defaultStyle: this.defaultStyle,
      selectInteraction: this.selectInteraction,
    });

// add to map
    this.map.addControl(goControl);
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
