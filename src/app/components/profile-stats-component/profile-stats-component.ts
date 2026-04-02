import { Component, Input } from '@angular/core';

import { ProfessionalCompleteData } from '../../models/professional-complete.model';

@Component({
  selector: 'app-profile-stats',
  standalone: true,
  imports: [],
  templateUrl: './profile-stats-component.html',
  styleUrls: ['./profile-stats-component.css']
})
export class ProfileStatsComponent {
  @Input() data!: ProfessionalCompleteData;
}
