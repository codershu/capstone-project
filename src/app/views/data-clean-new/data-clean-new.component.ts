import { HttpClient } from '@angular/common/http';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { from, timer } from 'rxjs';
import { JsonToCsvServiceService } from 'src/app/service/json-to-csv/json-to-csv-service.service';
import { cleannedDataModel, sourceDataElementModel, sourceDataModel, downloadFIleModel, outputFile, sourceDataNewModel, sourceDataElementNewModel, downloadFIleNewModel } from 'src/app/shared/models';

@Component({
  selector: 'app-data-clean-new',
  templateUrl: './data-clean-new.component.html',
  styleUrls: ['./data-clean-new.component.css']
})
export class DataCleanNewComponent implements OnInit {

  dataSource: any;
  sensorData: any[];
  pressureData: sourceDataElementNewModel[];
  temperatureData: sourceDataElementNewModel[];
  pressureDataCountAfterClean: number;
  temperatureDataCountAfterClean: number;
  cleannedPressureData: sourceDataElementNewModel[] = [];
  cleannedTemperatureData: sourceDataElementNewModel[] = [];
  invalidPressureData: sourceDataModel;
  invalidTemperatureData: sourceDataModel;
  valueCountDoesNotMatch: boolean = false;
  isDataFetched: boolean = false;
  downloadJSONFile: downloadFIleNewModel[];
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

  promises: Promise<any>[] = [];

  constructor(private httpClient: HttpClient, private sanitizer: DomSanitizer, private jsonToCsv: JsonToCsvServiceService) { }

  ngOnInit(): void {
    this.init()
  }

  init(){
    this.dataSource = null;
    this.pressureData = [];
    this.temperatureData = [];
    this.cleannedPressureData = [];
    this.cleannedTemperatureData = [];
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
    // this script is supposed to run locally with data, need to comment the next line back
    // this.loopFilesInFolder();
  }

