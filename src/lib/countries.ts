/**
 * WAB-TKD — Country / Nationality database.
 *
 * Single source of truth for every country the app can show a flag for.
 * Generated from the two bundled flag sets (src/assets/flags-standard and
 * src/assets/flags-hd), so *every* entry here is guaranteed to have at
 * least one real, offline, bundled flag image — there is no entry that
 * resolves to a missing/blank flag.
 *
 * Each entry carries:
 *  - iso2    : ISO 3166-1 alpha-2 (also the asset file name, lowercased).
 *              The four UK home nations use 'GB-ENG' / 'GB-SCT' /
 *              'GB-WLS' / 'GB-NIR' since they compete separately.
 *  - code    : the canonical 3-letter code shown in the UI. This is the
 *              IOC / NOC code when the country has one (MAR, KOR, USA,
 *              GER, SUI, ESP …) because that is what appears on real
 *              taekwondo score sheets and TV graphics — NOT the ISO
 *              alpha-3, which differs for ~60 countries (GER vs DEU,
 *              SUI vs CHE, MAS vs MYS …).
 *  - aliases : every other 3-letter code that must still resolve to this
 *              country (ISO alpha-3 + legacy codes already stored in old
 *              tournaments). Existing saved data keeps working.
 *  - en/ar/fr: localized country name, matching the app's 3 languages.
 *  - region  : continent, used to group the picker.
 *  - noc     : true when the country has a recognized National Olympic
 *              Committee (i.e. can realistically enter a competition).
 *              Territories (Guam, Réunion, Antarctica…) are noc:false and
 *              are pushed below the real NOCs in search results.
 */

export type CountryRegion =
  | 'Africa' | 'Asia' | 'Europe'
  | 'North America' | 'South America' | 'Oceania' | 'Antarctica';

export interface CountryEntry {
  iso2: string;
  /** asset base name (lowercase) inside src/assets/flags-* */
  file: string;
  code: string;
  aliases: string[];
  en: string;
  ar: string;
  fr: string;
  region: CountryRegion;
  noc: boolean;
}

export type CountryLang = 'en' | 'ar' | 'fr';

