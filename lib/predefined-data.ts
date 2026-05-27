export interface OptionGroup {
  group: string;
  options: string[];
}

export const PROJECT_TYPE_OPTIONS: OptionGroup[] = [
  {
    group: "Digital & Tech",
    options: ["Web Development", "Mobile App", "SaaS / Web Platform", "E-commerce", "API & Backend", "DevOps & Infrastructure", "Data Engineering", "Cybersecurity"]
  },
  {
    group: "Design & Creative",
    options: ["Brand Identity", "UI/UX Design", "Motion Design", "Graphic Design", "Print & Publication", "Photography & Video", "3D & Visualization"]
  },
  {
    group: "Built Environment",
    options: ["Architecture", "Interior Design", "Landscape Design", "Construction Management", "Urban Planning", "Renovation"]
  },
  {
    group: "Strategy & Consulting",
    options: ["Marketing Campaign", "Business Consulting", "Data Analytics", "AI / ML Project", "Market Research", "SEO & Growth", "Training & Education"]
  }
];

export const CLIENT_INDUSTRY_OPTIONS: OptionGroup[] = [
  {
    group: "Technology",
    options: ["Software & SaaS", "IT Services", "Cybersecurity", "AI & Machine Learning", "Hardware & Electronics", "Telecom"]
  },
  {
    group: "Business & Finance",
    options: ["Finance & Banking", "Insurance", "Legal & Consulting", "Accounting & Audit", "Private Equity & VC", "Real Estate"]
  },
  {
    group: "Consumer & Retail",
    options: ["E-commerce & Retail", "Fashion & Lifestyle", "Food & Beverage", "Hospitality & Tourism", "Automotive", "Sports & Fitness"]
  },
  {
    group: "Public & Social",
    options: ["Healthcare & Medical", "Education & Training", "Non-profit & NGO", "Government & Public Sector", "Research & Academia"]
  },
  {
    group: "Creative & Media",
    options: ["Marketing & Advertising", "Media & Entertainment", "Architecture & Design", "Photography & Film", "Music & Events"]
  }
];

export const BUDGET_OPTIONS: OptionGroup[] = [
  {
    group: "Small",
    options: ["Under 5,000 PLN", "5,000 – 15,000 PLN", "15,000 – 30,000 PLN"]
  },
  {
    group: "Mid-range",
    options: ["30,000 – 75,000 PLN", "75,000 – 150,000 PLN"]
  },
  {
    group: "Large",
    options: ["150,000 – 500,000 PLN", "500,000 PLN – 1M PLN", "1M+ PLN"]
  },
  {
    group: "Flexible",
    options: ["To be determined", "Time & Materials", "Fixed Price (negotiable)", "Pro bono"]
  }
];

export const TIMELINE_OPTIONS: OptionGroup[] = [
  {
    group: "Short-term",
    options: ["1 – 2 weeks", "2 – 4 weeks", "1 – 2 months"]
  },
  {
    group: "Medium-term",
    options: ["3 – 6 months", "6 – 9 months", "9 – 12 months"]
  },
  {
    group: "Long-term",
    options: ["12 – 18 months", "18 – 24 months", "2+ years", "Ongoing / Retainer"]
  },
  {
    group: "Flexible",
    options: ["To be determined", "Phased delivery"]
  }
];

export const LEAD_STAGE_OPTIONS: OptionGroup[] = [
  {
    group: "Early Stage",
    options: ["First Contact", "Intro Call Scheduled", "Discovery Meeting Done"]
  },
  {
    group: "Active Pursuit",
    options: ["Needs Assessment", "Demo Presented", "Proposal Sent", "Awaiting Feedback"]
  },
  {
    group: "Decision Phase",
    options: ["Negotiation", "Contract Review", "Awaiting Signature"]
  },
  {
    group: "Outcome",
    options: ["Closed — Won", "Closed — Lost", "On Hold", "Re-engaged"]
  }
];

export const LOCATION_OPTIONS: OptionGroup[] = [
  {
    group: "Work Mode",
    options: ["Remote", "Hybrid", "On-site"]
  },
  {
    group: "Poland",
    options: ["Warsaw, Poland", "Kraków, Poland", "Wrocław, Poland", "Gdańsk, Poland", "Poznań, Poland", "Łódź, Poland", "Katowice, Poland", "Lublin, Poland"]
  },
  {
    group: "Europe",
    options: ["London, UK", "Berlin, Germany", "Amsterdam, Netherlands", "Prague, Czech Republic", "Vienna, Austria", "Stockholm, Sweden", "Zurich, Switzerland", "Paris, France"]
  }
];
