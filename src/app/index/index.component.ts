import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  isSignedIn: boolean;

  constructor(authService: AuthService) {
    this.isSignedIn = authService.isSignedIn();
  }

  ngOnInit(): void {
  }

}
