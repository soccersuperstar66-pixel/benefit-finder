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

function fmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
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
  const hasDisability = answers.disability_status === "yes";
  const ageRange = answers.age_range ?? "25_54";
  const isSenior = ageRange === "65_plus";
  const isNearSenior = ageRange === "55_64";

  // Estimate monthly housing cost from bracket for burden analysis
  const monthlyHousingCost: Record<string, number> = {
    none: 0, under_500: 300, "500_1000": 750, "1000_1500": 1250, "1500_2000": 1750, over_2000: 2500,
  };
  const monthlyRent = monthlyHousingCost[housingCost] ?? 0;
  const annualRent = monthlyRent * 12;
  // Housing is considered "cost-burdened" if rent > 30% of gross income (federal standard)
  const isCostBurdened = hasRent && income > 0 && annualRent / income > 0.30;
  const isWorking = ["employed_full", "employed_part", "self_employed"].includes(employmentStatus);

  // ─── EITC ─────────────────────────────────────────────────────────────────
  const eitcLimits: Record<string, number[]> = {
    single: [18591, 49084, 55768, 59899],
    head_of_household: [18591, 49084, 55768, 59899],
    married_jointly: [25511, 56004, 62688, 66819],
    married_separately: [0, 0, 0, 0],
  };
  const eitcLimit = eitcLimits[filingStatus]?.[Math.min(numChildren, 3)] ?? 0;
  if (isWorking && income < eitcLimit && filingStatus !== "married_separately" && eitcLimit > 0) {
    const estimatedValues = ["up to $632", "up to $4,213", "up to $6,960", "up to $7,830"];
    const childText = numChildren > 0 ? ` with ${numChildren} qualifying child${numChildren > 1 ? "ren" : ""}` : " (no qualifying children)";
    benefits.push({
      id: "eitc",
      name: "Earned Income Tax Credit (EITC)",
      description: "A federal tax credit for working people with low to moderate income. It reduces the amount of tax you owe and may give you a refund.",
      reason: `Your estimated income (~$${fmt(income)}) is below the $${fmt(eitcLimit)} EITC limit for your filing status${childText}. You're currently working, which is required to qualify.`,
      learnMoreUrl: "https://www.irs.gov/credits-deductions/individuals/earned-income-tax-credit/eitc-central",
      category: "tax_credit",
      estimatedValue: estimatedValues[Math.min(numChildren, 3)] ?? null,
    });
  }

  // ─── Child Tax Credit ──────────────────────────────────────────────────────
  const ctcIncomeLimit = filingStatus === "married_jointly" ? 400000 : 200000;
  if (numChildren > 0 && income < ctcIncomeLimit) {
    const ctcValue = numChildren * 2000;
    benefits.push({
      id: "ctc",
      name: "Child Tax Credit (CTC)",
      description: "A tax credit of up to $2,000 per qualifying child under age 17. Helps offset the cost of raising children.",
      reason: `You have ${numChildren} qualifying child${numChildren > 1 ? "ren" : ""}. Your income (~$${fmt(income)}) is well below the $${fmt(ctcIncomeLimit)} phase-out threshold.`,
      learnMoreUrl: "https://www.irs.gov/credits-deductions/individuals/child-tax-credit",
      category: "tax_credit",
      estimatedValue: `up to $${fmt(ctcValue)}`,
    });
  }

  // ─── Child & Dependent Care Credit ────────────────────────────────────────
  if (numChildren > 0 && hasYoungChildren && isWorking) {
    benefits.push({
      id: "cdcc",
      name: "Child & Dependent Care Credit",
      description: "A tax credit for childcare expenses paid while you work or look for work. Covers up to 35% of eligible care expenses.",
      reason: `You have children who need care and you're currently working — the two core requirements for this credit. Eligible expenses are up to $3,000 for one child or $6,000 for two or more.`,
      learnMoreUrl: "https://www.irs.gov/credits-deductions/individuals/child-and-dependent-care-credit-information",
      category: "tax_credit",
      estimatedValue: "up to $1,050 for 1 child, $2,100 for 2+",
    });
  }

  // ─── AOTC / LLC ───────────────────────────────────────────────────────────
  if (inSchool && income < 90000) {
    benefits.push({
      id: "aotc",
      name: "American Opportunity Tax Credit (AOTC)",
      description: "A tax credit worth up to $2,500 per student for the first four years of higher education. Up to 40% is refundable.",
      reason: `Someone in your household is enrolled in school and your income (~$${fmt(income)}) is below the $90,000 phase-out threshold (single/HOH) or $180,000 (married jointly).`,
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
      reason: `Someone in your household is enrolled in school. Your income (~$${fmt(income)}) is above the AOTC range but within the LLC range (up to $180,000 for joint filers).`,
      learnMoreUrl: "https://www.irs.gov/credits-deductions/individuals/llc",
      category: "education",
      estimatedValue: "up to $2,000 per tax return",
    });
  }

  // ─── Premium Tax Credit (ACA) ──────────────────────────────────────────────
  const ptcFPL: Record<number, number[]> = {
    1: [15060, 60240],
    2: [20440, 81760],
    3: [25820, 103280],
    4: [31200, 124800],
    5: [36580, 146320],
  };
  const ptcRange = ptcFPL[Math.min(householdSize, 5)] ?? ptcFPL[5]!;
  if (!hasHealthInsurance && income >= ptcRange[0] && income <= ptcRange[1]) {
    benefits.push({
      id: "ptc",
      name: "Premium Tax Credit (ACA)",
      description: "Helps cover the cost of health insurance purchased through the Health Insurance Marketplace. The credit amount depends on your income and the plan you choose.",
      reason: `You don't have health insurance and your income (~$${fmt(income)}) falls between $${fmt(ptcRange[0])} and $${fmt(ptcRange[1])} for a ${householdSize}-person household — the eligibility window for this credit.`,
      learnMoreUrl: "https://www.healthcare.gov/lower-costs/save-on-monthly-premiums/",
      category: "healthcare",
      estimatedValue: "varies by plan and income",
    });
  }

  // ─── Medicaid / CHIP ───────────────────────────────────────────────────────
  const medicaidLimits: Record<number, number> = {
    1: 20783, 2: 28208, 3: 35633, 4: 43058, 5: 50483,
  };
  const medicaidLimit = medicaidLimits[Math.min(householdSize, 5)] ?? 50483;
  const medicaidThreshold = Math.round(medicaidLimit * 1.38);
  if (!hasHealthInsurance && income <= medicaidThreshold) {
    benefits.push({
      id: "medicaid",
      name: "Medicaid / CHIP",
      description: "Free or low-cost health coverage for adults, children, and families with limited income. CHIP covers children in families that earn too much for Medicaid.",
      reason: `Your income (~$${fmt(income)}) is at or below the ~$${fmt(medicaidThreshold)} Medicaid eligibility threshold for a ${householdSize}-person household (138% of the Federal Poverty Level).`,
      learnMoreUrl: "https://www.medicaid.gov/medicaid/eligibility/index.html",
      category: "healthcare",
      estimatedValue: "free or low-cost coverage",
    });
  }

  // ─── SSI (Supplemental Security Income) ───────────────────────────────────
  // 2025 SSI income limits: $967/mo individual, $1,450/mo couple (plus FPL-based resource test)
  const ssiMonthlyLimit = filingStatus === "married_jointly" ? 17400 : 11604;
  if (hasDisability && income <= ssiMonthlyLimit) {
    benefits.push({
      id: "ssi",
      name: "Supplemental Security Income (SSI)",
      description: "Monthly cash payments from the Social Security Administration for people with disabilities or aged 65+ who have limited income and resources.",
      reason: `You reported a disability and your income (~$${fmt(income)}/year) is below the $${fmt(ssiMonthlyLimit)}/year SSI countable income limit. Eligibility also considers your assets (resources).`,
      learnMoreUrl: "https://www.ssa.gov/ssi/",
      category: "other",
      estimatedValue: "up to $967/month (individual)",
    });
  }

  // ─── WIC ──────────────────────────────────────────────────────────────────
  // WIC: income ≤ 185% FPL; targets pregnant, postpartum, or breastfeeding women + children under 5
  const wicFPL185: Record<number, number> = {
    1: 27861, 2: 37814, 3: 47767, 4: 57720, 5: 67673,
  };
  const wicLimit = wicFPL185[Math.min(householdSize, 5)] ?? 67673;
  const hasYoungChild = numChildren > 0 && (answers.has_young_children === "yes" || numChildren > 0);
  if (hasYoungChild && income <= wicLimit) {
    benefits.push({
      id: "wic",
      name: "WIC (Women, Infants & Children)",
      description: "Provides food assistance, nutrition education, and healthcare referrals for pregnant women, new mothers, infants, and children under age 5.",
      reason: `You have young children and your income (~$${fmt(income)}) is below the $${fmt(wicLimit)} WIC limit (185% FPL) for a ${householdSize}-person household. Children under 5 and pregnant/postpartum women qualify.`,
      learnMoreUrl: "https://www.fns.usda.gov/wic",
      category: "food_assistance",
      estimatedValue: "monthly food benefits + services",
    });
  }

  // ─── Head Start / Early Head Start ────────────────────────────────────────
  // Head Start targets families below 100% FPL; Early Head Start below 100% FPL with children under 3
  const headStartFPL: Record<number, number> = {
    1: 15060, 2: 20440, 3: 25820, 4: 31200, 5: 36580,
  };
  const headStartLimit = headStartFPL[Math.min(householdSize, 5)] ?? 36580;
  if (numChildren > 0 && income <= headStartLimit * 1.3) {
    benefits.push({
      id: "head_start",
      name: "Head Start / Early Head Start",
      description: "Free early childhood education, health, nutrition, and parent involvement services for low-income children from birth to age 5 and their families.",
      reason: `You have children and your income (~$${fmt(income)}) is near or below the Head Start income threshold (~$${fmt(headStartLimit)} at 100% FPL for ${householdSize} people). Priority is given to families below the poverty line.`,
      learnMoreUrl: "https://www.acf.hhs.gov/ohs",
      category: "education",
      estimatedValue: "free early education & services",
    });
  }

  // ─── SNAP ─────────────────────────────────────────────────────────────────
  const snapLimits: Record<number, number> = {
    1: 22332, 2: 30228, 3: 38124, 4: 46020, 5: 53916,
  };
  const snapLimit = snapLimits[Math.min(householdSize, 5)] ?? 53916;
  if (foodConcerns && income <= snapLimit) {
    benefits.push({
      id: "snap",
      name: "SNAP (Food Assistance)",
      description: "Supplemental Nutrition Assistance Program provides monthly benefits to buy groceries at participating stores.",
      reason: `You've indicated food affordability concerns and your income (~$${fmt(income)}) is at or below the $${fmt(snapLimit)} gross income limit for a ${householdSize}-person household (130% of FPL).`,
      learnMoreUrl: "https://www.fns.usda.gov/snap/eligibility",
      category: "food_assistance",
      estimatedValue: "varies by household size and income",
    });
  }

  // ─── Housing Choice Voucher / Section 8 ───────────────────────────────────
  const section8Limits: Record<number, number> = {
    1: 48600, 2: 55500, 3: 62400, 4: 69300, 5: 74950,
  };
  const section8Limit = section8Limits[Math.min(householdSize, 5)] ?? 74950;
  const section8Threshold = Math.round(section8Limit * 0.5);
  if (hasRent && income <= section8Threshold) {
    const housingReasonParts: string[] = [
      `Your income (~$${fmt(income)}) is at or below 50% of the Area Median Income threshold ($${fmt(section8Threshold)}) for a ${householdSize}-person household — the primary eligibility criterion for Section 8.`,
    ];
    if (isCostBurdened) {
      const pct = Math.round((annualRent / income) * 100);
      housingReasonParts.push(`You're also spending ~${pct}% of your income on housing, well above the 30% affordability standard.`);
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

  // ─── Emergency Rental Assistance ──────────────────────────────────────────
  if (hasRent && isCostBurdened && income > section8Threshold && income <= section8Limit) {
    const pct = Math.round((annualRent / income) * 100);
    benefits.push({
      id: "emergency_rental_assistance",
      name: "Emergency Rental Assistance (ERA)",
      description: "Federal funding administered through state and local agencies to help households experiencing housing instability cover rent and utility costs.",
      reason: `Your housing costs are ~${pct}% of your income — above the 30% federal affordability threshold. Your income (~$${fmt(income)}) places you in the ERA target range for cost-burdened households ($${fmt(section8Threshold)}–$${fmt(section8Limit)}).`,
      learnMoreUrl: "https://home.treasury.gov/policy-issues/coronavirus/assistance-for-state-local-and-tribal-governments/emergency-rental-assistance-program",
      category: "housing",
      estimatedValue: "varies by program and need",
    });
  }

  // ─── Saver's Credit ───────────────────────────────────────────────────────
  const saversLimits: Record<string, number> = {
    single: 36500, head_of_household: 54750, married_jointly: 73000, married_separately: 36500,
  };
  const saversLimit = saversLimits[filingStatus] ?? 36500;
  if (isWorking && income <= saversLimit) {
    benefits.push({
      id: "savers_credit",
      name: "Saver's Credit (Retirement Savings Contribution Credit)",
      description: "A tax credit for low- and moderate-income workers who contribute to a retirement account such as an IRA or 401(k).",
      reason: `Your income (~$${fmt(income)}) is at or below the $${fmt(saversLimit)} limit for your filing status. Contributing even a small amount to an IRA or 401(k) can earn you this credit.`,
      learnMoreUrl: "https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-savings-contributions-savers-credit",
      category: "tax_credit",
      estimatedValue: "up to $1,000 ($2,000 for married couples)",
    });
  }

  // ─── LIHEAP ───────────────────────────────────────────────────────────────
  const liheapLimit = Math.round(medicaidLimit * 1.5);
  if (income <= liheapLimit) {
    benefits.push({
      id: "liheap",
      name: "LIHEAP (Energy Assistance)",
      description: "Low Income Home Energy Assistance Program helps households pay heating and cooling bills and may provide emergency assistance.",
      reason: `Your income (~$${fmt(income)}) is at or below the ~$${fmt(liheapLimit)} LIHEAP eligibility guideline (150% FPL) for a ${householdSize}-person household.`,
      learnMoreUrl: "https://www.acf.hhs.gov/ocs/programs/liheap",
      category: "other",
      estimatedValue: "varies by state and need",
    });
  }

  // ─── Medicare ─────────────────────────────────────────────────────────────
  if (isSenior) {
    benefits.push({
      id: "medicare",
      name: "Medicare",
      description: "Federal health insurance for people 65 and older. Covers hospital stays (Part A), doctor visits (Part B), and prescription drugs (Part D).",
      reason: "You are 65 or older, making you categorically eligible for Medicare regardless of income.",
      learnMoreUrl: "https://www.medicare.gov/",
      category: "healthcare",
      estimatedValue: "Part A typically premium-free; Part B ~$185/month",
    });
  }

  // ─── Medicare Savings Programs (for low-income seniors) ──────────────────
  if (isSenior && income <= medicaidThreshold) {
    benefits.push({
      id: "medicare_savings",
      name: "Medicare Savings Programs (Extra Help)",
      description: "State programs that help people with Medicare pay for premiums, deductibles, and copays. Also called 'Extra Help' for prescription drug costs.",
      reason: `You're 65+ and your income (~$${fmt(income)}) is at or below $${fmt(medicaidThreshold)}, which qualifies you for assistance with Medicare cost-sharing beyond standard Medicare.`,
      learnMoreUrl: "https://www.medicare.gov/basics/costs/help/medicare-savings-programs",
      category: "healthcare",
      estimatedValue: "hundreds to thousands per year in saved costs",
    });
  }

  // ─── Senior Farmers' Market Nutrition Program (SFMNP) ────────────────────
  if ((isSenior || isNearSenior) && income <= medicaidLimit) {
    benefits.push({
      id: "sfmnp",
      name: "Senior Farmers' Market Nutrition Program",
      description: "Provides coupons to low-income seniors to purchase fresh fruits, vegetables, and herbs at farmers' markets, roadside stands, and community-supported agriculture programs.",
      reason: `Your income (~$${fmt(income)}) is below the $${fmt(medicaidLimit)} limit and you are${isSenior ? " 65 or older" : " approaching senior age"}, meeting the core criteria for this program.`,
      learnMoreUrl: "https://www.fns.usda.gov/sfmnp/senior-farmers-market-nutrition-program",
      category: "food_assistance",
      estimatedValue: "seasonal coupons for fresh produce",
    });
  }

  return benefits;
}
