/**
 * Data dan tipe untuk size guide. Dipakai bersama oleh halaman
 * `/size-guide` dan modal size guide di halaman detail produk
 * (`app/product/[id]/page.tsx`) supaya keduanya selalu identik.
 */

export interface SizeRow {
  label: string;
  values: string[];
}

export interface SizeGuideVariation {
  id: string;
  label: string;
  title: string;
  subtitle: string;
  caption: string;
  tableTitle: string;
  rows: SizeRow[];
}

export const GUIDE_SIZES = ["S", "M", "L", "XL", "XXL"] as const;

export const MEASUREMENT_NOTE =
  "All measurements in centimeters. Between sizes? Choose the larger size.";

export const SIZE_GUIDES: SizeGuideVariation[] = [
  {
    id: "standard",
    label: "Standard Apparel",
    title: "Standard Apparel Size Guide",
    subtitle: "Tops, Outerwear & Bottoms",
    caption: "Standard apparel size guide, sizes S through XXL",
    tableTitle: "Standard Apparel Measurements",
    rows: [
      { label: "Shoulder", values: ["38", "39", "40", "41", "42"] },
      { label: "Bust", values: ["92", "96", "100", "104", "108"] },
      { label: "Waist", values: ["72", "76", "80", "84", "88"] },
      { label: "Hips", values: ["98", "102", "106", "110", "114"] },
      { label: "Arm Length", values: ["57", "58", "59", "60", "61"] },
      { label: "Arm Hole", values: ["46.5", "48", "49.5", "51", "52.5"] },
    ],
  },
  {
    id: "dress",
    label: "Dress Collection",
    title: "Dress Collection Size Guide",
    subtitle: "Maxi, Midi & Shifting Silhouettes",
    caption: "Dress collection modest fit size guide, sizes S through XXL",
    tableTitle: "Dress (Modest Fit) Measurements",
    rows: [
      { label: "Lingkar Dada (Bust)", values: ["88 - 92", "92 - 96", "96 - 100", "100 - 106", "106 - 112"] },
      { label: "Lingkar Pinggang (Waist)", values: ["72 - 76", "76 - 80", "80 - 84", "84 - 90", "90 - 96"] },
      { label: "Lingkar Panggul (Hips)", values: ["96 - 100", "100 - 104", "104 - 108", "108 - 114", "114 - 120"] },
      { label: "Panjang Bahu (Shoulder)", values: ["37", "38", "39", "40", "41 - 42"] },
      { label: "Lingkar Ketiak (Armhole)", values: ["44 - 46", "46 - 48", "48 - 50", "50 - 52", "52 - 55"] },
      { label: "Lingkar Lengan Atas (Upper Arm)", values: ["30 - 32", "32 - 34", "34 - 36", "36 - 38", "38 - 42"] },
      { label: "Panjang Tangan (Arm Length)", values: ["55", "56", "57", "58", "59"] },
      { label: "Panjang Baju (Dress Length)", values: ["138", "140", "140", "142", "142 - 145"] },
    ],
  },
  {
    id: "kebaya",
    label: "Kebaya & Traditional",
    title: "Kebaya & Traditional Size Guide",
    subtitle: "Modern Cut & Bespoke Heritage",
    caption: "Kebaya slim fit size guide, sizes S through XXL",
    tableTitle: "Kebaya (Slim Fit) Measurements",
    rows: [
      { label: "Lingkar Dada Utama (Bust)", values: ["84 - 86", "88 - 90", "92 - 94", "96 - 100", "102 - 106"] },
      { label: "Lingkar Dada Atas (Upper Bust)", values: ["80 - 82", "84 - 86", "88 - 90", "92 - 96", "98 - 102"] },
      { label: "Lingkar Dada Bawah (Underbust)", values: ["68 - 72", "72 - 76", "76 - 80", "80 - 86", "86 - 92"] },
      { label: "Lingkar Pinggang (Waist)", values: ["66 - 68", "70 - 72", "74 - 76", "78 - 82", "84 - 88"] },
      { label: "Lingkar Panggul (Hips)", values: ["88 - 92", "92 - 96", "96 - 100", "100 - 106", "106 - 112"] },
      { label: "Panjang Bahu (Shoulder)", values: ["36", "37", "38", "39", "40 - 41"] },
      { label: "Lebar Punggung (Back Width)", values: ["33 - 34", "34 - 35", "35 - 36", "36 - 38", "38 - 40"] },
      { label: "Lebar Dada Atas (Upper Bust Width)", values: ["31 - 32", "32 - 33", "33 - 34", "34 - 36", "36 - 38"] },
      { label: "Lingkar Ketiak (Armhole)", values: ["42", "44", "46", "48 - 50", "50 - 52"] },
      { label: "Lingkar Lengan Atas (Upper Arm)", values: ["28", "30", "32", "34 - 36", "36 - 38"] },
      { label: "Panjang Tangan (Arm Length)", values: ["54", "55", "56", "57", "58"] },
      { label: "Lingkar Pergelangan (Wrist)", values: ["16", "17", "18", "19", "20"] },
      { label: "Lingkar Leher (Neck)", values: ["34 - 35", "35 - 36", "36 - 37", "37 - 38", "39 - 40"] },
      { label: "Panjang Badan (Body Length)", values: ["37 - 38", "38 - 39", "39 - 40", "40 - 41", "41 - 42"] },
      { label: "Panjang Baju Kebaya (Kebaya Length)", values: ["85 - 90", "90 - 95", "95 - 100", "100", "100"] },
    ],
  },
];

export const MEASURE_POINTS = [
  {
    label: "Bust",
    text: "Measure around the fullest part of your chest, keeping the tape level across your shoulder blades.",
  },
  {
    label: "Waist",
    text: "Measure the narrowest part of your torso, just above the navel, without pulling tight.",
  },
  {
    label: "Hips",
    text: "Measure around the fullest part of your hips and glutes, keeping your feet together.",
  },
  {
    label: "Length",
    text: "For garment length, measure from the top of the shoulder down to your desired hem.",
  },
];
