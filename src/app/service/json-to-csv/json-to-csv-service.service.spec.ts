import { TestBed } from '@angular/core/testing';

import { JsonToCsvServiceService } from './json-to-csv-service.service';

describe('JsonToCsvServiceService', () => {
  let service: JsonToCsvServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JsonToCsvServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
