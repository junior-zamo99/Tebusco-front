export interface Country {
  id: number;
  name: string;
  code: string;
  cities?: City[];
}

export interface City {
  id: number;
  name: string;
  code: string;
  country?: Country;
}


export interface CreateCountryDTO {
  name: string;
  code: string;
}

export interface CreateCityDTO {
  name: string;
  code?: string;
  countryId: number;
}

export interface UpdateCityDTO {
  name?: string;
  code?: string;
  countryId?: number;
}
