import { Curriculum, SchoolLevel, SchoolType, type Prisma } from "@prisma/client";

/**
 * Curated school records. Type, level, curriculum, founding year, ratio,
 * graduate destinations, and achievements come from the project's school
 * research sheet. Districts, addresses, websites, and accreditation were
 * added only where a public source confirms them (school sites, Wikipedia):
 * leave a field out rather than guess.
 *
 * Addresses and Mongolian names for the 13 private/international schools
 * come from the project owner (2026-10-08). Map coordinates are
 * OpenStreetMap matches checked against those addresses; a school without
 * coordinates simply has no pin yet. `locationApproximate` marks a pin
 * placed from a landmark rather than the school's own building.
 * `emailDomains` lists who may review: verified users whose email is on
 * one of these domains (or a subdomain). Empty = reviews closed.
 *
 * nameMn is left out where no official Mongolian name is known. The live
 * database fills those with nameEn (older deployments required a value);
 * the UI hides a Mongolian name that just repeats the English one.
 *
 * Re-run safely with `npm run db:import` — records are matched on nameEn.
 */
type SchoolSeed = Omit<Prisma.SchoolCreateInput, "aimagCity"> & { aimagCity?: string };

const { INTERNATIONAL, PRIVATE, PUBLIC } = SchoolType;
const { K12, HIGH } = SchoolLevel;
const { IB, CAMBRIDGE, DUAL_LANGUAGE, MONGOLIAN_NATIONAL, AP } = Curriculum;

