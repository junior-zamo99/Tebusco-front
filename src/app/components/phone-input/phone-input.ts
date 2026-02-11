import { Component, EventEmitter, Output } from '@angular/core';
import { COUNTRIES, Country } from '../../utils/country';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PhoneNumberUtil } from 'google-libphonenumber';
@Component({
  selector: 'app-phone-input',
  imports: [FormsModule,CommonModule],
  templateUrl: './phone-input.html',
  styleUrl: './phone-input.css',
})
export class PhoneInput{

  countries = COUNTRIES.filter(c => c.phoneCode);

  selectedCountry: Country = this.countries.find(c => c.iso2 === 'BO') || this.countries[0];

  phoneNumber = '';
  phoneUtil = PhoneNumberUtil.getInstance();
  @Output() numberChange = new EventEmitter<any>();
  get dialCodeClean(): string {
    return this.selectedCountry.phoneCode.replace(/\s/g, '');
  }
  onCountryChange(event: any) {
    const iso2 = event.target.value;
    this.selectedCountry = this.countries.find(c => c.iso2 === iso2) || this.countries[0];
    this.validate();
  }
  onInputChange() {
    this.validate();
  }
  validate() {
    try {
      const numberToParse = this.phoneNumber;
      const parsedNumber = this.phoneUtil.parseAndKeepRawInput(numberToParse, this.selectedCountry.iso2);

      const isValid = this.phoneUtil.isValidNumber(parsedNumber);

      this.numberChange.emit({
        valid: isValid,
        countryCode: this.selectedCountry.iso2,
        dialCode: '+' + this.dialCodeClean,
        number: this.phoneNumber,
        fullNumber: '+' + this.dialCodeClean + this.phoneNumber
      });

    } catch (e) {
      this.numberChange.emit({ valid: false });
    }
  }
}
