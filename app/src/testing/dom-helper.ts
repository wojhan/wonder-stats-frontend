import { ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

export class DOMHelper<T> {
  fixture: ComponentFixture<T>;

  constructor(fixture: ComponentFixture<T>) {
    this.fixture = fixture;
  }

  getPlaceholder(tagName: string): string {
    return this.fixture.debugElement.query(By.css(tagName)).nativeNode
      .placeholder;
  }

  getValue(tagName: string): any {
    return this.fixture.debugElement.query(By.css(tagName)).nativeNode.value;
  }

  count(tagName: string): number {
    return this.fixture.debugElement.queryAll(By.css(tagName)).length;
  }
}
