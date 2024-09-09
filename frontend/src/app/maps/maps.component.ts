import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { ActivatedRoute } from '@angular/router';
import 'leaflet.markercluster';

@Component({
  selector: 'app-maps',
  templateUrl: './maps.component.html',
  styleUrls: ['./maps.component.css']
})
export class MapsComponent implements AfterViewInit {
  private map: L.Map | undefined;
  public mapPointView: any;

  constructor(private route: ActivatedRoute) { }

  ngAfterViewInit(): void {
    this.initMap();
    console.log(this.map)
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['dataMap'] == undefined) {
        this.mapPointView = null
      } else {
        this.mapPointView = JSON.parse(params['dataMap']);
      }
    });
  }

  private initMap(): void {
   
    this.map = L.map('myMap', {

      center: [
        (this.mapPointView && this.mapPointView.lat) || -34.61315,
        (this.mapPointView && this.mapPointView.long) || -58.37723
      ],  
      zoom: 14,
      zoomControl: true  
    });


    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.megatrans.com.ar/">Megatrans</a> contributors'
    }).addTo(this.map);


    if (this.mapPointView !== null) {

      const iconMarker = L.divIcon({
        className: 'custom-icon',
        html: `
        <div class="icon-container">
          <img src="./../../assets/marker.png" class="marker-icon" />
          <div style="font-size: 18px; position: absolute; right: -10px"  class="icon-text">${this.mapPointView.name}</div>
          </div>`,
        iconSize: [21, 23],
        iconAnchor: [20, 30]
      });

      L.marker([this.mapPointView.lat, this.mapPointView.long], { icon: iconMarker }).addTo(this.map);
    }
  }
}
