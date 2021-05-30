import { HttpClient } from '@angular/common/http';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { timer } from 'rxjs';
import { cleannedDataModel, sourceDataElementModel, sourceDataModel, downloadFIleModel, outputFile } from 'src/app/shared/models';

@Component({
  selector: 'app-data-clean',
  templateUrl: './data-clean.component.html',
  styleUrls: ['./data-clean.component.css']
})
export class DataCleanComponent implements OnInit {

  dataSource: any;
  sensorData: any[];
  pressureData: sourceDataModel;
  temperatureData: sourceDataModel;
  pressureDataCountAfterClean: number;
  temperatureDataCountAfterClean: number;
  cleannedPressureData: cleannedDataModel;
  cleannedTemperatureData: cleannedDataModel;
  invalidPressureData: sourceDataModel;
  invalidTemperatureData: sourceDataModel;
  valueCountDoesNotMatch: boolean = false;
  isDataFetched: boolean = false;
  downloadJSONFile: downloadFIleModel[];
  downloadJsonHref: SafeUrl;
  outputFile: outputFile;
  finishedCreatingDownloadFile: boolean = false;
  processPressureDataFinished: boolean = false;
  processTemperatureDataFinished: boolean = false;

  sourceJsonFileName: string = "";
  downloadFileName: string = "";

  processingPercentageOfPressure: number;
  processingPercentageOfTemperature: number;
  processingPercentageOfPressureString: string;
  processingPercentageOfTemperatureString: string;
  indexOfPressure: number = 0;
  indexOfTemperature: number = 0;
  totalPressureSamples: number;
  totalTemperatureSamples: number;
  processingFileInProgress: boolean;

  constructor(private httpClient: HttpClient, private sanitizer: DomSanitizer) { }

  ngOnInit(): void {
    this.init()
  }

  init(){
    this.dataSource = null;
    this.cleannedPressureData = new cleannedDataModel();
    this.cleannedTemperatureData = new cleannedDataModel();
    this.processPressureDataFinished = false;
    this.processTemperatureDataFinished = false;
    this.sourceJsonFileName = "";
    this.downloadFileName = "";
    this.finishedCreatingDownloadFile = false;
    this.downloadJSONFile = [];
    this.outputFile = new outputFile();
    this.processingPercentageOfPressure = 0;
    this.processingPercentageOfTemperature = 0;
    this.indexOfPressure = 0;
    this.indexOfTemperature = 0;
    this.totalPressureSamples = 0;
    this.totalTemperatureSamples = 0;
    this.processingFileInProgress = false;
  }

  loadDataFile(){
    this.httpClient.get("../assets/data/raw-data/" + this.sourceJsonFileName).subscribe(data =>{
      this.dataSource = data;
      // this.prepareData();
    }, error => {
      console.log("error when load json file", error);
    })
  }
  fetchSensorData(sensorType: string){
    return Object.assign(new sourceDataModel(), this.sensorData.find(x => x.sensor == sensorType));
  }

  cleanData(){
    if(this.pressureData.actualSamples != 0 && this.temperatureData.actualSamples != 0){
      this.filterSensorData(this.pressureData)
          .then(pressure => {
            this.cleannedPressureData = Object.assign(new cleannedDataModel(), pressure);
          })
          .then(() => {
            this.filterSensorData(this.temperatureData)
                .then(temperature => {
                  this.cleannedTemperatureData = Object.assign(new cleannedDataModel(), temperature);
                })
                .then(() => {
                  console.log("start processing pressure data")
                  this.processPressureData()
                      .then(() => {
                        console.log("start processing temperature data")
                        this.processTemperatureData()
                            .then(() => {
                              console.log("start generating download url")
                              this.generateDownloadJsonUri();
                            })
                      })
                })
          })
          .catch(error => {
            console.log("error", error)
          })
    }

  }

  processPressureData(){
    return new Promise((resolve, reject) => {
      let flags = this.pressureData.data.qaqcFlags;
      let dates = this.pressureData.data.sampleTimes;
      let values = this.pressureData.data.values;

      if(flags.length != dates.length || flags.length != values.length || dates.length != values.length){
        console.log("the data length is different", flags.length, dates.length, values.length);
        this.valueCountDoesNotMatch = true;
        reject("length does not match");
      }

      values.forEach((value, index) => {
        // classify by value and flag
        if(value != "" && value != null && value != "NaN" && flags[index] == 1){
          let date = dates[index];
          this.processingPercentageOfPressure = index / this.totalPressureSamples * 100;
          // console.log("index increasing", this.processingPercentageOfPressure)
          let item = new downloadFIleModel();
          item.date = date;
          item.pressureData = +value;
          item.pressureDataQualityFlag = 1;
          this.downloadJSONFile.push(item);
        }
      })
      this.processPressureDataFinished = true;
      resolve(this.processPressureDataFinished);
    })
  }