  loopFilesInFolder(){
    let startDate = new Date("2020-12-02");
    let endDate = new Date("2021-01-01");
    let currentDate = startDate;
    this.downloadFileName = this.convertDate(startDate);
    while(currentDate.getTime() < endDate.getTime()){
      let currentDateString = this.convertDate(currentDate);
      let fileName = "ClayoquotSlope_Bullseye_ConductivityTemperatureDepth_" + currentDateString + ".json";
      this.promises.push(this.loadDataFile(fileName));

      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    Promise.all(this.promises)
      .then(() => {
        console.log("length", this.pressureData.length, this.temperatureData.length);
        this.cleanData()
          .then(() => {
            this.createDownloadFile()
              .then(() => {
                this.convertJsonResultToCsv();
              })
          })
      })
      .catch(error => {
        this.handleNetErr;
        console.log("promise error", error)
      })
  }

  handleNetErr = function(e: any) { return e };

  convertDate(x: Date) {
    var y = x.getFullYear().toString();
    var m = (x.getMonth() + 1).toString();
    var d = x.getDate().toString();
    (d.length == 1) && (d = '0' + d);
    (m.length == 1) && (m = '0' + m);
    var yyyymmdd = y + m + d;
    return yyyymmdd;
  }

  loadDataFile(fileName: string){
    return new Promise((resolve, reject) => {

      this.httpClient.get("../assets/data/raw-data/" + fileName).subscribe(data =>{
        // console.log("check files", data)
        let tempDataSource = JSON.parse(JSON.stringify(data));
        let tempSensorData = tempDataSource.sensorData;
        let tempPressureData = this.fetchSensorData(tempSensorData, "pressure");
        let tempTemperatureData = this.fetchSensorData(tempSensorData, "temperature");
        // console.log("what i get", tempPressureData)
        if(this.pressureData.length == 0){
          this.pressureData = tempPressureData.data;
        }else{
          this.pressureData = [...this.pressureData, ...tempPressureData.data];
        }
        if(this.temperatureData.length == 0){
          this.temperatureData = tempTemperatureData.data;
        }else{
          this.temperatureData = [...this.temperatureData, ...tempTemperatureData.data];
        }
        // console.log("check data", this.pressureData[1], this.temperatureData[2])
        resolve(true);
      }, error => {
        console.log("error when load json file", error);
        resolve(true);
      })
  
    })
  }
  
  fetchSensorData(sourceData: any[], sensorType: string){
    return Object.assign(new sourceDataNewModel(), sourceData.find(x => x.sensor == sensorType));
  }

  cleanData(){
    return new Promise((resolve, reject) => {
      console.log("before clean data", this.pressureData)
      this.pressureData.forEach(data => {
        if(data.value != "" && data.value != null && data.value != "NaN") this.cleannedPressureData.push(data);
      })

      this.temperatureData.forEach(data => {
        if(data.value != "" && data.value != null && data.value != "NaN") this.cleannedTemperatureData.push(data);
      })

      console.log("after clean", this.cleannedPressureData);
      resolve(true)
      // setTimeout(() => {
      // }, 1000);
    })

  }

  createDownloadFile(){
    return new Promise((resolve, reject) => {
      console.log("before creating download file", this.cleannedPressureData)
      this.finishedCreatingDownloadFile = false;
      this.cleannedPressureData.forEach((data, index) => {
        if( index % 60 == 0){
          let tempData = new downloadFIleModel();
          tempData.pressureData = +data.value;
          tempData.pressureDataQualityFlag = data.qaqcFlag;
          tempData.date = data.sampleTime;
  
          let foundTemperature = this.cleannedTemperatureData.find(x => x.sampleTime == data.sampleTime);
          if(foundTemperature != null){
            tempData.temperatureData = +foundTemperature.value;
            tempData.temperatureDataQualityFlag = foundTemperature.qaqcFlag;
          }
          console.log("check each", tempData)
          this.downloadJSONFile.push(tempData)
        }
      })
      this.downloadJSONFile.sort((a, b) => {
        let time1 = new Date(a.date);
        let time2 = new Date(b.date);
        return time1.getTime() - time2.getTime();
      })
      this.finishedCreatingDownloadFile = true;
      console.log("after creating download file", this.downloadJSONFile);
      resolve(true);
    })
  }

  convertJsonResultToCsv(){
    console.log("start convert to csv")
    this.jsonToCsv.downloadFile(this.downloadJSONFile, "clean_data_with_flag_" + this.downloadFileName, 1);
    this.processPressureDataFinished = true;
    this.processTemperatureDataFinished = true;
  }

  processPressureData(){
    // return new Promise((resolve, reject) => {
    //   let flags = this.pressureData.data.qaqcFlags;
    //   let dates = this.pressureData.data.sampleTimes;
    //   let values = this.pressureData.data.values;

    //   if(flags.length != dates.length || flags.length != values.length || dates.length != values.length){
    //     console.log("the data length is different", flags.length, dates.length, values.length);
    //     this.valueCountDoesNotMatch = true;
    //     reject("length does not match");
    //   }

    //   values.forEach((value, index) => {
    //     // classify by value and flag
    //     if(value != "" && value != null && value != "NaN" && flags[index] == 1){
    //       let date = dates[index];
    //       this.processingPercentageOfPressure = index / this.totalPressureSamples * 100;
    //       // console.log("index increasing", this.processingPercentageOfPressure)
    //       let item = new downloadFIleModel();
    //       item.date = date;
    //       item.pressureData = +value;
    //       item.pressureDataQualityFlag = 1;
    //       this.downloadJSONFile.push(item);
    //     }
    //   })
    //   this.processPressureDataFinished = true;
    //   resolve(this.processPressureDataFinished);
    // })
  }

  processTemperatureData(){
    // return new Promise((resolve, reject) => {
    //   let flags = this.temperatureData.data.qaqcFlags;
    //   let dates = this.temperatureData.data.sampleTimes;
    //   let values = this.temperatureData.data.values;

    //   if(flags.length != dates.length || flags.length != values.length || dates.length != values.length){
    //     console.log("the data length is different", flags.length, dates.length, values.length);
    //     this.valueCountDoesNotMatch = true;
    //     reject("length does not match");
    //   }

    //   values.forEach((value, index) => {
    //     // classify by value and flag
    //     if(value != "" && value != null && value != "NaN" && flags[index] == 1){
    //       let date = dates[index];
    //       this.processingPercentageOfTemperature = index / this.totalTemperatureSamples * 100;
    //       // console.log("index increasing", this.processingPercentageOfPressure)
    //       let found = this.downloadJSONFile.find(x => x.date == date);
    //       if(found){
    //         found.temperatureData = +value;
    //         found.temperatureDataQualityFlag = 1;
    //       }
    //     }
    //   })
    //   this.processTemperatureDataFinished = true;
    //   resolve(this.processTemperatureDataFinished);
    // })
  }

  filterSensorData(sensorData: sourceDataElementNewModel[], cleannedData: sourceDataElementNewModel[]){
    // return new Promise((resolve, reject) => {
      
    //   sensorData.forEach(data => {
    //     if(data.values != "" && data.values != null && data.values != "NaN") cleannedData.push(data);
    //   })
      
      
    //   resolve(cleannedData);
    // })

  }

  onFileChange(event: any){
  //   let that = this;
  //   this.init();
  //   // console.log("on file change", event)
  //   let file = event.target.files[0];
  //   if (file) {
  //     that.sourceJsonFileName = file.name;
  //     that.downloadFileName = file.name.split(".")[0] + "_cleanned.json";
  //     var reader = new FileReader();
  //     reader.readAsText(file, "UTF-8");
  //     reader.onload = function(evt){
  //       // console.log(evt)
  //       if(evt && evt.target && evt.target.result){
  //         // console.log(evt.target.result);
  //         let fileContent = evt.target.result as string;
  //         that.dataSource = JSON.parse(fileContent);
  //         that.sensorData = that.dataSource.sensorData;
  //         that.pressureData = that.fetchSensorData("pressure");
  //         that.temperatureData = that.fetchSensorData("temperature");
  //         that.totalPressureSamples = that.pressureData.actualSamples;
  //         that.totalTemperatureSamples = that.temperatureData.actualSamples;
  //         that.isDataFetched = true;
  //         console.log("initial loading of pressure", that.totalPressureSamples, that.isDataFetched);
  //         console.log("initial loading of temperature", that.totalTemperatureSamples);
  //       }
  //     }
  //     reader.onerror = function (evt) {
  //         console.log('error reading file');
  //     }
  //   }
  }

  processFile(){
    // this.processingFileInProgress = true;
    // setTimeout(() => {
    //   this.cleanData();
    // }, 500);
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
    // this.outputFile.data = this.downloadJSONFile;
    // var theJSON = JSON.stringify(this.outputFile);
    // var uri = this.sanitizer.bypassSecurityTrustUrl("data:text/json;charset=UTF-8," + encodeURIComponent(theJSON));
    // this.downloadJsonHref = uri;
    // // console.log("download url", this.downloadJsonHref)
    // this.processingFileInProgress = false;
  }

  

}

