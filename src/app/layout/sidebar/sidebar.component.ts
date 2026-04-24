import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SIDEBAR_SOCIAL_LINKS } from '../../shared/data/social-links';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  protected readonly socialLinks = SIDEBAR_SOCIAL_LINKS;
}
