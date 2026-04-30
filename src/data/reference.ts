// Reference data: countries, national exams, majors, universities database.

export interface Country {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRIES: Country[] = [
  { code: "KZ", name: "Казахстан", flag: "🇰🇿" },
  { code: "RU", name: "Россия", flag: "🇷🇺" },
  { code: "BY", name: "Беларусь", flag: "🇧🇾" },
  { code: "UA", name: "Украина", flag: "🇺🇦" },
  { code: "UZ", name: "Узбекистан", flag: "🇺🇿" },
  { code: "KG", name: "Кыргызстан", flag: "🇰🇬" },
  { code: "AZ", name: "Азербайджан", flag: "🇦🇿" },
  { code: "AM", name: "Армения", flag: "🇦🇲" },
  { code: "GE", name: "Грузия", flag: "🇬🇪" },
  { code: "MD", name: "Молдова", flag: "🇲🇩" },
  { code: "TJ", name: "Таджикистан", flag: "🇹🇯" },
  { code: "TM", name: "Туркменистан", flag: "🇹🇲" },
  { code: "US", name: "США", flag: "🇺🇸" },
  { code: "GB", name: "Великобритания", flag: "🇬🇧" },
  { code: "DE", name: "Германия", flag: "🇩🇪" },
  { code: "FR", name: "Франция", flag: "🇫🇷" },
  { code: "IT", name: "Италия", flag: "🇮🇹" },
  { code: "ES", name: "Испания", flag: "🇪🇸" },
  { code: "NL", name: "Нидерланды", flag: "🇳🇱" },
  { code: "BE", name: "Бельгия", flag: "🇧🇪" },
  { code: "CH", name: "Швейцария", flag: "🇨🇭" },
  { code: "AT", name: "Австрия", flag: "🇦🇹" },
  { code: "SE", name: "Швеция", flag: "🇸🇪" },
  { code: "NO", name: "Норвегия", flag: "🇳🇴" },
  { code: "FI", name: "Финляндия", flag: "🇫🇮" },
  { code: "DK", name: "Дания", flag: "🇩🇰" },
  { code: "IE", name: "Ирландия", flag: "🇮🇪" },
  { code: "PT", name: "Португалия", flag: "🇵🇹" },
  { code: "PL", name: "Польша", flag: "🇵🇱" },
  { code: "CZ", name: "Чехия", flag: "🇨🇿" },
  { code: "HU", name: "Венгрия", flag: "🇭🇺" },
  { code: "GR", name: "Греция", flag: "🇬🇷" },
  { code: "TR", name: "Турция", flag: "🇹🇷" },
  { code: "CA", name: "Канада", flag: "🇨🇦" },
  { code: "MX", name: "Мексика", flag: "🇲🇽" },
  { code: "BR", name: "Бразилия", flag: "🇧🇷" },
  { code: "AR", name: "Аргентина", flag: "🇦🇷" },
  { code: "CL", name: "Чили", flag: "🇨🇱" },
  { code: "AU", name: "Австралия", flag: "🇦🇺" },
  { code: "NZ", name: "Новая Зеландия", flag: "🇳🇿" },
  { code: "JP", name: "Япония", flag: "🇯🇵" },
  { code: "KR", name: "Южная Корея", flag: "🇰🇷" },
  { code: "CN", name: "Китай", flag: "🇨🇳" },
  { code: "HK", name: "Гонконг", flag: "🇭🇰" },
  { code: "SG", name: "Сингапур", flag: "🇸🇬" },
  { code: "MY", name: "Малайзия", flag: "🇲🇾" },
  { code: "TH", name: "Таиланд", flag: "🇹🇭" },
  { code: "VN", name: "Вьетнам", flag: "🇻🇳" },
  { code: "IN", name: "Индия", flag: "🇮🇳" },
  { code: "PK", name: "Пакистан", flag: "🇵🇰" },
  { code: "BD", name: "Бангладеш", flag: "🇧🇩" },
  { code: "AE", name: "ОАЭ", flag: "🇦🇪" },
  { code: "SA", name: "Саудовская Аравия", flag: "🇸🇦" },
  { code: "QA", name: "Катар", flag: "🇶🇦" },
  { code: "IL", name: "Израиль", flag: "🇮🇱" },
  { code: "EG", name: "Египет", flag: "🇪🇬" },
  { code: "ZA", name: "ЮАР", flag: "🇿🇦" },
  { code: "NG", name: "Нигерия", flag: "🇳🇬" },
  { code: "KE", name: "Кения", flag: "🇰🇪" },
  { code: "MA", name: "Марокко", flag: "🇲🇦" },
];

export function flagFor(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.flag || "🏳️";
}

export function countryName(code: string): string {
  return COUNTRIES.find((c) => c.code === code)?.name || code;
}

// National exams by country
export interface NationalExam {
  name: string;
  max: number;
  hint: string;
  betterLower?: boolean;
}

export const NATIONAL_EXAM: Record<string, NationalExam> = {
  KZ: { name: "ЕНТ", max: 140, hint: "Максимум 140 баллов" },
  RU: { name: "ЕГЭ", max: 400, hint: "Сумма 3 предметов, максимум 400" },
  BY: { name: "ЦТ", max: 400, hint: "Сумма 4 предметов" },
  UA: { name: "ЗНО", max: 200, hint: "Шкала 100–200" },
  UZ: { name: "ВНО", max: 189, hint: "Максимум 189 баллов" },
  DE: { name: "Abitur", max: 4, hint: "Шкала 1.0–4.0, лучше — меньше", betterLower: true },
  GB: { name: "A-Levels", max: 100, hint: "AAA* — лучший результат" },
  US: { name: "GPA", max: 4, hint: "Шкала 4.0" },
  CA: { name: "GPA", max: 4, hint: "Шкала 4.0" },
  FR: { name: "Baccalauréat", max: 20, hint: "Шкала 0–20" },
  NL: { name: "VWO", max: 10, hint: "Шкала 1–10" },
  AU: { name: "ATAR", max: 99.95, hint: "Шкала 0–99.95" },
  KR: { name: "Suneung (CSAT)", max: 500, hint: "Сумма по предметам" },
  JP: { name: "Center Exam", max: 900, hint: "Максимум 900" },
  CN: { name: "Gaokao", max: 750, hint: "Шкала 0–750" },
  AE: { name: "EmSAT", max: 1900, hint: "Шкала 500–1900" },
  IN: { name: "12th Board / JEE", max: 100, hint: "% по аттестату" },
  TR: { name: "YKS", max: 500, hint: "Шкала 100–500" },
};

export function examFor(country: string): NationalExam {
  return (
    NATIONAL_EXAM[country] || {
      name: "Custom",
      max: 100,
      hint: "Введи свои баллы",
    }
  );
}

// Convert national score to GPA / SAT estimate.
export function convertScore(country: string, score: number | null): { gpa: number | null; sat: number | null; pct: number | null } {
  if (score == null || isNaN(score)) return { gpa: null, sat: null, pct: null };
  const exam = examFor(country);
  let pct: number;
  if (exam.betterLower) {
    pct = Math.max(0, Math.min(100, ((exam.max - score) / (exam.max - 1)) * 100));
  } else {
    pct = Math.max(0, Math.min(100, (score / exam.max) * 100));
  }
  const gpa = Math.round((1 + (pct / 100) * 3) * 10) / 10; // 1.0–4.0
  const sat = Math.round(400 + (pct / 100) * 1200);
  return { gpa, sat, pct: Math.round(pct) };
}

export const MAJORS = [
  "Computer Science",
  "Software Engineering",
  "Data Science",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Business Administration",
  "Finance",
  "Economics",
  "Medicine",
  "Pharmacy",
  "Law",
  "Architecture",
  "Design",
  "Mathematics",
  "Physics",
  "Psychology",
  "International Relations",
  "Journalism",
  "Education",
  "Other",
];

export const BUDGETS = [
  { value: "any", label: "Любой" },
  { value: "scholarships_only", label: "Только стипендии" },
  { value: "20k", label: "До $20 000/год" },
  { value: "40k", label: "До $40 000/год" },
  { value: "60k", label: "До $60 000/год" },
  { value: "60k_plus", label: "Более $60 000/год" },
];

export const GRADES = [
  { value: "9", label: "9 класс" },
  { value: "10", label: "10 класс" },
  { value: "11", label: "11 класс" },
  { value: "12", label: "12 класс" },
  { value: "bachelor_1", label: "Бакалавр 1 курс" },
  { value: "bachelor_2", label: "Бакалавр 2 курс" },
  { value: "bachelor_3", label: "Бакалавр 3 курс" },
  { value: "bachelor_4", label: "Бакалавр 4 курс" },
  { value: "gap_year", label: "Gap Year" },
];

// ----- Universities database (100 universities) -----
export interface UniversityRecord {
  id: string;
  name: string;
  country: string;
  countryFlag: string;
  city: string;
  minGpa: number;
  minSat: number;
  minIelts: number;
  tuitionUsd: number;
  hasScholarship: boolean;
  majors: string[];
  website: string;
}

const u = (
  name: string,
  country: string,
  city: string,
  minGpa: number,
  minSat: number,
  minIelts: number,
  tuitionUsd: number,
  hasScholarship: boolean,
  website: string
): UniversityRecord => ({
  id: `${country}-${name}`.toLowerCase().replace(/\s+/g, "-"),
  name,
  country,
  countryFlag: flagFor(country),
  city,
  minGpa,
  minSat,
  minIelts,
  tuitionUsd,
  hasScholarship,
  majors: ["Computer Science", "Engineering", "Business", "Mathematics"],
  website,
});

export const UNIVERSITIES: UniversityRecord[] = [
  // USA (25)
  u("MIT", "US", "Cambridge, MA", 3.9, 1520, 7.0, 57000, true, "https://mit.edu"),
  u("Stanford University", "US", "Stanford, CA", 3.9, 1500, 7.0, 56169, true, "https://stanford.edu"),
  u("Harvard University", "US", "Cambridge, MA", 3.9, 1510, 7.0, 54269, true, "https://harvard.edu"),
  u("Caltech", "US", "Pasadena, CA", 3.9, 1540, 7.0, 58680, true, "https://caltech.edu"),
  u("Princeton University", "US", "Princeton, NJ", 3.9, 1500, 7.0, 57410, true, "https://princeton.edu"),
  u("Columbia University", "US", "New York, NY", 3.8, 1490, 7.0, 63530, true, "https://columbia.edu"),
  u("University of Chicago", "US", "Chicago, IL", 3.8, 1490, 7.0, 62241, true, "https://uchicago.edu"),
  u("Yale University", "US", "New Haven, CT", 3.9, 1500, 7.0, 59950, true, "https://yale.edu"),
  u("UPenn", "US", "Philadelphia, PA", 3.8, 1480, 7.0, 63452, true, "https://upenn.edu"),
  u("Duke University", "US", "Durham, NC", 3.8, 1480, 7.0, 60488, true, "https://duke.edu"),
  u("Johns Hopkins University", "US", "Baltimore, MD", 3.8, 1470, 7.0, 57010, true, "https://jhu.edu"),
  u("Northwestern University", "US", "Evanston, IL", 3.8, 1480, 7.0, 60768, true, "https://northwestern.edu"),
  u("UC Berkeley", "US", "Berkeley, CA", 3.7, 1400, 7.0, 44066, true, "https://berkeley.edu"),
  u("UCLA", "US", "Los Angeles, CA", 3.7, 1390, 7.0, 42994, true, "https://ucla.edu"),
  u("Carnegie Mellon University", "US", "Pittsburgh, PA", 3.7, 1480, 7.0, 58924, true, "https://cmu.edu"),
  u("Cornell University", "US", "Ithaca, NY", 3.8, 1470, 7.0, 61015, true, "https://cornell.edu"),
  u("Dartmouth College", "US", "Hanover, NH", 3.8, 1470, 7.0, 61947, true, "https://dartmouth.edu"),
  u("Brown University", "US", "Providence, RI", 3.8, 1470, 7.0, 62304, true, "https://brown.edu"),
  u("Rice University", "US", "Houston, TX", 3.8, 1480, 7.0, 52009, true, "https://rice.edu"),
  u("Vanderbilt University", "US", "Nashville, TN", 3.7, 1460, 7.0, 58816, true, "https://vanderbilt.edu"),
  u("University of Michigan", "US", "Ann Arbor, MI", 3.7, 1400, 6.5, 52266, true, "https://umich.edu"),
  u("Georgetown University", "US", "Washington, DC", 3.7, 1430, 7.0, 59957, true, "https://georgetown.edu"),
  u("Tufts University", "US", "Medford, MA", 3.7, 1420, 7.0, 63804, true, "https://tufts.edu"),
  u("Boston University", "US", "Boston, MA", 3.5, 1340, 6.5, 58560, true, "https://bu.edu"),
  u("Purdue University", "US", "West Lafayette, IN", 3.4, 1270, 6.5, 28794, true, "https://purdue.edu"),

  // UK (15)
  u("University of Oxford", "GB", "Oxford", 3.9, 1500, 7.5, 28950, true, "https://ox.ac.uk"),
  u("University of Cambridge", "GB", "Cambridge", 3.9, 1500, 7.5, 27627, true, "https://cam.ac.uk"),
  u("Imperial College London", "GB", "London", 3.7, 1400, 6.5, 35100, true, "https://imperial.ac.uk"),
  u("UCL", "GB", "London", 3.5, 1300, 6.5, 28400, false, "https://ucl.ac.uk"),
  u("LSE", "GB", "London", 3.6, 1350, 7.0, 22430, true, "https://lse.ac.uk"),
  u("King's College London", "GB", "London", 3.4, 1280, 6.5, 21500, false, "https://kcl.ac.uk"),
  u("University of Edinburgh", "GB", "Edinburgh", 3.4, 1260, 6.5, 22800, true, "https://ed.ac.uk"),
  u("University of Manchester", "GB", "Manchester", 3.3, 1230, 6.5, 22000, true, "https://manchester.ac.uk"),
  u("University of Bristol", "GB", "Bristol", 3.3, 1220, 6.5, 20700, false, "https://bristol.ac.uk"),
  u("University of Warwick", "GB", "Coventry", 3.4, 1250, 6.5, 23020, true, "https://warwick.ac.uk"),
  u("Durham University", "GB", "Durham", 3.4, 1250, 6.5, 20250, false, "https://durham.ac.uk"),
  u("University of Glasgow", "GB", "Glasgow", 3.2, 1180, 6.0, 19450, true, "https://gla.ac.uk"),
  u("University of Birmingham", "GB", "Birmingham", 3.2, 1200, 6.0, 19890, false, "https://birmingham.ac.uk"),
  u("University of Leeds", "GB", "Leeds", 3.1, 1170, 6.0, 19250, false, "https://leeds.ac.uk"),
  u("University of Nottingham", "GB", "Nottingham", 3.1, 1160, 6.0, 18700, false, "https://nottingham.ac.uk"),

  // Germany (10)
  u("TU Munich", "DE", "Munich", 3.3, 1200, 6.0, 0, true, "https://tum.de"),
  u("LMU Munich", "DE", "Munich", 3.3, 1200, 6.0, 0, true, "https://lmu.de"),
  u("Heidelberg University", "DE", "Heidelberg", 3.2, 1150, 6.0, 0, true, "https://uni-heidelberg.de"),
  u("Humboldt University Berlin", "DE", "Berlin", 3.1, 1120, 6.0, 0, true, "https://hu-berlin.de"),
  u("RWTH Aachen University", "DE", "Aachen", 3.2, 1150, 6.0, 0, true, "https://rwth-aachen.de"),
  u("KIT", "DE", "Karlsruhe", 3.2, 1150, 6.0, 0, true, "https://kit.edu"),
  u("University of Freiburg", "DE", "Freiburg", 3.0, 1100, 5.5, 0, true, "https://uni-freiburg.de"),
  u("TU Berlin", "DE", "Berlin", 3.1, 1120, 6.0, 0, false, "https://tu.berlin"),
  u("University of Hamburg", "DE", "Hamburg", 3.0, 1080, 5.5, 0, false, "https://uni-hamburg.de"),
  u("University of Stuttgart", "DE", "Stuttgart", 3.1, 1100, 6.0, 0, true, "https://uni-stuttgart.de"),

  // Canada (8)
  u("University of Toronto", "CA", "Toronto", 3.6, 1320, 6.5, 40070, true, "https://utoronto.ca"),
  u("McGill University", "CA", "Montreal", 3.6, 1330, 6.5, 22000, true, "https://mcgill.ca"),
  u("UBC", "CA", "Vancouver", 3.5, 1290, 6.5, 38946, true, "https://ubc.ca"),
  u("University of Waterloo", "CA", "Waterloo", 3.5, 1300, 6.5, 41730, true, "https://uwaterloo.ca"),
  u("University of Alberta", "CA", "Edmonton", 3.3, 1200, 6.5, 28000, true, "https://ualberta.ca"),
  u("McMaster University", "CA", "Hamilton", 3.4, 1250, 6.5, 32000, true, "https://mcmaster.ca"),
  u("Queen's University", "CA", "Kingston", 3.5, 1290, 6.5, 35000, false, "https://queensu.ca"),
  u("Western University", "CA", "London, ON", 3.4, 1250, 6.5, 31000, false, "https://uwo.ca"),

  // Netherlands (6)
  u("TU Delft", "NL", "Delft", 3.4, 1260, 6.5, 15000, true, "https://tudelft.nl"),
  u("University of Amsterdam", "NL", "Amsterdam", 3.2, 1180, 6.0, 11168, true, "https://uva.nl"),
  u("TU Eindhoven", "NL", "Eindhoven", 3.2, 1170, 6.0, 10244, true, "https://tue.nl"),
  u("Leiden University", "NL", "Leiden", 3.2, 1180, 6.0, 11400, true, "https://universiteitleiden.nl"),
  u("Utrecht University", "NL", "Utrecht", 3.2, 1170, 6.0, 10800, false, "https://uu.nl"),
  u("University of Groningen", "NL", "Groningen", 3.0, 1100, 6.0, 9800, false, "https://rug.nl"),

  // Switzerland (4)
  u("ETH Zurich", "CH", "Zurich", 3.8, 1450, 7.0, 1460, true, "https://ethz.ch"),
  u("EPFL", "CH", "Lausanne", 3.8, 1450, 7.0, 1460, true, "https://epfl.ch"),
  u("University of Zurich", "CH", "Zurich", 3.4, 1250, 6.5, 1400, true, "https://uzh.ch"),
  u("University of Basel", "CH", "Basel", 3.2, 1180, 6.0, 1350, false, "https://unibas.ch"),

  // Australia (6)
  u("ANU", "AU", "Canberra", 3.5, 1290, 6.5, 42000, true, "https://anu.edu.au"),
  u("University of Melbourne", "AU", "Melbourne", 3.5, 1290, 6.5, 40000, true, "https://unimelb.edu.au"),
  u("University of Sydney", "AU", "Sydney", 3.4, 1260, 6.5, 39000, true, "https://sydney.edu.au"),
  u("University of Queensland", "AU", "Brisbane", 3.3, 1220, 6.5, 36000, true, "https://uq.edu.au"),
  u("Monash University", "AU", "Melbourne", 3.3, 1210, 6.0, 35000, true, "https://monash.edu"),
  u("UNSW", "AU", "Sydney", 3.4, 1250, 6.5, 38000, true, "https://unsw.edu.au"),

  // Singapore (2)
  u("NUS", "SG", "Singapore", 3.7, 1400, 6.5, 17550, true, "https://nus.edu.sg"),
  u("NTU", "SG", "Singapore", 3.6, 1380, 6.5, 16450, true, "https://ntu.edu.sg"),

  // South Korea (3)
  u("KAIST", "KR", "Daejeon", 3.5, 1350, 6.5, 5000, true, "https://kaist.ac.kr"),
  u("Seoul National University", "KR", "Seoul", 3.6, 1370, 6.5, 5500, true, "https://snu.ac.kr"),
  u("POSTECH", "KR", "Pohang", 3.5, 1340, 6.5, 5000, true, "https://postech.ac.kr"),

  // Japan (3)
  u("University of Tokyo", "JP", "Tokyo", 3.7, 1400, 6.5, 5000, true, "https://u-tokyo.ac.jp"),
  u("Kyoto University", "JP", "Kyoto", 3.6, 1370, 6.5, 4900, true, "https://kyoto-u.ac.jp"),
  u("Osaka University", "JP", "Osaka", 3.4, 1250, 6.0, 4800, true, "https://osaka-u.ac.jp"),

  // UAE (2)
  u("NYU Abu Dhabi", "AE", "Abu Dhabi", 3.8, 1440, 7.0, 0, true, "https://nyuad.nyu.edu"),
  u("Khalifa University", "AE", "Abu Dhabi", 3.4, 1250, 6.0, 0, true, "https://ku.ac.ae"),

  // France (4)
  u("Sciences Po", "FR", "Paris", 3.5, 1280, 7.0, 13540, true, "https://sciencespo.fr"),
  u("École Polytechnique", "FR", "Palaiseau", 3.8, 1450, 7.0, 12000, true, "https://polytechnique.edu"),
  u("HEC Paris", "FR", "Jouy-en-Josas", 3.6, 1350, 7.0, 45000, true, "https://hec.edu"),
  u("ESSEC Business School", "FR", "Cergy", 3.4, 1280, 6.5, 35000, true, "https://essec.edu"),

  // Sweden (3)
  u("KTH", "SE", "Stockholm", 3.3, 1200, 6.5, 14000, true, "https://kth.se"),
  u("Uppsala University", "SE", "Uppsala", 3.2, 1170, 6.0, 13000, true, "https://uu.se"),
  u("Lund University", "SE", "Lund", 3.2, 1160, 6.0, 13500, false, "https://lu.se"),

  // Austria (2)
  u("TU Wien", "AT", "Vienna", 3.2, 1180, 6.0, 1500, true, "https://tuwien.at"),
  u("University of Vienna", "AT", "Vienna", 3.1, 1150, 6.0, 1500, false, "https://univie.ac.at"),

  // Czech Republic (2)
  u("Charles University Prague", "CZ", "Prague", 3.0, 1100, 6.0, 4000, true, "https://cuni.cz"),
  u("Czech Technical University", "CZ", "Prague", 3.0, 1090, 5.5, 3500, false, "https://cvut.cz"),

  // China (2)
  u("Peking University", "CN", "Beijing", 3.7, 1390, 6.5, 4600, true, "https://pku.edu.cn"),
  u("Tsinghua University", "CN", "Beijing", 3.8, 1420, 6.5, 4800, true, "https://tsinghua.edu.cn"),

  // Italy (2)
  u("Politecnico di Milano", "IT", "Milan", 3.2, 1170, 6.0, 4000, true, "https://polimi.it"),
  u("University of Bologna", "IT", "Bologna", 3.0, 1100, 5.5, 3000, true, "https://unibo.it"),

  // Finland (1)
  u("Aalto University", "FI", "Espoo", 3.3, 1200, 6.5, 15000, true, "https://aalto.fi"),
];

// Chance calculation
export function calculateChance(
  user: { gpa: number | null; sat: number | null; ielts: number | null },
  uni: { minGpa: number; minSat: number; minIelts: number }
): { chancePercent: number; tier: "safety" | "match" | "reach" } {
  let score = 0;
  let weight = 0;
  if (user.gpa && uni.minGpa) {
    score += Math.min((user.gpa / uni.minGpa) * 40, 40);
    weight += 40;
  }
  if (user.sat && uni.minSat) {
    score += Math.min((user.sat / uni.minSat) * 35, 35);
    weight += 35;
  }
  if (user.ielts && uni.minIelts) {
    score += Math.min((user.ielts / uni.minIelts) * 25, 25);
    weight += 25;
  }
  // Normalize if not all categories provided
  const chancePercent = weight > 0 ? Math.min(Math.round((score / weight) * 100), 99) : 50;
  const tier: "safety" | "match" | "reach" =
    chancePercent > 70 ? "safety" : chancePercent >= 40 ? "match" : "reach";
  return { chancePercent, tier };
}
