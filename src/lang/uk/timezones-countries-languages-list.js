import date from 'handlers/date';

export default {
  timezones: [
    { value: 'local', utc: `${date.getCurrentTimezoneShortname()}`, label: `Локальный` },
    { value: 'Etc/GMT+12', utc: 'UTC -12:00', label: 'Линия перемены дат' },
    { value: 'Etc/GMT+11', utc: 'UTC -11:00', label: 'Время в формате UTC -11' },
    { value: 'Pacific/Honolulu', utc: 'UTC -10:00', label: 'Гавайи' },
    { value: 'America/Juneau', utc: 'UTC -09:00', label: 'Аляска' },
    {
      value: 'America/Dawson',
      utc: 'UTC -08:00',
      label: 'Тихоокеанское время (США и Канада), Тихуана',
    },
    { value: 'America/Mazatlan', utc: 'UTC -07:00', label: 'Ла Пас, Чиуауа, Масатлан, Наярит' },
    { value: 'America/Boise', utc: 'UTC -07:00', label: 'Горное время (США и Канада)' },
    { value: 'America/Phoenix', utc: 'UTC -07:00', label: 'Аризона' },
    { value: 'America/Mexico_City', utc: 'UTC -06:00', label: 'Гвадалахара, Мехико' },
    { value: 'America/Monterrey', utc: 'UTC -06:00', label: 'Монтеррей' },
    { value: 'Pacific/Easter', utc: 'UTC -06:00', label: 'о. Пасхи' },
    { value: 'America/Regina', utc: 'UTC -06:00', label: 'Саскачеван' },
    { value: 'America/Belize', utc: 'UTC -06:00', label: 'Центральная Америка' },
    { value: 'America/Chicago', utc: 'UTC -06:00', label: 'Центральное время (США и Канада)' },
    { value: 'America/Bogota', utc: 'UTC -05:00', label: 'Богота' },
    { value: 'America/Guayaquil', utc: 'UTC -05:00', label: 'Кито' },
    { value: 'America/Lima', utc: 'UTC -05:00', label: 'Лима' },
    { value: 'America/Cancun', utc: 'UTC -05:00', label: 'Четумаль' },
    { value: 'America/Detroit', utc: 'UTC -05:00', label: 'Восточное время (США и Канада)' },
    { value: 'America/Havana', utc: 'UTC -05:00', label: 'Гавана' },
    {
      value: 'America/Port-au-Prince',
      utc: 'UTC -05:00',
      label: 'Порт-о-Пренс, Острова Теркс и Кайкос',
    },
    { value: 'America/Indiana/Indianapolis', utc: 'UTC -05:00', label: 'Индиана (восток)' },
    { value: 'America/Asuncion', utc: 'UTC -04:00', label: 'Асунсьон' },
    { value: 'America/Glace_Bay', utc: 'UTC -04:00', label: 'Атлантическое время (Канада)' },
    { value: 'America/Caracas', utc: 'UTC -04:00', label: 'Каракас' },
    { value: 'America/Puerto_Rico', utc: 'UTC -04:00', label: 'Сан-Хуан (Пуэрто-Рико)' },
    { value: 'America/Guyana', utc: 'UTC -04:00', label: 'Джорджтаун (Гайана)' },
    { value: 'America/Santiago', utc: 'UTC -04:00', label: 'Сантьяго' },
    { value: 'America/Cuiaba', utc: 'UTC -04:00', label: 'Куяба' },
    { value: 'America/Manaus', utc: 'UTC -04:00', label: 'Манаус' },
    { value: 'America/St_Johns', utc: 'UTC -03:30', label: 'Ньюфаундленд' },
    { value: 'America/Araguaina', utc: 'UTC -03:00', label: 'Арагуаина' },
    { value: 'America/Sao_Paulo', utc: 'UTC -03:00', label: 'Бразилиа' },
    { value: 'America/Fortaleza', utc: 'UTC -03:00', label: 'Форталеза' },
    { value: 'America/Bahia', utc: 'UTC -03:00', label: 'Сальвадор' },
    { value: 'America/Argentina/Buenos_Aires', utc: 'UTC -03:00', label: 'Буэнос-Айрес' },
    { value: 'America/Godthab', utc: 'UTC -03:00', label: 'Гренландия' },
    { value: 'America/Cayenne', utc: 'UTC -03:00', label: 'Кайенна' },
    { value: 'America/Montevideo', utc: 'UTC -03:00', label: 'Монтевидео' },
    { value: 'America/Miquelon', utc: 'UTC -03:00', label: 'Сен-Пьер и Микелон' },
    { value: 'Etc/GMT+11', utc: 'UTC -02:00', label: 'Время в формате UTC -02' },
    { value: 'Atlantic/Azores', utc: 'UTC -01:00', label: 'Азорские острова' },
    { value: 'Atlantic/Cape_Verde', utc: 'UTC -01:00', label: 'Кабо-Верде' },
    { value: 'Etc/UTC', utc: 'UTC', label: 'Время в формате UTC' },
    { value: 'Europe/London', utc: 'UTC +00:00', label: 'Лондон, Эдинбург' },
    { value: 'Europe/Dublin', utc: 'UTC +00:00', label: 'Дублин' },
    { value: 'Europe/Lisbon', utc: 'UTC +00:00', label: 'Лиссабон' },
    { value: 'Africa/Monrovia', utc: 'UTC +00:00', label: 'Монровия, Рейкьявик, Сан-Томе' },
    { value: 'Africa/Casablanca', utc: 'UTC +01:00', label: 'Касабланка' },
    { value: 'Africa/Bangui', utc: 'UTC +01:00', label: 'Западная Центральная Африка' },
    { value: 'Europe/Amsterdam', utc: 'UTC +01:00', label: 'Амстердам' },
    { value: 'Europe/Berlin', utc: 'UTC +01:00', label: 'Берлин' },
    { value: 'Europe/Zurich', utc: 'UTC +01:00', label: 'Берн' },
    { value: 'Europe/Vienna', utc: 'UTC +01:00', label: 'Вена' },
    { value: 'Europe/Rome', utc: 'UTC +01:00', label: 'Рим' },
    { value: 'Europe/Stockholm', utc: 'UTC +01:00', label: 'Стокгольм' },
    { value: 'Europe/Belgrade', utc: 'UTC +01:00', label: 'Белград' },
    { value: 'Europe/Bratislava', utc: 'UTC +01:00', label: 'Братислава' },
    { value: 'Europe/Ljubljana', utc: 'UTC +01:00', label: 'Любляна' },
    { value: 'Europe/Budapest', utc: 'UTC +01:00', label: 'Будапешт' },
    { value: 'Europe/Prague', utc: 'UTC +01:00', label: 'Прага' },
    { value: 'Europe/Brussels', utc: 'UTC +01:00', label: 'Брюссель' },
    { value: 'Europe/Copenhagen', utc: 'UTC +01:00', label: 'Копенгаген' },
    { value: 'Europe/Madrid', utc: 'UTC +01:00', label: 'Мадрид' },
    { value: 'Europe/Paris', utc: 'UTC +01:00', label: 'Париж' },
    { value: 'Europe/Warsaw', utc: 'UTC +01:00', label: 'Варшава' },
    { value: 'Europe/Zagreb', utc: 'UTC +01:00', label: 'Загреб' },
    { value: 'Europe/Sarajevo', utc: 'UTC +01:00', label: 'Сараево' },
    { value: 'Europe/Skopje', utc: 'UTC +01:00', label: 'Скопье' },
    { value: 'Asia/Amman', utc: 'UTC +02:00', label: 'Амман' },
    { value: 'Europe/Athens', utc: 'UTC +02:00', label: 'Афины' },
    { value: 'Europe/Bucharest', utc: 'UTC +02:00', label: 'Бухарест' },
    { value: 'Asia/Beirut', utc: 'UTC +02:00', label: 'Бейрут' },
    { value: 'Europe/Vilnius', utc: 'UTC +02:00', label: 'Вильнюс' },
    { value: 'Europe/Kiev', utc: 'UTC +02:00', label: 'Киев' },
    { value: 'Europe/Riga', utc: 'UTC +02:00', label: 'Рига' },
    { value: 'Europe/Sofia', utc: 'UTC +02:00', label: 'София' },
    { value: 'Europe/Tallinn', utc: 'UTC +02:00', label: 'Таллин' },
    { value: 'Europe/Helsinki', utc: 'UTC +02:00', label: 'Хельсинки' },
    { value: 'Africa/Windhoek', utc: 'UTC +02:00', label: 'Виндхук' },
    { value: 'Asia/Damascus', utc: 'UTC +02:00', label: 'Дамаск' },
    { value: 'Asia/Jerusalem', utc: 'UTC +02:00', label: 'Иерусалим' },
    { value: 'Africa/Cairo', utc: 'UTC +02:00', label: 'Каир' },
    { value: 'Europe/Chisinau', utc: 'UTC +02:00', label: 'Кишинев' },
    { value: 'Asia/Hebron', utc: 'UTC +02:00', label: 'Сектор Газа, Хеврон' },
    { value: 'Africa/Tripoli', utc: 'UTC +02:00', label: 'Триполи' },
    { value: 'Africa/Harare', utc: 'UTC +02:00', label: 'Хараре' },
    { value: 'Africa/Johannesburg', utc: 'UTC +02:00', label: 'Претория' },
    { value: 'Africa/Khartoum', utc: 'UTC +02:00', label: 'Хартум' },
    { value: 'Europe/Kaliningrad', utc: 'UTC +02:00', label: 'Калининград' },
    { value: 'Europe/Moscow', utc: 'UTC +03:00', label: 'Москва' },
    { value: 'Europe/Minsk', utc: 'UTC +03:00', label: 'Минск' },
    { value: 'Asia/Baghdad', utc: 'UTC +03:00', label: 'Багдад' },
    { value: 'Asia/Kuwait', utc: 'UTC +03:00', label: 'Кувейт' },
    { value: 'Asia/Riyadh', utc: 'UTC +03:00', label: 'Эр-Рияд' },
    { value: 'Africa/Nairobi', utc: 'UTC +03:00', label: 'Найроби' },
    { value: 'Europe/Istanbul', utc: 'UTC +03:00', label: 'Стамбул' },
    { value: 'Asia/Tehran', utc: 'UTC +03:30', label: 'Тегеран' },
    { value: 'Asia/Dubai', utc: 'UTC +04:00', label: 'Абу-Даби' },
    { value: 'Asia/Muscat', utc: 'UTC +04:00', label: 'Маскат' },
    {
      value: 'Europe/Astrakhan',
      utc: 'UTC +04:00',
      label: 'Астрахань, Ульяновск, Волгоград, Саратов',
    },
    { value: 'Europe/Samara', utc: 'UTC +04:00', label: 'Самара, Ижевск' },
    { value: 'Asia/Yekaterinburg', utc: 'UTC +05:00', label: 'Екатеринбург' },
    { value: 'Asia/Baku', utc: 'UTC +04:00', label: 'Баку' },
    { value: 'Asia/Yerevan', utc: 'UTC +04:00', label: 'Ереван' },
    { value: 'Indian/Mauritius', utc: 'UTC +04:00', label: 'Порт-Луи' },
    { value: 'Asia/Tbilisi', utc: 'UTC +04:00', label: 'Тбилиси' },
    { value: 'Asia/Kabul', utc: 'UTC +04:30', label: 'Кабул' },
    { value: 'Asia/Ashgabat', utc: 'UTC +05:00', label: 'Ашхабад' },
    { value: 'Asia/Tashkent', utc: 'UTC +05:00', label: 'Ташкент' },
    { value: 'Asia/Karachi', utc: 'UTC +05:00', label: 'Исламабад, Карачи' },
    { value: 'Asia/Qyzylorda', utc: 'UTC +05:00', label: 'Кызылорда' },
    { value: 'Asia/Kolkata', utc: 'UTC +05:30', label: 'Колката, Мумбаи, Нью-Дели, Ченнай' },
    { value: 'Asia/Colombo', utc: 'UTC +05:30', label: 'Шри-Джаяварденепура-Котте' },
    { value: 'Asia/Kathmandu', utc: 'UTC +05:45', label: 'Катманду' },
    { value: 'Asia/Almaty', utc: 'UTC +06:00', label: 'Нур-Султан' },
    { value: 'Asia/Dhaka', utc: 'UTC +06:00', label: 'Дакка' },
    { value: 'Asia/Omsk', utc: 'UTC +06:00', label: 'Омск' },
    { value: 'Asia/Yangon', utc: 'UTC +06:30', label: 'Янгон' },
    { value: 'Asia/Ho_Chi_Minh', utc: 'UTC +07:00', label: 'Ханой' },
    { value: 'Asia/Jakarta', utc: 'UTC +07:00', label: 'Джакарта' },
    { value: 'Asia/Bangkok', utc: 'UTC +07:00', label: 'Бангкок' },
    { value: 'Asia/Hovd', utc: 'UTC +07:00', label: 'Ховд' },
    { value: 'Asia/Krasnoyarsk', utc: 'UTC +07:00', label: 'Красноярск' },
    { value: 'Asia/Krasnoyarsk', utc: 'UTC +07:00', label: 'Новосибирск' },
    { value: 'Asia/Irkutsk', utc: 'UTC +08:00', label: 'Иркутск, Бурятия' },
    { value: 'Asia/Hong_Kong', utc: 'UTC +08:00', label: 'Гонконг' },
    { value: 'Asia/Shanghai', utc: 'UTC +08:00', label: 'Шанхай, Пекин' },
    { value: 'Asia/Singapore', utc: 'UTC +08:00', label: 'Сингапур' },
    { value: 'Asia/Kuala_Lumpur', utc: 'UTC +08:00', label: 'Куала-Лумпур' },
    { value: 'Australia/Perth', utc: 'UTC +08:00', label: 'Перт' },
    { value: 'Asia/Taipei', utc: 'UTC +08:00', label: 'Тайбэй' },
    { value: 'Asia/Ulaanbaatar', utc: 'UTC +08:00', label: 'Улан-Батор' },
    { value: 'Australia/Eucla', utc: 'UTC +08:45', label: 'Западная Австралия(Юкла)' },
    { value: 'Asia/Tokyo', utc: 'UTC +09:00', label: 'Осака, Токио, Саппоро' },
    { value: 'Asia/Pyongyang', utc: 'UTC +09:00', label: 'Пхеньян' },
    { value: 'Asia/Seoul', utc: 'UTC +09:00', label: 'Сеул' },
    { value: 'Asia/Yakutsk', utc: 'UTC +09:00', label: 'Чита, Якутск' },
    { value: 'Australia/Adelaide', utc: 'UTC +09:30', label: 'Аделаида' },
    { value: 'Australia/Darwin', utc: 'UTC +09:30', label: 'Дарвин' },
    { value: 'Australia/Brisbane', utc: 'UTC +10:00', label: 'Брисбен' },
    { value: 'Australia/Sydney', utc: 'UTC +10:00', label: 'Канберра, Мельбурн, Сидней' },
    { value: 'Australia/Hobart', utc: 'UTC +10:00', label: 'Хобарт' },
    { value: 'Pacific/Guam', utc: 'UTC +10:00', label: 'Гуам' },
    { value: 'Pacific/Port_Moresby', utc: 'UTC +10:00', label: 'Порт-Морсби' },
    { value: 'Asia/Vladivostok', utc: 'UTC +10:00', label: 'Владивосток' },
    { value: 'Australia/Lord_Howe', utc: 'UTC +10:30', label: 'о. Лорд-Хау' },
    { value: 'Asia/Magadan', utc: 'UTC +11:00', label: 'Магадан' },
    { value: 'Asia/Sakhalin', utc: 'UTC +11:00', label: 'Сахалин' },
    { value: 'Pacific/Norfolk', utc: 'UTC +11:00', label: 'о. Норфолк' },
    { value: 'Pacific/Bougainville', utc: 'UTC +11:00', label: 'о. Бугенвиль' },
    {
      value: 'Pacific/Guadalcanal',
      utc: 'UTC +11:00',
      label: 'Соломоновы о-ва, Новая Каледония',
    },
    { value: 'Asia/Kamchatka', utc: 'UTC +12:00', label: 'Камчатка' },
    { value: 'Pacific/Auckland', utc: 'UTC +12:00', label: 'Окленд, Веллингтон' },
    { value: 'Etc/GMT-12', utc: 'UTC +12:00', label: 'Время в формате UTC+12' },
    { value: 'Pacific/Fiji', utc: 'UTC +12:00', label: 'Фиджи' },
    { value: 'Etc/GMT-13', utc: 'UTC +13:00', label: 'Время в формате UTC+13' },
    { value: 'Pacific/Tongatapu', utc: 'UTC +13:00', label: 'Нукуалофа' },
    { value: 'Pacific/Apia', utc: 'UTC +13:00', label: 'Самоа' },
    { value: 'Pacific/Kiritimati', utc: 'UTC +14:00', label: 'о. Киритимати' },
  ],
};