export const COUNTRIES: readonly CountryEntry[] = [
  { iso2: 'AD', file: 'ad', code: 'AND', aliases: ['AND'], en: 'Andorra', ar: 'أندورا', fr: 'Andorre', region: 'Europe', noc: true },
  { iso2: 'AE', file: 'ae', code: 'UAE', aliases: ['UAE', 'ARE'], en: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة', fr: 'Émirats arabes unis', region: 'Asia', noc: true },
  { iso2: 'AF', file: 'af', code: 'AFG', aliases: ['AFG'], en: 'Afghanistan', ar: 'أفغانستان', fr: 'Afghanistan', region: 'Asia', noc: true },
  { iso2: 'AG', file: 'ag', code: 'ANT', aliases: ['ANT', 'ATG'], en: 'Antigua & Barbuda', ar: 'أنتيغوا وبربودا', fr: 'Antigua-et-Barbuda', region: 'North America', noc: true },
  { iso2: 'AI', file: 'ai', code: 'AIA', aliases: ['AIA'], en: 'Anguilla', ar: 'أنغويلا', fr: 'Anguilla', region: 'North America', noc: false },
  { iso2: 'AL', file: 'al', code: 'ALB', aliases: ['ALB'], en: 'Albania', ar: 'ألبانيا', fr: 'Albanie', region: 'Europe', noc: true },
  { iso2: 'AM', file: 'am', code: 'ARM', aliases: ['ARM'], en: 'Armenia', ar: 'أرمينيا', fr: 'Arménie', region: 'Asia', noc: true },
  { iso2: 'AO', file: 'ao', code: 'ANG', aliases: ['ANG', 'AGO'], en: 'Angola', ar: 'أنغولا', fr: 'Angola', region: 'Africa', noc: true },
  { iso2: 'AQ', file: 'aq', code: 'ATA', aliases: ['ATA'], en: 'Antarctica', ar: 'أنتاركتيكا', fr: 'Antarctique', region: 'Antarctica', noc: false },
  { iso2: 'AR', file: 'ar', code: 'ARG', aliases: ['ARG'], en: 'Argentina', ar: 'الأرجنتين', fr: 'Argentine', region: 'South America', noc: true },
  { iso2: 'AS', file: 'as', code: 'ASA', aliases: ['ASA', 'ASM'], en: 'American Samoa', ar: 'ساموا الأمريكية', fr: 'Samoa américaines', region: 'Oceania', noc: true },
  { iso2: 'AT', file: 'at', code: 'AUT', aliases: ['AUT'], en: 'Austria', ar: 'النمسا', fr: 'Autriche', region: 'Europe', noc: true },
  { iso2: 'AU', file: 'au', code: 'AUS', aliases: ['AUS'], en: 'Australia', ar: 'أستراليا', fr: 'Australie', region: 'Oceania', noc: true },
  { iso2: 'AW', file: 'aw', code: 'ARU', aliases: ['ARU', 'ABW'], en: 'Aruba', ar: 'أروبا', fr: 'Aruba', region: 'North America', noc: true },
  { iso2: 'AX', file: 'ax', code: 'ALA', aliases: ['ALA'], en: 'Åland Islands', ar: 'جزر آلاند', fr: 'Îles Åland', region: 'Europe', noc: false },
  { iso2: 'AZ', file: 'az', code: 'AZE', aliases: ['AZE'], en: 'Azerbaijan', ar: 'أذربيجان', fr: 'Azerbaïdjan', region: 'Asia', noc: true },
  { iso2: 'BA', file: 'ba', code: 'BIH', aliases: ['BIH'], en: 'Bosnia & Herzegovina', ar: 'البوسنة والهرسك', fr: 'Bosnie-Herzégovine', region: 'Europe', noc: true },
  { iso2: 'BB', file: 'bb', code: 'BAR', aliases: ['BAR', 'BRB'], en: 'Barbados', ar: 'بربادوس', fr: 'Barbade', region: 'North America', noc: true },
  { iso2: 'BD', file: 'bd', code: 'BAN', aliases: ['BAN', 'BGD'], en: 'Bangladesh', ar: 'بنغلاديش', fr: 'Bangladesh', region: 'Asia', noc: true },
  { iso2: 'BE', file: 'be', code: 'BEL', aliases: ['BEL'], en: 'Belgium', ar: 'بلجيكا', fr: 'Belgique', region: 'Europe', noc: true },
  { iso2: 'BF', file: 'bf', code: 'BUR', aliases: ['BUR', 'BFA'], en: 'Burkina Faso', ar: 'بوركينا فاسو', fr: 'Burkina Faso', region: 'Africa', noc: true },
  { iso2: 'BG', file: 'bg', code: 'BUL', aliases: ['BUL', 'BGR'], en: 'Bulgaria', ar: 'بلغاريا', fr: 'Bulgarie', region: 'Europe', noc: true },
  { iso2: 'BH', file: 'bh', code: 'BRN', aliases: ['BRN', 'BHR'], en: 'Bahrain', ar: 'البحرين', fr: 'Bahreïn', region: 'Asia', noc: true },
  { iso2: 'BI', file: 'bi', code: 'BDI', aliases: ['BDI'], en: 'Burundi', ar: 'بوروندي', fr: 'Burundi', region: 'Africa', noc: true },
  { iso2: 'BJ', file: 'bj', code: 'BEN', aliases: ['BEN'], en: 'Benin', ar: 'بنين', fr: 'Bénin', region: 'Africa', noc: true },
  { iso2: 'BL', file: 'bl', code: 'BLM', aliases: ['BLM'], en: 'St. Barthélemy', ar: 'سان بارتليمي', fr: 'Saint-Barthélemy', region: 'North America', noc: false },
  { iso2: 'BM', file: 'bm', code: 'BER', aliases: ['BER', 'BMU'], en: 'Bermuda', ar: 'برمودا', fr: 'Bermudes', region: 'North America', noc: true },
  { iso2: 'BN', file: 'bn', code: 'BRU', aliases: ['BRU', 'BRN'], en: 'Brunei', ar: 'بروناي', fr: 'Brunei', region: 'Asia', noc: true },
  { iso2: 'BO', file: 'bo', code: 'BOL', aliases: ['BOL'], en: 'Bolivia', ar: 'بوليفيا', fr: 'Bolivie', region: 'South America', noc: true },
  { iso2: 'BQ', file: 'bq', code: 'BES', aliases: ['BES'], en: 'Caribbean Netherlands', ar: 'هولندا الكاريبية', fr: 'Pays-Bas caribéens', region: 'North America', noc: false },
  { iso2: 'BR', file: 'br', code: 'BRA', aliases: ['BRA'], en: 'Brazil', ar: 'البرازيل', fr: 'Brésil', region: 'South America', noc: true },
  { iso2: 'BS', file: 'bs', code: 'BAH', aliases: ['BAH', 'BHS'], en: 'Bahamas', ar: 'جزر البهاما', fr: 'Bahamas', region: 'North America', noc: true },
  { iso2: 'BT', file: 'bt', code: 'BHU', aliases: ['BHU', 'BTN'], en: 'Bhutan', ar: 'بوتان', fr: 'Bhoutan', region: 'Asia', noc: true },
  { iso2: 'BV', file: 'bv', code: 'BVT', aliases: ['BVT'], en: 'Bouvet Island', ar: 'جزيرة بوفيه', fr: 'Île Bouvet', region: 'Antarctica', noc: false },
  { iso2: 'BW', file: 'bw', code: 'BOT', aliases: ['BOT', 'BWA'], en: 'Botswana', ar: 'بوتسوانا', fr: 'Botswana', region: 'Africa', noc: true },
  { iso2: 'BY', file: 'by', code: 'BLR', aliases: ['BLR'], en: 'Belarus', ar: 'بيلاروس', fr: 'Biélorussie', region: 'Europe', noc: true },
  { iso2: 'BZ', file: 'bz', code: 'BIZ', aliases: ['BIZ', 'BLZ'], en: 'Belize', ar: 'بليز', fr: 'Belize', region: 'North America', noc: true },
  { iso2: 'CA', file: 'ca', code: 'CAN', aliases: ['CAN'], en: 'Canada', ar: 'كندا', fr: 'Canada', region: 'North America', noc: true },
  { iso2: 'CC', file: 'cc', code: 'CCK', aliases: ['CCK'], en: 'Cocos (Keeling) Islands', ar: 'جزر كوكوس (كيلينغ)', fr: 'Îles Cocos', region: 'Oceania', noc: false },
  { iso2: 'CD', file: 'cd', code: 'COD', aliases: ['COD'], en: 'Congo - Kinshasa', ar: 'الكونغو - كينشاسا', fr: 'Congo-Kinshasa', region: 'Africa', noc: true },
  { iso2: 'CF', file: 'cf', code: 'CAF', aliases: ['CAF'], en: 'Central African Republic', ar: 'جمهورية أفريقيا الوسطى', fr: 'République centrafricaine', region: 'Africa', noc: true },
  { iso2: 'CG', file: 'cg', code: 'CGO', aliases: ['CGO', 'COG'], en: 'Congo - Brazzaville', ar: 'الكونغو - برازافيل', fr: 'Congo-Brazzaville', region: 'Africa', noc: true },
  { iso2: 'CH', file: 'ch', code: 'SUI', aliases: ['SUI', 'CHE'], en: 'Switzerland', ar: 'سويسرا', fr: 'Suisse', region: 'Europe', noc: true },
  { iso2: 'CI', file: 'ci', code: 'CIV', aliases: ['CIV'], en: 'Côte d’Ivoire', ar: 'ساحل العاج', fr: 'Côte d’Ivoire', region: 'Africa', noc: true },
  { iso2: 'CK', file: 'ck', code: 'COK', aliases: ['COK'], en: 'Cook Islands', ar: 'جزر كوك', fr: 'Îles Cook', region: 'Oceania', noc: true },
  { iso2: 'CL', file: 'cl', code: 'CHI', aliases: ['CHI', 'CHL'], en: 'Chile', ar: 'تشيلي', fr: 'Chili', region: 'South America', noc: true },
  { iso2: 'CM', file: 'cm', code: 'CMR', aliases: ['CMR'], en: 'Cameroon', ar: 'الكاميرون', fr: 'Cameroun', region: 'Africa', noc: true },
  { iso2: 'CN', file: 'cn', code: 'CHN', aliases: ['CHN'], en: 'China', ar: 'الصين', fr: 'Chine', region: 'Asia', noc: true },
  { iso2: 'CO', file: 'co', code: 'COL', aliases: ['COL'], en: 'Colombia', ar: 'كولومبيا', fr: 'Colombie', region: 'South America', noc: true },
  { iso2: 'CR', file: 'cr', code: 'CRC', aliases: ['CRC', 'CRI'], en: 'Costa Rica', ar: 'كوستاريكا', fr: 'Costa Rica', region: 'North America', noc: true },
  { iso2: 'CU', file: 'cu', code: 'CUB', aliases: ['CUB'], en: 'Cuba', ar: 'كوبا', fr: 'Cuba', region: 'North America', noc: true },
  { iso2: 'CV', file: 'cv', code: 'CPV', aliases: ['CPV'], en: 'Cape Verde', ar: 'الرأس الأخضر', fr: 'Cap-Vert', region: 'Africa', noc: true },
  { iso2: 'CW', file: 'cw', code: 'CUW', aliases: ['CUW'], en: 'Curaçao', ar: 'كوراساو', fr: 'Curaçao', region: 'North America', noc: false },
  { iso2: 'CX', file: 'cx', code: 'CXR', aliases: ['CXR'], en: 'Christmas Island', ar: 'جزيرة كريسماس', fr: 'Île Christmas', region: 'Oceania', noc: false },
  { iso2: 'CY', file: 'cy', code: 'CYP', aliases: ['CYP'], en: 'Cyprus', ar: 'قبرص', fr: 'Chypre', region: 'Asia', noc: true },
  { iso2: 'CZ', file: 'cz', code: 'CZE', aliases: ['CZE'], en: 'Czechia', ar: 'التشيك', fr: 'Tchéquie', region: 'Europe', noc: true },
  { iso2: 'DE', file: 'de', code: 'GER', aliases: ['GER', 'DEU'], en: 'Germany', ar: 'ألمانيا', fr: 'Allemagne', region: 'Europe', noc: true },
  { iso2: 'DJ', file: 'dj', code: 'DJI', aliases: ['DJI'], en: 'Djibouti', ar: 'جيبوتي', fr: 'Djibouti', region: 'Africa', noc: true },
  { iso2: 'DK', file: 'dk', code: 'DEN', aliases: ['DEN', 'DNK'], en: 'Denmark', ar: 'الدانمرك', fr: 'Danemark', region: 'Europe', noc: true },
  { iso2: 'DM', file: 'dm', code: 'DMA', aliases: ['DMA'], en: 'Dominica', ar: 'دومينيكا', fr: 'Dominique', region: 'North America', noc: true },
  { iso2: 'DO', file: 'do', code: 'DOM', aliases: ['DOM'], en: 'Dominican Republic', ar: 'جمهورية الدومينيكان', fr: 'République dominicaine', region: 'North America', noc: true },
  { iso2: 'DZ', file: 'dz', code: 'ALG', aliases: ['ALG', 'DZA'], en: 'Algeria', ar: 'الجزائر', fr: 'Algérie', region: 'Africa', noc: true },
  { iso2: 'EC', file: 'ec', code: 'ECU', aliases: ['ECU'], en: 'Ecuador', ar: 'الإكوادور', fr: 'Équateur', region: 'South America', noc: true },
  { iso2: 'EE', file: 'ee', code: 'EST', aliases: ['EST'], en: 'Estonia', ar: 'إستونيا', fr: 'Estonie', region: 'Europe', noc: true },
  { iso2: 'EG', file: 'eg', code: 'EGY', aliases: ['EGY'], en: 'Egypt', ar: 'مصر', fr: 'Égypte', region: 'Africa', noc: true },
  { iso2: 'EH', file: 'eh', code: 'ESH', aliases: ['ESH'], en: 'Western Sahara', ar: 'الصحراء الغربية', fr: 'Sahara occidental', region: 'Africa', noc: false },
  { iso2: 'ER', file: 'er', code: 'ERI', aliases: ['ERI'], en: 'Eritrea', ar: 'إريتريا', fr: 'Érythrée', region: 'Africa', noc: true },
  { iso2: 'ES', file: 'es', code: 'ESP', aliases: ['ESP'], en: 'Spain', ar: 'إسبانيا', fr: 'Espagne', region: 'Europe', noc: true },
  { iso2: 'ET', file: 'et', code: 'ETH', aliases: ['ETH'], en: 'Ethiopia', ar: 'إثيوبيا', fr: 'Éthiopie', region: 'Africa', noc: true },
  { iso2: 'FI', file: 'fi', code: 'FIN', aliases: ['FIN'], en: 'Finland', ar: 'فنلندا', fr: 'Finlande', region: 'Europe', noc: true },
  { iso2: 'FJ', file: 'fj', code: 'FIJ', aliases: ['FIJ', 'FJI'], en: 'Fiji', ar: 'فيجي', fr: 'Fidji', region: 'Oceania', noc: true },
  { iso2: 'FK', file: 'fk', code: 'FLK', aliases: ['FLK'], en: 'Falkland Islands', ar: 'جزر فوكلاند', fr: 'Îles Malouines', region: 'South America', noc: false },
  { iso2: 'FM', file: 'fm', code: 'FSM', aliases: ['FSM'], en: 'Micronesia', ar: 'ميكرونيزيا', fr: 'Micronésie', region: 'Oceania', noc: true },
  { iso2: 'FO', file: 'fo', code: 'FRO', aliases: ['FRO'], en: 'Faroe Islands', ar: 'جزر فارو', fr: 'Îles Féroé', region: 'Europe', noc: false },
  { iso2: 'FR', file: 'fr', code: 'FRA', aliases: ['FRA'], en: 'France', ar: 'فرنسا', fr: 'France', region: 'Europe', noc: true },
  { iso2: 'GA', file: 'ga', code: 'GAB', aliases: ['GAB'], en: 'Gabon', ar: 'الغابون', fr: 'Gabon', region: 'Africa', noc: true },
  { iso2: 'GB-ENG', file: 'gb-eng', code: 'ENG', aliases: ['ENG'], en: 'England', ar: 'إنجلترا', fr: 'Angleterre', region: 'Europe', noc: true },
  { iso2: 'GB-NIR', file: 'gb-nir', code: 'NIR', aliases: ['NIR'], en: 'Northern Ireland', ar: 'أيرلندا الشمالية', fr: 'Irlande du Nord', region: 'Europe', noc: true },
  { iso2: 'GB-SCT', file: 'gb-sct', code: 'SCO', aliases: ['SCO'], en: 'Scotland', ar: 'اسكتلندا', fr: 'Écosse', region: 'Europe', noc: true },
  { iso2: 'GB-WLS', file: 'gb-wls', code: 'WAL', aliases: ['WAL'], en: 'Wales', ar: 'ويلز', fr: 'Pays de Galles', region: 'Europe', noc: true },
  { iso2: 'GB', file: 'gb', code: 'GBR', aliases: ['GBR', 'UK'], en: 'United Kingdom', ar: 'المملكة المتحدة', fr: 'Royaume-Uni', region: 'Europe', noc: true },
  { iso2: 'GD', file: 'gd', code: 'GRN', aliases: ['GRN', 'GRD'], en: 'Grenada', ar: 'غرينادا', fr: 'Grenade', region: 'North America', noc: true },
  { iso2: 'GE', file: 'ge', code: 'GEO', aliases: ['GEO'], en: 'Georgia', ar: 'جورجيا', fr: 'Géorgie', region: 'Asia', noc: true },
  { iso2: 'GF', file: 'gf', code: 'GUF', aliases: ['GUF'], en: 'French Guiana', ar: 'غويانا الفرنسية', fr: 'Guyane française', region: 'South America', noc: false },
  { iso2: 'GG', file: 'gg', code: 'GGY', aliases: ['GGY'], en: 'Guernsey', ar: 'غيرنزي', fr: 'Guernesey', region: 'Europe', noc: false },
  { iso2: 'GH', file: 'gh', code: 'GHA', aliases: ['GHA'], en: 'Ghana', ar: 'غانا', fr: 'Ghana', region: 'Africa', noc: true },
  { iso2: 'GI', file: 'gi', code: 'GIB', aliases: ['GIB'], en: 'Gibraltar', ar: 'جبل طارق', fr: 'Gibraltar', region: 'Europe', noc: false },
  { iso2: 'GL', file: 'gl', code: 'GRL', aliases: ['GRL'], en: 'Greenland', ar: 'غرينلاند', fr: 'Groenland', region: 'Europe', noc: false },
  { iso2: 'GM', file: 'gm', code: 'GAM', aliases: ['GAM', 'GMB'], en: 'Gambia', ar: 'غامبيا', fr: 'Gambie', region: 'Africa', noc: true },
  { iso2: 'GN', file: 'gn', code: 'GUI', aliases: ['GUI', 'GIN'], en: 'Guinea', ar: 'غينيا', fr: 'Guinée', region: 'Africa', noc: true },
  { iso2: 'GP', file: 'gp', code: 'GLP', aliases: ['GLP'], en: 'Guadeloupe', ar: 'غوادلوب', fr: 'Guadeloupe', region: 'North America', noc: false },
  { iso2: 'GQ', file: 'gq', code: 'GEQ', aliases: ['GEQ', 'GNQ'], en: 'Equatorial Guinea', ar: 'غينيا الاستوائية', fr: 'Guinée équatoriale', region: 'Africa', noc: true },
  { iso2: 'GR', file: 'gr', code: 'GRE', aliases: ['GRE', 'GRC'], en: 'Greece', ar: 'اليونان', fr: 'Grèce', region: 'Europe', noc: true },
  { iso2: 'GS', file: 'gs', code: 'SGS', aliases: ['SGS'], en: 'South Georgia & South Sandwich Islands', ar: 'جورجيا الجنوبية وجزر ساندويتش الجنوبية', fr: 'Géorgie du Sud-et-les Îles Sandwich du Sud', region: 'South America', noc: false },
  { iso2: 'GT', file: 'gt', code: 'GUA', aliases: ['GUA', 'GTM'], en: 'Guatemala', ar: 'غواتيمالا', fr: 'Guatemala', region: 'North America', noc: true },
  { iso2: 'GU', file: 'gu', code: 'GUM', aliases: ['GUM'], en: 'Guam', ar: 'غوام', fr: 'Guam', region: 'Oceania', noc: true },
  { iso2: 'GW', file: 'gw', code: 'GBS', aliases: ['GBS', 'GNB'], en: 'Guinea-Bissau', ar: 'غينيا بيساو', fr: 'Guinée-Bissau', region: 'Africa', noc: true },
  { iso2: 'GY', file: 'gy', code: 'GUY', aliases: ['GUY'], en: 'Guyana', ar: 'غيانا', fr: 'Guyana', region: 'South America', noc: true },
  { iso2: 'HK', file: 'hk', code: 'HKG', aliases: ['HKG'], en: 'Hong Kong SAR China', ar: 'هونغ كونغ الصينية (منطقة إدارية خاصة)', fr: 'R.A.S. chinoise de Hong Kong', region: 'Asia', noc: true },
  { iso2: 'HM', file: 'hm', code: 'HMD', aliases: ['HMD'], en: 'Heard & McDonald Islands', ar: 'جزيرة هيرد وجزر ماكدونالد', fr: 'Îles Heard-et-MacDonald', region: 'Oceania', noc: false },
  { iso2: 'HN', file: 'hn', code: 'HON', aliases: ['HON', 'HND'], en: 'Honduras', ar: 'هندوراس', fr: 'Honduras', region: 'North America', noc: true },
  { iso2: 'HR', file: 'hr', code: 'CRO', aliases: ['CRO', 'HRV'], en: 'Croatia', ar: 'كرواتيا', fr: 'Croatie', region: 'Europe', noc: true },
  { iso2: 'HT', file: 'ht', code: 'HAI', aliases: ['HAI', 'HTI'], en: 'Haiti', ar: 'هايتي', fr: 'Haïti', region: 'North America', noc: true },
  { iso2: 'HU', file: 'hu', code: 'HUN', aliases: ['HUN'], en: 'Hungary', ar: 'هنغاريا', fr: 'Hongrie', region: 'Europe', noc: true },
  { iso2: 'ID', file: 'id', code: 'INA', aliases: ['INA', 'IDN'], en: 'Indonesia', ar: 'إندونيسيا', fr: 'Indonésie', region: 'Asia', noc: true },
  { iso2: 'IE', file: 'ie', code: 'IRL', aliases: ['IRL'], en: 'Ireland', ar: 'أيرلندا', fr: 'Irlande', region: 'Europe', noc: true },
  { iso2: 'IL', file: 'il', code: 'ISR', aliases: ['ISR'], en: 'Israel', ar: 'إسرائيل', fr: 'Israël', region: 'Asia', noc: true },
  { iso2: 'IM', file: 'im', code: 'IMN', aliases: ['IMN'], en: 'Isle of Man', ar: 'جزيرة مان', fr: 'Île de Man', region: 'Europe', noc: false },
  { iso2: 'IN', file: 'in', code: 'IND', aliases: ['IND'], en: 'India', ar: 'الهند', fr: 'Inde', region: 'Asia', noc: true },
  { iso2: 'IO', file: 'io', code: 'IOT', aliases: ['IOT'], en: 'British Indian Ocean Territory', ar: 'الإقليم البريطاني في المحيط الهندي', fr: 'Territoire britannique de l’océan Indien', region: 'Africa', noc: false },
  { iso2: 'IQ', file: 'iq', code: 'IRQ', aliases: ['IRQ'], en: 'Iraq', ar: 'العراق', fr: 'Irak', region: 'Asia', noc: true },
  { iso2: 'IR', file: 'ir', code: 'IRI', aliases: ['IRI', 'IRN'], en: 'Iran', ar: 'إيران', fr: 'Iran', region: 'Asia', noc: true },
  { iso2: 'IS', file: 'is', code: 'ISL', aliases: ['ISL'], en: 'Iceland', ar: 'آيسلندا', fr: 'Islande', region: 'Europe', noc: true },
  { iso2: 'IT', file: 'it', code: 'ITA', aliases: ['ITA'], en: 'Italy', ar: 'إيطاليا', fr: 'Italie', region: 'Europe', noc: true },
  { iso2: 'JE', file: 'je', code: 'JEY', aliases: ['JEY'], en: 'Jersey', ar: 'جيرسي', fr: 'Jersey', region: 'Europe', noc: false },
  { iso2: 'JM', file: 'jm', code: 'JAM', aliases: ['JAM'], en: 'Jamaica', ar: 'جامايكا', fr: 'Jamaïque', region: 'North America', noc: true },
  { iso2: 'JO', file: 'jo', code: 'JOR', aliases: ['JOR'], en: 'Jordan', ar: 'الأردن', fr: 'Jordanie', region: 'Asia', noc: true },
  { iso2: 'JP', file: 'jp', code: 'JPN', aliases: ['JPN'], en: 'Japan', ar: 'اليابان', fr: 'Japon', region: 'Asia', noc: true },
  { iso2: 'KE', file: 'ke', code: 'KEN', aliases: ['KEN'], en: 'Kenya', ar: 'كينيا', fr: 'Kenya', region: 'Africa', noc: true },
  { iso2: 'KG', file: 'kg', code: 'KGZ', aliases: ['KGZ'], en: 'Kyrgyzstan', ar: 'قيرغيزستان', fr: 'Kirghizstan', region: 'Asia', noc: true },
  { iso2: 'KH', file: 'kh', code: 'CAM', aliases: ['CAM', 'KHM'], en: 'Cambodia', ar: 'كمبوديا', fr: 'Cambodge', region: 'Asia', noc: true },
  { iso2: 'KI', file: 'ki', code: 'KIR', aliases: ['KIR'], en: 'Kiribati', ar: 'كيريباتي', fr: 'Kiribati', region: 'Oceania', noc: true },
  { iso2: 'KM', file: 'km', code: 'COM', aliases: ['COM'], en: 'Comoros', ar: 'جزر القمر', fr: 'Comores', region: 'Africa', noc: true },
  { iso2: 'KN', file: 'kn', code: 'SKN', aliases: ['SKN', 'KNA'], en: 'St. Kitts & Nevis', ar: 'سانت كيتس ونيفيس', fr: 'Saint-Christophe-et-Niévès', region: 'North America', noc: true },
  { iso2: 'KP', file: 'kp', code: 'PRK', aliases: ['PRK'], en: 'North Korea', ar: 'كوريا الشمالية', fr: 'Corée du Nord', region: 'Asia', noc: true },
  { iso2: 'KR', file: 'kr', code: 'KOR', aliases: ['KOR', 'ROK'], en: 'South Korea', ar: 'كوريا الجنوبية', fr: 'Corée du Sud', region: 'Asia', noc: true },
  { iso2: 'KW', file: 'kw', code: 'KUW', aliases: ['KUW', 'KWT'], en: 'Kuwait', ar: 'الكويت', fr: 'Koweït', region: 'Asia', noc: true },
  { iso2: 'KY', file: 'ky', code: 'CAY', aliases: ['CAY', 'CYM'], en: 'Cayman Islands', ar: 'جزر كايمان', fr: 'Îles Caïmans', region: 'North America', noc: true },
  { iso2: 'KZ', file: 'kz', code: 'KAZ', aliases: ['KAZ'], en: 'Kazakhstan', ar: 'كازاخستان', fr: 'Kazakhstan', region: 'Asia', noc: true },
  { iso2: 'LA', file: 'la', code: 'LAO', aliases: ['LAO'], en: 'Laos', ar: 'لاوس', fr: 'Laos', region: 'Asia', noc: true },
  { iso2: 'LB', file: 'lb', code: 'LBN', aliases: ['LBN'], en: 'Lebanon', ar: 'لبنان', fr: 'Liban', region: 'Asia', noc: true },
  { iso2: 'LC', file: 'lc', code: 'LCA', aliases: ['LCA'], en: 'St. Lucia', ar: 'سانت لوسيا', fr: 'Sainte-Lucie', region: 'North America', noc: true },
  { iso2: 'LI', file: 'li', code: 'LIE', aliases: ['LIE'], en: 'Liechtenstein', ar: 'ليختنشتاين', fr: 'Liechtenstein', region: 'Europe', noc: true },
  { iso2: 'LK', file: 'lk', code: 'SRI', aliases: ['SRI', 'LKA'], en: 'Sri Lanka', ar: 'سريلانكا', fr: 'Sri Lanka', region: 'Asia', noc: true },
  { iso2: 'LR', file: 'lr', code: 'LBR', aliases: ['LBR'], en: 'Liberia', ar: 'ليبيريا', fr: 'Liberia', region: 'Africa', noc: true },
  { iso2: 'LS', file: 'ls', code: 'LES', aliases: ['LES', 'LSO'], en: 'Lesotho', ar: 'ليسوتو', fr: 'Lesotho', region: 'Africa', noc: true },
  { iso2: 'LT', file: 'lt', code: 'LTU', aliases: ['LTU'], en: 'Lithuania', ar: 'ليتوانيا', fr: 'Lituanie', region: 'Europe', noc: true },
  { iso2: 'LU', file: 'lu', code: 'LUX', aliases: ['LUX'], en: 'Luxembourg', ar: 'لوكسمبورغ', fr: 'Luxembourg', region: 'Europe', noc: true },
  { iso2: 'LV', file: 'lv', code: 'LAT', aliases: ['LAT', 'LVA'], en: 'Latvia', ar: 'لاتفيا', fr: 'Lettonie', region: 'Europe', noc: true },
  { iso2: 'LY', file: 'ly', code: 'LBA', aliases: ['LBA', 'LBY'], en: 'Libya', ar: 'ليبيا', fr: 'Libye', region: 'Africa', noc: true },
  { iso2: 'MA', file: 'ma', code: 'MAR', aliases: ['MAR'], en: 'Morocco', ar: 'المغرب', fr: 'Maroc', region: 'Africa', noc: true },
  { iso2: 'MC', file: 'mc', code: 'MON', aliases: ['MON', 'MCO'], en: 'Monaco', ar: 'موناكو', fr: 'Monaco', region: 'Europe', noc: true },
  { iso2: 'MD', file: 'md', code: 'MDA', aliases: ['MDA'], en: 'Moldova', ar: 'مولدوفا', fr: 'Moldavie', region: 'Europe', noc: true },
  { iso2: 'ME', file: 'me', code: 'MNE', aliases: ['MNE'], en: 'Montenegro', ar: 'الجبل الأسود', fr: 'Monténégro', region: 'Europe', noc: true },
  { iso2: 'MF', file: 'mf', code: 'MAF', aliases: ['MAF'], en: 'St. Martin', ar: 'سان مارتن', fr: 'Saint-Martin', region: 'North America', noc: false },
  { iso2: 'MG', file: 'mg', code: 'MAD', aliases: ['MAD', 'MDG'], en: 'Madagascar', ar: 'مدغشقر', fr: 'Madagascar', region: 'Africa', noc: true },
  { iso2: 'MH', file: 'mh', code: 'MHL', aliases: ['MHL'], en: 'Marshall Islands', ar: 'جزر مارشال', fr: 'Îles Marshall', region: 'Oceania', noc: true },
  { iso2: 'MK', file: 'mk', code: 'MKD', aliases: ['MKD'], en: 'North Macedonia', ar: 'مقدونيا الشمالية', fr: 'Macédoine du Nord', region: 'Europe', noc: true },
  { iso2: 'ML', file: 'ml', code: 'MLI', aliases: ['MLI'], en: 'Mali', ar: 'مالي', fr: 'Mali', region: 'Africa', noc: true },
  { iso2: 'MM', file: 'mm', code: 'MYA', aliases: ['MYA', 'MMR'], en: 'Myanmar (Burma)', ar: 'ميانمار (بورما)', fr: 'Myanmar (Birmanie)', region: 'Asia', noc: true },
  { iso2: 'MN', file: 'mn', code: 'MGL', aliases: ['MGL', 'MNG'], en: 'Mongolia', ar: 'منغوليا', fr: 'Mongolie', region: 'Asia', noc: true },
  { iso2: 'MO', file: 'mo', code: 'MAC', aliases: ['MAC'], en: 'Macao SAR China', ar: 'منطقة ماكاو الإدارية الخاصة', fr: 'R.A.S. chinoise de Macao', region: 'Asia', noc: false },
  { iso2: 'MP', file: 'mp', code: 'MNP', aliases: ['MNP'], en: 'Northern Mariana Islands', ar: 'جزر ماريانا الشمالية', fr: 'Îles Mariannes du Nord', region: 'Oceania', noc: false },
  { iso2: 'MQ', file: 'mq', code: 'MTQ', aliases: ['MTQ'], en: 'Martinique', ar: 'جزر المارتينيك', fr: 'Martinique', region: 'North America', noc: false },
  { iso2: 'MR', file: 'mr', code: 'MTN', aliases: ['MTN', 'MRT'], en: 'Mauritania', ar: 'موريتانيا', fr: 'Mauritanie', region: 'Africa', noc: true },
  { iso2: 'MS', file: 'ms', code: 'MSR', aliases: ['MSR'], en: 'Montserrat', ar: 'مونتسرات', fr: 'Montserrat', region: 'North America', noc: false },
  { iso2: 'MT', file: 'mt', code: 'MLT', aliases: ['MLT'], en: 'Malta', ar: 'مالطا', fr: 'Malte', region: 'Europe', noc: true },
  { iso2: 'MU', file: 'mu', code: 'MRI', aliases: ['MRI', 'MUS'], en: 'Mauritius', ar: 'موريشيوس', fr: 'Maurice', region: 'Africa', noc: true },
  { iso2: 'MV', file: 'mv', code: 'MDV', aliases: ['MDV'], en: 'Maldives', ar: 'جزر المالديف', fr: 'Maldives', region: 'Asia', noc: true },
  { iso2: 'MW', file: 'mw', code: 'MAW', aliases: ['MAW', 'MWI'], en: 'Malawi', ar: 'ملاوي', fr: 'Malawi', region: 'Africa', noc: true },
  { iso2: 'MX', file: 'mx', code: 'MEX', aliases: ['MEX'], en: 'Mexico', ar: 'المكسيك', fr: 'Mexique', region: 'North America', noc: true },
  { iso2: 'MY', file: 'my', code: 'MAS', aliases: ['MAS', 'MYS'], en: 'Malaysia', ar: 'ماليزيا', fr: 'Malaisie', region: 'Asia', noc: true },
  { iso2: 'MZ', file: 'mz', code: 'MOZ', aliases: ['MOZ'], en: 'Mozambique', ar: 'موزمبيق', fr: 'Mozambique', region: 'Africa', noc: true },
  { iso2: 'NA', file: 'na', code: 'NAM', aliases: ['NAM'], en: 'Namibia', ar: 'ناميبيا', fr: 'Namibie', region: 'Africa', noc: true },
  { iso2: 'NC', file: 'nc', code: 'NCL', aliases: ['NCL'], en: 'New Caledonia', ar: 'كاليدونيا الجديدة', fr: 'Nouvelle-Calédonie', region: 'Oceania', noc: false },
  { iso2: 'NE', file: 'ne', code: 'NIG', aliases: ['NIG', 'NER'], en: 'Niger', ar: 'النيجر', fr: 'Niger', region: 'Africa', noc: true },
  { iso2: 'NF', file: 'nf', code: 'NFK', aliases: ['NFK'], en: 'Norfolk Island', ar: 'جزيرة نورفولك', fr: 'Île Norfolk', region: 'Oceania', noc: false },
  { iso2: 'NG', file: 'ng', code: 'NGR', aliases: ['NGR', 'NGA'], en: 'Nigeria', ar: 'نيجيريا', fr: 'Nigeria', region: 'Africa', noc: true },
  { iso2: 'NI', file: 'ni', code: 'NCA', aliases: ['NCA', 'NIC'], en: 'Nicaragua', ar: 'نيكاراغوا', fr: 'Nicaragua', region: 'North America', noc: true },
  { iso2: 'NL', file: 'nl', code: 'NED', aliases: ['NED', 'NLD'], en: 'Netherlands', ar: 'هولندا', fr: 'Pays-Bas', region: 'Europe', noc: true },
  { iso2: 'NO', file: 'no', code: 'NOR', aliases: ['NOR'], en: 'Norway', ar: 'النرويج', fr: 'Norvège', region: 'Europe', noc: true },
  { iso2: 'NP', file: 'np', code: 'NEP', aliases: ['NEP', 'NPL'], en: 'Nepal', ar: 'نيبال', fr: 'Népal', region: 'Asia', noc: true },
  { iso2: 'NR', file: 'nr', code: 'NRU', aliases: ['NRU'], en: 'Nauru', ar: 'ناورو', fr: 'Nauru', region: 'Oceania', noc: true },
  { iso2: 'NU', file: 'nu', code: 'NIU', aliases: ['NIU'], en: 'Niue', ar: 'نيوي', fr: 'Niue', region: 'Oceania', noc: false },
  { iso2: 'NZ', file: 'nz', code: 'NZL', aliases: ['NZL'], en: 'New Zealand', ar: 'نيوزيلندا', fr: 'Nouvelle-Zélande', region: 'Oceania', noc: true },
  { iso2: 'OM', file: 'om', code: 'OMA', aliases: ['OMA', 'OMN'], en: 'Oman', ar: 'عُمان', fr: 'Oman', region: 'Asia', noc: true },
  { iso2: 'PA', file: 'pa', code: 'PAN', aliases: ['PAN'], en: 'Panama', ar: 'بنما', fr: 'Panama', region: 'North America', noc: true },
  { iso2: 'PE', file: 'pe', code: 'PER', aliases: ['PER'], en: 'Peru', ar: 'بيرو', fr: 'Pérou', region: 'South America', noc: true },
  { iso2: 'PF', file: 'pf', code: 'PYF', aliases: ['PYF'], en: 'French Polynesia', ar: 'بولينيزيا الفرنسية', fr: 'Polynésie française', region: 'Oceania', noc: false },
  { iso2: 'PG', file: 'pg', code: 'PNG', aliases: ['PNG'], en: 'Papua New Guinea', ar: 'بابوا غينيا الجديدة', fr: 'Papouasie-Nouvelle-Guinée', region: 'Oceania', noc: true },
  { iso2: 'PH', file: 'ph', code: 'PHI', aliases: ['PHI', 'PHL'], en: 'Philippines', ar: 'الفلبين', fr: 'Philippines', region: 'Asia', noc: true },
  { iso2: 'PK', file: 'pk', code: 'PAK', aliases: ['PAK'], en: 'Pakistan', ar: 'باكستان', fr: 'Pakistan', region: 'Asia', noc: true },
  { iso2: 'PL', file: 'pl', code: 'POL', aliases: ['POL'], en: 'Poland', ar: 'بولندا', fr: 'Pologne', region: 'Europe', noc: true },
  { iso2: 'PM', file: 'pm', code: 'SPM', aliases: ['SPM'], en: 'St. Pierre & Miquelon', ar: 'سان بيير ومكويلون', fr: 'Saint-Pierre-et-Miquelon', region: 'North America', noc: false },
  { iso2: 'PN', file: 'pn', code: 'PCN', aliases: ['PCN'], en: 'Pitcairn Islands', ar: 'جزر بيتكيرن', fr: 'Îles Pitcairn', region: 'Oceania', noc: false },
  { iso2: 'PR', file: 'pr', code: 'PUR', aliases: ['PUR', 'PRI'], en: 'Puerto Rico', ar: 'بورتوريكو', fr: 'Porto Rico', region: 'North America', noc: true },
  { iso2: 'PS', file: 'ps', code: 'PLE', aliases: ['PLE', 'PSE'], en: 'Palestinian Territories', ar: 'الأراضي الفلسطينية', fr: 'Territoires palestiniens', region: 'Asia', noc: true },
  { iso2: 'PT', file: 'pt', code: 'POR', aliases: ['POR', 'PRT'], en: 'Portugal', ar: 'البرتغال', fr: 'Portugal', region: 'Europe', noc: true },
  { iso2: 'PW', file: 'pw', code: 'PLW', aliases: ['PLW'], en: 'Palau', ar: 'بالاو', fr: 'Palaos', region: 'Oceania', noc: true },
  { iso2: 'PY', file: 'py', code: 'PAR', aliases: ['PAR', 'PRY'], en: 'Paraguay', ar: 'باراغواي', fr: 'Paraguay', region: 'South America', noc: true },
  { iso2: 'QA', file: 'qa', code: 'QAT', aliases: ['QAT'], en: 'Qatar', ar: 'قطر', fr: 'Qatar', region: 'Asia', noc: true },
  { iso2: 'RE', file: 're', code: 'REU', aliases: ['REU'], en: 'Réunion', ar: 'روينيون', fr: 'La Réunion', region: 'Africa', noc: false },
  { iso2: 'RO', file: 'ro', code: 'ROU', aliases: ['ROU', 'ROM'], en: 'Romania', ar: 'رومانيا', fr: 'Roumanie', region: 'Europe', noc: true },
  { iso2: 'RS', file: 'rs', code: 'SRB', aliases: ['SRB'], en: 'Serbia', ar: 'صربيا', fr: 'Serbie', region: 'Europe', noc: true },
  { iso2: 'RU', file: 'ru', code: 'RUS', aliases: ['RUS'], en: 'Russia', ar: 'روسيا', fr: 'Russie', region: 'Europe', noc: true },
  { iso2: 'RW', file: 'rw', code: 'RWA', aliases: ['RWA'], en: 'Rwanda', ar: 'رواندا', fr: 'Rwanda', region: 'Africa', noc: true },
  { iso2: 'SA', file: 'sa', code: 'KSA', aliases: ['KSA', 'SAU'], en: 'Saudi Arabia', ar: 'المملكة العربية السعودية', fr: 'Arabie saoudite', region: 'Asia', noc: true },
  { iso2: 'SB', file: 'sb', code: 'SOL', aliases: ['SOL', 'SLB'], en: 'Solomon Islands', ar: 'جزر سليمان', fr: 'Îles Salomon', region: 'Oceania', noc: true },
  { iso2: 'SC', file: 'sc', code: 'SEY', aliases: ['SEY', 'SYC'], en: 'Seychelles', ar: 'سيشل', fr: 'Seychelles', region: 'Africa', noc: true },
  { iso2: 'SD', file: 'sd', code: 'SUD', aliases: ['SUD', 'SDN'], en: 'Sudan', ar: 'السودان', fr: 'Soudan', region: 'Africa', noc: true },
  { iso2: 'SE', file: 'se', code: 'SWE', aliases: ['SWE'], en: 'Sweden', ar: 'السويد', fr: 'Suède', region: 'Europe', noc: true },
  { iso2: 'SG', file: 'sg', code: 'SGP', aliases: ['SGP'], en: 'Singapore', ar: 'سنغافورة', fr: 'Singapour', region: 'Asia', noc: true },
  { iso2: 'SH', file: 'sh', code: 'SHN', aliases: ['SHN'], en: 'St. Helena', ar: 'سانت هيلينا', fr: 'Sainte-Hélène', region: 'Africa', noc: false },
  { iso2: 'SI', file: 'si', code: 'SLO', aliases: ['SLO', 'SVN'], en: 'Slovenia', ar: 'سلوفينيا', fr: 'Slovénie', region: 'Europe', noc: true },
  { iso2: 'SJ', file: 'sj', code: 'SJM', aliases: ['SJM'], en: 'Svalbard & Jan Mayen', ar: 'سفالبارد وجان ماين', fr: 'Svalbard et Jan Mayen', region: 'Europe', noc: false },
  { iso2: 'SK', file: 'sk', code: 'SVK', aliases: ['SVK'], en: 'Slovakia', ar: 'سلوفاكيا', fr: 'Slovaquie', region: 'Europe', noc: true },
  { iso2: 'SL', file: 'sl', code: 'SLE', aliases: ['SLE'], en: 'Sierra Leone', ar: 'سيراليون', fr: 'Sierra Leone', region: 'Africa', noc: true },
  { iso2: 'SM', file: 'sm', code: 'SMR', aliases: ['SMR'], en: 'San Marino', ar: 'سان مارينو', fr: 'Saint-Marin', region: 'Europe', noc: true },
  { iso2: 'SN', file: 'sn', code: 'SEN', aliases: ['SEN'], en: 'Senegal', ar: 'السنغال', fr: 'Sénégal', region: 'Africa', noc: true },
  { iso2: 'SO', file: 'so', code: 'SOM', aliases: ['SOM'], en: 'Somalia', ar: 'الصومال', fr: 'Somalie', region: 'Africa', noc: true },
  { iso2: 'SR', file: 'sr', code: 'SUR', aliases: ['SUR'], en: 'Suriname', ar: 'سورينام', fr: 'Suriname', region: 'South America', noc: true },
  { iso2: 'SS', file: 'ss', code: 'SSD', aliases: ['SSD'], en: 'South Sudan', ar: 'جنوب السودان', fr: 'Soudan du Sud', region: 'Africa', noc: true },
  { iso2: 'ST', file: 'st', code: 'STP', aliases: ['STP'], en: 'São Tomé & Príncipe', ar: 'ساو تومي وبرينسيبي', fr: 'Sao Tomé-et-Principe', region: 'Africa', noc: true },
  { iso2: 'SV', file: 'sv', code: 'ESA', aliases: ['ESA', 'SLV'], en: 'El Salvador', ar: 'السلفادور', fr: 'Salvador', region: 'North America', noc: true },
  { iso2: 'SX', file: 'sx', code: 'SXM', aliases: ['SXM'], en: 'Sint Maarten', ar: 'سانت مارتن', fr: 'Saint-Martin (partie néerlandaise)', region: 'North America', noc: false },
  { iso2: 'SY', file: 'sy', code: 'SYR', aliases: ['SYR'], en: 'Syria', ar: 'سوريا', fr: 'Syrie', region: 'Asia', noc: true },
  { iso2: 'SZ', file: 'sz', code: 'SWZ', aliases: ['SWZ', 'ESW'], en: 'Eswatini', ar: 'إسواتيني', fr: 'Eswatini', region: 'Africa', noc: true },
  { iso2: 'TC', file: 'tc', code: 'TKS', aliases: ['TKS', 'TCA'], en: 'Turks & Caicos Islands', ar: 'جزر توركس وكايكوس', fr: 'Îles Turques-et-Caïques', region: 'North America', noc: true },
  { iso2: 'TD', file: 'td', code: 'CHA', aliases: ['CHA', 'TCD'], en: 'Chad', ar: 'تشاد', fr: 'Tchad', region: 'Africa', noc: true },
  { iso2: 'TF', file: 'tf', code: 'ATF', aliases: ['ATF'], en: 'French Southern Territories', ar: 'الأقاليم الجنوبية الفرنسية', fr: 'Terres australes françaises', region: 'Africa', noc: false },
  { iso2: 'TG', file: 'tg', code: 'TOG', aliases: ['TOG', 'TGO'], en: 'Togo', ar: 'توغو', fr: 'Togo', region: 'Africa', noc: true },
  { iso2: 'TH', file: 'th', code: 'THA', aliases: ['THA'], en: 'Thailand', ar: 'تايلاند', fr: 'Thaïlande', region: 'Asia', noc: true },
  { iso2: 'TJ', file: 'tj', code: 'TJK', aliases: ['TJK'], en: 'Tajikistan', ar: 'طاجيكستان', fr: 'Tadjikistan', region: 'Asia', noc: true },
  { iso2: 'TK', file: 'tk', code: 'TKL', aliases: ['TKL'], en: 'Tokelau', ar: 'توكيلاو', fr: 'Tokelau', region: 'Oceania', noc: false },
  { iso2: 'TL', file: 'tl', code: 'TLS', aliases: ['TLS'], en: 'Timor-Leste', ar: 'تيمور - ليشتي', fr: 'Timor oriental', region: 'Asia', noc: true },
  { iso2: 'TM', file: 'tm', code: 'TKM', aliases: ['TKM'], en: 'Turkmenistan', ar: 'تركمانستان', fr: 'Turkménistan', region: 'Asia', noc: true },
  { iso2: 'TN', file: 'tn', code: 'TUN', aliases: ['TUN'], en: 'Tunisia', ar: 'تونس', fr: 'Tunisie', region: 'Africa', noc: true },
  { iso2: 'TO', file: 'to', code: 'TGA', aliases: ['TGA', 'TON'], en: 'Tonga', ar: 'تونغا', fr: 'Tonga', region: 'Oceania', noc: true },
  { iso2: 'TR', file: 'tr', code: 'TUR', aliases: ['TUR'], en: 'Türkiye', ar: 'تركيا', fr: 'Turquie', region: 'Asia', noc: true },
  { iso2: 'TT', file: 'tt', code: 'TTO', aliases: ['TTO'], en: 'Trinidad & Tobago', ar: 'ترينيداد وتوباغو', fr: 'Trinité-et-Tobago', region: 'North America', noc: true },
  { iso2: 'TV', file: 'tv', code: 'TUV', aliases: ['TUV'], en: 'Tuvalu', ar: 'توفالو', fr: 'Tuvalu', region: 'Oceania', noc: true },
  { iso2: 'TW', file: 'tw', code: 'TPE', aliases: ['TPE', 'TWN'], en: 'Taiwan', ar: 'تايوان', fr: 'Taïwan', region: 'Asia', noc: true },
  { iso2: 'TZ', file: 'tz', code: 'TAN', aliases: ['TAN', 'TZA'], en: 'Tanzania', ar: 'تنزانيا', fr: 'Tanzanie', region: 'Africa', noc: true },
  { iso2: 'UA', file: 'ua', code: 'UKR', aliases: ['UKR'], en: 'Ukraine', ar: 'أوكرانيا', fr: 'Ukraine', region: 'Europe', noc: true },
  { iso2: 'UG', file: 'ug', code: 'UGA', aliases: ['UGA'], en: 'Uganda', ar: 'أوغندا', fr: 'Ouganda', region: 'Africa', noc: true },
  { iso2: 'UM', file: 'um', code: 'UMI', aliases: ['UMI'], en: 'U.S. Outlying Islands', ar: 'جزر الولايات المتحدة النائية', fr: 'Îles mineures éloignées des États-Unis', region: 'Oceania', noc: false },
  { iso2: 'US', file: 'us', code: 'USA', aliases: ['USA'], en: 'United States', ar: 'الولايات المتحدة', fr: 'États-Unis', region: 'North America', noc: true },
  { iso2: 'UY', file: 'uy', code: 'URU', aliases: ['URU', 'URY'], en: 'Uruguay', ar: 'أورغواي', fr: 'Uruguay', region: 'South America', noc: true },
  { iso2: 'UZ', file: 'uz', code: 'UZB', aliases: ['UZB'], en: 'Uzbekistan', ar: 'أوزبكستان', fr: 'Ouzbékistan', region: 'Asia', noc: true },
  { iso2: 'VA', file: 'va', code: 'VAT', aliases: ['VAT'], en: 'Vatican City', ar: 'الفاتيكان', fr: 'État de la Cité du Vatican', region: 'Europe', noc: false },
  { iso2: 'VC', file: 'vc', code: 'VIN', aliases: ['VIN', 'VCT'], en: 'St. Vincent & Grenadines', ar: 'سانت فنسنت وجزر غرينادين', fr: 'Saint-Vincent-et-les Grenadines', region: 'North America', noc: true },
  { iso2: 'VE', file: 've', code: 'VEN', aliases: ['VEN'], en: 'Venezuela', ar: 'فنزويلا', fr: 'Venezuela', region: 'South America', noc: true },
  { iso2: 'VG', file: 'vg', code: 'IVB', aliases: ['IVB', 'VGB'], en: 'British Virgin Islands', ar: 'جزر فيرجن البريطانية', fr: 'Îles Vierges britanniques', region: 'North America', noc: true },
  { iso2: 'VI', file: 'vi', code: 'ISV', aliases: ['ISV', 'VIR'], en: 'U.S. Virgin Islands', ar: 'جزر فيرجن الأمريكية', fr: 'Îles Vierges des États-Unis', region: 'North America', noc: true },
  { iso2: 'VN', file: 'vn', code: 'VIE', aliases: ['VIE', 'VNM'], en: 'Vietnam', ar: 'فيتنام', fr: 'Viêt Nam', region: 'Asia', noc: true },
  { iso2: 'VU', file: 'vu', code: 'VAN', aliases: ['VAN', 'VUT'], en: 'Vanuatu', ar: 'فانواتو', fr: 'Vanuatu', region: 'Oceania', noc: true },
  { iso2: 'WF', file: 'wf', code: 'WLF', aliases: ['WLF'], en: 'Wallis & Futuna', ar: 'جزر والس وفوتونا', fr: 'Wallis-et-Futuna', region: 'Oceania', noc: false },
  { iso2: 'WS', file: 'ws', code: 'SAM', aliases: ['SAM', 'WSM'], en: 'Samoa', ar: 'ساموا', fr: 'Samoa', region: 'Oceania', noc: true },
  { iso2: 'XK', file: 'xk', code: 'KOS', aliases: ['KOS', 'XKX'], en: 'Kosovo', ar: 'كوسوفو', fr: 'Kosovo', region: 'Europe', noc: true },
  { iso2: 'YE', file: 'ye', code: 'YEM', aliases: ['YEM'], en: 'Yemen', ar: 'اليمن', fr: 'Yémen', region: 'Asia', noc: true },
  { iso2: 'YT', file: 'yt', code: 'MYT', aliases: ['MYT'], en: 'Mayotte', ar: 'مايوت', fr: 'Mayotte', region: 'Africa', noc: false },
  { iso2: 'ZA', file: 'za', code: 'RSA', aliases: ['RSA', 'ZAF'], en: 'South Africa', ar: 'جنوب أفريقيا', fr: 'Afrique du Sud', region: 'Africa', noc: true },
  { iso2: 'ZM', file: 'zm', code: 'ZAM', aliases: ['ZAM', 'ZMB'], en: 'Zambia', ar: 'زامبيا', fr: 'Zambie', region: 'Africa', noc: true },
  { iso2: 'ZW', file: 'zw', code: 'ZIM', aliases: ['ZIM', 'ZWE'], en: 'Zimbabwe', ar: 'زيمبابوي', fr: 'Zimbabwe', region: 'Africa', noc: true },];

/** Total number of countries/territories with a bundled flag. */
export const COUNTRY_COUNT = COUNTRIES.length;

export const COUNTRY_REGIONS: readonly CountryRegion[] = [
  'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Antarctica',
];

// ---------------------------------------------------------------------------
// Lookup index
// ---------------------------------------------------------------------------

/** Normalizes Arabic/accented input so "Maroc", "maroc", "المغرب" and "MAR"
 *  all hit the same key. Strips diacritics/tatweel and unifies alef/ya/ta. */
export function normalizeCountryQuery(input: string): string {
  return (input || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')      // latin accents (é → e)
    .replace(/[\u064B-\u065F\u0670]/g, '') // arabic harakat
    .replace(/\u0640/g, '')                // tatweel
    .replace(/[\u0622\u0623\u0625\u0671]/g, '\u0627') // أ إ آ → ا
    .replace(/\u0649/g, '\u064A')          // ى → ي
    .replace(/\u0629/g, '\u0647')          // ة → ه
    .replace(/[^a-z0-9\u0600-\u06FF]+/g, ''); // drop spaces/punctuation
}

const INDEX = new Map<string, CountryEntry>();
for (const c of COUNTRIES) {
  const keys = [c.iso2, c.code, ...c.aliases, c.en, c.ar, c.fr];
  for (const k of keys) {
    const key = normalizeCountryQuery(k);
    if (key && !INDEX.has(key)) INDEX.set(key, c);
  }
}

/**
 * Resolve any user/stored input — 'mar', 'MAR', 'MA', 'Morocco', 'Maroc',
 * 'المغرب' — to a country entry. Returns null when nothing matches, never
 * throws, and is safe to call with undefined/empty values.
 */
export function findCountry(input: string | null | undefined): CountryEntry | null {
  if (!input) return null;
  return INDEX.get(normalizeCountryQuery(input)) || null;
}

/** Canonical 3-letter code ('mar' → 'MAR'). Falls back to the raw uppercased
 *  input so unknown/legacy values are still displayed rather than blanked. */
export function toCountryCode(input: string | null | undefined): string {
  const c = findCountry(input);
  return c ? c.code : (input || '').toUpperCase().trim();
}

/** ISO alpha-2 used to pick the flag asset ('MAR' → 'MA'). */
export function toIso2(input: string | null | undefined): string | null {
  const c = findCountry(input);
  return c ? c.iso2 : null;
}

/** Localized country name, with graceful fallback to English. */
export function countryName(
  input: string | CountryEntry | null | undefined,
  lang: CountryLang = 'en',
): string {
  const c = typeof input === 'string' || input == null ? findCountry(input as string) : input;
  if (!c) return (typeof input === 'string' ? input : '') || '';
  return (lang === 'ar' ? c.ar : lang === 'fr' ? c.fr : c.en) || c.en;
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface CountrySearchOptions {
  /** Language whose name is ranked first. Others are still searched. */
  lang?: CountryLang;
  /** Cap the result list. Default: no cap. */
  limit?: number;
  /** Only countries with a National Olympic Committee. Default false. */
  nocOnly?: boolean;
}

/**
 * Search by 3-letter code, ISO-2, or country name in ANY of the three
 * languages. Ranking (best first):
 *   1. exact code / ISO-2 match      ("mar" → MAR Morocco, first hit)
 *   2. name starts with the query    ("mor" → Morocco)
 *   3. code starts with the query
 *   4. name contains the query
 * Ties break on NOC first, then alphabetically in the active language.
 * An empty query returns the whole list (so the picker can show everything).
 */
export function searchCountries(query: string, options: CountrySearchOptions = {}): CountryEntry[] {
  const { lang = 'en', limit, nocOnly = false } = options;
  const q = normalizeCountryQuery(query);
  const pool = nocOnly ? COUNTRIES.filter(c => c.noc) : COUNTRIES;

  const collator = new Intl.Collator(lang);
  const byName = (a: CountryEntry, b: CountryEntry) => {
    if (a.noc !== b.noc) return a.noc ? -1 : 1;
    return collator.compare(countryName(a, lang), countryName(b, lang));
  };

  if (!q) {
    const all = [...pool].sort(byName);
    return limit ? all.slice(0, limit) : all;
  }

  const scored: { c: CountryEntry; score: number }[] = [];
  for (const c of pool) {
    const codes = [c.iso2, c.code, ...c.aliases].map(normalizeCountryQuery);
    const names = [c.en, c.ar, c.fr].map(normalizeCountryQuery);
    let score = -1;
    if (codes.includes(q)) score = 0;
    else if (names.some(n => n === q)) score = 1;
    else if (names.some(n => n.startsWith(q))) score = 2;
    else if (codes.some(n => n.startsWith(q))) score = 3;
    else if (names.some(n => n.includes(q))) score = 4;
    if (score >= 0) scored.push({ c, score });
  }

  scored.sort((a, b) => (a.score - b.score) || byName(a.c, b.c));
  const out = scored.map(s => s.c);
  return limit ? out.slice(0, limit) : out;
}

/** Group a list of countries by continent, preserving the given order. */
export function groupByRegion(list: readonly CountryEntry[]): { region: CountryRegion; countries: CountryEntry[] }[] {
  const map = new Map<CountryRegion, CountryEntry[]>();
  for (const c of list) {
    const arr = map.get(c.region);
    if (arr) arr.push(c); else map.set(c.region, [c]);
  }
  return COUNTRY_REGIONS.filter(r => map.has(r)).map(r => ({ region: r, countries: map.get(r)! }));
}

export const REGION_LABELS: Record<CountryRegion, Record<CountryLang, string>> = {
  Africa: { en: 'Africa', ar: 'أفريقيا', fr: 'Afrique' },
  Asia: { en: 'Asia', ar: 'آسيا', fr: 'Asie' },
  Europe: { en: 'Europe', ar: 'أوروبا', fr: 'Europe' },
  'North America': { en: 'North America', ar: 'أمريكا الشمالية', fr: 'Amérique du Nord' },
  'South America': { en: 'South America', ar: 'أمريكا الجنوبية', fr: 'Amérique du Sud' },
  Oceania: { en: 'Oceania', ar: 'أوقيانوسيا', fr: 'Océanie' },
  Antarctica: { en: 'Antarctica', ar: 'القارة القطبية الجنوبية', fr: 'Antarctique' },
};