  processTemperatureData(){
    return new Promise((resolve, reject) => {
      let flags = this.temperatureData.data.qaqcFlags;
      let dates = this.temperatureData.data.sampleTimes;
      let values = this.temperatureData.data.values;

      if(flags.length != dates.length || flags.length != values.length || dates.length != values.length){
        console.log("the data length is different", flags.length, dates.length, values.length);
        this.valueCountDoesNotMatch = true;
        reject("length does not match");
      }

      values.forEach((value, index) => {
        // classify by value and flag
        if(value != "" && value != null && value != "NaN" && flags[index] == 1){
          let date = dates[index];
          this.processingPercentageOfTemperature = index / this.totalTemperatureSamples * 100;
          // console.log("index increasing", this.processingPercentageOfPressure)
          let found = this.downloadJSONFile.find(x => x.date == date);
          if(found){
            found.temperatureData = +value;
            found.temperatureDataQualityFlag = 1;
          }
        }
      })
      this.processTemperatureDataFinished = true;
      resolve(this.processTemperatureDataFinished);
    })
  }

  filterSensorData(sensor: sourceDataModel){
    return new Promise((resolve, reject) => {
      this.indexOfPressure = 0;
      this.indexOfTemperature = 0;
      let result = new cleannedDataModel();
      result.valid.sensor = sensor.sensor;
      result.valid.actualSamples = 0;
      result.invalid.sensor = sensor.sensor;
      result.invalid.actualSamples = 0;
      
  
      let flags = sensor.data.qaqcFlags;
      let dates = sensor.data.sampleTimes;
      let values = sensor.data.values;
  
      if(flags.length != dates.length || flags.length != values.length || dates.length != values.length){
        console.log("the data length is different", flags.length, dates.length, values.length);
        this.valueCountDoesNotMatch = true;
        reject();
      }
  
      values.forEach((value, index) => {
        // classify by value and flag
        if(value != "" && value != null && value != "NaN" && flags[index] == 1){
          let date = dates[index];
          result.valid.data.values.push(value);
          result.valid.data.qaqcFlags.push(flags[index]);
          result.valid.data.sampleTimes.push(date);
          result.valid.actualSamples += 1;
        }
      })
      
      resolve(result);
    })

  }

  onFileChange(event: any){
    let that = this;
    this.init();
    // console.log("on file change", event)
    let file = event.target.files[0];
    if (file) {
      that.sourceJsonFileName = file.name;
      that.downloadFileName = file.name.split(".")[0] + "_cleanned.json";
      var reader = new FileReader();
      reader.readAsText(file, "UTF-8");
      reader.onload = function(evt){
        // console.log(evt)
        if(evt && evt.target && evt.target.result){
          // console.log(evt.target.result);
          let fileContent = evt.target.result as string;
          that.dataSource = JSON.parse(fileContent);
          that.sensorData = that.dataSource.sensorData;
          that.pressureData = that.fetchSensorData("pressure");
          that.temperatureData = that.fetchSensorData("temperature");
          that.totalPressureSamples = that.pressureData.actualSamples;
          that.totalTemperatureSamples = that.temperatureData.actualSamples;
          that.isDataFetched = true;
          console.log("initial loading of pressure", that.totalPressureSamples, that.isDataFetched);
          console.log("initial loading of temperature", that.totalTemperatureSamples);
        }
      }
      reader.onerror = function (evt) {
          console.log('error reading file');
      }
    }
  }

  processFile(){
    this.processingFileInProgress = true;
    setTimeout(() => {
      this.cleanData();
    }, 500);
  }

  createDownloadFile(){
    this.finishedCreatingDownloadFile = false;
    this.cleannedPressureData.valid.data.sampleTimes.forEach((date, index) => {
      let pressureValue = this.cleannedPressureData.valid.data.values[index];
      let temperatureValue = this.cleannedTemperatureData.valid.data.values[this.cleannedTemperatureData.valid.data.sampleTimes.indexOf(date)];
      let item = new downloadFIleModel();
      item.date = date;
      item.pressureData = +pressureValue;
      item.pressureDataQualityFlag = 1;
      item.temperatureData = +temperatureValue;
      item.temperatureDataQualityFlag = 1;
      this.downloadJSONFile.push(item)
    })
    this.finishedCreatingDownloadFile = true;
  }

  // downloadFile(){
  //   const link = document.createElement('a');
  //   link.setAttribute('target', '_blank');
  //   link.setAttribute('href', this.downloadJsonHref as string);
  //   link.setAttribute('download', this.downloadFileName);
  //   document.body.appendChild(link);
  //   link.click();
  //   link.remove();
  // }

  generateDownloadJsonUri() {
    this.outputFile.data = this.downloadJSONFile;
    var theJSON = JSON.stringify(this.outputFile);
    var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));
    this.downloadJsonHref = uri;
    // console.log("download url", this.downloadJsonHref)
    this.processingFileInProgress = false;
  }

}
