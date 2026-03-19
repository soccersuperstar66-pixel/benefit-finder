export interface Benefit {
  id: string;
  name: string;
  description: string;
  reason: string;
  learnMoreUrl: string;
  category: "tax_credit" | "food_assistance" | "housing" | "healthcare" | "education" | "other";
  estimatedValue: string | null;
}

type Answers = Record<string, string>;

function getIncomeBracket(income: string): number {
  switch (income) {
    case "under_15000": return 12500;
    case "15000_30000": return 22500;
    case "30000_50000": return 40000;
    case "50000_75000": return 62500;
    case "75000_100000": return 87500;
    case "over_100000": return 150000;
    default: return 50000;
  }
}

function getHouseholdSize(size: string): number {
  switch (size) {
    case "1": return 1;
    case "2": return 2;
    case "3": return 3;
    case "4": return 4;
    case "5_plus": return 5;
    default: return 3;
  }
}

function getNumChildren(children: string): number {
  switch (children) {
    case "0": return 0;
    case "1": return 1;
    case "2": return 2;
    case "3": return 3;
    default: return 0;
  }
}

export function computeBenefits(answers: Answers): Benefit[] {
  const benefits: Benefit[] = [];

  const income = getIncomeBracket(answers.annual_income ?? "50000_75000");
  const householdSize = getHouseholdSize(answers.household_size ?? "3");
  const numChildren = getNumChildren(answers.num_children ?? "0");
  const filingStatus = answers.filing_status ?? "single";
  const employmentStatus = answers.employment_status ?? "employed_full";
  const inSchool = answers.in_school === "yes";
  const hasHealthInsurance = answers.has_health_insurance === "yes";
  const hasYoungChildren = answers.has_young_children === "yes";
  const foodConcerns = answers.food_concerns === "yes";
  const housingCost = answers.housing_cost ?? "none";
  const hasRent = housingCost !== "none";
  // Estimate monthly housing cost from bracket for burden analysis
  const monthlyHousingCost: Record<string, number> = {
    none: 0, under_500: 300, "500_1000": 750, "1000_1500": 1250, "1500_2000": 1750, over_2000: 2500,
  };
  const monthlyRent = monthlyHousingCost[housingCost] ?? 0;
  const annualRent = monthlyRent * 12;
  // Housing is considered "cost-burdened" if rent > 30% of gross income (federal standard)
  const isCostBurdened = hasRent && income > 0 && annualRent / income > 0.30;
  const isWorking = ["employed_full", "employed_part", "self_employed"].includes(employmentStatus);

  // EITC - Earned Income Tax Credit
  const eitcLimits: Record<string, number[]> = {
    single: [18591, 49084, 55768, 59899],
    head_of_household: [18591, 49084, 55768, 59899],
    married_jointly: [25511, 56004, 62688, 66819],
    married_separately: [0, 0, 0, 0],
  };
  const eitcLimit = eitcLimits[filingStatus]?.[Math.min(numChildren, 3)] ?? 0;
  if (isWorking && income < eitcLimit && filingStatus !== "married_separately" && eitcLimit > 0) {
    const estimatedValues = ["up to $632", "up to $4,213", "up to $6,960", "up to $7,830"];
    benefits.push({
      id: "eitc",
      name: "Earned Income Tax Credit (EITC)",
      description: "A federal tax credit for working people with low to moderate income. It reduces the amount of tax you owe and may give you a refund.",
      reason: `Based on your income and filing status, you may qualify for the EITC${numChildren > 0 ? ` with ${numChildren} qualifying child${numChildren > 1 ? "ren" : ""}` : ""}.`,
      learnMoreUrl: "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit/eitc-central",
      category: "tax_credit",
      estimatedValue: estimatedValues[Math.min(numChildren, 3)] ?? null,
    });
  }

  // Child Tax Credit (CTC)
  const ctcIncomeLimit = filingStatus === "married_jointly" ? 400000 : 200000;
  if (numChildren > 0 && income < ctcIncomeLimit) {
    const ctcValue = Math.min(numChildren * 2000, numChildren * 2000);
    benefits.push({
      id: "ctc",
      name: "Child Tax Credit (CTC)",
      description: "A tax credit of up to $2,000 per qualifying child under age 17. Helps offset the cost of raising children.",
      reason: `You have ${numChildren} qualifying child${numChildren > 1 ? "ren" : ""} and your income is within the eligible range.`,
      learnMoreUrl: "https://www.irs.gov/credits-deductions/individuals/child-tax-credit",
      category: "tax_credit",
      estimatedValue: `up to $${ctcValue.toLocaleString()}`,
    });
  }

  // Child & Dependent Care Credit
  if (numChildren > 0 && hasYoungChildren && isWorking) {
    benefits.push({
      id: "cdcc",
      name: "Child & Dependent Care Credit",
      description: "A tax credit for childcare expenses paid while you work or look for work. Covers up to 35% of eligible care expenses.",
      reason: "You have children who need care and you're working, which are the core requirements for this credit.",
      learnMoreUrl: "https://www.irs.gov/credits-deductions/individuals/child-and-dependent-care-credit-information",
      category: "tax_credit",
      estimatedValue: "up to $1,050 for 1 child, $2,100 for 2+",
    });
  }

  // American Opportunity Tax Credit / Lifetime Learning Credit
  if (inSchool && income < 90000) {
    const creditName = "American Opportunity Tax Credit (AOTC)";
    benefits.push({
      id: "aotc",
      name: creditName,
      description: "A tax credit worth up to $2,500 per student for the first four years of higher education. Up to 40% is refundable.",
      reason: "Someone in your household is enrolled in school and your income is within the eligible range.",
      learnMoreUrl: "https://www.irs.gov/credits-deductions/individuals/aotc",
      category: "education",
      estimatedValue: "up to $2,500 per student",
    });
  }
  if (inSchool && income >= 90000 && income < 180000) {
    benefits.push({
      id: "llc",
      name: "Lifetime Learning Credit (LLC)",
      description: "A tax credit worth up to $2,000 per tax return for qualified education expenses. Available for any year of higher education.",
      reason: "Someone in your household is enrolled in school and your income may qualify for this credit.",
      learnMoreUrl: "https://www.irs.gov/credits-deductions/individuals/llc",
      category: "education",
      estimatedValue: "up to $2,000 per tax return",
    });
  }

  // Premium Tax Credit (ACA marketplace)
  const ptcFPL: Record<number, number[]> = {
    1: [15060, 60240],
    2: [20440, 81760],
    3: [25820, 103280],
    4: [31200, 124800],
    5: [36580, 146320],
  };
  const ptcRange = ptcFPL[Math.min(householdSize, 5)] ?? ptcFPL[5];
  if (!hasHealthInsurance && income >= ptcRange[0] && income <= ptcRange[1]) {
    benefits.push({
      id: "ptc",
      name: "Premium Tax Credit (ACA)",
      description: "Helps cover the cost of health insurance purchased through the Health Insurance Marketplace. The credit amount depends on your income and the plan you choose.",
      reason: "You don't have health insurance and your income falls within the range for this credit.",
      learnMoreUrl: "https://www.healthcare.gov/lower-costs/save-on-monthly-premiums/",
      category: "healthcare",
      estimatedValue: "varies by plan and income",
    });
  }

  // Medicaid / CHIP
  const medicaidLimits: Record<number, number> = {
    1: 20783, 2: 28208, 3: 35633, 4: 43058, 5: 50483,
  };
  const medicaidLimit = medicaidLimits[Math.min(householdSize, 5)] ?? 50483;
  if (!hasHealthInsurance && income <= medicaidLimit * 1.38) {
    benefits.push({
      id: "medicaid",
      name: "Medicaid / CHIP",
      description: "Free or low-cost health coverage for adults, children, and families with limited income. CHIP covers children in families that earn too much for Medicaid.",
      reason: "Based on your household size and income, you may qualify for Medicaid or CHIP coverage.",
      learnMoreUrl: "https://www.medicaid.gov/medicaid/eligibility/index.html",
      category: "healthcare",
      estimatedValue: "free or low-cost coverage",
    });
  }

  // SNAP (Food Stamps)
  const snapLimits: Record<number, number> = {
    1: 22332, 2: 30228, 3: 38124, 4: 46020, 5: 53916,
  };
  const snapLimit = snapLimits[Math.min(householdSize, 5)] ?? 53916;
  if (foodConcerns && income <= snapLimit) {
    benefits.push({
      id: "snap",
      name: "SNAP (Food Assistance)",
      description: "Supplemental Nutrition Assistance Program provides monthly benefits to buy groceries at participating stores.",
      reason: "You've indicated food affordability concerns and your income may fall within SNAP eligibility limits.",
      learnMoreUrl: "https://www.fns.usda.gov/snap/eligibility",
      category: "food_assistance",
      estimatedValue: "varies by household size and income",
    });
  }

  // Housing Choice Voucher / Section 8
  const section8Limits: Record<number, number> = {
    1: 48600, 2: 55500, 3: 62400, 4: 69300, 5: 74950,
  };
  const section8Limit = section8Limits[Math.min(householdSize, 5)] ?? 74950;
  if (hasRent && income <= section8Limit * 0.5) {
    const housingReasonParts: string[] = [
      "Your income relative to your household size suggests you may qualify for federal housing assistance.",
    ];
    if (isCostBurdened) {
      const pct = Math.round((annualRent / income) * 100);
      housingReasonParts.push(`Your housing costs are approximately ${pct}% of your income — above the 30% affordability threshold used by federal programs.`);
    }
    benefits.push({
      id: "housing_voucher",
      name: "Housing Choice Voucher (Section 8)",
      description: "Federal rental assistance that helps low-income families afford housing in the private market. Vouchers pay a portion of rent directly to landlords.",
      reason: housingReasonParts.join(" "),
      learnMoreUrl: "https://www.hud.gov/topics/housing_choice_voucher_program_section_8",
      category: "housing",
      estimatedValue: "varies by location and income",
    });
  }

  // Emergency Rental Assistance — specifically for cost-burdened households above Section 8 threshold
  if (hasRent && isCostBurdened && income > section8Limit * 0.5 && income <= section8Limit) {
    const pct = Math.round((annualRent / income) * 100);
    benefits.push({
      id: "emergency_rental_assistance",
      name: "Emergency Rental Assistance (ERA)",
      description: "Federal funding administered through state and local agencies to help households experiencing housing instability cover rent and utility costs.",
      reason: `Your housing costs are approximately ${pct}% of your income. Households spending more than 30% on rent may qualify for emergency rental assistance through local programs.`,
      learnMoreUrl: "https://home.treasury.gov/policy-issues/coronavirus/assistance-for-state-local-and-tribal-governments/emergency-rental-assistance-program",
      category: "housing",
      estimatedValue: "varies by program and need",
    });
  }

  // Savers Credit
  const saversLimits: Record<string, number> = {
    single: 36500, head_of_household: 54750, married_jointly: 73000, married_separately: 36500,
  };
  const saversLimit = saversLimits[filingStatus] ?? 36500;
  if (isWorking && income <= saversLimit) {
    benefits.push({
      id: "savers_credit",
      name: "Saver's Credit (Retirement Savings Contribution Credit)",
      description: "A tax credit for low- and moderate-income workers who contribute to a retirement account such as an IRA or 401(k).",
      reason: "Your income qualifies you for a credit on retirement savings contributions.",
      learnMoreUrl: "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-savings-contributions-savers-credit",
      category: "tax_credit",
      estimatedValue: "up to $1,000 ($2,000 for married couples)",
    });
  }

  // Low Income Home Energy Assistance Program (LIHEAP)
  const liheapLimit = medicaidLimit * 1.5;
  if (income <= liheapLimit) {
    benefits.push({
      id: "liheap",
      name: "LIHEAP (Energy Assistance)",
      description: "Low Income Home Energy Assistance Program helps households pay heating and cooling bills and may provide emergency assistance.",
      reason: "Your income level may qualify you for help with energy costs through this federal program.",
      learnMoreUrl: "https://www.acf.hhs.gov/ocs/programs/liheap",
      category: "other",
      estimatedValue: "varies by state and need",
    });
  }

  return benefits;
}
