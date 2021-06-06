import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JsonToCsvServiceService {

  constructor() { }
  
  downloadFile(data: any, filename='data') {
    let csvData = this.ConvertToCSV(data, ['date','pressureData', 'pressureDataQualityFlag', 'temperatureData', 'temperatureDataQualityFlag']);
    // console.log(csvData)
    let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
    let dwldLink = document.createElement("a");
    let url = URL.createObjectURL(blob);
    let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
    if (isSafariBrowser) {  //if Safari open in new window to save file with random filename.
        dwldLink.setAttribute("target", "_blank");
    }
    dwldLink.setAttribute("href", url);
    dwldLink.setAttribute("download", filename + ".csv");
    dwldLink.style.visibility = "hidden";
    document.body.appendChild(dwldLink);
    dwldLink.click();
    document.body.removeChild(dwldLink);
}

ConvertToCSV(objArray: string, headerList: string[]) {
     let array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
     let str = '';
     let row = '';

     for (let index in headerList) {
         row += headerList[index] + ',';
     }
     row = row.slice(0, -1);
     console.log("row", row)
     str += row + '\r\n';
     for (let i = 0; i < array.length; i++) {
         let line = '';
         for (let index in headerList) {
            let head = headerList[index];

             line += array[i][head] + ",";
         }
         str += line + '\r\n';
     }
     return str;
 }
}
