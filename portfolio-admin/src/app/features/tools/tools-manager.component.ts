import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ToolsService, Tool } from '../../core/services/tools.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-tools-manager',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCardModule,
    MatTooltipModule,
    DragDropModule,
  ],
  templateUrl: './tools-manager.component.html',
})
export class ToolsManagerComponent implements OnInit {
  tools = signal<Tool[]>([]);
  isLoading = signal(false);
  isSaving = signal(false);
  editingTool = signal<Tool | null>(null);
  iconPreview = signal<string | null>(null);
  selectedFile = signal<File | null>(null);

  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private toolsService: ToolsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      order: [0],
      isActive: [true],
    });
  }

  ngOnInit(): void {
    this.loadTools();
  }

  private loadTools(): void {
    this.isLoading.set(true);
    this.toolsService.getTools().subscribe({
      next: (tools) => {
        this.tools.set([...tools].sort((a, b) => a.order - b.order));
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Failed to load tools.', 'Close', { duration: 3000 });
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.selectedFile.set(file);

    const reader = new FileReader();
    reader.onload = (e) => this.iconPreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  editTool(tool: Tool): void {
    this.editingTool.set(tool);
    this.iconPreview.set(tool.iconUrl);
    this.selectedFile.set(null);
    this.form.patchValue({
      name: tool.name,
      order: tool.order,
      isActive: tool.isActive,
    });
  }

  cancelEdit(): void {
    this.editingTool.set(null);
    this.iconPreview.set(null);
    this.selectedFile.set(null);
    this.form.reset({ name: '', order: 0, isActive: true });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const editing = this.editingTool();

    if (!editing && !this.selectedFile()) {
      this.snackBar.open('Please select an icon image.', 'Close', { duration: 3000 });
      return;
    }

    const fd = new FormData();
    fd.append('name', this.form.value.name);
    fd.append('order', String(this.form.value.order ?? 0));
    fd.append('isActive', String(this.form.value.isActive ?? true));

    const file = this.selectedFile();
    if (file) fd.append('icon', file);

    this.isSaving.set(true);

    const request$ = editing
      ? this.toolsService.updateTool(editing.id, fd)
      : this.toolsService.createTool(fd);

    request$.subscribe({
      next: (saved) => {
        if (editing) {
          this.tools.update((list) => list.map((t) => (t.id === saved.id ? saved : t)));
        } else {
          this.tools.update((list) => [...list, saved].sort((a, b) => a.order - b.order));
        }
        this.isSaving.set(false);
        this.snackBar.open(editing ? 'Tool updated!' : 'Tool added!', 'Close', { duration: 3000 });
        this.cancelEdit();
      },
      error: (err) => {
        this.isSaving.set(false);
        const msg = err?.error?.message ?? 'Failed to save tool.';
        this.snackBar.open(msg, 'Close', { duration: 5000 });
      },
    });
  }

  onDrop(event: CdkDragDrop<Tool[]>): void {
    if (event.previousIndex === event.currentIndex) return;

    const updated = [...this.tools()];
    moveItemInArray(updated, event.previousIndex, event.currentIndex);

    const reorderings = updated.map((tool, index) => ({ id: tool.id, order: index }));
    this.tools.set(updated.map((tool, index) => ({ ...tool, order: index })));

    this.toolsService.reorderTools(reorderings).subscribe({
      error: () => {
        this.snackBar.open('Failed to save order.', 'Close', { duration: 3000 });
        this.loadTools(); // Revert to server state on error
      },
    });
  }

  deleteTool(tool: Tool): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Tool',
        message: `Delete "${tool.name}" from the ticker?`,
        confirmLabel: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.toolsService.deleteTool(tool.id).subscribe({
        next: () => {
          this.tools.update((list) => list.filter((t) => t.id !== tool.id));
          this.snackBar.open('Tool deleted.', 'Close', { duration: 3000 });
        },
        error: () => this.snackBar.open('Failed to delete tool.', 'Close', { duration: 3000 }),
      });
    });
  }

  toggleActive(tool: Tool): void {
    const fd = new FormData();
    fd.append('isActive', String(!tool.isActive));
    this.toolsService.updateTool(tool.id, fd).subscribe({
      next: (updated) => {
        this.tools.update((list) => list.map((t) => (t.id === updated.id ? updated : t)));
      },
      error: () => this.snackBar.open('Failed to update visibility.', 'Close', { duration: 3000 }),
    });
  }
}
