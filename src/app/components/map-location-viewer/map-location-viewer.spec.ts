import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapLocationViewer } from './map-location-viewer';

describe('MapLocationViewer', () => {
  let component: MapLocationViewer;
  let fixture: ComponentFixture<MapLocationViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapLocationViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapLocationViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
