import { Component, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';
import { ContactService, ContactMessage } from '../../core/services/contact.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';

@Component({
  selector: 'app-contact-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatChipsModule,
    DatePipe,
  ],
  templateUrl: './contact-list.component.html',
})
export class ContactListComponent implements OnInit {
  messages = signal<ContactMessage[]>([]);
  isLoading = signal(false);
  showUnreadOnly = signal(false);
  expandedMessageId = signal<string | null>(null);
  displayedColumns = ['status', 'name', 'email', 'subject', 'date', 'actions'];

  constructor(
    private contactService: ContactService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadMessages();
  }

  private loadMessages(): void {
    this.isLoading.set(true);
    const params = this.showUnreadOnly() ? { isRead: false } : undefined;
    this.contactService.getMessages(params).subscribe({
      next: (response) => {
        this.messages.set(response.data ?? []);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.snackBar.open('Failed to load messages.', 'Close', { duration: 3000 });
      },
    });
  }

  toggleFilter(): void {
    this.showUnreadOnly.update((v) => !v);
    this.loadMessages();
  }

  toggleExpand(message: ContactMessage): void {
    const currentId = this.expandedMessageId();
    this.expandedMessageId.set(currentId === message.id ? null : message.id);

    if (!message.isRead && this.expandedMessageId() === message.id) {
      this.markAsRead(message);
    }
  }

  markAsRead(message: ContactMessage): void {
    if (message.isRead) return;

    this.contactService.markAsRead(message.id).subscribe({
      next: () => {
        this.messages.update((list) =>
          list.map((m) => (m.id === message.id ? { ...m, isRead: true } : m))
        );
      },
      error: () => {
        this.snackBar.open('Failed to mark as read.', 'Close', { duration: 3000 });
      },
    });
  }

  deleteMessage(message: ContactMessage): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Message',
        message: `Delete message from "${message.senderName}"?`,
        confirmLabel: 'Delete',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed) {
        this.contactService.deleteMessage(message.id).subscribe({
          next: () => {
            this.messages.update((list) => list.filter((m) => m.id !== message.id));
            this.snackBar.open('Message deleted.', 'Close', { duration: 3000 });
          },
          error: () => {
            this.snackBar.open('Failed to delete message.', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }
}
