import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {

  firstName: string = "";
  lastName: string = "";
  email: string = "";
  password: string = "";

  setFirstName = (value: string) => { this.firstName = value; }
  setLastName = (value: string) => { this.lastName = value; }
  setEmail = (value: string) => { this.email = value; }
  setPassword = (value: string) => { this.password = value; }

  constructor() { }

  ngOnInit(): void {
  }

  onSubmit(e: Event): void {
    e.preventDefault();

    console.log(this.firstName, this.lastName, this.email, this.password);
  }

}
