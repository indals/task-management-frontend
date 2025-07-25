// src/app/shared/components/loading/loading.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {
  @Input() showOverlay = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() message = 'Loading...';
  @Input() showMessage = true;
  @Input() showProgress = false;
  @Input() progress = 0;
  @Input() details: string | null = null;
  
  particles: any[] = [];

  ngOnInit(): void {
    this.generateParticles();
  }

  private generateParticles(): void {
    this.particles = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      delay: i * 0.1
    }));
  }
}