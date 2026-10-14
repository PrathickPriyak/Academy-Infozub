/** Static site facts from academy.infozub.com — do not invent values. */

export const site = {
  name: "Infozub Digital Academy",
  shortName: "Infozub",
  tagline: "Quality Education for Everyone",
  /** Rotating hero taglines — typed in the home banner (published academy messaging). */
  heroTypewriterPhrases: [
    "Quality Education for Everyone",
    "Practical digital skills that stick",
    "Hands-on learning with certificates",
    "Learn anytime, on any device",
  ],
  description:
    "Infozub Digital Academy courses are designed to equip you with the skills and knowledge to succeed in the digital realm.",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://academy.infozub.com",
  email: "academy@infozub.com",
  phone: "+91 93 22 33 88 22",
  phoneHref: "tel:+919322338822",
  offices: {
    registered: {
      label: "Registered Office",
      lines: [
        "INFOZUB Private Limited",
        "271 A3, Chinnaiyah Garden, Kosavampalayam Road",
        "Palladam – 641664",
      ],
    },
    corporate: {
      label: "Corporate Office",
      lines: [
        "INFOZUB Private Limited",
        "2nd Floor, Alagendira Towers, Bungalow Stop",
        "Tiruppur – 641602",
      ],
    },
  },
  social: [
    { label: "Facebook", href: "https://www.facebook.com/InfozubDigitalAcademy" },
    { label: "Instagram", href: "https://www.instagram.com/infozubdigitalacademy/" },
    { label: "X", href: "https://twitter.com/InfozubAcademy" },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/infozub-digital-academy/" },
    { label: "YouTube", href: "https://www.youtube.com/@InfozubDigitalAcademy" },
  ],
  companySite: "https://infozub.com/",
  lms: "https://courses.infozub.com/",
} as const;

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/courses#categories", label: "Categories" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const audiences = [
  {
    title: "Digital marketers",
    text: "Who want a higher-paying job in digital marketing by learning advanced skills.",
  },
  {
    title: "Traditional marketers",
    text: "Who want to transition their careers into the most in-demand digital marketing space.",
  },
  {
    title: "Students / Freshers",
    text: "Who want to kickstart a successful career in Digital Marketing.",
  },
  {
    title: "Business Owners",
    text: "Who want to learn the skills to drive leads and sales for their businesses and manage agencies better.",
  },
  {
    title: "Freelancers",
    text: "Who want to grow their freelance business and charge a premium by offering broader digital services.",
  },
  {
    title: "Anyone learning",
    text: "Who is interested in digital marketing and wants to stay ahead in the digital world.",
  },
] as const;

export const highlights = [
  "Updated strategies",
  "Certificate on completion from INFOZUB",
  "Hands-on learning",
  "Community group",
  "Step-by-step training",
  "Learn on any device",
] as const;

export const founder = {
  name: "Logesh Kumar",
  title: "Founder of INFOZUB",
  story: [
    "Logesh noticed a significant loophole in the education system—outdated syllabi that lacked real-time applications.",
    "He followed his passion and worked in a digital marketing agency in the UK. In 2013, he gave shape to INFOZUB.",
    "With more than ten years of experience, he has handled B2B, B2C, and D2C businesses and more than 200 digital marketing projects.",
  ],
  stats: [
    { label: "Years of digital experience", value: "10+" },
    { label: "Digital marketing projects handled", value: "200+" },
    { label: "Leads generated in last 12 months", value: "170,000+" },
    { label: "Ad impressions in last 12 months", value: "47,000,000+" },
  ],
} as const;

export const testimonials = [
  {
    name: "Menaga",
    quote:
      "Mentors are not just experts in their field, but they are also genuinely passionate about teaching and making a difference in the lives of their students.",
  },
  {
    name: "Vignesh",
    quote:
      "The course has given me the tools and knowledge I need to excel in my chosen field and has prepared me for the challenges of the real world.",
  },
  {
    name: "Sathish",
    quote:
      "Logesh Kumar has been a very impressive mentor so far with lots and lots of knowledge on this respective area into this workshop. Thank you INFOZUB Digital Academy.",
  },
  {
    name: "Subash",
    quote:
      "The course has helped me in understanding very minute details of social media marketing—from account and page creation to posting, connecting Instagram and Facebook, and running ads.",
  },
] as const;

export const refundSummary = {
  headline: "Not satisfied with our course?",
  body: "If you are not satisfied with our course within 07 days of purchase, we offer a complete refund. Eligibility also requires that you have not completed more than 20% of the course content.",
  href: "/refund",
} as const;

/** About-page copy grounded in academy.infozub.com / catalog platform notes. */
export const aboutContent = {
  introduction: [
    "INFOZUB Digital Academy describes itself as quality education for everyone.",
    "Courses are designed to equip you with the skills and knowledge to succeed in the digital realm, helping people navigate the digital landscape.",
    "The academy is built from INFOZUB’s digital marketing customer experience, with learning access delivered through courses.infozub.com after purchase.",
  ],
  background: [
    "INFOZUB started in May 2013, after a technology blog during engineering became a digital marketing company.",
    "Logesh noticed a significant loophole in the education system—outdated syllabi that lacked real-time applications.",
    "He followed his passion and worked in a digital marketing agency in the UK. In 2013, he gave shape to INFOZUB.",
    "With more than ten years of experience, he has handled B2B, B2C, and D2C businesses and more than 200 digital marketing projects.",
  ],
  /** Published positioning — not an invented corporate manifesto. */
  mission: {
    title: "Mission",
    text: "Quality Education for Everyone — practical digital skills through Infozub Digital Academy courses designed for real-world application.",
  },
  vision: {
    title: "Vision",
    text: "Help learners navigate the digital landscape with updated strategies, hands-on training, and certificates on completion from INFOZUB.",
  },
  philosophy: {
    title: "Training philosophy",
    text: "INFOZUB is a digital marketing company with 10+ years of experience, and the academy is built from that customer experience—prioritizing real-time applications over outdated syllabi.",
  },
  started: "May 2013",
} as const;
