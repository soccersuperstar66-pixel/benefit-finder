export interface QuestionOption {
  value: string;
  label: string;
}

export interface Question {
  id: string;
  text: string;
  helpText: string | null;
  type: "single_choice" | "number_input" | "yes_no";
  options: QuestionOption[];
  inputMin?: number | null;
  inputMax?: number | null;
  inputUnit?: string | null;
}

export const QUESTIONS: Question[] = [
  {
    id: "filing_status",
    text: "What is your tax filing status?",
    helpText: "This is the status you use (or would use) when filing your federal taxes.",
    type: "single_choice",
    options: [
      { value: "single", label: "Single" },
      { value: "married_jointly", label: "Married Filing Jointly" },
      { value: "married_separately", label: "Married Filing Separately" },
      { value: "head_of_household", label: "Head of Household" },
    ],
  },
  {
    id: "age_range",
    text: "What is your age range?",
    helpText: "Your age affects eligibility for certain programs like Medicare and senior-specific benefits.",
    type: "single_choice",
    options: [
      { value: "under_25", label: "Under 25" },
      { value: "25_54", label: "25 – 54" },
      { value: "55_64", label: "55 – 64" },
      { value: "65_plus", label: "65 or older" },
    ],
  },
  {
    id: "num_children",
    text: "How many qualifying children under age 17 do you have?",
    helpText: "Children who live with you and whom you support financially.",
    type: "single_choice",
    options: [
      { value: "0", label: "None" },
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3 or more" },
    ],
  },
  {
    id: "annual_income",
    text: "What is your approximate annual household income (before taxes)?",
    helpText: "Include all income from wages, self-employment, and other sources for everyone in your household.",
    type: "single_choice",
    options: [
      { value: "under_15000", label: "Under $15,000" },
      { value: "15000_30000", label: "$15,000 – $30,000" },
      { value: "30000_50000", label: "$30,000 – $50,000" },
      { value: "50000_75000", label: "$50,000 – $75,000" },
      { value: "75000_100000", label: "$75,000 – $100,000" },
      { value: "over_100000", label: "Over $100,000" },
    ],
  },
  {
    id: "household_size",
    text: "How many people live in your household?",
    helpText: "Count yourself, your spouse/partner, and any dependents living with you.",
    type: "single_choice",
    options: [
      { value: "1", label: "1 (just me)" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" },
      { value: "5_plus", label: "5 or more" },
    ],
  },
  {
    id: "employment_status",
    text: "What is your current work/employment status?",
    helpText: null,
    type: "single_choice",
    options: [
      { value: "employed_full", label: "Employed full-time" },
      { value: "employed_part", label: "Employed part-time" },
      { value: "self_employed", label: "Self-employed / freelance" },
      { value: "unemployed", label: "Unemployed / job seeking" },
      { value: "retired", label: "Retired" },
      { value: "student", label: "Student" },
      { value: "unable_to_work", label: "Unable to work / disability" },
    ],
  },
  {
    id: "disability_status",
    text: "Do you have a disability or receive disability benefits?",
    helpText: "This includes physical, mental, or developmental disabilities. SSI, SSDI, or VA disability counts.",
    type: "yes_no",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "housing_cost",
    text: "How much do you spend each month on rent or mortgage?",
    helpText: "Select 'None' if you live rent-free (with family, in subsidized housing, etc.).",
    type: "single_choice",
    options: [
      { value: "none", label: "I don't pay rent or mortgage" },
      { value: "under_500", label: "Under $500 / month" },
      { value: "500_1000", label: "$500 – $1,000 / month" },
      { value: "1000_1500", label: "$1,000 – $1,500 / month" },
      { value: "1500_2000", label: "$1,500 – $2,000 / month" },
      { value: "over_2000", label: "Over $2,000 / month" },
    ],
  },
  {
    id: "in_school",
    text: "Are you or anyone in your household currently enrolled in college or a vocational school?",
    helpText: "This includes undergraduate, graduate, and vocational/trade programs.",
    type: "yes_no",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "has_health_insurance",
    text: "Do you currently have health insurance?",
    helpText: "Include coverage from an employer, Medicare, Medicaid, or a marketplace plan.",
    type: "yes_no",
    options: [
      { value: "yes", label: "Yes, I have coverage" },
      { value: "no", label: "No, I'm uninsured" },
    ],
  },
  {
    id: "has_young_children",
    text: "Do you have children under age 13 who need childcare while you work or attend school?",
    helpText: null,
    type: "yes_no",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
  {
    id: "food_concerns",
    text: "Do you or your household sometimes struggle to afford enough food?",
    helpText: null,
    type: "yes_no",
    options: [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;
