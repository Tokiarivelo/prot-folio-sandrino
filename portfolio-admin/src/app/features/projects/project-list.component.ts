import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ProjectsService, Project } from '../../core/services/projects.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    DragDropModule,
  ],
  templateUrl: './project-list.component.html',
})
export class ProjectListComponent implements OnInit {
  projects = signal<Project[]>([]);
  isLoading = signal(false);
  displayedColumns = ['drag', 'order', 'title', 'status', 'tags', 'actions'];

  constructor(
    private projectsService: ProjectsService,
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  private loadProjects(): void {
    this.isLoading.set(true);
    this.projectsService.getProjects().subscribe({
      next: (projects) => {
        const sorted = [...projects].sort(
          (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)
        );
        this.projects.set(sorted);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Failed to load projects.', 'Close', { duration: 3000 });
      },
    });
  }

  onDrop(event: CdkDragDrop<Project[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    const updated = [...this.projects()];
    moveItemInArray(updated, event.previousIndex, event.currentIndex);

    const reordered = updated.map((project, index) => ({
      ...project,
      displayOrder: index + 1,
    }));
    this.projects.set(reordered);

    reordered.forEach((project) => {
      if (project.id) {
        this.projectsService.updateProject(project.id, { displayOrder: project.displayOrder }).subscribe({
          error: () => {
            this.snackBar.open('Failed to update project order.', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }

  navigateToNew(): void {
    this.router.navigate(['/dashboard/projects/new']);
  }

  navigateToEdit(project: Project): void {
    this.router.navigate(['/dashboard/projects', project.id]);
  }

  deleteProject(project: Project): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Project',
        message: `Are you sure you want to delete "${project.title}"? This action cannot be undone.`,
        confirmLabel: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && project.id) {
        this.projectsService.deleteProject(project.id).subscribe({
          next: () => {
            this.projects.update((list) => list.filter((p) => p.id !== project.id));
            this.snackBar.open('Project deleted.', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to delete project.', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }
}
