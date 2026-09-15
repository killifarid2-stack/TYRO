import { describe, expect, it } from 'vitest';
import {
  COUNTRIES, COUNTRY_COUNT, countryName, findCountry, groupByRegion,
  searchCountries, toCountryCode, toIso2,
} from '@/lib/countries';
import { getCountryFlag, getIso2 } from '@/lib/flags';
import { DEFAULT_FLAG_STYLE, sanitizeFlagStyle } from '@/lib/flag-style';

describe('country database', () => {
  it('has a unique canonical code per country', () => {
    const codes = COUNTRIES.map(c => c.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(COUNTRY_COUNT).toBe(COUNTRIES.length);
  });

  it('resolves a country from its 3-letter code, ISO-2, or name in any language', () => {
    for (const input of ['MAR', 'mar', 'MA', 'ma', 'Morocco', 'morocco', 'Maroc', 'المغرب']) {
      expect(findCountry(input)?.code, input).toBe('MAR');
    }
  });

  it('ignores Arabic diacritics and alef/ya/ta variants when searching', () => {
    // 'المغرب' typed with a hamza-alef and harakat must still match.
    expect(findCountry('أَلْمَغْرِب')?.code).toBe('MAR');
  });

  it('keeps every legacy/ISO-3 code working so saved tournaments still resolve', () => {
    // These were the ambiguous ones in the old hand-written map: the app
    // stored either variant depending on where the value was entered.
    const legacy: Record<string, string> = {
      VNM: 'VIE', VIE: 'VIE', BGD: 'BAN', NPL: 'NEP', LKA: 'SRI', PSE: 'PLE',
      IDN: 'INA', AGO: 'ANG', MWI: 'MAW', BFA: 'BUR', ESW: 'SWZ', BHR: 'BRN',
      IRN: 'IRI', PHL: 'PHI', SAU: 'KSA', SDN: 'SUD', LBY: 'LBA', DEU: 'GER',
      CHE: 'SUI', MYS: 'MAS', NLD: 'NED',
    };
    for (const [input, expected] of Object.entries(legacy)) {
      expect(toCountryCode(input), input).toBe(expected);
    }
  });

  it('gives the four UK home nations their own entries', () => {
    expect(toIso2('ENG')).toBe('GB-ENG');
    expect(toIso2('SCO')).toBe('GB-SCT');
    expect(toIso2('GBR')).toBe('GB');
  });

  it('never throws on empty or unknown input', () => {
    expect(findCountry('')).toBeNull();
    expect(findCountry(null)).toBeNull();
    expect(findCountry('ZZZZ')).toBeNull();
    expect(toCountryCode('zzz')).toBe('ZZZ');   // still displayable
    expect(getIso2('')).toBeNull();
    expect(getCountryFlag('nope')).toBe('');
  });

  it('localizes names, falling back to English', () => {
    expect(countryName('KOR', 'en')).toBe('South Korea');
    expect(countryName('KOR', 'fr')).toContain('Cor');
    expect(countryName('KOR', 'ar')).toContain('كوريا');
  });
});

describe('country search', () => {
  it('puts an exact code match first', () => {
    expect(searchCountries('mar')[0].code).toBe('MAR');
    expect(searchCountries('ger')[0].code).toBe('GER');
  });

  it('finds countries by partial name in each language', () => {
    expect(searchCountries('moro').map(c => c.code)).toContain('MAR');
    expect(searchCountries('maro').map(c => c.code)).toContain('MAR');
    expect(searchCountries('مغرب').map(c => c.code)).toContain('MAR');
  });

  it('returns the whole list for an empty query', () => {
    expect(searchCountries('').length).toBe(COUNTRY_COUNT);
  });

  it('can restrict to National Olympic Committees', () => {
    const noc = searchCountries('', { nocOnly: true });
    expect(noc.length).toBeGreaterThan(190);
    expect(noc.length).toBeLessThan(COUNTRY_COUNT);
    expect(noc.every(c => c.noc)).toBe(true);
  });

  it('groups results by continent without losing any entry', () => {
    const all = searchCountries('');
    const total = groupByRegion(all).reduce((n, g) => n + g.countries.length, 0);
    expect(total).toBe(all.length);
  });
});

describe('flag style', () => {
  it('rejects a corrupted or hand-edited stored style instead of putting it on air', () => {
    expect(sanitizeFlagStyle({ set: 'bogus', shape: 'triangle' })).toEqual(DEFAULT_FLAG_STYLE);
    expect(sanitizeFlagStyle(null)).toEqual(DEFAULT_FLAG_STYLE);
    expect(sanitizeFlagStyle({ set: 'hd', shape: 'circle', border: true, shadow: false }))
      .toEqual({ set: 'hd', shape: 'circle', border: true, shadow: false });
  });

  it('defaults to the pre-existing broadcast look', () => {
    expect(DEFAULT_FLAG_STYLE).toEqual({ set: 'standard', shape: 'rectangle', border: false, shadow: true });
  });
});
