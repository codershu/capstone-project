export class sourceDataModel{
    public actualSamples: number;
    public data : sourceDataElementModel = new sourceDataElementModel();
    public sensor : string;
    public sensorName : string;
    public unitOfMeasure : string;
}

export class sourceDataElementModel{
    public qaqcFlags : number[] = [];
    public sampleTimes : string[] = [];
    public values : string[] = [];
}

export class cleannedDataModel{
    public valid: sourceDataModel = new sourceDataModel();
    public invalid : sourceDataModel = new sourceDataModel();
}

export class downloadFIleModel{
    public date: string;
    public pressureData: number;
    public pressureDataQualityFlag: number;
    public temperatureData: number;
    public temperatureDataQualityFlag: number;
}

export class outputFile{
    public data: downloadFIleModel[] = [];
}

export class sourceDataNewModel{
    public actualSamples: number;
    public data : sourceDataElementNewModel[];
    public sensor : string;
    public sensorName : string;
    public unitOfMeasure : string;
}

export class sourceDataElementNewModel{
    public qaqcFlag : number;
    public sampleTime : string;
    public value : string;
}

export class downloadFIleNewModel{
    public date: string;
    public pressureData: number;
    public temperatureData: number;
}