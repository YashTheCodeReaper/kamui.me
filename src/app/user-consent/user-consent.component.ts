import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-user-consent',
  standalone: true,
  imports: [],
  templateUrl: './user-consent.component.html',
  styleUrl: './user-consent.component.scss'
})
export class UserConsentComponent {
  @Output() consentChange = new EventEmitter<boolean | undefined>();

  giveConsent(consent: boolean): void {
    this.consentChange.emit(consent);
    localStorage.setItem('userConsent', consent.toString());
  }
}
