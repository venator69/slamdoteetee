export const siteLinks = {
  driftCorrectorRepo:
    "https://github.com/venator69/ORBSLAM3-Drift-Corrector-module",
  howItWorksVideoId: "xsKft9Mwxcg",
  specificationsVideoId: "OXoEv5bC7MU",
} as const;

export type ContactPerson = {
  name: string;
  detail: string;
  email: string;
};

export const contacts = {
  developedBy: {
    heading: "Developed by",
    people: [
      {
        name: "Dennis Hubert",
        detail: "Student ID: 13222018",
        email: "dennishubert69420@gmail.com",
      },
      {
        name: "Bianca Chiquita",
        detail: "Student ID: 13222092",
        email: "13222092@std.itb.ac.id",
      },
    ],
  },
  supervisedBy: {
    heading: "Supervised by",
    people: [
      {
        name: "Nana Sutisna, S.T., M.T., Ph.D.",
        detail: "Microelectronics Research Group",
        email: "nana.sutisna@stei.itb.ac.id",
      },
      {
        name: "Ishak Hilton Pujantoro Tnunay, Ph.D.",
        detail: "Control and Computer Systems Research Group",
        email: "hilton.tnunay@itb.ac.id",
      },
      {
        name: "Anggera Bayuwindra, S.T., M.T., Ph.D.",
        detail: "Control and Computer Systems Research Group",
        email: "bayuwindra@itb.ac.id",
      },
    ],
  },
} as const;
