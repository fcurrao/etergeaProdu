import { Component, OnInit, Renderer2, HostListener, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import { DataService } from '../services/dataServices';
import { ToastService } from '../services/toastServices';
import { Router } from '@angular/router';
import { Response } from 'src/app/models/response';
import { data } from '../../assets/data'; // estoy probando la data.... //  ACA ESTA EL JSON COMO VA A SER ! PROBAR ESTO 
import { Data } from '../models/data';
import * as esTranslations from '../../assets/es.json'
import * as L from 'leaflet';
import 'leaflet.markercluster';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit {
  private map: L.Map | undefined;
  public es: any = (esTranslations as any).default || esTranslations;
  public loaders: number[] = [];
  public fails: number[] = [];
  mapInit = false;
  public datas: Data[] = [];
  public datasChecked: Data[] = [];
  public etergea: any;
  isColumnDirection: boolean = false;
  loading: boolean = false;
  allChecked: boolean = false;
  alertToEndYetExist: boolean = false;
  alertToEndNotExist: boolean = false;
  alertSomethingNew: boolean = false;
  public showmapPopUp: boolean = false;
  public mapPopUp: string = '';
  delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private renderer: Renderer2,
    private DataServices: DataService,
    private ToastService: ToastService,

  ) { }


  ngOnInit() {
    this.mapInit = false
    this.DataServices.loaders$.subscribe(loaders => this.loaders = loaders);
    this.DataServices.fails$.subscribe(fails => this.fails = fails);
    this.DataServices.datas$.subscribe(datas => this.datas = datas);
    this.DataServices.datasChecked$.subscribe(datasChecked => this.datasChecked = datasChecked);
    let datasInStorage = JSON.parse(localStorage.getItem('datas')!);
    if (datasInStorage !== null && datasInStorage !== undefined) {
      this.updateDatas(datasInStorage)
    }
  }


  updateLoaders(loaders: number[]) {
    this.DataServices.setLoaders(loaders);
  }

  updateFails(fails: number[]) {
    this.DataServices.setFails(fails);
  }

  updateDatas(datas: Data[]) {
    localStorage.setItem('datas', JSON.stringify(datas));
    if (datas !== undefined && datas !== null) {
      datas.sort((a: any, b: any) => a.name - b.name);
    }
    this.DataServices.setDatas(datas);
  }

  updateDatasChecked(datasChecked: Data[]) {
    this.DataServices.setDatasChecked(datasChecked);
  }

  flexDirection(): void {
    this.isColumnDirection = !this.isColumnDirection;
  }


  cleanAll(): void { 
    this.fails = []
    this.loaders = []
    this.updateFails(this.fails)
    this.updateLoaders(this.loaders)

  }


  deleteFromLoaders = (loader: number) => {
    let index = this.loaders.indexOf(loader);
    (index !== -1) ? this.loaders.splice(index, 1) : "";
    this.updateLoaders(this.loaders)
  }

  reebotThis(event: string) {  
    console.log("reboot this:" + event);
  }

  updateAll() {
    this.datas.forEach(etergea => {
      if (etergea.checked) {
        console.log("update this:", etergea);
      }
    })
    this.updateDatas(this.datas)
  }

  testAll = () => {
    this.getCheckedEtergeas() 
    this.loading = true;
    console.log("test all:", this.datasChecked);  
    console.log("datas", this.datas) 
    this.loading = false;
  }

  retryFails = () => {
    let fails = this.fails
    setTimeout(() => {
      fails.forEach(fail => {
        this.addEachOne(fail, false)
        setTimeout(() => {
          this.deleteOfFail(fail)
        }, 100);
      })
    }, 100);
  }

  cleanFails = () => {
    this.fails = []
    this.updateFails(this.fails)
  }


  resetAll = async () => {
    for (const etergea of this.datas.filter(etergea => etergea.checked === true)) {
      await this.resetOne(etergea); 
      await new Promise(resolve => setTimeout(resolve, 400)); 
    }
  }

  resetOne = async (oneEtergea: Data) => {
    if (oneEtergea.data.PM.data.lowBattery === false) {
      const result = await Swal.fire({
        title: " ",
        html: "<h4 class='textswal'>La etergea " + oneEtergea.name + " tiene poca batería, se podría apagar.</h4> <h4  class='textswal' style='font-weight: 700;'>¿Estás seguro de que deseas continuar?</h4>",
        showDenyButton: true,
        confirmButtonText: "Reiniciar igual",
        denyButtonText: "Cancelar reinicio",
        didOpen: () => {
          const confirmButton = Swal.getConfirmButton();
          const denyButton = Swal.getDenyButton();
      
          if (confirmButton) {
            confirmButton.style.backgroundColor = '#5D5179';
            confirmButton.style.color = 'white';
            confirmButton.style.padding = '10px 20px';
            confirmButton.style.borderRadius = '5px';
            confirmButton.style.width= 'auto';
            confirmButton.style.height= '36px';
            confirmButton.style.border= 'transparent';
            confirmButton.style.borderRadius= '8px';
            confirmButton.style.fontSize= 'small';
            confirmButton.style.margin= '10px 0px !important';
            confirmButton.style.fontFamily= 'system-ui !important';
            confirmButton.style.outline = 'transparent !important';
            confirmButton.style.fontWeight= '600';
          }
      
          if (denyButton) {
            denyButton.style.backgroundColor = 'rgb(201, 78, 38) ';
            denyButton.style.color = 'white';
            denyButton.style.padding = '10px 20px';
            denyButton.style.borderRadius = '5px';
            denyButton.style.width= 'auto';
            denyButton.style.height= '36px';
            denyButton.style.border= 'transparent';
            denyButton.style.borderRadius= '8px';
            denyButton.style.fontSize= 'small';
            denyButton.style.margin= '10px 0px !important';
            denyButton.style.fontFamily= 'system-ui !important';
            denyButton.style.outline = 'transparent !important';
            denyButton.style.fontWeight= '600';
          }
        }
        
      }); 
      if (!result.isConfirmed) {
        return; 
      }
      if (result.isConfirmed) {
        this.continueReset(oneEtergea)
        return;
      }
    } else {
      this.continueReset(oneEtergea)
    }
  }

  continueReset = async (oneEtergea : Data) => { 
    let etergea = oneEtergea;
    etergea!.isLoading = true;
    etergea!.checked = false;
    this.updateDatas(this.datas);

    try {
      const resp = await this.DataServices.postResetEtergeas(parseInt(etergea!.name), etergea!.reset_modem).toPromise();

      if (resp && resp.status === "Ok") {
        this.ToastService.show('Se está reiniciando el ' + etergea!.name, { classname: 'toastInfo blue', delay: 5000 });

        await this.delay(35000);

        let retryCount = 0;
        const maxRetries = 2;

        while (retryCount < maxRetries) {
          try {
            const respOk = await this.DataServices.getOneEtergea(etergea!.name).toPromise();
            if (respOk && (respOk.status === "success" || respOk.status === "partial_success")) {
              // Manejar respuesta exitosa
              let name = etergea!.name;
              etergea = respOk;
              etergea!.name = name;
              etergea!.checked = true;
              etergea!.isLoading = false;
              etergea!.isFail = false;
              etergea!.isInMap = false;
              etergea!.reset_modem = true;
              const now = new Date();
              const day = String(now.getDate()).padStart(2, '0');
              const month = String(now.getMonth() + 1).padStart(2, '0');
              const year = now.getFullYear();
              const hours = String(now.getHours()).padStart(2, '0');
              const minutes = String(now.getMinutes()).padStart(2, '0'); 
              etergea!.date = `${year}-${month}-${day} ${hours}:${minutes}`;
              let index = this.datas.findIndex(data => data.name === etergea!.name);
              this.datas.splice(index, 1);
              this.datas.push(etergea!);
              this.updateDatas(this.datas);
              this.ToastService.show('Etergea ' + etergea!.name + ' reiniciada con éxito', { classname: 'toastInfo blue', delay: 5000 });
              break;
            } else {
              retryCount++;
              if (retryCount < maxRetries) {
                await this.delay(25000);
              } else {
                this.fails.push(parseInt(etergea!.name));
                etergea!.isFail = true;
                etergea!.isLoading = false;
                setTimeout(() => {
                  this.fails.sort((a: any, b: any) => a - b);
                }, 200);
                this.updateFails(this.fails);
                let index = this.datas.findIndex(data => data.name === etergea!.name);
                this.datas.splice(index, 1);
                this.updateDatas(this.datas);
                this.ToastService.show('Falló la Etergea ' + etergea!.name, { classname: 'toastInfo red', delay: 5000 });
              }
            }
          } catch (error) {
            console.error('Error en getOneEtergea:', error);
            retryCount++;
            if (retryCount < maxRetries) {
              await this.delay(30000);
            } else {
              this.fails.push(parseInt(etergea!.name));
              etergea!.isFail = true;
              etergea!.isLoading = false;
              setTimeout(() => {
                this.fails.sort((a: any, b: any) => a - b);
              }, 200);
              this.updateFails(this.fails);
              let index = this.datas.findIndex(data => data.name === etergea!.name);
              this.datas.splice(index, 1);
              this.updateDatas(this.datas);
              this.ToastService.show('Falló la Etergea ' + etergea!.name, { classname: 'toastInfo red', delay: 5000 });
            }
          }
        }
      } else {
        this.ToastService.show('Error al reiniciar ' + etergea!.name, { classname: 'toastInfo red', delay: 5000 });
      }
    } catch (error) {
      console.error('Error en postResetEtergeas:', error);
      this.fails.push(parseInt(etergea!.name));
      etergea!.isLoading = false;
      setTimeout(() => {
        this.fails.sort((a: any, b: any) => a - b);
      }, 200);
      this.updateFails(this.fails);
      let index = this.datas.findIndex(data => data.name === etergea!.name);
      this.datas.splice(index, 1);
      this.updateDatas(this.datas);
      this.ToastService.show('Error al reiniciar ' + etergea!.name, { classname: 'toastInfo red', delay: 5000 });
    } finally {
      etergea!.isLoading = false;
      this.updateDatas(this.datas);
    }
  }


  deleteAll = () => {
    this.getCheckedEtergeas()
    if (this.datasChecked.length === 0) {
      this.ToastService.show('No hay seleccionadas', { classname: 'toastInfo red', delay: 5000 });
    } else {
      let datasNotCheckedToDeleted = this.datas.filter(e => e.checked === false);
      this.datas = datasNotCheckedToDeleted;
      this.updateDatas(this.datas)
      this.ToastService.show('Se borro los seleccionados', { classname: 'toastInfo blue', delay: 5000 });
    }
    this.getCheckedEtergeas()
  }

  checkAll = () => {
    this.allChecked = !this.allChecked;
    this.datas.forEach((data: Data) => data.checked = this.allChecked);
    this.updateDatas(this.datas)
  }

  goToMap = (data:any) =>{ 
      data.isInMap = false
      this.updateDatas(this.datas)
      setTimeout(() => {
        const queryParams = { dataMap: JSON.stringify(data.dataMap) }; 
        this.router.navigate(['/maps'], { queryParams });
      },  );
  }
   
  toMap = async (value?: any) => {
    this.mapInit = true
    let lat = null
    let long = null;
    if (value.isInMap) {
      this.closeMapPopUp(value)
    } else if (!value.isInMap) {
      if (value.data.GPS.status === "success") {
        const keys = Object.keys(value.data.GPS.data);  
        if(value.data.GPS.data[keys[0]].data || value.data.GPS.data[keys[1]].data ){ 
          if (keys[0] && value.data.GPS.data[keys[0]].data.valid && value.data.GPS.data[keys[0]].data.latitude && value.data.GPS.data[keys[0]].data.longitude ) {
            lat = value.data.GPS.data[keys[0]].data.latitude
            long = value.data.GPS.data[keys[0]].data.longitude
          } else if (keys[1] && value.data.GPS.data[keys[1]].data.valid && value.data.GPS.data[keys[1]].data.latitude && value.data.GPS.data[keys[1]].data.longitude ) {
            lat = value.data.GPS.data[keys[1]].data.latitude
            long = value.data.GPS.data[keys[1]].data.longitude
          }
        } else{ 
          if (keys[0] && value.data.GPS.data[keys[0]].valid && value.data.GPS.data[keys[0]].data.latitude && value.data.GPS.data[keys[0]].data.longitude || value.data.GPS.data[keys[1]].valid  && value.data.GPS.data[keys[1]].data.latitude && value.data.GPS.data[keys[1]].data.longitude ) {
            lat = value.data.GPS.data[keys[0]].latitude
            long = value.data.GPS.data[keys[0]].longitude
          } else if (keys[1] && value.data.GPS.data[keys[1]].valid) {
            lat = value.data.GPS.data[keys[1]].latitude
            long = value.data.GPS.data[keys[1]].longitude
          }
        } 
        if (value.data.GPS.data[keys[0]].data  == null && value.data.GPS.data[keys[1]].data == null){ 
          this.mapInit = false
        } else {
          value.isInMap = true
          value.dataMap = {lat,long, name:value.name}
          this.updateDatas(this.datas)
          this.cdr.detectChanges();
          this.initMap(lat, long, value.name); 
        } 
      }
    }
  }


  closeMapPopUp(value?: any): void {
    this.datas.map((etergea: Data) => {
      if (etergea.name == value.name) {
        etergea.isInMap = false
      }
    })
    this.updateDatas(this.datas)
  }


  validateInput(event: KeyboardEvent) {
    const allowedKeys = /[0-9,-]/;
    const inputChar = String.fromCharCode(event.keyCode || event.which);
    if (!allowedKeys.test(inputChar)) {
      event.preventDefault();
    }
  }

  orderBy = (value: string) => {
    switch (value) {
      case 'numerico':
        setTimeout(() => { this.datas.sort((a: any, b: any) => a.name - b.name) }, 200);
        this.updateDatas(this.datas)
        break;
      case 'fecha':
        // this.datas.map((e:any)=>{
        //   e.data
        // })
        this.updateDatas(this.datas)
        break;
      case 'fallados':
        // this.datas.map((e:any)=>{
        //   if(e.fail == true)
        // })
        this.updateDatas(this.datas)
        break;

      default:
        break;
    }
  }

  private initMap(lat: string, long: string, name: string): void {
    this.mapInit = true
    this.map = L.map(`myMap${name}`, {
      center: [parseFloat(lat), parseFloat(long)],
      zoom: 15,
      zoomControl: true
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.megatrans.com.ar/">Megatrans</a> contributors'
    }).addTo(this.map);
    const iconMarker = L.icon({
      iconUrl: './../../assets/marker.png',
      iconSize: [21, 23],
      iconAnchor: [20, 30]
    });

    L.marker([parseFloat(lat), parseFloat(long)], { icon: iconMarker }).addTo(this.map);
  }

  getCheckedEtergeas = () => {
    this.datasChecked = []
    this.updateDatasChecked(this.datasChecked)
    this.datas.forEach((data: Data) => {
      if (data.checked == true) {
        if (!this.datasChecked.includes(data))
          this.datasChecked.push(data)
      }
    })
    this.updateDatasChecked(this.datasChecked)
  }

  getDeviceStatusGPRS(eachEtergea: any, number: number): any {
    if (eachEtergea.data.ppp0 === undefined || eachEtergea.data === undefined || eachEtergea.data === null) {
      return false;
    }
    const key = Object.keys(eachEtergea.data)[number];
    return eachEtergea.data[key];
  }

  
  getDeviceStatusGPS(eachEtergea: any, number: number): any { 
    // valido resultado de data partial_error
    if (eachEtergea.status == "error" || eachEtergea.data === undefined || eachEtergea.data === null) {
      return false;
    }
    const key = Object.keys(eachEtergea.data)[number];  
    if (eachEtergea.data[key].data !== null ) {
      return eachEtergea.data[key].data.valid;
    } else {
      if (eachEtergea.data[key].connected  === false || eachEtergea.data[key].connected  === undefined) {
        return "Modem desconectado";
      }
      if (eachEtergea.data[key].antena === false || eachEtergea.data[key].antena === undefined ) { 
        return "Antena sin señal";
      } 
      return eachEtergea.data[key];
    }
  }


  getDeviceStatusPM(eachEtergea: any): any {
    let mp = 0;
    let lb = 0;
    if (eachEtergea.data === undefined || eachEtergea.data === null) {
      return 4;
    } else {
      (eachEtergea.data.mainPower === false) ? mp = 0 : (eachEtergea.data.mainPower === true) ? mp = 1 : "";
      (eachEtergea.data.lowBattery === false) ? lb = 0 : (eachEtergea.data.lowBattery === true) ? lb = 1 : "";
    }
    let valuePMStatus = 0
    if (mp === 0 && lb === 0) { valuePMStatus = 0 }
    if (mp === 1 && lb === 0) { valuePMStatus = 1 }
    if (mp === 0 && lb === 1) { valuePMStatus = 2 }
    if (mp === 1 && lb === 1) { valuePMStatus = 3 }
    return valuePMStatus
  }

  deleteOfList = (event: Data) => {
    this.datas = this.datas.filter((data: Data) => data.name !== event.name);
    this.updateDatas(this.datas)
    this.ToastService.show("Se saco el " + event.name + " de la lista", { classname: 'toastInfo blue', delay: 5000 });
  }

  cleanInput = () => {
    let idResultValue = document.getElementById('idResult')! as HTMLInputElement
    idResultValue.value = ""
  }

  setInput = () => {
    let idResultValue = document.getElementById('idResult')! as HTMLInputElement
    let idResult = idResultValue.value
    this.cleanInput()
    return idResult;
  }

  deleteOfFail = (fail: number) => {
    let index = this.fails.indexOf(fail);
    (index !== -1) ? this.fails.splice(index, 1) : "";
    this.updateFails(this.fails)
  }

  resetFail = (fail: number) => {
    this.addEachOne(fail, false);
    this.deleteOfFail(fail)
  }

  updateStates = () => [
    this.datas.forEach((etergea: Data) => {
      if (etergea.checked) {
        this.addToList(etergea.name, true)
      }
    })

  ]

  addEachOne = async (resultInput: number, multiple?: boolean, reUpload?: boolean) => {
    if (resultInput == 32 || resultInput == 33 || resultInput >= 100 && resultInput <= 1180) { //! filtrados manual
      const existYetInLoaders = this.loaders.find((number) => number === resultInput);
      const existYetInDatas = this.datas.find((item: Data) => item.name === String(resultInput));
      if (existYetInDatas || existYetInLoaders) {
        (!reUpload) ? this.ToastService.show("El " + resultInput + " ya está incorporado o esta en proceso   a la lista", { classname: 'toastInfo red', delay: 5000 }) : "";
      } else {
        this.loaders.push(resultInput)
        setTimeout(() => { this.loaders.sort((a: any, b: any) => a - b) }, 200);
        this.updateLoaders(this.loaders)
        let yetHere = false;
        this.loading = true
        this.etergea = { name: String(resultInput) }

        try {
          const resp = await this.DataServices.getOneEtergea(resultInput).toPromise();
          console.log("resp", resp)
          if (resp.status === "success" || resp.status === "partial_success" || (resp !== undefined && resp !== null)) {
            if (resp.status === "partial_success") {
              if (resp.data.GPRS.status === "error") {
                resp.data.GPS.data = null
              }
              if (resp.data.GPRS.status === "error") {
                resp.data.GPS.data = null
              }
              console.warn("respuesta: PARTIAL SUCCESS: ", this.etergea)
            } else {
              console.log("respuesta: SUCCESS: ", this.etergea)

            }
            this.etergea = resp;
            this.etergea.name = String(resultInput);
            this.etergea.checked = true;
            this.etergea.isFail = false;
            this.etergea.isLoading = false;
            this.etergea.reset_modem = true;
            const now = new Date();
            const day = String(now.getDate()).padStart(2, '0');
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const year = now.getFullYear();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');
            this.etergea.date = `${year}-${month}-${day} ${hours}:${minutes}`;

            const newResult = this.datas.find((item: Data) => item.name === String(resultInput));
            if (newResult) yetHere = true;
          } else {
            this.etergea = { name: resultInput }
          }
          if (yetHere) {
            if (multiple) {
              this.alertToEndYetExist = true;
            } else {
              let index = this.loaders.indexOf(resultInput);
              (index !== -1) ? this.loaders.splice(index, 1) : "";
              this.updateLoaders(this.loaders)
              this.ToastService.show("El " + resultInput + " ya está incorporado este etergea a la lista", { classname: 'toastInfo red', delay: 5000 });
            }
          } else {
            if (!yetHere) {
              this.datas = this.datas.concat(this.etergea);
              setTimeout(() => { this.datas.sort((a: any, b: any) => a.name - b.name) }, 200);
              this.updateDatas(this.datas)
              let index = this.loaders.indexOf(parseInt(this.etergea.name));
              (index !== -1) ? this.loaders.splice(index, 1) : "";
              this.updateLoaders(this.loaders)
              if (multiple) {
                this.alertSomethingNew = true;
              } else {
                this.ToastService.show("El etergea " + resultInput + " fue agregado", { classname: 'toastInfo blue', delay: 5000 });
              }
            }
          }
        } catch (error) {
          (!this.fails.includes(resultInput)) ? this.fails.push(resultInput) : "";
          setTimeout(() => { this.fails.sort((a: any, b: any) => a - b) }, 200);
          this.updateFails(this.fails)
          let index = this.loaders.indexOf(resultInput);
          (index !== -1) ? this.loaders.splice(index, 1) : "";
          this.updateLoaders(this.loaders)
          this.ToastService.show(resultInput + " Error al consultar", { classname: 'toastInfo red', delay: 5000 });
        } finally {
          this.loading = false;
          // } 
        }
      }
    } else {
      this.ToastService.show("El " + resultInput + " No existe", { classname: 'toastInfo red', delay: 5000 })
    }
  }

  probando = () => {
    this.addToList('503,418,604,734,32');
  }

  addMultiple = async (first: number, second: number) => {
    let numbersBetween: number[] = [];
    for (let i: number = first; i <= second; i++) {
      numbersBetween.push(i);
    }

    // Ejecuta todas las promesas en paralelo y espera a que terminen
    await Promise.all(
      numbersBetween.map((number: number) => this.addEachOne(number, true))
    );

    // Una vez que todas las promesas hayan terminado, chequea las alertas
    if (this.alertToEndYetExist) {
      this.ToastService.show("Uno o más elementos ya estaban en la lista", { classname: 'toastInfo red', delay: 5000 });
      this.alertToEndYetExist = false;
    }
    if (this.alertToEndNotExist) {
      this.ToastService.show("Uno o más elementos No Existen", { classname: 'toastInfo red', delay: 5000 });
      this.alertToEndNotExist = false;
    }
    if (this.alertSomethingNew) {
      this.ToastService.show("Fueron agregados", { classname: 'toastInfo blue', delay: 5000 });
      this.alertSomethingNew = false;
    }
  }



 
  addToList = (value?: string, uploadStatus?: boolean) => {
    (uploadStatus === undefined) ? uploadStatus = false : "";
    if (uploadStatus) {
      this.datas = this.datas.filter((data: Data) => data.name !== value);
      setTimeout(() => { this.datas.sort((a: any, b: any) => a.name - b.name) }, 200);
      this.updateDatas(this.datas)
      this.ToastService.show("Se esta actualizando el " + value, { classname: 'toastInfo blue', delay: 5000 });
    }
    let resultInput = this.setInput();
    (value) ? resultInput = value : "";
    while (resultInput.includes(' ')) {
      resultInput = resultInput.replace(' ', ',');
    }
    while (resultInput.includes(',,')) {
      resultInput = resultInput.replace(',,', ',');
    }
    while (resultInput.includes('--')) {
      resultInput = resultInput.replace('--', '-');
    }
    while (resultInput.endsWith(',') || resultInput.endsWith('-')) {
      resultInput = resultInput.slice(0, -1);
    }
    while (resultInput.startsWith(',') || resultInput.startsWith('-')) {
      resultInput = resultInput.slice(1);
    }
    if (resultInput) {
      let stringArray = resultInput.split(',');
      this.loading = true;
      const addEachPromises = stringArray.map(async (each: string) => {
        let eachString = String(each);
        if (eachString.includes('-')) {
          let arraySeleccionMultiple = eachString.split('-');
          let start = Number(arraySeleccionMultiple[0]);
          let end = Number(arraySeleccionMultiple[1]);
          await this.addMultiple(start, end);
        } else {
          try {
            await this.addEachOne(parseInt(each), false, uploadStatus);
          } catch (error) {
            console.error("Error processing:", each, error);
            this.alertToEndNotExist = true;
          }
        }
      });

      Promise.all(
        addEachPromises.map(p => p.catch(e => e)) // Esta línea asegura que Promise.all no se detenga en la primera promesa que falle.
      ).then(() => {

        if (this.alertToEndYetExist) {
          this.ToastService.show("Uno o más elementos ya estaban en la lista", { classname: 'toastInfo red', delay: 5000 });
          this.alertToEndYetExist = false;
        }

        if (this.alertToEndNotExist) {
          this.ToastService.show("Uno o más elementos no existen", { classname: 'toastInfo red', delay: 5000 });
          this.alertToEndNotExist = false;
        }

        if (this.alertSomethingNew) {
          this.ToastService.show("Fueron agregados", { classname: 'toastInfo blue', delay: 5000 });
          this.alertSomethingNew = false;
        }
      });
    } else {
      this.ToastService.show("Escriba la Etergea", { classname: 'toastInfo red', delay: 5000 });
    }
  };



}