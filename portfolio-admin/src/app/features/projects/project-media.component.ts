import { Component, Input, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MediaService } from '../../core/services/media.service';
import { ProjectMedia, ProjectsService } from '../../core/services/projects.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-project-media',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatSlideToggleModule,
    MatCardModule,
    MatChipsModule,
  ],
  templateUrl: './project-media.component.html',
})
export class ProjectMediaComponent implements OnInit {
  @Input() projectId!: string;
  @Input() set initialMedia(value: ProjectMedia[]) {
    this.mediaItems.set(value ?? []);
  }

  mediaItems = signal<ProjectMedia[]>([]);
  isUploading = signal(false);

  constructor(
    private mediaService: MediaService,
    private projectsService: ProjectsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      this.uploadFile(file);
    });

    input.value = '';
  }

  private uploadFile(file: File): void {
    const fileType = file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE';
    const currentItems = this.mediaItems();
    const isCover = currentItems.length === 0;

    this.isUploading.set(true);
    this.mediaService.uploadMedia({
      file,
      projectId: this.projectId,
      fileType,
      isCover,
      order: currentItems.length + 1,
    }).subscribe({
      next: (media) => {
        this.mediaItems.update((items) => [...items, media]);
        this.isUploading.set(false);
        this.snackBar.open('Media uploaded successfully!', 'Close', { duration: 3000 });
      },
      error: () => {
        this.isUploading.set(false);
        this.snackBar.open('Failed to upload media.', 'Close', { duration: 3000 });
      },
    });
  }

  setCover(media: ProjectMedia): void {
    if (!media.id) return;
    this.projectsService.updateProject(this.projectId, {}).subscribe();
    this.mediaItems.update((items) =>
      items.map((item) => ({ ...item, isCover: item.id === media.id }))
    );
  }

  deleteMedia(media: ProjectMedia): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Media',
        message: 'Are you sure you want to delete this media item?',
        confirmLabel: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed && media.id) {
        this.mediaService.deleteMedia(media.id).subscribe({
          next: () => {
            this.mediaItems.update((items) => items.filter((m) => m.id !== media.id));
            this.snackBar.open('Media deleted.', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to delete media.', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }
}
