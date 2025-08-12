import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {
  @Input() message: string = 'Loading';
  @Input() details: string = '';
  @Input() showProgress: boolean = false;
  @Input() progress: number = 0;
  @Input() overlay: boolean = false;
  @Input() size: 'small' | 'normal' | 'large' = 'normal';

  // Generate particles for animation
  particles: number[] = [];

  ngOnInit() {
    // Create 5 particles for the floating animation
    this.particles = Array.from({ length: 5 }, (_, i) => i);
  }
}