import { Component, OnInit, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../../core/services/auth.service';
import { ContactService } from '../../../core/services/contact.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule,
  ],
  templateUrl: './shell.component.html',
})
export class ShellComponent implements OnInit {
  private authService = inject(AuthService);
  private contactService = inject(ContactService);

  currentUser = this.authService.currentUser;
  unreadCount = signal(0);

  navItems = [
    { label: 'Profile', icon: 'person', route: '/dashboard/profile' },
    { label: 'Projects', icon: 'work', route: '/dashboard/projects' },
    { label: 'Skills', icon: 'star', route: '/dashboard/skills' },
    { label: 'Tech Ticker', icon: 'view_carousel', route: '/dashboard/tools' },
    { label: 'Messages', icon: 'mail', route: '/dashboard/contacts', badge: true },
    { label: 'Account Settings', icon: 'settings', route: '/dashboard/account' },
  ];

  ngOnInit(): void {
    this.loadUnreadCount();
  }

  private loadUnreadCount(): void {
    this.contactService.getMessages({ isRead: false, limit: 1 }).subscribe({
      next: (response) => {
        this.unreadCount.set(response.meta?.total ?? 0);
      },
      error: () => {
        this.unreadCount.set(0);
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
