/**
 * All of the choir's website content lives in this one file.
 *
 * When the publicity team sends updates (events, songs, photos, leaders),
 * this is the only file that needs editing. Any field set to `null` or an
 * empty list is simply hidden on the site until it is filled in.
 */

export type Leader = {
  name: string;
  title: string;
  /** Path under /public, e.g. "/photos/leaders/director.jpg" */
  photo: string | null;
};

export type ChoirEvent = {
  title: string;
  /** ISO date, e.g. "2026-12-20" */
  date: string;
  time: string | null;
  venue: string;
  description: string | null;
};

export type Video = {
  /** The ID from a YouTube link: youtube.com/watch?v=THIS_PART */
  youtubeId: string;
  title: string;
};

export type Photo = {
  /** Path under /public, e.g. "/photos/gallery/easter-2026.jpg" */
  src: string;
  alt: string;
};

export const site = {
  name: "Melodies of Praise",
  shortName: "MOP",
  church: "The Church of Pentecost",
  assembly: "Lapaz Central",
  foundedYear: 2016,
  tagline: "Ministering in song to bless the body of Christ",
  url: "https://melodiesofpraise.vercel.app",

  mission:
    "To minister Christian songs that bless the body of Christ, win souls, and bring glory to the name of our Lord Jesus Christ.",
  vision:
    "To bring together men and women with a passion for music, serving God through praise and worship within the district, the area and beyond.",

  scripture: {
    text: "Sing to him, sing praise to him; tell of all his wonderful acts.",
    reference: "Psalm 105:2",
  },

  /** Photos behind the title at the top of each page (About and Visit Us use the dashboard's banner photo). */
  pageBanners: {
    events: { src: "/photos/hero/choir-ministering-purple.jpg", alt: "Melodies of Praise ministering on stage" },
    music: { src: "/photos/hero/choir-worship-lights.jpg", alt: "The choir and band in worship" },
    join: { src: "/photos/group/choir-group-mop-shirts.jpg", alt: "Melodies of Praise members together on stage" },
    bookings: { src: "/photos/hero/choir-ministering-blue.jpg", alt: "The choir ministering under blue stage lights" },
    outreach: { src: "/photos/group/choir-group-mop-shirts.jpg", alt: "Melodies of Praise members together" },
    give: { src: "/photos/hero/choir-ministering-purple.jpg", alt: "Melodies of Praise ministering on stage" },
    news: { src: "/photos/hero/choir-ministering-blue.jpg", alt: "The choir ministering under blue stage lights" },
    gallery: { src: "/photos/hero/choir-worship-lights.jpg", alt: "The choir and band in worship" },
  },

  /** Photos shown side by side behind maroon bands (5 each looks best). */
  photoBands: {
    /** Behind the scripture verse on the home page */
    verse: [
      "/photos/leaders/benjamin-boateng-asamoah.jpg",
      "/photos/leaders/isaac-mari-ntiamoah.jpg",
      "/photos/leaders/susanna-ofori.jpg",
      "/photos/leaders/lawrence-frimpong.jpg",
      "/photos/leaders/esther-frimpong.jpg",
    ],
    /** Behind Mission & Vision on the About page (the home-page set, so no face repeats on About) */
    missionVision: [
      "/photos/leaders/benjamin-boateng-asamoah.jpg",
      "/photos/leaders/isaac-mari-ntiamoah.jpg",
      "/photos/leaders/susanna-ofori.jpg",
      "/photos/leaders/lawrence-frimpong.jpg",
      "/photos/leaders/esther-frimpong.jpg",
    ],
    /** Behind "Minister with us" at the end of the About page */
    ministerWithUs: [
      "/photos/leaders/elder-micaiah-kofi-tsibuah.jpg",
      "/photos/leaders/deborah-hammond.jpg",
      "/photos/leaders/josephine-ocran.jpg",
      "/photos/leaders/david-tetteh.jpg",
      "/photos/leaders/daniel-asare-asamoah.jpg",
    ],
  },

  history: [
    "Melodies of Praise, popularly known as MOP, is a singing group within The Church of Pentecost, established with a passion for ministering Christian songs to bless the body of Christ, win souls, and bring glory to the name of our Lord Jesus Christ.",
    "The choir has been in existence since 2016, when it was established by our former Asofo Maame, Dorothy Nyame, with the support and assistance of Pastor Patrick Nyame. It was formed as a district choir with the vision of bringing together individuals with a passion and interest in music to serve God through praise and worship.",
    "Over the years, God has been faithful to us. We are particularly grateful to our Patron, Elder Micaiah Kofi Tsibuah, who has been a strong pillar of support to the choir. His encouragement and commitment have contributed significantly to our growth and development, and we sincerely appreciate his continuous support.",
    "In 2020, following the arrival of Pastor Emmanuel Oppong-Kyeremah, we introduced Melodies of Praise to him, and we are grateful that he warmly received us and has continued to support our vision and activities.",
    "Through the grace of God and the support of our leaders, MOP has grown into a vibrant choir, making an impact not only within the district but also across the area and beyond.",
  ],

  milestones: [
    { year: "2016", text: "Founded as a district choir by Asofo Maame Dorothy Nyame, with Pastor Patrick Nyame." },
    { year: "2020", text: "Warmly received by Pastor Emmanuel Oppong-Kyeremah, who continues to support our vision." },
    { year: "Area", text: "Winners of the area-level music competition." },
    { year: "Media", text: "Featured on Pent Vars and ministered on platforms within and beyond the area." },
  ],

  /** Leadership, in display order. `photo: null` shows the person's initials until a photo is added. */
  leaders: [
    { name: "Elder Micaiah Kofi Tsibuah", title: "Patron", photo: "/photos/leaders/elder-micaiah-kofi-tsibuah.jpg" },
    { name: "Mr. Benjamin Boateng Asamoah", title: "President", photo: "/photos/leaders/benjamin-boateng-asamoah.jpg" },
    { name: "Mr. Isaac Mari Ntiamoah", title: "Music Director", photo: "/photos/leaders/isaac-mari-ntiamoah.jpg" },
    { name: "Mrs. Susanna Ofori", title: "Assistant Music Director", photo: "/photos/leaders/susanna-ofori.jpg" },
    { name: "Mr. Lawrence Frimpong", title: "Assistant Music Director", photo: "/photos/leaders/lawrence-frimpong.jpg" },
    { name: "Miss Deborah Hammond", title: "General Secretary", photo: "/photos/leaders/deborah-hammond.jpg" },
    { name: "Miss Josephine Ocran", title: "Welfare", photo: "/photos/leaders/josephine-ocran.jpg" },
    { name: "Mr. David Tetteh", title: "Organizing Secretary", photo: "/photos/leaders/david-tetteh.jpg" },
    { name: "Mr. Daniel Asare Asamoah", title: "Prayer Secretary", photo: "/photos/leaders/daniel-asare-asamoah.jpg" },
    { name: "Miss Esther Frimpong", title: "Head of Publicity", photo: "/photos/leaders/esther-frimpong.jpg" },
    { name: "Mrs. Ruth Asamoah", title: "Head of Costume", photo: "/photos/leaders/ruth-asamoah.jpg" },
    { name: "Miss Esther Sowah", title: "Executive Member", photo: "/photos/leaders/esther-sowah.jpg" },
  ] as Leader[],

  rehearsal: {
    day: "Sundays",
    time: "6:00 pm",
    venue: "Lapaz Central Auditorium",
  },

  contact: {
    /** Public phone line for visitors, e.g. "024 000 0000". */
    phone: null as string | null,
    /** WhatsApp number in international form without "+", e.g. "233240000000". */
    whatsapp: null as string | null,
    email: null as string | null,
    address: "The Church of Pentecost, Lapaz Central Auditorium, Lapaz, Accra",
    mapQuery: "Church of Pentecost Lapaz Central, Accra",
  },

  social: {
    youtube: "https://www.youtube.com/@melodiesofpraiseofficial",
    instagram: "https://www.instagram.com/melodies.of.praise",
    facebook: "https://www.facebook.com/share/18RQWDDM66/",
    tiktok: "https://www.tiktok.com/@melodies.of.praise",
  },

  donation: {
    network: "MTN Mobile Money",
    number: "0249567621",
    accountName: "Benjamin Boateng Asamoah",
    note: "Please use “MOP” plus your name as the reference so we can thank you.",
  },

  /** Join Us requirements still to be confirmed by the choir. Hidden while null. */
  join: {
    minimumAge: null as number | null,
    monthlyDues: null as string | null,
    probation: null as string | null,
  },

  /**
   * Photos that slide behind the logo on the home page (3–6 is ideal).
   * Wide, landscape shots work best, e.g. the full choir in robes.
   * If left empty, the first five gallery photos are used.
   */
  heroSlides: [
    { src: "/photos/hero/choir-ministering-purple.jpg", alt: "Melodies of Praise ministering on stage in matching attire" },
    { src: "/photos/hero/choir-ministering-blue.jpg", alt: "The choir worshipping under blue stage lights, led by a soloist" },
    { src: "/photos/hero/choir-worship-lights.jpg", alt: "Choir members singing with hands raised in worship" },
    { src: "/photos/group/choir-group-mop-shirts.jpg", alt: "Melodies of Praise members together on stage in MOP shirts" },
  ] as Photo[],

  /** Group photo used behind the Our Story and Visit Us page banners. */
  groupPhoto: {
    src: "/photos/group/choir-group-mop-shirts.jpg",
    alt: "Melodies of Praise members together on stage in MOP shirts",
  } as Photo,

  events: [] as ChoirEvent[],
  videos: [] as Video[],

  /** Short phone videos hosted on the site itself (portrait), shown on the Music page. */
  clips: [
    {
      src: "/videos/live-ministration-lapaz-central.mp4",
      poster: "/videos/live-ministration-lapaz-central.jpg",
      title: "Live ministration at Lapaz Central",
      credit: null as string | null,
    },
    {
      src: "/videos/behind-the-scenes.mp4",
      poster: "/videos/behind-the-scenes.jpg",
      title: "Behind the scenes",
      credit: "Video: Gospel Concept Channel",
    },
  ],
  photos: [] as Photo[],
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/news", label: "News" },
  { href: "/music", label: "Music" },
  { href: "/events", label: "Events" },
  { href: "/outreach", label: "Outreach" },
  { href: "/gallery", label: "Gallery" },
  { href: "/join", label: "Join Us" },
  { href: "/bookings", label: "Bookings" },
  { href: "/donate", label: "Donate" },
  { href: "/contact", label: "Contact" },
];
