import { Component, AfterViewInit } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import OverviewMap from 'ol/control/OverviewMap';
import { defaults as defaultControls } from 'ol/control/defaults';
import DragRotateAndZoom from 'ol/interaction/DragRotateAndZoom';
import { defaults as defaultInteractions } from 'ol/interaction/defaults';
import { toLonLat } from 'ol/proj';
import { Pixel } from 'ol/pixel';
import {CdkDrag} from '@angular/cdk/drag-drop'

@Component({
  selector: 'app-map',
  imports: [CdkDrag],
  standalone: true, // ✅ required for standalone setup
  template: `
    <div id="map" class="map" (click)="coordFinder($event)" (drag)="dragDetected()"></div>
  `,
  styles: [`
    .map {
      width: 100%;
      height: 400px;
      object-fit: contain;
    }

/*
<div>
      <label><input type="checkbox" id="rotateWithView"> Rotate with view</label>
    </div>
*/

    .map .ol-custom-overviewmap,
/*    .map .ol-custom-overviewmap.ol-uncollapsible {
      bottom: auto;
      left: auto;
      right: 0;
      top: 0;
    }

    .map .ol-custom-overviewmap:not(.ol-collapsed) {
      border: 1px solid black;
    }
*/
    .map .ol-custom-overviewmap .ol-overviewmap-map {
      border: none;
      width: 300px;
    }

    .map .ol-custom-overviewmap .ol-overviewmap-box {
      border: 2px solid red;
    }

    .map .ol-custom-overviewmap:not(.ol-collapsed) button {
      bottom: auto;
      left: auto;
      right: 1px;
      top: 1px;
    }

    .map .ol-rotate {
      top: 170px;
      right: 0;
    }
  `]
})
export class MapComponent implements AfterViewInit {
  
  map!: Map;
  noDrag: boolean = true;

  ngAfterViewInit(): void {

  /*  
    const overviewMapControl = new OverviewMap({
      className: 'ol-overviewmap ol-custom-overviewmap',
      layers: [
        new TileLayer({
          source: new OSM({
            url: 'https://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=YOUR_API_KEY',
          }),
        }),
      ],
      collapseLabel: '\u00BB',
      label: '\u00AB',
      collapsed: false,
    });
    */

    this.map = new Map({
      target: 'map',
      //controls: defaultControls().extend([overviewMapControl]),
      interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [500000, 6000000],
        zoom: 7,
      }),
    });
  }

  dragDetected(): void {

    this.noDrag = true;
    alert('dragging');

    //i think this is perma and that's a problem

  }

  coordFinder(event: MouseEvent): void {

    if (this.noDrag) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const pixel: Pixel = [
        event.clientX - rect.left,
        event.clientY - rect.top
      ];
      const point = this.map.getCoordinateFromPixel(pixel);
      const lonLat = toLonLat(point);
      console.log('Coordinates:', lonLat);
      alert(`Longitude: ${lonLat[0]}, Latitude: ${lonLat[1]}`);
    }
  }

}
