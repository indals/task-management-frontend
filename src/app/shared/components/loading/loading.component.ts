import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent {
  @Input() showOverlay = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() message = 'Loading...';
  @Input() showMessage = true;
}