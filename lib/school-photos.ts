/**
 * Real photos of schools, keyed by School.nameEn.
 *
 * Only free-licensed photos from Wikimedia Commons, and only when the file's
 * own description or category names the school. Every photo must be shown
 * with its author and license (CC BY / CC BY-SA require it).
 *
 * Don't add photos from school websites, Facebook or Google Maps — they are
 * copyrighted. To add a school: upload a photo you took (or one the school
 * gave written permission for) to Commons, then add it here.
 *
 * Checked: 12 Nov 2026.
 */
export type SchoolPhoto = {
  /** Image URL (Commons thumbnail, ~960px wide). */
  url: string;
  /** Commons file page — link it from the credit. */
  page: string;
  author: string;
  license: string;
};

export const SCHOOL_PHOTOS: Record<string, SchoolPhoto> = {
  "First School of Ulaanbaatar": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/School_No_1_of_Ulaanbaatar.jpg/960px-School_No_1_of_Ulaanbaatar.jpg",
    page: "https://commons.wikimedia.org/wiki/File:School_No_1_of_Ulaanbaatar.jpg",
    author: "Chinneeb",
    license: "CC BY 4.0",
  },
  "Shine Mongol School": {
    url: "https://upload.wikimedia.org/wikipedia/commons/1/15/Shine-Mongol-Secondary-School_building.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Shine-Mongol-Secondary-School_building.jpg",
    author: "Battushig",
    license: "CC BY-SA 4.0",
  },
  "Shine Mongol Harumafuji School": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Shine_Mongol_Harumafuji_School_2026_02.jpg/960px-Shine_Mongol_Harumafuji_School_2026_02.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Shine_Mongol_Harumafuji_School_2026_02.jpg",
    author: "KQuhen",
    license: "CC BY-SA 4.0",
  },
  "Hobby School": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Hobby_School_of_Ulaanbaatar_building.jpg/960px-Hobby_School_of_Ulaanbaatar_building.jpg",
    page: "https://commons.wikimedia.org/wiki/File:Hobby_School_of_Ulaanbaatar_building.jpg",
    author: "Nemuun",
    license: "CC BY-SA 4.0",
  },
  "American School of Ulaanbaatar": {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/American_School_of_Ulaanbaatar.jpg/960px-American_School_of_Ulaanbaatar.jpg",
    page: "https://commons.wikimedia.org/wiki/File:American_School_of_Ulaanbaatar.jpg",
    author: "Asu2020",
    license: "CC BY-SA 4.0",
  },
};