export const SCHOOLS: SchoolSeed[] = [
  {
    nameEn: "International School of Ulaanbaatar",
    nameMn: "Олон улсын Улаанбаатар сургууль",
    district: "Khan-Uul",
    khoroo: "18",
    address: "Four Seasons Garden хотхон",
    latitude: 47.89862,
    longitude: 106.93049,
    emailDomains: ["isumongolia.edu.mn"],
    type: INTERNATIONAL,
    level: K12,
    curriculum: [IB],
    teachingLanguages: ["en"],
    foundedYear: 1992,
    studentTeacherRatio: "~7:1",
    phone: "+976 7016 0010",
    website: "https://www.isumongolia.edu.mn",
    accreditation: "IB World School — Mongolia's first",
    // Earlier placeholder figures, not real fees.
    tuitionMinAnnual: null,
    tuitionMaxAnnual: null,
    graduateDestinations: ["Harvard", "Stanford", "Oxford", "Cambridge", "Columbia", "NYU"],
    notableAchievements: [
      "IB диплом 45/45 оноо",
      "Ivy League элсэлтүүд",
      "Олон улсын урлаг/STEM тэмцээнүүд",
    ],
  },
  {
    nameEn: "American School of Ulaanbaatar",
    nameMn: "Америк сургууль",
    district: "Khan-Uul",
    khoroo: "11",
    address: "Зайсангийн тойруу 42",
    latitude: 47.88106,
    longitude: 106.9196,
    emailDomains: ["asu.edu.mn"],
    type: INTERNATIONAL,
    level: K12,
    curriculum: [DUAL_LANGUAGE],
    teachingLanguages: ["en", "mn"],
    foundedYear: 2006,
    studentTeacherRatio: "~10:1",
    website: "https://www.asu.edu.mn",
    accreditation: "WASC (Western Association of Schools and Colleges)",
    graduateDestinations: ["UC Berkeley", "UCLA", "NYU", "University of Toronto", "UBC"],
    notableAchievements: [
      "SAT 1500+ оноотнууд",
      "AP Scholars",
      "АНУ-ын их сургуулиудын тэтгэлгүүд",
    ],
  },
  {
    nameEn: "British School of Ulaanbaatar",
    nameMn: "Улаанбаатар дахь Британийн сургууль",
    district: "Khan-Uul",
    khoroo: "23",
    address: "Наадамчдын зам 50",
    latitude: 47.87439,
    longitude: 106.84843,
    emailDomains: ["britishschool.edu.mn"],
    type: INTERNATIONAL,
    level: K12,
    curriculum: [CAMBRIDGE],
    teachingLanguages: ["en"],
    foundedYear: 2010,
    studentTeacherRatio: "~12:1",
    phone: "+976 7004 7788",
    email: "admission@britishschool.edu.mn",
    website: "https://www.britishschool.edu.mn",
    graduateDestinations: ["Imperial College London", "UCL", "King's College London", "Cambridge"],
    notableAchievements: [
      "Cambridge “Top in the World / Country” шагналтнууд",
      "A-Level өндөр оноо",
    ],
  },
  {
    nameEn: "The English School of Mongolia",
    nameMn: "Монголын Англи сургууль",
    district: "Bayanzurkh",
    khoroo: "1",
    address: "Токио гудамж 89",
    latitude: 47.92791,
    longitude: 106.93418,
    emailDomains: ["esm.edu.mn"],
    type: INTERNATIONAL,
    level: K12,
    curriculum: [CAMBRIDGE, IB],
    teachingLanguages: ["en"],
    foundedYear: 2011,
    studentTeacherRatio: "~13:1",
    website: "https://esm.edu.mn",
    graduateDestinations: ["Cambridge", "Imperial College London", "University of Melbourne", "UK/US тэтгэлэгтүүд"],
    notableAchievements: [
      "Дэлхийн сурагчдын дебатын АШТ",
      "Cambridge/IB Honor roll",
    ],
  },
  {
    nameEn: "Orchlon International School",
    nameMn: "Орчлон олон улсын сургууль",
    district: "Khan-Uul",
    khoroo: "15",
    latitude: 47.90154,
    longitude: 106.92624,
    type: INTERNATIONAL,
    level: K12,
    curriculum: [CAMBRIDGE],
    teachingLanguages: ["en", "mn"],
    foundedYear: 2001,
    studentTeacherRatio: "~10:1",
    graduateDestinations: ["MIT", "Harvard", "Stanford", "Oxford", "Cambridge", "Ivy League"],
    notableAchievements: [
      "Олон улсын Математик (IMO), Физик (IPhO), Биологийн олимпиадын медалиуд",
    ],
  },
  {
    nameEn: "Shine Mongol School",
    nameMn: "Шинэ Монгол сургууль",
    district: "Bayanzurkh",
    khoroo: "25",
    address: "Туслах зам 47",
    latitude: 47.91119,
    longitude: 106.93886,
    type: PRIVATE,
    level: K12,
    curriculum: [DUAL_LANGUAGE, MONGOLIAN_NATIONAL],
    teachingLanguages: ["mn", "ja"],
    foundedYear: 2000,
    studentTeacherRatio: "~15:1",
    graduateDestinations: ["Токиогийн их сургууль", "Киото", "TITech", "Waseda", "МУИС"],
    notableAchievements: [
      "Япон улсын Засгийн газрын (MEXT) тэтгэлэгтний тоогоор тэргүүлэгч",
      "Улсын олимпиадын медалиуд",
    ],
  },
  {
    nameEn: "Shine Mongol Harumafuji School",
    nameMn: "Шинэ Монгол Харүмафүжи сургууль",
    district: "Khan-Uul",
    khoroo: "24",
    address: "Наадамчдын зам 480",
    latitude: 47.87572,
    longitude: 106.85005,
    type: PRIVATE,
    level: K12,
    curriculum: [DUAL_LANGUAGE, MONGOLIAN_NATIONAL],
    teachingLanguages: ["mn", "ja"],
    foundedYear: 2018,
    studentTeacherRatio: "~12:1",
    graduateDestinations: ["Японы их дээд сургуулиуд", "MEXT тэтгэлэг", "МУИС", "ШУТИС"],
    notableAchievements: [
      "MEXT тэтгэлэг",
      "Улсын чанартай олимпиад болон спортын тэмцээний шагналууд",
    ],
  },
  {
    nameEn: "Sant School",
    nameMn: "Сант сургууль",
    district: "Sukhbaatar",
    khoroo: "2",
    address: "Усны гудамж 23",
    latitude: 47.90907,
    longitude: 106.90768,
    type: PRIVATE,
    level: K12,
    curriculum: [MONGOLIAN_NATIONAL, AP],
    teachingLanguages: ["mn", "en"],
    foundedYear: 1992,
    studentTeacherRatio: "~15:1",
    graduateDestinations: ["MIT", "Harvard", "Stanford", "Caltech", "Ivy League", "Top Tech Unis"],
    notableAchievements: [
      "Монгол улсын IMO, IPhO, IOI, IChO олон улсын олимпиадын хамгийн олон медалиуд",
    ],
  },
  {
    nameEn: "English School of Ulaanbaatar",
    district: "Khan-Uul",
    khoroo: "23",
    address: "Арцатын гудамж",
    type: PRIVATE,
    level: K12,
    curriculum: [CAMBRIDGE],
    teachingLanguages: ["en", "mn"],
    foundedYear: 2016,
    studentTeacherRatio: "~12:1",
    graduateDestinations: ["Их Британи", "АНУ", "Европын сургуулиуд", "Дотоодын сургуулиуд"],
    notableAchievements: [
      "Cambridge A-Level өндөр амжилтууд",
      "Англи хэлний илтгэл/дебатын олимпиадууд",
    ],
  },
  {
    nameEn: "Australian Smart School of Ulaanbaatar",
    district: "Sukhbaatar",
    khoroo: "4",
    address: "Энхтайваны өргөн чөлөө",
    latitude: 47.91524,
    longitude: 106.90151,
    locationApproximate: true,
    type: INTERNATIONAL,
    level: K12,
    curriculum: [DUAL_LANGUAGE],
    teachingLanguages: ["en", "mn"],
    foundedYear: 2021,
    studentTeacherRatio: "~10:1",
    graduateDestinations: ["University of Sydney", "University of Melbourne", "Азийн сургуулиуд"],
    notableAchievements: [
      "Австрали хөтөлбөрийн сертификат",
      "Гадаад хэл, академик тэмцээний амжилтууд",
    ],
  },
  {
    nameEn: "Human International School",
    district: "Khan-Uul",
    khoroo: "11",
    address: "Ар Зайсангийн гудамж 122/4",
    latitude: 47.87103,
    longitude: 106.91068,
    type: INTERNATIONAL,
    level: K12,
    curriculum: [DUAL_LANGUAGE],
    teachingLanguages: ["en", "mn"],
    foundedYear: 2015,
    studentTeacherRatio: "~10:1",
    graduateDestinations: ["АНУ", "Солонгос", "Японы сургуулиуд", "Дотоодын их дээд сургуулиуд"],
    notableAchievements: [
      "Гадаад хэлний түвшин тогтоох шалгалтуудын өндөр оноо",
      "Дүүрэг/нийслэлийн олимпиадууд",
    ],
  },
  {
    nameEn: "Huleg International School",
    nameMn: "Хүлэг олон улсын сургууль",
    district: "Khan-Uul",
    khoroo: "23",
    address: "Арцатын ам",
    type: INTERNATIONAL,
    level: K12,
    curriculum: [DUAL_LANGUAGE],
    teachingLanguages: ["en", "mn"],
    foundedYear: 2021,
    studentTeacherRatio: "~10:1",
    graduateDestinations: ["Турк", "Хятад", "Солонгос", "АНУ-ын сургуулиуд"],
    notableAchievements: [
      "Роботик, програмчлалын тэмцээнүүд",
      "Гадаад хэлний олимпиадууд",
    ],
  },
  {
    nameEn: "New Century Leadership International School",
    district: "Sukhbaatar",
    khoroo: "11",
    address: "Ногоон нуур 51",
    type: INTERNATIONAL,
    level: K12,
    curriculum: [DUAL_LANGUAGE],
    teachingLanguages: ["en", "mn"],
    foundedYear: 2012,
    studentTeacherRatio: "~12:1",
    graduateDestinations: ["АНУ", "Ази", "Европын сургуулиуд", "МУИС"],
    notableAchievements: [
      "Model UN шилдэг төлөөлөгчид",
      "Залуучуудын манлайллын хөтөлбөрийн шагналууд",
    ],
  },
  {
    nameEn: "Ulaanbaatar Elite International School",
    type: INTERNATIONAL,
    level: K12,
    curriculum: [CAMBRIDGE],
    teachingLanguages: ["en", "mn"],
    foundedYear: 2005,
    studentTeacherRatio: "~11:1",
    graduateDestinations: ["АНУ", "Европ", "Турк", "Азийн сургуулиуд"],
    notableAchievements: [
      "Genius Olympiad, ISWEEEP, Туймаада олон улсын STEM олимпиадын медалиуд",
    ],
  },
  {
    nameEn: "Mongol Aspiration International School",
    emailDomains: ["mongolaspiration.edu.mn"],
    type: INTERNATIONAL,
    // Grades 9–12 per the school's public profile.
    level: HIGH,
    curriculum: [CAMBRIDGE],
    teachingLanguages: ["en", "mn"],
    foundedYear: 2011,
    studentTeacherRatio: "~10:1",
    district: "Bayanzurkh",
    website: "https://mongolaspiration.edu.mn",
    accreditation: "International Laboratory School of the Ministry of Education",
    graduateDestinations: ["Cambridge", "Топ UK/US/Asian сургуулиуд", "МУИС"],
    notableAchievements: [
      "Улсын олимпиадын медалиуд",
      "Cambridge A-Level онцлох амжилтууд",
    ],
  },
  publicSchool(15, 1962, ["МУИС", "ШУТИС", "АШУҮИС", "Орос/Хятадын Засгийн газрын тэтгэлэг"], [
    "Дүүрэг, нийслэлийн олимпиадын медалиуд",
    "Улсын спортын амжилтууд",
  ]),
  publicSchool(18, 1957, ["МУИС", "ШУТИС", "АШУҮИС", "Орос, Хятад, Унгарын тэтгэлэг"], [
    "Улсын хичээлийн олимпиадын шагналууд",
    "Нийслэлийн тэмцээнүүд",
  ]),
  publicSchool(5, 1938, ["МУИС", "ШУТИС", "Гадаадын Засгийн газрын тэтгэлэгт хөтөлбөрүүд"], [
    "Дүүрэг болон Нийслэлийн эрдэм шинжилгээ, олимпиадын шагналууд",
  ]),
  publicSchool(14, 1951, ["МУИС", "ШУТИС", "Дотоодын их дээд сургуулиуд"], [
    "Нийслэлийн олимпиадын байрууд",
    "Урлаг спортын амжилтууд",
  ]),
  publicSchool(50, 1974, ["МУИС", "ШУТИС", "Дотоодын их дээд сургуулиуд"], [
    "Дүүргийн хичээлийн олимпиадууд",
    "Техникийн болон спортын уралдаанууд",
  ]),
  publicSchool(23, 1957, ["МУИС", "ШУТИС", "Орос, Хятад, АНУ-ын сургуулиуд"], [
    "Улсын гадаад хэлний (Орос, Англи) ба STEM олимпиадын аварга сургууль",
  ]),
  publicSchool(24, 1958, ["МУИС", "ШУТИС", "Дотоодын томоохон их сургуулиуд"], [
    "Нийслэлийн олимпиад",
    "Сурагчдын эрдэм шинжилгээний хурал тэргүүлэгч",
  ]),
];

function publicSchool(
  number: number,
  foundedYear: number,
  graduateDestinations: string[],
  notableAchievements: string[]
): SchoolSeed {
  return {
    nameEn: `School No. ${number}`,
    nameMn: `${number}-р сургууль`,
    schoolNumber: `No. ${number}`,
    type: PUBLIC,
    level: K12,
    curriculum: [MONGOLIAN_NATIONAL],
    teachingLanguages: ["mn"],
    foundedYear,
    studentTeacherRatio: "~25:1",
    graduateDestinations,
    notableAchievements,
  };
}
