import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngularTree } from './angular-tree';

describe('AngularTree', () => {
  let component: AngularTree;
  let fixture: ComponentFixture<AngularTree>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AngularTree]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AngularTree);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
