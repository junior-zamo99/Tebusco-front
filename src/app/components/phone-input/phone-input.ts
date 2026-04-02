import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { COUNTRIES, Country } from '../../utils/country';

import { FormsModule } from '@angular/forms';
import { PhoneNumberUtil } from 'google-libphonenumber';
@Component({
  selector: 'app-phone-input',
  imports: [FormsModule],
  templateUrl: './phone-input.html',
  styleUrl: './phone-input.css',
})
export class PhoneInput implements OnInit {

  @Input() initialPhone: string = '';
  @Output() numberChange = new EventEmitter<any>();

  countries = COUNTRIES.filter(c => c.phoneCode);

  selectedCountry: Country = this.countries.find(c => c.iso2 === 'BO') || this.countries[0];

  phoneNumber = '';
  phoneUtil = PhoneNumberUtil.getInstance();

  ngOnInit(): void {
    if (this.initialPhone) {
      // Si hay un teléfono inicial, intentar parsearlo
      try {
        // Intentar parsear el número completo (con código de país)
        const parsedNumber = this.phoneUtil.parseAndKeepRawInput(this.initialPhone);
        
        // Obtener el código de país
        const countryCode = parsedNumber.getCountryCode();
        const nationalNumber = parsedNumber.getNationalNumber();
        
        // Encontrar el país correspondiente
        const country = this.countries.find(c => {
          const cleanCode = c.phoneCode.replace(/\s/g, '');
          return cleanCode === countryCode?.toString();
        });
        
        if (country) {
          this.selectedCountry = country;
          this.phoneNumber = nationalNumber?.toString() || '';
        } else {
          // Si no se encuentra el país, usar el número tal cual (sin código)
          this.phoneNumber = this.initialPhone.replace(/^\+\d+\s*/, '');
        }
        
        // Validar inmediatamente
        this.validate();
      } catch (e) {
        // Si hay error al parsear, usar el número tal cual
        this.phoneNumber = this.initialPhone.replace(/^\+\d+\s*/, '');
      }
    }
  }

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
