import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  template: `
    <div [class]="cardClasses">
      <div *ngIf="title || hasHeaderSlot" class="card-header">
        <h3 *ngIf="title" class="card-title">{{ title }}</h3>
        <ng-content select="[slot=header]"></ng-content>
      </div>
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      <div *ngIf="hasFooterSlot" class="card-footer">
        <ng-content select="[slot=footer]"></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input() title?: string;
  @Input() shadow = true;
  @Input() border = true;
  @Input() padding = true;

  get cardClasses(): string {
    const classes = ['card'];
    
    if (this.shadow) {
      classes.push('card-shadow');
    }
    
    if (this.border) {
      classes.push('card-border');
    }
    
    if (this.padding) {
      classes.push('card-padding');
    }
    
    return classes.join(' ');
  }

  get hasHeaderSlot(): boolean {
    // This would need to be implemented with ViewChild or content projection detection
    return false;
  }

  get hasFooterSlot(): boolean {
    // This would need to be implemented with ViewChild or content projection detection
    return false;
  }
}