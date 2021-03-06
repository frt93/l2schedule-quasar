import date from 'handlers/date';

export default {
  getTimezonesList: userTimezone => {
    let list = [
      { value: 'Etc/GMT+12', utc: 'UTC -12:00', label: 'International Date Line' },
      { value: 'Etc/GMT+11', utc: 'UTC -11:00', label: 'Coordinated Universal Time -11' },
      { value: 'Pacific/Honolulu', utc: 'UTC -10:00', label: 'Hawaii' },
      { value: 'America/Juneau', utc: 'UTC -09:00', label: 'Alaska' },
      { value: 'America/Dawson', utc: 'UTC -08:00', label: 'Pacific Time (US & Canada), Tijuana' },
      {
        value: 'America/Mazatlan',
        utc: 'UTC -07:00',
        label: 'La Paz, Chihuahua, Mazatlan, Nayarit',
      },
      { value: 'America/Boise', utc: 'UTC -07:00', label: 'Mountain Time (USA & Canada)' },
      { value: 'America/Phoenix', utc: 'UTC -07:00', label: 'Arizona' },
      { value: 'America/Mexico_City', utc: 'UTC -06:00', label: 'Guadalajara, Mexico' },
      { value: 'America/Monterrey', utc: 'UTC -06:00', label: 'Monterrey' },
      { value: 'Pacific/Easter', utc: 'UTC -06:00', label: 'Easter Island' },
      { value: 'America/Regina', utc: 'UTC -06:00', label: 'Saskatchewan' },
      { value: 'America/Belize', utc: 'UTC -06:00', label: 'Central America' },
      { value: 'America/Chicago', utc: 'UTC -06:00', label: 'Central Time (USA & Canada)' },
      { value: 'America/Bogota', utc: 'UTC -05:00', label: 'Bogota' },
      { value: 'America/Guayaquil', utc: 'UTC -05:00', label: 'Quito' },
      { value: 'America/Lima', utc: 'UTC -05:00', label: 'Lima' },
      { value: 'America/Cancun', utc: 'UTC -05:00', label: 'Chetumal' },
      { value: 'America/Detroit', utc: 'UTC -05:00', label: 'Eastern Time (USA & Canada)' },
      { value: 'America/Havana', utc: 'UTC -05:00', label: 'Havana' },
      {
        value: 'America/Port-au-Prince',
        utc: 'UTC -05:00',
        label: 'Port-au-Prince, Turks and Caicos Islands',
      },
      { value: 'America/Indiana/Indianapolis', utc: 'UTC -05:00', label: 'Indiana (East)' },
      { value: 'America/Asuncion', utc: 'UTC -04:00', label: 'Asuncion' },
      { value: 'America/Glace_Bay', utc: 'UTC -04:00', label: 'Atlantic Time (Canada)' },
      { value: 'America/Caracas', utc: 'UTC -04:00', label: 'Caracas' },
      { value: 'America/Puerto_Rico', utc: 'UTC -04:00', label: 'San Juan (Puerto Rico)' },
      { value: 'America/Guyana', utc: 'UTC -04:00', label: 'Georgetown (Guyana)' },
      { value: 'America/Santiago', utc: 'UTC -04:00', label: 'Santiago' },
      { value: 'America/Cuiaba', utc: 'UTC -04:00', label: 'Cuiaba' },
      { value: 'America/Manaus', utc: 'UTC -04:00', label: 'Manaus' },
      { value: 'America/St_Johns', utc: 'UTC -03:30', label: 'Newfoundland' },
      { value: 'America/Araguaina', utc: 'UTC -03:00', label: 'Araguaina' },
      { value: 'America/Sao_Paulo', utc: 'UTC -03:00', label: 'Brasilia' },
      { value: 'America/Fortaleza', utc: 'UTC -03:00', label: 'Fortaleza' },
      { value: 'America/Bahia', utc: 'UTC -03:00', label: 'Salvador' },
      { value: 'America/Argentina/Buenos_Aires', utc: 'UTC -03:00', label: 'Buenos Aires' },
      { value: 'America/Godthab', utc: 'UTC -03:00', label: 'Greenland' },
      { value: 'America/Cayenne', utc: 'UTC -03:00', label: 'Cayenne' },
      { value: 'America/Montevideo', utc: 'UTC -03:00', label: 'Montevideo' },
      { value: 'America/Miquelon', utc: 'UTC -03:00', label: 'Saint Pierre and Miquelon' },
      { value: 'Etc/GMT+11', utc: 'UTC -02:00', label: 'Coordinated Universal Time -02' },
      { value: 'Atlantic/Azores', utc: 'UTC -01:00', label: 'Azores' },
      { value: 'Atlantic/Cape_Verde', utc: 'UTC -01:00', label: 'Cape Verde' },
      { value: 'Etc/UTC', utc: 'UTC', label: 'Coordinated Universal Time' },
      { value: 'Europe/London', utc: 'UTC +00:00', label: 'London, Edinburgh' },
      { value: 'Europe/Dublin', utc: 'UTC +00:00', label: 'Dublin' },
      { value: 'Europe/Lisbon', utc: 'UTC +00:00', label: 'Lisbon' },
      {
        value: 'Africa/Monrovia',
        utc: 'UTC +00:00',
        label: 'Monrovia, Reykjavik, Sao Tome and Principe',
      },
      { value: 'Africa/Casablanca', utc: 'UTC +01:00', label: 'Casablanca' },
      { value: 'Africa/Bangui', utc: 'UTC +01:00', label: 'West Central Africa' },
      { value: 'Europe/Amsterdam', utc: 'UTC +01:00', label: 'Amsterdam' },
      { value: 'Europe/Berlin', utc: 'UTC +01:00', label: 'Berlin' },
      { value: 'Europe/Zurich', utc: 'UTC +01:00', label: 'Bern' },
      { value: 'Europe/Vienna', utc: 'UTC +01:00', label: 'Vienna' },
      { value: 'Europe/Rome', utc: 'UTC +01:00', label: 'Rome' },
      { value: 'Europe/Stockholm', utc: 'UTC +01:00', label: 'Stockholm' },
      { value: 'Europe/Belgrade', utc: 'UTC +01:00', label: 'Belgrade' },
      { value: 'Europe/Bratislava', utc: 'UTC +01:00', label: 'Bratislava' },
      { value: 'Europe/Ljubljana', utc: 'UTC +01:00', label: 'Ljubljana' },
      { value: 'Europe/Budapest', utc: 'UTC +01:00', label: 'Budapest' },
      { value: 'Europe/Prague', utc: 'UTC +01:00', label: 'Prague' },
      { value: 'Europe/Brussels', utc: 'UTC +01:00', label: 'Brussels' },
      { value: 'Europe/Copenhagen', utc: 'UTC +01:00', label: 'Copenhagen' },
      { value: 'Europe/Madrid', utc: 'UTC +01:00', label: 'Madrid' },
      { value: 'Europe/Paris', utc: 'UTC +01:00', label: 'Paris' },
      { value: 'Europe/Warsaw', utc: 'UTC +01:00', label: 'Warsaw' },
      { value: 'Europe/Zagreb', utc: 'UTC +01:00', label: 'Zagreb' },
      { value: 'Europe/Sarajevo', utc: 'UTC +01:00', label: 'Sarajevo' },
      { value: 'Europe/Skopje', utc: 'UTC +01:00', label: 'Skopje' },
      { value: 'Asia/Amman', utc: 'UTC +02:00', label: 'Amman' },
      { value: 'Europe/Athens', utc: 'UTC +02:00', label: 'Athens' },
      { value: 'Europe/Bucharest', utc: 'UTC +02:00', label: 'Bucharest' },
      { value: 'Asia/Beirut', utc: 'UTC +02:00', label: 'Beirut' },
      { value: 'Europe/Vilnius', utc: 'UTC +02:00', label: 'Vilnius' },
      { value: 'Europe/Kiev', utc: 'UTC +02:00', label: 'Kyiv' },
      { value: 'Europe/Riga', utc: 'UTC +02:00', label: 'Riga' },
      { value: 'Europe/Sofia', utc: 'UTC +02:00', label: 'Sofia' },
      { value: 'Europe/Tallinn', utc: 'UTC +02:00', label: 'Tallinn' },
      { value: 'Europe/Helsinki', utc: 'UTC +02:00', label: 'Helsinki' },
      { value: 'Africa/Windhoek', utc: 'UTC +02:00', label: 'Windhoek' },
      { value: 'Asia/Damascus', utc: 'UTC +02:00', label: 'Damascus' },
      { value: 'Asia/Jerusalem', utc: 'UTC +02:00', label: 'Jerusalem' },
      { value: 'Africa/Cairo', utc: 'UTC +02:00', label: 'Cairo' },
      { value: 'Europe/Chisinau', utc: 'UTC +02:00', label: 'Chisinau' },
      { value: 'Asia/Hebron', utc: 'UTC +02:00', label: 'Gaza Strip, Hebron' },
      { value: 'Africa/Tripoli', utc: 'UTC +02:00', label: 'Tripoli' },
      { value: 'Africa/Harare', utc: 'UTC +02:00', label: 'Harare' },
      { value: 'Africa/Johannesburg', utc: 'UTC +02:00', label: 'Johannesburg' },
      { value: 'Africa/Khartoum', utc: 'UTC +02:00', label: 'Khartoum' },
      { value: 'Europe/Kaliningrad', utc: 'UTC +02:00', label: 'Kaliningrad' },
      { value: 'Europe/Moscow', utc: 'UTC +03:00', label: 'Moscow' },
      { value: 'Europe/Minsk', utc: 'UTC +03:00', label: 'Minsk' },
      { value: 'Asia/Baghdad', utc: 'UTC +03:00', label: 'Baghdad' },
      { value: 'Asia/Kuwait', utc: 'UTC +03:00', label: 'Kuwait' },
      { value: 'Asia/Riyadh', utc: 'UTC +03:00', label: 'Riyadh' },
      { value: 'Africa/Nairobi', utc: 'UTC +03:00', label: 'Nairobi' },
      { value: 'Europe/Istanbul', utc: 'UTC +03:00', label: 'Istanbul' },
      { value: 'Asia/Tehran', utc: 'UTC +03:30', label: 'Tehran' },
      { value: 'Asia/Dubai', utc: 'UTC +04:00', label: 'Abu Dhabi' },
      { value: 'Asia/Muscat', utc: 'UTC +04:00', label: 'Muscat' },
      {
        value: 'Europe/Astrakhan',
        utc: 'UTC +04:00',
        label: 'Astrakhan, Ulyanovsk, Volgograd, Saratov',
      },
      { value: 'Europe/Samara', utc: 'UTC +04:00', label: 'Samara, Izhevsk' },
      { value: 'Asia/Yekaterinburg', utc: 'UTC +05:00', label: 'Yekaterinburg' },
      { value: 'Asia/Baku', utc: 'UTC +04:00', label: 'Baku' },
      { value: 'Asia/Yerevan', utc: 'UTC +04:00', label: 'Yerevan' },
      { value: 'Indian/Mauritius', utc: 'UTC +04:00', label: 'Port Louis' },
      { value: 'Asia/Tbilisi', utc: 'UTC +04:00', label: 'Tbilisi' },
      { value: 'Asia/Kabul', utc: 'UTC +04:30', label: 'Kabul' },
      { value: 'Asia/Ashgabat', utc: 'UTC +05:00', label: 'Ashgabat' },
      { value: 'Asia/Tashkent', utc: 'UTC +05:00', label: 'Tashkent' },
      { value: 'Asia/Karachi', utc: 'UTC +05:00', label: 'Islamabad, Karachi' },
      { value: 'Asia/Qyzylorda', utc: 'UTC +05:00', label: 'Qyzylorda' },
      { value: 'Asia/Kolkata', utc: 'UTC +05:30', label: 'Kolkata, Mumbai, New Delhi, Chennai' },
      { value: 'Asia/Colombo', utc: 'UTC +05:30', label: 'Sri Jayewardenepura Kotte' },
      { value: 'Asia/Kathmandu', utc: 'UTC +05:45', label: 'Kathmandu' },
      { value: 'Asia/Almaty', utc: 'UTC +06:00', label: 'Nur-Sultan' },
      { value: 'Asia/Dhaka', utc: 'UTC +06:00', label: 'Dhaka' },
      { value: 'Asia/Omsk', utc: 'UTC +06:00', label: 'Omsk' },
      { value: 'Asia/Yangon', utc: 'UTC +06:30', label: 'Yangon' },
      { value: 'Asia/Ho_Chi_Minh', utc: 'UTC +07:00', label: 'Hanoi' },
      { value: 'Asia/Jakarta', utc: 'UTC +07:00', label: 'Jakarta' },
      { value: 'Asia/Bangkok', utc: 'UTC +07:00', label: 'Bangkok' },
      { value: 'Asia/Hovd', utc: 'UTC +07:00', label: 'Hovd' },
      { value: 'Asia/Krasnoyarsk', utc: 'UTC +07:00', label: 'Krasnoyarsk' },
      { value: 'Asia/Novosibirsk', utc: 'UTC +07:00', label: 'Novosibirsk' },
      { value: 'Asia/Irkutsk', utc: 'UTC +08:00', label: 'Irkutsk, Buryatia' },
      { value: 'Asia/Hong_Kong', utc: 'UTC +08:00', label: 'Hong Kong' },
      { value: 'Asia/Shanghai', utc: 'UTC +08:00', label: 'Shanghai, Beijing' },
      { value: 'Asia/Singapore', utc: 'UTC +08:00', label: 'Singapore' },
      { value: 'Asia/Kuala_Lumpur', utc: 'UTC +08:00', label: 'Kuala Lumpur' },
      { value: 'Australia/Perth', utc: 'UTC +08:00', label: 'Perth' },
      { value: 'Asia/Taipei', utc: 'UTC +08:00', label: 'Taipei' },
      { value: 'Asia/Ulaanbaatar', utc: 'UTC +08:00', label: 'Ulan Bator' },
      { value: 'Australia/Eucla', utc: 'UTC +08:45', label: 'West Australia (Eucla)' },
      { value: 'Asia/Tokyo', utc: 'UTC +09:00', label: 'Osaka, Tokyo, Sapporo' },
      { value: 'Asia/Pyongyang', utc: 'UTC +09:00', label: 'Pyongyang' },
      { value: 'Asia/Seoul', utc: 'UTC +09:00', label: 'Seoul' },
      { value: 'Asia/Yakutsk', utc: 'UTC +09:00', label: 'Chita, Yakutsk' },
      { value: 'Australia/Adelaide', utc: 'UTC +09:30', label: 'Adelaide' },
      { value: 'Australia/Darwin', utc: 'UTC +09:30', label: 'Darwin' },
      { value: 'Australia/Brisbane', utc: 'UTC +10:00', label: 'Brisbane' },
      { value: 'Australia/Sydney', utc: 'UTC +10:00', label: 'Canberra, Melbourne, Sydney' },
      { value: 'Australia/Hobart', utc: 'UTC +10:00', label: 'Hobart' },
      { value: 'Pacific/Guam', utc: 'UTC +10:00', label: 'Guam' },
      { value: 'Pacific/Port_Moresby', utc: 'UTC +10:00', label: 'Port Moresby' },
      { value: 'Asia/Vladivostok', utc: 'UTC +10:00', label: 'Vladivostok' },
      { value: 'Australia/Lord_Howe', utc: 'UTC +10:30', label: 'Lord Howe Island' },
      { value: 'Asia/Magadan', utc: 'UTC +11:00', label: 'Magadan' },
      { value: 'Asia/Sakhalin', utc: 'UTC +11:00', label: 'Sakhalin' },
      { value: 'Pacific/Norfolk', utc: 'UTC +11:00', label: 'Norfolk Island' },
      { value: 'Pacific/Bougainville', utc: 'UTC +11:00', label: 'Bougainville Island' },
      { value: 'Pacific/Guadalcanal', utc: 'UTC +11:00', label: 'Solomon Islands, New Caledonia' },
      { value: 'Asia/Kamchatka', utc: 'UTC +12:00', label: 'Kamchatka' },
      { value: 'Pacific/Auckland', utc: 'UTC +12:00', label: 'Auckland, Wellington' },
      { value: 'Etc/GMT-12', utc: 'UTC +12:00', label: 'Coordinated Universal Time +12' },
      { value: 'Pacific/Fiji', utc: 'UTC +12:00', label: 'Fiji' },
      { value: 'Etc/GMT-13', utc: 'UTC +13:00', label: 'Coordinated Universal Time +13' },
      { value: 'Pacific/Tongatapu', utc: 'UTC +13:00', label: "Nuku'alofa" },
      { value: 'Pacific/Apia', utc: 'UTC +13:00', label: 'Samoa' },
      { value: 'Pacific/Kiritimati', utc: 'UTC +14:00', label: 'Christmas Island' },
    ];

    if (userTimezone === 'local') {
      list.unshift({
        value: 'local',
        utc: `${date.getCurrentTimezoneShortname()}`,
        label: `Local`,
      });
    }

    return list;
  },

  countries: [
    { value: 'au', label: 'Australia' },
    { value: 'at', label: 'Austria' },
    { value: 'az', label: 'Azerbaijan' },
    { value: 'ax', label: 'Aland Islands' },
    { value: 'al', label: 'Albania' },
    { value: 'dz', label: 'Algeria' },
    { value: 'as', label: 'American Samoa' },
    { value: 'ai', label: 'Anguilla' },
    { value: 'gb-eng', label: 'England' },
    { value: 'ao', label: 'Angola' },
    { value: 'ad', label: 'Andorra' },
    { value: 'aq', label: 'Antarctica' },
    { value: 'ag', label: 'Antigua and Barbuda' },
    { value: 'ar', label: 'Argentina' },
    { value: 'am', label: 'Armenia' },
    { value: 'aw', label: 'Aruba' },
    { value: 'af', label: 'Afghanistan' },
    { value: 'bs', label: 'Bahamas' },
    { value: 'bd', label: 'Bangladesh' },
    { value: 'bb', label: 'Barbados' },
    { value: 'bh', label: 'Bahrain' },
    { value: 'by', label: 'Belarus' },
    { value: 'bz', label: 'Belize' },
    { value: 'be', label: 'Belgium' },
    { value: 'bj', label: 'Benin' },
    { value: 'bm', label: 'Bermuda' },
    { value: 'bg', label: 'Bulgaria' },
    { value: 'bo', label: 'Bolivia' },
    { value: 'bq', label: 'Bonaire, Sint Eustatius and Saba' },
    { value: 'ba', label: 'Bosnia and Herzegovina' },
    { value: 'bw', label: 'Botswana' },
    { value: 'br', label: 'Brazil' },
    { value: 'io', label: 'British Indian Ocean Territory' },
    { value: 'bn', label: 'Brunei' },
    { value: 'bf', label: 'Burkina Faso' },
    { value: 'bi', label: 'Burundi' },
    { value: 'bt', label: 'Bhutan' },
    { value: 'vu', label: 'Vanuatu' },
    { value: 'va', label: 'Vatican City' },
    { value: 'hu', label: 'Hungary' },
    { value: 've', label: 'Venezuela' },
    { value: 'vi', label: 'U.S. Virgin Islands' },
    { value: 'vg', label: 'British Virgin Islands' },
    { value: 'tl', label: 'East Timor' },
    { value: 'vn', label: 'Vietnam' },
    { value: 'ga', label: 'Gabon' },
    { value: 'ht', label: 'Haiti' },
    { value: 'gy', label: 'Guyana' },
    { value: 'gm', label: 'Gambia' },
    { value: 'gh', label: 'Ghana' },
    { value: 'gp', label: 'Guadeloupe' },
    { value: 'gt', label: 'Guatemala' },
    { value: 'gn', label: 'Guinea' },
    { value: 'gw', label: 'Guinea-Bissau' },
    { value: 'de', label: 'Germany' },
    { value: 'gg', label: 'Guernsey' },
    { value: 'gi', label: 'Gibraltar' },
    { value: 'hn', label: 'Honduras' },
    { value: 'hk', label: 'Hong Kong (SAR)' },
    { value: 'gd', label: 'Grenada' },
    { value: 'gl', label: 'Greenland' },
    { value: 'gr', label: 'Greece' },
    { value: 'ge', label: 'Georgia' },
    { value: 'gu', label: 'Guam' },
    { value: 'dk', label: 'Denmark' },
    { value: 'je', label: 'Jersey' },
    { value: 'dj', label: 'Djibouti' },
    { value: 'dm', label: 'Dominica' },
    { value: 'do', label: 'Dominican Republic' },
    { value: 'eg', label: 'Egypt' },
    { value: 'zm', label: 'Zambia' },
    { value: 'zw', label: 'Zimbabwe' },
    { value: 'il', label: 'Israel' },
    { value: 'in', label: 'India' },
    { value: 'id', label: 'Indonesia' },
    { value: 'jo', label: 'Jordan' },
    { value: 'iq', label: 'Iraq' },
    { value: 'ir', label: 'Iran' },
    { value: 'ie', label: 'Ireland' },
    { value: 'is', label: 'Iceland' },
    { value: 'es', label: 'Spain' },
    { value: 'it', label: 'Italy' },
    { value: 'ye', label: 'Yemen' },
    { value: 'cv', label: 'Cape Verde' },
    { value: 'kz', label: 'Kazakhstan' },
    { value: 'kh', label: 'Cambodia' },
    { value: 'cm', label: 'Cameroon' },
    { value: 'ca', label: 'Canada' },
    { value: 'qa', label: 'Qatar' },
    { value: 'ke', label: 'Kenya' },
    { value: 'cy', label: 'Cyprus' },
    { value: 'kg', label: 'Kyrgyzstan' },
    { value: 'ki', label: 'Kiribati' },
    { value: 'cc', label: 'Cocos Islands' },
    { value: 'cn', label: 'China' },
    { value: 'co', label: 'Colombia' },
    { value: 'km', label: 'Comoros' },
    { value: 'cg', label: 'Republic of the Congo' },
    { value: 'cd', label: 'Democratic Republic of the Congo' },
    { value: 'kp', label: 'North Korea' },
    { value: 'xk', label: 'Kosovo' },
    { value: 'cr', label: 'Costa Rica' },
    { value: 'ci', label: 'Ivory Coast' },
    { value: 'cu', label: 'Cuba' },
    { value: 'kw', label: 'Kuwait' },
    { value: 'cw', label: 'Curacao' },
    { value: 'la', label: 'Laos' },
    { value: 'lv', label: 'Latvia' },
    { value: 'ls', label: 'Lesotho' },
    { value: 'lr', label: 'Liberia' },
    { value: 'lb', label: 'Lebanon' },
    { value: 'ly', label: 'Libya' },
    { value: 'lt', label: 'Lithuania' },
    { value: 'li', label: 'Liechtenstein' },
    { value: 'lu', label: 'Luxembourg' },
    { value: 'mu', label: 'Mauritius' },
    { value: 'mr', label: 'Mauritania' },
    { value: 'mg', label: 'Madagascar' },
    { value: 'yt', label: 'Mayotte' },
    { value: 'mo', label: 'Macau (SAR)' },
    { value: 'mw', label: 'Malawi' },
    { value: 'my', label: 'Malaysia' },
    { value: 'ml', label: 'Mali' },
    { value: 'mv', label: 'Maldives' },
    { value: 'mt', label: 'Malta' },
    { value: 'ma', label: 'Morocco' },
    { value: 'mq', label: 'Martinique' },
    { value: 'mh', label: 'Marshall Islands' },
    { value: 'mx', label: 'Mexico' },
    { value: 'mz', label: 'Mozambique' },
    { value: 'md', label: 'Moldova' },
    { value: 'mc', label: 'Monaco' },
    { value: 'mn', label: 'Mongolia' },
    { value: 'ms', label: 'Montserrat' },
    { value: 'mm', label: 'Myanmar' },
    { value: 'na', label: 'Namibia' },
    { value: 'nr', label: 'Nauru' },
    { value: 'np', label: 'Nepal' },
    { value: 'ne', label: 'Niger' },
    { value: 'ng', label: 'Nigeria' },
    { value: 'nl', label: 'Netherlands' },
    { value: 'ni', label: 'Nicaragua' },
    { value: 'nu', label: 'Niue' },
    { value: 'nz', label: 'New Zealand' },
    { value: 'nc', label: 'New Caledonia' },
    { value: 'no', label: 'Norway' },
    { value: 'bv', label: 'Bouvet Island' },
    { value: 'im', label: 'Isle Of Man' },
    { value: 'nf', label: 'Norfolk Island' },
    { value: 'cx', label: 'Christmas Island' },
    { value: 'sh', label: 'Saint Helena' },
    { value: 'pn', label: 'Pitcairn Islands' },
    { value: 'tc', label: 'Turks and Caicos Islands' },
    { value: 'ae', label: 'United Arab Emirates' },
    { value: 'om', label: 'Oman' },
    { value: 'ky', label: 'Cayman Islands' },
    { value: 'ck', label: 'Cook Islands' },
    { value: 'pk', label: 'Pakistan' },
    { value: 'pw', label: 'Palau' },
    { value: 'ps', label: 'Palestine' },
    { value: 'pa', label: 'Panama' },
    { value: 'pg', label: 'Papua New Guinea' },
    { value: 'py', label: 'Paraguay' },
    { value: 'pe', label: 'Peru' },
    { value: 'pl', label: 'Poland' },
    { value: 'pt', label: 'Portugal' },
    { value: 'pr', label: 'Puerto Rico' },
    { value: 'kr', label: 'South Korea' },
    { value: 're', label: 'Reunion' },
    { value: 'ru', label: 'Russian Federation' },
    { value: 'rw', label: 'Rwanda' },
    { value: 'ro', label: 'Romania' },
    { value: 'sv', label: 'El Salvador' },
    { value: 'ws', label: 'Samoa' },
    { value: 'sm', label: 'San Marino' },
    { value: 'st', label: 'Sao Tome and Principe' },
    { value: 'sa', label: 'Saudi Arabia' },
    { value: 'gb-nir', label: 'Northern Ireland' },
    { value: 'mk', label: 'North Macedonia' },
    { value: 'mp', label: 'Northern Mariana Islands' },
    { value: 'sc', label: 'Seychelles' },
    { value: 'bl', label: 'Saint Barthelemy' },
    { value: 'mf', label: 'Saint Martin' },
    { value: 'pm', label: 'Saint Pierre and Miquelon' },
    { value: 'sn', label: 'Senegal' },
    { value: 'vc', label: 'Saint Vincent and the Grenadines' },
    { value: 'kn', label: 'Saint Kitts and Nevis' },
    { value: 'lc', label: 'Saint Lucia' },
    { value: 'rs', label: 'Serbia' },
    { value: 'sg', label: 'Singapore' },
    { value: 'sx', label: 'Sint Maarten' },
    { value: 'sk', label: 'Slovakia' },
    { value: 'si', label: 'Slovenia' },
    { value: 'us', label: 'United States of America' },
    { value: 'sb', label: 'Solomon islands' },
    { value: 'so', label: 'Somalia' },
    { value: 'sd', label: 'Sudan' },
    { value: 'sr', label: 'Suriname' },
    { value: 'sl', label: 'Sierra Leone' },
    { value: 'tj', label: 'Tajikistan' },
    { value: 'th', label: 'Thailand' },
    { value: 'tw', label: 'Taiwan' },
    { value: 'tz', label: 'Tanzania' },
    { value: 'tg', label: 'Togo' },
    { value: 'tk', label: 'Tokelau' },
    { value: 'to', label: 'Tonga' },
    { value: 'tt', label: 'Trinidad and Tobago' },
    { value: 'tv', label: 'Tuvalu' },
    { value: 'tn', label: 'Tunisia' },
    { value: 'tm', label: 'Turkmenistan' },
    { value: 'tr', label: 'Turkey' },
    { value: 'ug', label: 'Uganda' },
    { value: 'uz', label: 'Uzbekistan' },
    { value: 'ua', label: 'Ukraine' },
    { value: 'wf', label: 'Wallis and Futuna' },
    { value: 'uy', label: 'Uruguay' },
    { value: 'gb-wls', label: 'Wales' },
    { value: 'fo', label: 'Faroe Islands' },
    { value: 'fm', label: 'Federated States of Micronesia' },
    { value: 'fj', label: 'Fiji' },
    { value: 'ph', label: 'Philippines' },
    { value: 'fi', label: 'Finland' },
    { value: 'fk', label: 'Falkland Islands' },
    { value: 'fr', label: 'France' },
    { value: 'gf', label: 'French Guiana' },
    { value: 'pf', label: 'French Polynesia' },
    { value: 'hr', label: 'Croatia' },
    { value: 'cf', label: 'Central African Republic' },
    { value: 'td', label: 'Chad' },
    { value: 'me', label: 'Montenegro' },
    { value: 'cz', label: 'Czech' },
    { value: 'cl', label: 'Chile' },
    { value: 'ch', label: 'Switzerland' },
    { value: 'se', label: 'Sweden' },
    { value: 'gb-sct', label: 'Scotland' },
    { value: 'lk', label: 'Sri Lanka' },
    { value: 'ec', label: 'Ecuador' },
    { value: 'gq', label: 'Equatorial Guinea' },
    { value: 'er', label: 'Eritrea' },
    { value: 'sz', label: 'Eswatini' },
    { value: 'ee', label: 'Estonia' },
    { value: 'et', label: 'Ethiopia' },
    { value: 'gs', label: 'South Georgia and the South Sandwich Islands' },
    { value: 'za', label: 'Republic of South Africa' },
    { value: 'ss', label: 'South Sudan' },
    { value: 'jm', label: 'Jamaica' },
    { value: 'jp', label: 'Japan' },
  ],

  languages:[
    {value:"ru", label:"Русский - Russian"},
    {value:"uk", label:"Українська мова - Ukrainian"},
    {value:"en-us", label:"English"},
  ]
};
