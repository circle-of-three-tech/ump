import data from '../../../tertiary_institutions_by_country.json';

export interface Option {
  label: string;
  value: string;
}

export interface Country {
  name: string;
  institutions: string[];
}

interface InstitutionsData {
  countries: Country[];
}

export const UniversityService = {
  getCountries(): Option[] {
    return data.countries.map((country: Country) => ({
      label: country.name,
      value: country.name,
    }));
  },

  getUniversitiesByCountry(countryName: string): Option[] {
    const country = data.countries.find((c: Country) => c.name === countryName);
    if (!country) return [];

    return country.institutions
      .map((institution: string) => ({
        label: institution,
        value: institution,
      }))
      .sort((a: Option, b: Option) => a.label.localeCompare(b.label));
  },

  isValidUniversityEmail(email: string, university: string): boolean {
    // For now, just check if the email ends with .edu
    // In a real application, you would maintain a list of valid university email domains
    const domain = email.split('@')[1];
    return domain?.endsWith('.edu') || domain?.endsWith('.com') || false;
  }
};