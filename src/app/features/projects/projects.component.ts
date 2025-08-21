// src/app/features/projects/projects.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { Project as BackendProject } from '../../core/models/project.model';
import { SharedModule } from '../../shared/shared.module'; // ✅ Import SharedModule

import { ProjectService } from '../../core/services/project.service';


interface Project {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD' | 'CANCELLED';
  progress: number;
  startDate: Date;
  endDate?: Date;
  teamMembers: string[];
  tasksCount: {
    total: number;
    completed: number;
    pending: number;
  };
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  budget?: number;
  spent?: number;
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  filteredProjects: Project[] = [];
  loading = false;
  viewMode: 'grid' | 'list' = 'grid';
  searchTerm = '';
  statusFilter = '';
  isLoading: boolean = false;

  constructor(private router: Router, private projectService: ProjectService) {}

  ngOnInit() {
    this.isLoading = true;
    this.loadProjects();
  }

//   loadProjects() {
//     this.loading = true;
    
//     // Mock data - replace with actual API call
//     setTimeout(() => {
//       this.projects = [
//         {
//           id: '1',
//           name: 'Website Redesign',
//           description: 'Complete overhaul of company website with modern design and improved UX',
//           status: 'ACTIVE',
//           progress: 67,
//           startDate: new Date('2024-01-15'),
//           endDate: new Date('2024-03-30'),
//           teamMembers: ['John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Connor'],
//           tasksCount: { total: 24, completed: 16, pending: 8 },
//           priority: 'HIGH',
//           budget: 50000,
//           spent: 33500
//         },
//         {
//           id: '2',
//           name: 'Mobile App Development',
//           description: 'Native iOS and Android app for customer engagement',
//           status: 'ACTIVE',
//           progress: 43,
//           startDate: new Date('2024-02-01'),
//           endDate: new Date('2024-06-15'),
//           teamMembers: ['Alice Brown', 'Bob Wilson', 'Charlie Davis'],
//           tasksCount: { total: 35, completed: 15, pending: 20 },
//           priority: 'HIGH',
//           budget: 75000,
//           spent: 32250
//         },
//         {
//           id: '3',
//           name: 'Marketing Campaign Q2',
//           description: 'Digital marketing campaign for Q2 product launch',
//           status: 'COMPLETED',
//           progress: 100,
//           startDate: new Date('2024-01-01'),
//           endDate: new Date('2024-02-28'),
//           teamMembers: ['Emma Wilson', 'David Lee'],
//           tasksCount: { total: 18, completed: 18, pending: 0 },
//           priority: 'MEDIUM',
//           budget: 25000,
//           spent: 24800
//         },
//         {
//           id: '4',
//           name: 'Database Migration',
//           description: 'Migration from legacy database to cloud infrastructure',
//           status: 'ON_HOLD',
//           progress: 25,
//           startDate: new Date('2024-03-01'),
//           endDate: new Date('2024-05-30'),
//           teamMembers: ['Tech Team Lead', 'Database Admin'],
//           tasksCount: { total: 12, completed: 3, pending: 9 },
//           priority: 'MEDIUM',
//           budget: 40000,
//           spent: 10000
//         },
//         {
//           id: '5',
//           name: 'Security Audit',
//           description: 'Comprehensive security assessment and vulnerability testing',
//           status: 'ACTIVE',
//           progress: 80,
//           startDate: new Date('2024-02-15'),
//           endDate: new Date('2024-03-15'),
//           teamMembers: ['Security Specialist', 'DevOps Engineer'],
//           tasksCount: { total: 8, completed: 6, pending: 2 },
//           priority: 'HIGH',
//           budget: 15000,
//           spent: 12000
//         }
//       ];
      
//       this.filteredProjects = [...this.projects];
//       this.loading = false;
//     }, 1000);
//   }

loadProjects() {
    this.isLoading = true;

    this.projectService.getProjects().subscribe({
      next: (response: any) => {
        // Fixed: Handle paginated response properly
        const projectsData = Array.isArray(response) ? response : response.data || [];
        
        this.projects = projectsData.map((p: Project) => {
        //   const totalTasks = p.tasks_count ?? 0;
          const totalTasks = 10;
          const completedTasks = Math.floor(totalTasks * 0.6); // Mock data
          const pendingTasks = totalTasks - completedTasks;
          const estHours = 0; // Default since estimated_hours doesn't exist

          const priority: 'HIGH' | 'MEDIUM' | 'LOW' =
            estHours > 1000 ? 'HIGH' : estHours > 500 ? 'MEDIUM' : 'LOW';

          return {
            id: p.id.toString(),
            name: p.name,
            description: p.description,
            status: (p.status || 'ACTIVE'),
            progress: totalTasks > 0 ? Math.floor((completedTasks / totalTasks) * 100) : 0,
            startDate: new Date(),
            endDate: new Date(),
            teamMembers: [], // Since members doesn't exist, use empty array
            tasksCount: {
              total: totalTasks,
              completed: completedTasks,
              pending: pendingTasks
            },
            priority,
            budget: undefined,
            spent: undefined
          };
        });

        this.filteredProjects = [...this.projects];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading projects:', error);
        this.isLoading = false;
      }
    });
}


  filterProjects() {
    this.filteredProjects = this.projects.filter(project => {
      const matchesSearch = !this.searchTerm || 
        project.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || project.status === this.statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }

  createProject() {
    // console.log('Create new project');
  }

  viewProject(project: Project) {
    // console.log('View project:', project);
  }

  editProject(event: Event, project: Project) {
    event.stopPropagation();
    // console.log('Edit project:', project);
  }

  deleteProject(event: Event, project: Project) {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete "${project.name}"?`)) {
      this.projects = this.projects.filter(p => p.id !== project.id);
      this.filterProjects();
      // console.log('Deleted project:', project);
    }
  }

  toggleProjectMenu(event: Event) {
    event.stopPropagation();
    // console.log('Toggle project menu');
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getDueDateClass(endDate?: Date): string {
    if (!endDate) return '';
    
    const now = new Date();
    const timeDiff = endDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) {
      return 'overdue';
    } else if (daysDiff <= 3) {
      return 'urgent';
    }
    return '';
  }
}