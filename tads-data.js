/* ============================================================
   DADSync · Tripura AI Transformation — DATA SERVICE LAYER
   ------------------------------------------------------------
   Clean service abstraction so a real backend/database can be
   connected later WITHOUT rebuilding the UI.

   Architecture:
     window.TADS          — public API (the only thing the UI uses)
     TADS.getSchemes()    — returns array of scheme/service records
     TADS.getFunding()    — funding opportunities
     TADS.getProblems()   — citizen problem reports
     TADS.getOpportunities() — district opportunity records
     TADS.getKnowledge()  — knowledge hub articles
     TADS.searchAll(q, filters)
     TADS.addProblem(), TADS.updateRecord(), TADS.saveOpportunity()
     TADS.getProfile(), TADS.saveProfile()
     TADS.resetData()     — restore seed data (admin)

   Every record carries:  id, title, dataStatus, source, sourceUrl,
   verifiedBy, verificationDate (+ type-specific fields).
   dataStatus ∈ { VERIFIED, NEEDS VERIFICATION, USER SUBMITTED,
                  AI GENERATED, ARCHIVED }

   Persistence: localStorage key "tads_data_v1" (records),
                "tads_profile_v1" (entrepreneur profile),
                "tads_saved_v1"   (saved opportunity ids),
                "tads_problem_v1" (user-submitted problems merged).
   ============================================================ */
(function () {
  'use strict';
  var LS_KEY = 'tads_data_v1';
  var PROFILE_KEY = 'tads_profile_v1';
  var SAVED_KEY = 'tads_saved_v1';
  var PROBLEM_KEY = 'tads_problem_v1';

  /* ---------------------------- Enums ---------------------------- */
  var DATA_STATUS = ['VERIFIED', 'NEEDS VERIFICATION', 'USER SUBMITTED', 'AI GENERATED', 'ARCHIVED'];

  var DISTRICTS = [
    'Dhalai', 'Gomati', 'Khowai', 'North Tripura', 'Sepahijala', 'South Tripura', 'Unakoti', 'West Tripura'
  ];

  var SECTORS = [
    'Agriculture', 'Tourism', 'Education', 'Healthcare', 'MSME', 'Startup', 'Manufacturing',
    'Handicraft', 'Food processing', 'Digital services', 'Renewable energy', 'Logistics',
    'Rural development'
  ];

  var PROBLEM_CATEGORIES = [
    'Roads', 'Water', 'Electricity', 'Waste', 'Transport', 'Education', 'Healthcare',
    'Agriculture', 'Tourism', 'Government services', 'Internet/Connectivity', 'Local infrastructure'
  ];

  var PROBLEM_STATUSES = ['Submitted', 'Under Review', 'Verified', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];

  var GOV_CATEGORIES = ['Scheme', 'Public Service', 'Certification', 'Financial Support', 'Infrastructure', 'Social Welfare'];

  var KNOWLEDGE_CATEGORIES = [
    'AI', 'Government technology', 'Agriculture technology', 'Startup ecosystem',
    'Digital governance', 'Tourism technology', 'Education technology', 'Healthcare technology',
    'Local innovation', 'Research', 'Case studies'
  ];

  /* ---------------------------- Seed data ----------------------------
     TRUST RULE: only records marked VERIFIED carry an official sourceUrl
     that has been checked by DADSync. Everything else is explicitly
     labelled NEEDS VERIFICATION / USER SUBMITTED / AI GENERATED and is
     never presented as verified fact.                                   */

  var SEED_SCHEMES = [
    {
      id: 'gov-01', type: 'scheme', title: 'PM Street Vendor\'s AtmaNirbhar Nidhi (PM SVANidhi)',
      category: 'Financial Support', district: 'All districts', dataStatus: 'VERIFIED',
      source: 'Ministry of Housing & Urban Affairs (PM SVANidhi portal)', sourceUrl: 'https://pmsvanidhi.mohua.gov.in/',
      verifiedBy: 'DADSync research desk', verificationDate: '2026-08-01',
      summary: 'Working capital loan up to ₹10,000 (renewable up to ₹50,000) for street vendors to restart/expand vending, with incentives for timely repayment.',
      eligible: ['Street vendors of vending zones identified by the urban local body', 'Age 18 years or above', 'Vending activity carried out for at least 50 cumulative days in the preceding 12 months'],
      documents: ['Aadhaar card', 'Vending certificate / letter of identification issued by the urban local body', 'Bank account details', 'Passport-size photograph'],
      howToApply: ['Contact the nodal urban local body of your town (e.g. Agartala Municipal Corporation) to confirm inclusion in the vending survey', 'Apply online through the PM SVANidhi portal or via your nearest empanelled bank', 'Complete KYC and wait for the ULB recommendation', 'Loan is disbursed directly to the bank account'],
      dept: 'Ministry of Housing & Urban Affairs / Urban Local Bodies',
      lastVerified: '2026-08-01', notes: 'Eligibility details verified against the official PM SVANidhi portal description. Amounts are indicative; exact sanction depends on bank norms.'
    },
    {
      id: 'gov-02', type: 'scheme', title: 'Pradhan Mantri Awas Yojana – Gramin (PMAY-G)',
      category: 'Social Welfare', district: 'All districts', dataStatus: 'VERIFIED',
      source: 'Ministry of Rural Development / PMAY-G portal', sourceUrl: 'https://pmayg.nic.in/',
      verifiedBy: 'DADSync research desk', verificationDate: '2026-08-01',
      summary: 'Financial assistance for construction of pucca house with basic amenities for eligible rural households identified through SECC-2011 data.',
      eligible: ['Households identified under SECC-2011 housing deprivation parameters', 'Rural households without pucca house', 'Priority to SC/ST, minorities, women-headed households and disabled members'],
      documents: ['Aadhaar', 'SECC-2011 eligibility details', 'Bank account (with linkage to PM Jan Dhan if applicable)', 'Photographs of existing house (for verification)'],
      howToApply: ['Check your name in the PMAY-G beneficiary list at the Gram Panchayat', 'Beneficiary selection happens through the Gram Sabha; applications are entered by the Panchayat in AwaasSoft', 'Submit land ownership/possession proof at the GP', 'Track approval and instalment release on the PMAY-G portal'],
      dept: 'Ministry of Rural Development / Tripura Rural Development Department', lastVerified: '2026-08-01',
      notes: 'Scheme is demand-based with annual targets. Contact your Gram Panchayat for the current financial year cycle.'
    },
    {
      id: 'gov-03', type: 'scheme', title: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
      category: 'Scheme', district: 'All districts', dataStatus: 'VERIFIED',
      source: 'Ministry of Agriculture & Farmers Welfare / PM-KISAN portal', sourceUrl: 'https://pmkisan.gov.in/',
      verifiedBy: 'DADSync research desk', verificationDate: '2026-08-01',
      summary: 'Income support of ₹6,000 per year in three equal instalments to eligible farmer families, transferred directly to Aadhaar-seeded bank accounts.',
      eligible: ['Landholding farmer families with cultivable land (as per state land records)', 'Instalments land in three four-monthly equal instalments of ₹2,000'],
      documents: ['Aadhaar', 'Land records (Khatian / Jamabandi)', 'Aadhaar-seeded bank account', 'Mobile number'],
      howToApply: ['Verify name in the PM-KISAN beneficiary list (online)', 'If not listed, apply/rectify through your Patwari / Agriculture Officer with land records', 'Bank account must be Aadhaar-seeded and linked with the mobile number', 'Receive instalments directly'],
      dept: 'Ministry of Agriculture & Farmers Welfare / Tripura Agriculture Department', lastVerified: '2026-08-01',
      notes: 'Some ineligible categories apply (income-tax payers, government employees etc.) — confirm current exclusion list on the portal.'
    },
    {
      id: 'gov-04', type: 'scheme', title: 'Pradhan Mantri Matru Vandana Yojana (PMMVY)',
      category: 'Social Welfare', district: 'All districts', dataStatus: 'VERIFIED',
      source: 'Ministry of Women & Child Development / PMMVY portal', sourceUrl: 'https://pmmvy.wcd.gov.in/',
      verifiedBy: 'DADSync research desk', verificationDate: '2026-08-01',
      summary: 'Cash incentive for first live birth to eligible pregnant women and lactating mothers, subject to fulfilment of maternal and child health conditions.',
      eligible: ['Pregnant women and lactating mothers for the first live birth', 'Aadhaar holder with bank account', 'Registered with the Anganwadi / health system'],
      documents: ['Aadhaar', 'MCP card / pregnancy registration', 'Bank account details', 'Proof of residence'],
      howToApply: ['Register pregnancy at the nearest Anganwadi Centre / Health Centre', 'The Anganwadi worker fills the PMMVY application', 'Complete the required health visits and immunisation schedule', 'Instalments are transferred to the bank account'],
      dept: 'Ministry of Women & Child Development / ICDS Tripura', lastVerified: '2026-08-01',
      notes: 'Institutional delivery and child immunisation conditions apply.'
    },
    {
      id: 'gov-05', type: 'scheme', title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
      category: 'Scheme', district: 'All districts', dataStatus: 'VERIFIED',
      source: 'Department of Agriculture, Cooperation & Farmers Welfare / PMFBY portal', sourceUrl: 'https://pmfby.gov.in/',
      verifiedBy: 'DADSync research desk', verificationDate: '2026-08-01',
      summary: 'Crop insurance covering notified food crops, oilseeds and commercial/horticultural crops against natural calamities, pests and diseases.',
      eligible: ['Farmers growing notified crops in notified areas', 'Small and marginal farmers pay subsidised premium', 'Tenant farmers and sharecroppers can also enrol (with required declarations)'],
      documents: ['Aadhaar', 'Land records', 'Bank account', 'Crop details (area, variety, sowing date)'],
      howToApply: ['Contact the local Agriculture Officer / bank / Common Service Centre during the enrolment window', 'Fill the enrolment form with crop and land details', 'Pay the farmer premium share (subsidised for small/marginal farmers)', 'Insurance cover starts for the season'],
      dept: 'Ministry of Agriculture / Tripura Agriculture Department', lastVerified: '2026-08-01',
      notes: 'Enrolment happens before the sowing deadline each season — dates change every year; confirm with the district Agriculture office.'
    },
    {
      id: 'gov-06', type: 'service', title: 'Agartala Municipal Corporation (AMC) — Citizen Services',
      category: 'Public Service', district: 'West Tripura', dataStatus: 'VERIFIED',
      source: 'Agartala Municipal Corporation', sourceUrl: 'https://www.agartalamc.in/',
      verifiedBy: 'DADSync research desk', verificationDate: '2026-08-01',
      summary: 'Water connection, property tax, trade licence, birth/death certificates and grievance redressal through the AMC online portal.',
      eligible: ['Residents and businesses within Agartala Municipal Corporation limits'],
      documents: ['Aadhaar', 'Property documents (for tax/licence)', 'Bank details (for online payments)', 'Supporting documents per service (e.g. hospital certificate for birth registration)'],
      howToApply: ['Visit the AMC citizen portal and register with mobile/Aadhaar', 'Select the required service (property tax, trade licence, water connection, certificates)', 'Upload documents and pay applicable fees online', 'Track application status on the portal'],
      dept: 'Agartala Municipal Corporation', lastVerified: '2026-08-01',
      notes: 'Portal availability and service list may change — confirm on the AMC website.'
    },
    {
      id: 'gov-07', type: 'scheme', title: 'National Digital Literacy Mission / PMGDISHA (Digital Saksharta Abhiyan)',
      category: 'Scheme', district: 'All districts', dataStatus: 'NEEDS VERIFICATION',
      source: 'PMGDISHA programme (training under Common Service Centres)', sourceUrl: '',
      verifiedBy: '', verificationDate: '',
      summary: 'Digital literacy training for rural citizens (operating a computer/tablet, digital payments, government services online). Status and current training batches for Tripura require confirmation from the state e-Governance agency.',
      eligible: ['Rural citizens who are not digitally literate', 'Age and batch criteria vary — to be confirmed'],
      documents: ['Aadhaar', 'Address proof'],
      howToApply: ['Contact the nearest Common Service Centre (CSC) for the current batch schedule', 'Enrolment details to be confirmed with the state agency'],
      dept: 'MeitY / CSC e-Governance Services India Ltd', lastVerified: '',
      notes: 'Record not yet re-verified for the current year — treat as Needs Verification.'
    },
    {
      id: 'gov-08', type: 'service', title: 'Tripura Right to Public Services (RTPS) Act — Online Applications',
      category: 'Public Service', district: 'All districts', dataStatus: 'USER SUBMITTED',
      source: 'Submitted by citizen (awaiting DADSync verification against official portal)', sourceUrl: '',
      verifiedBy: '', verificationDate: '',
      summary: 'Citizen-reported service for applying to notified public services (income certificate, caste certificate, residential certificate, etc.) under Tripura\'s RTPS Act.',
      eligible: ['To be verified against the official RTPS service list and departmental rules'],
      documents: ['To be verified'],
      howToApply: ['Citizen-reported flow: apply via the state service portal or designated centres — exact portal URL pending verification'],
      dept: 'Tripura General Administration (Public Grievances) Department', lastVerified: '',
      notes: 'USER SUBMITTED — not yet independently verified by DADSync. Do not rely on the details above without confirming with the department.'
    },
    {
      id: 'gov-09', type: 'scheme', title: 'Chief Minister\'s (Tripura) special schemes — general note',
      category: 'Scheme', district: 'All districts', dataStatus: 'AI GENERATED',
      source: 'AI-generated placeholder — no official source attached', sourceUrl: '',
      verifiedBy: '', verificationDate: '',
      summary: 'Tripura-specific state schemes (agriculture subsidy, horticulture mission support, bamboo mission, etc.) exist across departments. This record is an AI-generated placeholder: the exact scheme list, amounts and deadlines MUST be sourced from the Tripura government portal before use.',
      eligible: ['Not available — do not rely on this record'],
      documents: ['Not available'],
      howToApply: ['Browse the Tripura government portal (tripura.gov.in) department-wise scheme list and add verified records'],
      dept: 'Government of Tripura (multiple departments)', lastVerified: '',
      notes: 'AI GENERATED placeholder. Intentionally empty of facts. To be replaced by verified departmental records.'
    },
    {
      id: 'gov-10', type: 'scheme', title: 'Startup India — recognition and tax benefits',
      category: 'Financial Support', district: 'All districts', dataStatus: 'VERIFIED',
      source: 'DPIIT, Ministry of Commerce & Industry / Startup India portal', sourceUrl: 'https://www.startupindia.gov.in/',
      verifiedBy: 'DADSync research desk', verificationDate: '2026-08-01',
      summary: 'DPIIT recognition for eligible startups enabling tax exemption benefits, access to funds, incubators and easier compliance under the Startup India initiative.',
      eligible: ['Entity incorporated as a private limited company, LLP or partnership registered in India', 'Age up to 10 years from incorporation (current policy)', 'Turnover up to ₹100 crore in any financial year', 'Not formed by splitting/reconstructing an existing business'],
      documents: ['Certificate of incorporation / registration', 'Proof of innovative product/service (eligibility self-certification)', 'Board resolution (for recognition application)'],
      howToApply: ['Register on the Startup India portal', 'Fill the DPIIT recognition application with incorporation details', 'Upload the required documents and self-certification', 'Recognition is granted upon review (typically within a few weeks)'],
      dept: 'DPIIT, Ministry of Commerce & Industry', lastVerified: '2026-08-01',
      notes: 'Tax benefits are subject to conditions under the Income Tax Act and require separate registration with the DPIIT. Verify the latest policy parameters on the portal.'
    }
  ];

  var SEED_FUNDING = [
    {
      id: 'fund-01', title: 'Startup India Seed Fund Scheme (SISFS)',
      org: 'DPIIT / Startup India', type: 'Grant', stage: 'Early', amount: 'Up to ₹20 lakh (seed), ₹50 lakh (follow-on)',
      district: 'All districts', sector: 'Startup', deadline: '', dataStatus: 'VERIFIED',
      source: 'Startup India portal (SISFS guidelines)', sourceUrl: 'https://www.startupindia.gov.in/',
      verifiedBy: 'DADSync research desk', verificationDate: '2026-08-01',
      summary: 'Financial assistance to startups for proof of concept, prototype development, product trials, market entry and commercialisation, disbursed through selected incubators (including some in the Northeast).',
      eligible: ['DPIIT-recognised startup', 'Incorporated in India, not older than 2 years at application', 'Clear business plan for commercialisation', 'Applied through an eligible incubator'],
      match: ['early-stage', 'technology', 'prototype'],
      notes: 'Selection happens via the nodal incubator. Tripura startups should check which incubators are currently empanelled and open for applications.'
    },
    {
      id: 'fund-02', title: 'North East Venture Fund (NEVF)',
      org: 'North Eastern Development Finance Corporation Ltd (NEDFi)', type: 'Equity/Debt', stage: 'Early–Growth', amount: 'Varies by round (up to ₹10 crore reported ceiling across stages)',
      district: 'All districts', sector: 'Startup', deadline: '', dataStatus: 'NEEDS VERIFICATION',
      source: 'NEDFi (amounts/terms to be re-verified against current fund documents)', sourceUrl: 'https://www.nedfi.com/',
      verifiedBy: '', verificationDate: '',
      summary: 'Venture fund for startups and enterprises based in the North East, managed through NEDFi with investments across early and growth stages. Current corpus and per-deal terms to be confirmed from NEDFi disclosures.',
      eligible: ['Enterprise based in the North Eastern Region', 'Stage and sector criteria per fund terms — to be confirmed'],
      match: ['early-stage', 'growth'],
      notes: 'NEEDS VERIFICATION — verify current terms with NEDFi before application.'
    },
    {
      id: 'fund-03', title: 'PM SVANidhi (Street Vendor) working capital loan',
      org: 'Ministry of Housing & Urban Affairs', type: 'Loan', stage: 'Early', amount: '₹10,000 first loan, up to ₹50,000 renewable',
      district: 'Urban areas', sector: 'MSME', deadline: '', dataStatus: 'VERIFIED',
      source: 'PM SVANidhi portal', sourceUrl: 'https://pmsvanidhi.mohua.gov.in/',
      verifiedBy: 'DADSync research desk', verificationDate: '2026-08-01',
      summary: 'Collateral-free working capital loan for street vendors with cash-back incentives on timely repayment.',
      eligible: ['Street vendors identified in vending zones by the urban local body', 'Age 18+', 'Vending ≥50 cumulative days in preceding 12 months'],
      match: ['street-vendor', 'msme'],
      notes: 'Apply through the urban local body and empanelled banks.'
    },
    {
      id: 'fund-04', title: 'PM Vishwakarma Yojana (craftsmen support)',
      org: 'Ministry of Micro, Small & Medium Enterprises', type: 'Loan', stage: 'Early', amount: 'Up to ₹1 lakh first loan, ₹2 lakh second (reported scheme design)',
      district: 'All districts', sector: 'Handicraft', deadline: '', dataStatus: 'NEEDS VERIFICATION',
      source: 'PM Vishwakarma scheme (official announcements; state enrolment dates to be confirmed)', sourceUrl: '',
      verifiedBy: '', verificationDate: '',
      summary: 'Support package for traditional artisans and craftspeople (carpenter, potter, weaver, blacksmith, etc.) including skill training and collateral-free loans. Enrolment mechanics for Tripura to be confirmed with the state MSME department.',
      eligible: ['Traditional artisans/craftsmen in the notified trades', 'Age and experience criteria per scheme guidelines — to be confirmed'],
      match: ['handicraft', 'msme'],
      notes: 'NEEDS VERIFICATION — confirm current enrolment window with Tripura MSME department.'
    },
    {
      id: 'fund-05', title: 'Mudra Loan (Shishu/Kishore/Tarun)',
      org: 'Ministry of Finance / participating banks', type: 'Loan', stage: 'Early', amount: 'Up to ₹50,000 / ₹5 lakh / ₹10 lakh by category',
      district: 'All districts', sector: 'MSME', deadline: '', dataStatus: 'VERIFIED',
      source: 'Pradhan Mantri MUDRA Yojana (PMMY) official scheme description', sourceUrl: 'https://www.mudra.org.in/',
      verifiedBy: 'DADSync research desk', verificationDate: '2026-08-01',
      summary: 'Collateral-free loans to non-corporate small business owners for income-generating activities, disbursed by banks/MFIs/NBFCs under PMMY.',
      eligible: ['Non-corporate micro/small enterprise owners', 'Manufacturing, trading, service or agriculture-allied activity', 'Bank credit history as per lender norms'],
      match: ['msme', 'early-stage'],
      notes: 'Approval depends on the lending institution\'s appraisal.'
    },
    {
      id: 'fund-06', title: 'PMFME — One District One Product (ODOP) support for Tripura products',
      org: 'Ministry of Food Processing Industries', type: 'Subsidy', stage: 'Early', amount: 'Credit-linked subsidy (details per ODOP guidelines)',
      district: 'All districts', sector: 'Food processing', deadline: '', dataStatus: 'NEEDS VERIFICATION',
      source: 'PM Formalisation of Micro Food Processing Enterprises (PMFME) scheme (state-specific details to be confirmed)', sourceUrl: '',
      verifiedBy: '', verificationDate: '',
      summary: 'Support for micro food processing enterprises including credit-linked capital subsidy, common infrastructure and training. Tripura ODOP product list and current implementation status to be confirmed with the state nodal agency.',
      eligible: ['Micro food processing enterprises (existing and new)', 'Category-specific criteria per ODOP guidelines — to be confirmed'],
      match: ['food-processing', 'msme'],
      notes: 'NEEDS VERIFICATION — confirm with the Tripura nodal department for food processing.'
    },
    {
      id: 'fund-07', title: 'Northeast agri-horticulture & bamboo value-chain support (illustrative)',
      org: 'Government of India / state departments', type: 'Subsidy', stage: 'Early', amount: 'Not disclosed — placeholder',
      district: 'All districts', sector: 'Agriculture', deadline: '', dataStatus: 'AI GENERATED',
      source: 'AI-generated placeholder — no verified source', sourceUrl: '',
      verifiedBy: '', verificationDate: '',
      summary: 'Illustrative placeholder for the various agriculture, horticulture and bamboo-sector support programmes active in Tripura across departments. No amounts or deadlines are asserted here.',
      eligible: ['Not available — do not rely on this record'],
      match: ['agriculture'],
      notes: 'AI GENERATED — replace with verified departmental programme records.'
    },
    {
      id: 'fund-08', title: 'Stand-Up India — loan to women/SC/ST entrepreneurs',
      org: 'Department of Financial Services (banks)', type: 'Loan', stage: 'Early', amount: '₹10 lakh to ₹1 crore',
      district: 'All districts', sector: 'MSME', deadline: '', dataStatus: 'VERIFIED',
      source: 'Stand-Up India scheme (official guidelines)', sourceUrl: 'https://www.standupmitra.in/',
      verifiedBy: 'DADSync research desk', verificationDate: '2026-08-01',
      summary: 'Composite loan (term loan + working capital) for greenfield enterprises of women, SC and ST entrepreneurs, at least one per scheduled bank branch.',
      eligible: ['Women or SC/ST entrepreneur', 'Greenfield enterprise (non-farm sector) in manufacturing, services or trading', 'Loan sought between ₹10 lakh and ₹1 crore'],
      match: ['women', 'sc-st', 'msme'],
      notes: 'Apply at a scheduled commercial bank branch under Stand-Up India.'
    },
    {
      id: 'fund-09', title: 'CGTMSE — collateral-free credit guarantee for MSEs',
      org: 'Ministry of MSME / CGTMSE', type: 'Guarantee', stage: 'Early', amount: 'Guarantee coverage on loans up to ₹2 crore (current ceiling)',
      district: 'All districts', sector: 'MSME', deadline: '', dataStatus: 'NEEDS VERIFICATION',
      source: 'CGTMSE (ceiling to be re-verified against current guidelines)', sourceUrl: 'https://www.cgtmse.in/',
      verifiedBy: '', verificationDate: '',
      summary: 'Credit guarantee for collateral-free loans extended to micro and small enterprises by member lending institutions. Ceiling and premium terms to be confirmed from CGTMSE circulars.',
      eligible: ['Micro & small enterprises (new and existing)', 'Loan from a member lending institution'],
      match: ['msme'],
      notes: 'NEEDS VERIFICATION — check current guarantee ceiling.'
    },
    {
      id: 'fund-10', title: 'Tripura Startup Ecosystem — state-level support (placeholder)',
      org: 'Tripura government (to be confirmed)', type: 'Grant/Support', stage: 'Early', amount: 'Not disclosed',
      district: 'All districts', sector: 'Startup', deadline: '', dataStatus: 'USER SUBMITTED',
      source: 'Community-submitted lead — unverified', sourceUrl: '',
      verifiedBy: '', verificationDate: '',
      summary: 'Community-reported leads about state-level startup support in Tripura. Nothing is asserted — to be verified with the Tripura Industries & Commerce Department before listing.',
      eligible: ['To be determined'],
      match: ['startup'],
      notes: 'USER SUBMITTED — awaiting verification.'
    }
  ];

  var SEED_PROBLEMS = [
    {
      id: 'prob-01', title: 'Potholes on National Highway near Dharmanagar',
      category: 'Roads', district: 'North Tripura', location: 'Dharmanagar, NH-8 stretch',
      description: 'Citizen report: multiple potholes on the highway stretch causing slow traffic and safety risk for two-wheelers during rains. [Demo seed — not a live verified report]',
      status: 'Submitted', priority: 'High', submittedAt: '2026-08-10T09:00:00+05:30',
      dataStatus: 'USER SUBMITTED', source: 'Demo seed record (illustrative)', sourceUrl: '',
      verifiedBy: '', verificationDate: '', contact: '', image: '',
      aiCategorisation: 'Roads', aiPriority: 'High', aiConfidence: 0.86
    },
    {
      id: 'prob-02', title: 'Irregular water supply in residential ward',
      category: 'Water', district: 'West Tripura', location: 'Agartala ward',
      description: 'Citizen report: intermittent supply and low pressure in the evening. [Demo seed — not a live verified report]',
      status: 'Under Review', priority: 'Medium', submittedAt: '2026-08-09T14:20:00+05:30',
      dataStatus: 'USER SUBMITTED', source: 'Demo seed record (illustrative)', sourceUrl: '',
      verifiedBy: '', verificationDate: '', contact: '', image: '',
      aiCategorisation: 'Water', aiPriority: 'Medium', aiConfidence: 0.91
    },
    {
      id: 'prob-03', title: 'Street light outage on market road',
      category: 'Electricity', district: 'Unakoti', location: 'Kailashahar market',
      description: 'Citizen report: street lights out for several nights affecting evening safety. [Demo seed — not a live verified report]',
      status: 'Verified', priority: 'Medium', submittedAt: '2026-08-07T18:05:00+05:30',
      dataStatus: 'USER SUBMITTED', source: 'Demo seed record (illustrative)', sourceUrl: '',
      verifiedBy: '', verificationDate: '2026-08-11', contact: '', image: '',
      aiCategorisation: 'Electricity', aiPriority: 'Medium', aiConfidence: 0.88
    },
    {
      id: 'prob-04', title: 'Waste collection gaps in residential colony',
      category: 'Waste', district: 'Gomati', location: 'Udaipur',
      description: 'Citizen report: irregular garbage collection leading to roadside accumulation. [Demo seed — not a live verified report]',
      status: 'In Progress', priority: 'Medium', submittedAt: '2026-08-05T11:10:00+05:30',
      dataStatus: 'USER SUBMITTED', source: 'Demo seed record (illustrative)', sourceUrl: '',
      verifiedBy: '', verificationDate: '', contact: '', image: '',
      aiCategorisation: 'Waste', aiPriority: 'Medium', aiConfidence: 0.9
    },
    {
      id: 'prob-05', title: 'Poor mobile internet connectivity in remote village',
      category: 'Internet/Connectivity', district: 'Dhalai', location: 'Gandacherra block',
      description: 'Citizen report: frequent call drops and weak data signal. [Demo seed — not a live verified report]',
      status: 'Resolved', priority: 'High', submittedAt: '2026-07-28T16:40:00+05:30',
      dataStatus: 'USER SUBMITTED', source: 'Demo seed record (illustrative)', sourceUrl: '',
      verifiedBy: '', verificationDate: '2026-08-02', contact: '', image: '',
      aiCategorisation: 'Internet/Connectivity', aiPriority: 'High', aiConfidence: 0.84,
      resolutionNote: 'Marked resolved in demo data after local feedback; no official confirmation claimed.'
    },
    {
      id: 'prob-06', title: 'School bus service shortage',
      category: 'Education', district: 'Sepahijala', location: 'Sonamura',
      description: 'Citizen report: students struggle due to limited bus frequency. [Demo seed — not a live verified report]',
      status: 'Submitted', priority: 'Medium', submittedAt: '2026-08-11T08:30:00+05:30',
      dataStatus: 'USER SUBMITTED', source: 'Demo seed record (illustrative)', sourceUrl: '',
      verifiedBy: '', verificationDate: '', contact: '', image: '',
      aiCategorisation: 'Education', aiPriority: 'Medium', aiConfidence: 0.87
    },
    {
      id: 'prob-07', title: 'Hospital OPD waiting time concern',
      category: 'Healthcare', district: 'South Tripura', location: 'Belonia',
      description: 'Citizen report: long queues at the OPD registration counter. [Demo seed — not a live verified report]',
      status: 'Under Review', priority: 'Medium', submittedAt: '2026-08-08T10:15:00+05:30',
      dataStatus: 'USER SUBMITTED', source: 'Demo seed record (illustrative)', sourceUrl: '',
      verifiedBy: '', verificationDate: '', contact: '', image: '',
      aiCategorisation: 'Healthcare', aiPriority: 'Medium', aiConfidence: 0.9
    },
    {
      id: 'prob-08', title: 'Irrigation canal blockage in farming cluster',
      category: 'Agriculture', district: 'Khowai', location: 'Khowai block',
      description: 'Citizen report: blocked canal affecting paddy fields. [Demo seed — not a live verified report]',
      status: 'Assigned', priority: 'High', submittedAt: '2026-08-03T09:45:00+05:30',
      dataStatus: 'USER SUBMITTED', source: 'Demo seed record (illustrative)', sourceUrl: '',
      verifiedBy: '', verificationDate: '', contact: '', image: '',
      aiCategorisation: 'Agriculture', aiPriority: 'High', aiConfidence: 0.92
    },
    {
      id: 'prob-09', title: 'Tourist signboards damaged near heritage site',
      category: 'Tourism', district: 'West Tripura', location: 'Ujjayanta Palace area',
      description: 'Citizen report: damaged directional signage for tourists. [Demo seed — not a live verified report]',
      status: 'Rejected', priority: 'Low', submittedAt: '2026-07-25T12:00:00+05:30',
      dataStatus: 'USER SUBMITTED', source: 'Demo seed record (illustrative)', sourceUrl: '',
      verifiedBy: '', verificationDate: '', contact: '', image: '',
      aiCategorisation: 'Tourism', aiPriority: 'Low', aiConfidence: 0.8,
      resolutionNote: 'Rejected in demo data (duplicate of an existing complaint channel).'
    }
  ];

  var SEED_OPPORTUNITIES = [
    {
      id: 'opp-01', district: 'Dhalai', sector: 'Tourism', title: 'Eco-tourism circuit around Dumboor Lake',
      problem: 'Dumboor Lake area has tourism potential but limited structured offerings and local enterprise.',
      solution: 'Community-led eco-tourism packages, homestays, guided bird-watching and water-based activities with digital booking.',
      resources: 'Training for homestay operators, small boats/equipment, digital booking platform, sanitation infrastructure.',
      stakeholders: 'Tripura Tourism, local self-help groups, district administration, travel operators.',
      difficulty: 'Medium', impact: 'High', dataStatus: 'AI GENERATED',
      source: 'AI-generated analysis based on publicly known geography — not an official study', sourceUrl: '',
      verifiedBy: '', verificationDate: '', notes: 'Treat as hypothesis; validate with district tourism data before investment.'
    },
    {
      id: 'opp-02', district: 'North Tripura', sector: 'Agriculture', title: 'Pineapple value-chain modernisation',
      problem: 'North Tripura is known for pineapple; post-harvest losses and price volatility hurt farmers.',
      solution: 'Collection and grading centres, cold storage, processing units (juice/pulp), and direct-market linkage.',
      resources: 'Cold chain investment, processing equipment, farmer producer organisation (FPO) formation, market tie-ups.',
      stakeholders: 'Agriculture department, FPOs, food processing enterprises, NABARD-supported programmes.',
      difficulty: 'Medium', impact: 'High', dataStatus: 'AI GENERATED',
      source: 'AI-generated analysis from sector knowledge — needs district-level validation', sourceUrl: '',
      verifiedBy: '', verificationDate: '', notes: 'Cross-check with the state agriculture department\'s crop statistics.'
    },
    {
      id: 'opp-03', district: 'West Tripura', sector: 'Digital services', title: 'Agartala IT services and remote-work hub',
      problem: 'Skilled youth in Agartala face limited local IT employment despite growing remote-work demand.',
      solution: 'Co-working + skill-training hub, industry tie-ups for remote internships, IT services incubator.',
      resources: 'Workspace, trainers, industry partnerships, stable connectivity (Agartala has better digital infra).',
      stakeholders: 'Startups, IT companies, Tripura Industrial Development Corporation (TIDC), educational institutions.',
      difficulty: 'Low', impact: 'High', dataStatus: 'AI GENERATED',
      source: 'AI-generated analysis — validate demand with industry surveys', sourceUrl: '',
      verifiedBy: '', verificationDate: '', notes: 'DADSync itself is a Dharmanagar-based AI/data company — related context.'
    },
    {
      id: 'opp-04', district: 'Sepahijala', sector: 'Handicraft', title: 'Bamboo craft cluster development',
      problem: 'Bamboo artisans have skill but limited design innovation and market access.',
      solution: 'Design workshops, product diversification, e-commerce listing, export-oriented bamboo products.',
      resources: 'Design consultants, common facility centre, marketplaces, bamboo treatment unit.',
      stakeholders: 'Handloom & Handicrafts department, Cane and Bamboo Technology Centre (CBTC), artisans\' groups.',
      difficulty: 'Medium', impact: 'Medium', dataStatus: 'AI GENERATED',
      source: 'AI-generated analysis — validate with handicrafts department data', sourceUrl: '',
      verifiedBy: '', verificationDate: '', notes: 'Cross-check CBTC programme status.'
    },
    {
      id: 'opp-05', district: 'Gomati', sector: 'Food processing', title: 'Local spice and turmeric processing',
      problem: 'Gomati district grows turmeric/ginger; local processing capacity is limited.',
      solution: 'Small processing units (powdering, packaging), FPO linkage, quality certification (GI/FSSAI).',
      resources: 'Processing machines, FSSAI compliance support, working capital, buyer linkages.',
      stakeholders: 'MSME department, FPOs, FSSAI, local cooperatives.',
      difficulty: 'Medium', impact: 'Medium', dataStatus: 'AI GENERATED',
      source: 'AI-generated analysis — needs district crop data validation', sourceUrl: '',
      verifiedBy: '', verificationDate: '', notes: 'Validate crop area statistics with the agriculture department.'
    },
    {
      id: 'opp-06', district: 'Unakoti', sector: 'Tourism', title: 'Heritage circuit development around Unakoti rock carvings',
      problem: 'Unakoti (famous rock-cut sculptures) lacks immersive visitor experience and local hospitality ecosystem.',
      solution: 'Guided heritage trails, museum/interpretation centre, local food experiences, festival events.',
      resources: 'ASI/tourism investment, guide training, hospitality startups, event management.',
      stakeholders: 'ASI, Tripura Tourism, district administration, local entrepreneurs.',
      difficulty: 'Medium', impact: 'High', dataStatus: 'AI GENERATED',
      source: 'AI-generated analysis based on known heritage site — not an official study', sourceUrl: '',
      verifiedBy: '', verificationDate: '', notes: 'Coordinate with ASI before any development near the monument.'
    },
    {
      id: 'opp-07', district: 'South Tripura', sector: 'Renewable energy', title: 'Solar micro-grids for remote habitations',
      problem: 'Some remote habitations face unreliable power; solar can improve reliability and reduce diesel use.',
      solution: 'Solar micro-grids, solar water pumps for agriculture, community charging stations.',
      resources: 'Capital subsidy programmes, technical partners, O&M training for local youth.',
      stakeholders: 'Tripura Renewable Energy Development Agency (TREDA), village committees, rural electrification programmes.',
      difficulty: 'High', impact: 'High', dataStatus: 'AI GENERATED',
      source: 'AI-generated analysis — validate with TREDA programme details', sourceUrl: '',
      verifiedBy: '', verificationDate: '', notes: 'TREDA exists; programme specifics need official confirmation.'
    },
    {
      id: 'opp-08', district: 'Khowai', sector: 'Rural development', title: 'Rural logistics and aggregation for farm produce',
      problem: 'Farmers in Khowai face high transport cost and middlemen for small volumes.',
      solution: 'Aggregation points, shared logistics (3-wheelers/light trucks), digital mandi linkage, cold chain on demand.',
      resources: 'Vehicle/subsidy programmes, FPOs, last-mile tech platform, warehousing.',
      stakeholders: 'Rural development dept, FPOs, logistics startups, district administration.',
      difficulty: 'Medium', impact: 'Medium', dataStatus: 'AI GENERATED',
      source: 'AI-generated analysis — validate with market and logistics data', sourceUrl: '',
      verifiedBy: '', verificationDate: '', notes: 'Cross-check with e-NAM and state mandi systems.'
    },
    {
      id: 'opp-09', district: 'West Tripura', sector: 'Education', title: 'Digital literacy and skilling centres',
      problem: 'Digital skill gap limits youth employability in digital-age jobs.',
      solution: 'Community digital literacy centres, coding/tools training, placement linkage with remote employers.',
      resources: 'Computers, trainers, curriculum partners, broadband, CSC network.',
      stakeholders: 'Education dept, CSC, IT companies, NGOs.',
      difficulty: 'Low', impact: 'High', dataStatus: 'AI GENERATED',
      source: 'AI-generated analysis — validate demand with education dept', sourceUrl: '',
      verifiedBy: '', verificationDate: '', notes: 'Pilot in one block before scaling.'
    },
    {
      id: 'opp-10', district: 'Sepahijala', sector: 'Healthcare', title: 'Telemedicine kiosks for rural health centres',
      problem: 'Specialist shortage in rural health centres means patients travel long distances.',
      solution: 'Telemedicine kiosks (video consult + e-prescription), medicine delivery, follow-up scheduling.',
      resources: 'Connectivity, kiosk hardware, MoU with telemedicine providers, training for health workers.',
      stakeholders: 'Health department, National Telemedicine Service (eSanjeevani), local PHCs.',
      difficulty: 'Medium', impact: 'High', dataStatus: 'AI GENERATED',
      source: 'AI-generated analysis — validate with health dept telemedicine coverage data', sourceUrl: '',
      verifiedBy: '', verificationDate: '', notes: 'eSanjeevani is a real national service; coverage in Tripura to be confirmed.'
    },
    {
      id: 'opp-11', district: 'Dhalai', sector: 'Agriculture', title: 'Organic spice and ginger FPO development',
      problem: 'Smallholder farmers lack collective bargaining and quality certification.',
      solution: 'Form FPOs, organic certification support, forward contracts with buyers, shared processing.',
      resources: 'FPO formation support (NABARD/state), certification costs, working capital.',
      stakeholders: 'NABARD, agriculture dept, FPO federations, buyers.',
      difficulty: 'Medium', impact: 'Medium', dataStatus: 'AI GENERATED',
      source: 'AI-generated analysis — validate with NABARD FPO programme details', sourceUrl: '',
      verifiedBy: '', verificationDate: '', notes: 'Check current FPO promotion scheme.'
    },
    {
      id: 'opp-12', district: 'Gomati', sector: 'Logistics', title: 'Warehousing and cold-storage gap study (Gomati)',
      problem: 'Limited warehousing capacity for agri produce and perishables near Udaipur.',
      solution: 'Shared warehousing/cold storage facility; feasibility study before investment.',
      resources: 'Feasibility study, private investment, subsidy programmes, land.',
      stakeholders: 'TIDC, NABARD, private investors, FPOs.',
      difficulty: 'High', impact: 'Medium', dataStatus: 'AI GENERATED',
      source: 'AI-generated analysis — feasibility study required before any claim', sourceUrl: '',
      verifiedBy: '', verificationDate: '', notes: 'AI-generated hypothesis only.'
    }
  ];

  var SEED_KNOWLEDGE = [
    {
      id: 'kb-01', title: 'What the Startup India ecosystem means for Tripura founders',
      category: 'Startup ecosystem', summary: 'A plain-language explainer of DPIIT startup recognition, tax benefits and how a Tripura founder can approach incubators and funding programmes.',
      source: 'Startup India portal (official)', sourceUrl: 'https://www.startupindia.gov.in/',
      publishedDate: '2026-07-20', verificationDate: '2026-08-01', dataStatus: 'VERIFIED',
      verifiedBy: 'DADSync research desk', tags: ['startup', 'funding', 'DPIIT'],
      body: 'Startup India recognition is granted by DPIIT to eligible young companies and unlocks several benefits: easier compliance, access to certain funds and tax benefits subject to conditions. For a Tripura founder the practical first steps are: (1) incorporate as a private limited company/LLP/partnership; (2) register on the Startup India portal; (3) apply for DPIIT recognition; (4) then approach incubators and state/national funding channels. This article is a summary of publicly documented information — always confirm current policy parameters on the official portal.'
    },
    {
      id: 'kb-02', title: 'Digital payments and e-governance services in Tripura — a quick overview',
      category: 'Digital governance', summary: 'Overview of how digital public infrastructure (Aadhaar, UPI, Common Service Centres) underpins day-to-day government services in Tripura.',
      source: 'Government of India digital India programme materials', sourceUrl: 'https://www.digitalindia.gov.in/',
      publishedDate: '2026-07-15', verificationDate: '2026-08-01', dataStatus: 'VERIFIED',
      verifiedBy: 'DADSync research desk', tags: ['digital-governance', 'CSC', 'UPI'],
      body: 'Common Service Centres act as access points for digital government services in rural areas. UPI and Aadhaar-based services are part of India\'s Digital Public Infrastructure. This article is a general explainer; specific Tripura service availability should be checked with the state e-governance agency.'
    },
    {
      id: 'kb-03', title: 'The bamboo economy of the Northeast — why it matters for Tripura',
      category: 'Local innovation', summary: 'Why bamboo is a strategic resource for the Northeast, and the kinds of enterprises (crafts, composites, biomass) that can build on it.',
      source: 'AI-drafted synthesis of public knowledge — cite specific reports before reuse', sourceUrl: '',
      publishedDate: '2026-08-01', verificationDate: '', dataStatus: 'AI GENERATED',
      verifiedBy: '', tags: ['bamboo', 'manufacturing', 'craft'],
      body: 'This article is an AI-drafted synthesis. The Northeast holds a large share of India\'s bamboo resources, and Tripura has an active bamboo craft tradition. Before quoting any statistic, replace this draft with a verified source such as a government report or NEDFi publication.'
    },
    {
      id: 'kb-04', title: 'How to verify a government scheme before applying',
      category: 'Government technology', summary: 'A practical checklist to confirm scheme details from official sources — avoiding scams and outdated information.',
      source: 'DADSync editorial (methodology article)', sourceUrl: '',
      publishedDate: '2026-08-05', verificationDate: '2026-08-05', dataStatus: 'VERIFIED',
      verifiedBy: 'DADSync editorial team', tags: ['verification', 'how-to', 'governance'],
      body: 'Steps: (1) find the official portal (look for .gov.in domains); (2) check the "guidelines" or "scheme document" PDF; (3) note the issuing department; (4) check the last updated date; (5) call the district/block office for the current application window. Never rely on unofficial third-party summaries for amounts and deadlines.'
    },
    {
      id: 'kb-05', title: 'AI for public service delivery — realistic use cases for small states',
      category: 'AI', summary: 'Realistic, low-risk ways a state like Tripura can use AI: grievance triage, document digitisation, language translation, scheme eligibility matching.',
      source: 'AI-drafted explainer (based on general public-sector AI literature)', sourceUrl: '',
      publishedDate: '2026-07-28', verificationDate: '', dataStatus: 'AI GENERATED',
      verifiedBy: '', tags: ['AI', 'public-service', 'governance'],
      body: 'AI-drafted explainer. Use cases described are illustrative and based on general public-sector practice; validate feasibility with pilot projects before scaling.'
    },
    {
      id: 'kb-06', title: 'Reading a tender notice correctly',
      category: 'Government technology', summary: 'How to read a government tender/e-tender: eligibility, EMD, pre-bid meeting, technical vs financial bid, and common mistakes.',
      source: 'DADSync editorial (methodology article)', sourceUrl: '',
      publishedDate: '2026-08-03', verificationDate: '2026-08-03', dataStatus: 'VERIFIED',
      verifiedBy: 'DADSync editorial team', tags: ['tenders', 'how-to', 'msme'],
      body: 'A tender usually contains: issuing authority, eligibility criteria, EMD amount, bid submission dates, technical specifications, and evaluation criteria. Common mistakes: missing documents, late submission, not reading corrigenda. Always download the original NIT from the official e-tender portal (e.g. the state/procurement portal).'
    },
    {
      id: 'kb-07', title: 'Agri-tech opportunities in the Northeast — draft overview',
      category: 'Agriculture technology', summary: 'AI-drafted overview of agri-tech directions (FPOs, precision agri, post-harvest) relevant to the Northeast. Cite official data before reuse.',
      source: 'AI-generated draft — no verified statistics', sourceUrl: '',
      publishedDate: '2026-08-06', verificationDate: '', dataStatus: 'AI GENERATED',
      verifiedBy: '', tags: ['agritech', 'fpo', 'post-harvest'],
      body: 'AI-drafted. All figures must be replaced with verified sources (state agriculture statistics, NABARD reports) before publication.'
    },
    {
      id: 'kb-08', title: 'Tourism technology trends — what Tripura could adopt',
      category: 'Tourism technology', summary: 'Digital tools for destinations: booking platforms, QR-based audio guides, digital marketing, visitor analytics.',
      source: 'AI-drafted explainer — validate with tourism department data', sourceUrl: '',
      publishedDate: '2026-08-04', verificationDate: '', dataStatus: 'AI GENERATED',
      verifiedBy: '', tags: ['tourism', 'digital'],
      body: 'AI-drafted explainer of tourism-technology directions. Validate current visitor statistics and digital adoption with Tripura Tourism before planning.'
    }
  ];

  /* ---------------------------- Storage helpers ---------------------------- */
  function loadJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var parsed = JSON.parse(raw);
      return parsed || fallback;
    } catch (e) { return fallback; }
  }
  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
  }

  function mergeRecords(seed, storedKey, storedField) {
    var stored = loadJSON(storedKey, null);
    if (!stored) return seed.slice();
    var storedList = (stored && stored[storedField]) || [];
    var byId = {};
    seed.forEach(function (r) { byId[r.id] = r; });
    storedList.forEach(function (r) { if (r && r.id) byId[r.id] = r; });
    return Object.keys(byId).map(function (k) { return byId[k]; });
  }

  function buildStore() {
    return {
      schemes: mergeRecords(SEED_SCHEMES, LS_KEY, 'schemes'),
      funding: mergeRecords(SEED_FUNDING, LS_KEY, 'funding'),
      problems: mergeRecords(SEED_PROBLEMS, LS_KEY, 'problems'),
      opportunities: mergeRecords(SEED_OPPORTUNITIES, LS_KEY, 'opportunities'),
      knowledge: mergeRecords(SEED_KNOWLEDGE, LS_KEY, 'knowledge'),
      userProblems: loadJSON(PROBLEM_KEY, [])
    };
  }

  /* ---------------------------- Search + scoring ---------------------------- */
  function norm(s) { return String(s || '').toLowerCase().replace(/\s+/g, ' ').trim(); }

  function haystack(record) {
    return norm([record.title, record.summary, record.description, record.category,
      record.district, record.sector, record.org, record.dept, record.problem,
      record.solution, record.source, record.tags ? record.tags.join(' ') : ''].join(' '));
  }

  function searchIn(list, q) {
    var needle = norm(q);
    if (!needle) return list;
    var terms = needle.split(' ');
    return list.filter(function (r) {
      var h = haystack(r);
      return terms.every(function (t) { return h.indexOf(t) !== -1; });
    });
  }

  function filterBy(list, f) {
    if (!f) return list;
    var out = list.filter(function (r) {
      if (f.dataStatus && f.dataStatus !== 'ALL' && (r.dataStatus || '').toUpperCase() !== f.dataStatus.toUpperCase()) return false;
      if (f.district && f.district !== 'ALL' && (r.district || '') !== f.district) return false;
      if (f.category && f.category !== 'ALL' && (r.category || '') !== f.category) return false;
      if (f.sector && f.sector !== 'ALL' && (r.sector || '') !== f.sector) return false;
      if (f.status && f.status !== 'ALL' && (r.status || '') !== f.status) return false;
      if (f.type && f.type !== 'ALL') {
        var t = (r.type || '').toUpperCase();
        if (t !== f.type.toUpperCase()) return false;
      }
      return true;
    });
    return out;
  }

  function paginate(list, page, perPage) {
    var p = Math.max(1, page || 1);
    var n = Math.max(1, perPage || 9);
    var total = list.length;
    var pages = Math.max(1, Math.ceil(total / n));
    var start = (p - 1) * n;
    return { items: list.slice(start, start + n), page: p, pages: pages, total: total };
  }

  /* AI Match Score: rule-based, transparent matching (works offline;
     swap for a real model API later without changing the UI contract). */
  function matchScore(opp, profile) {
    if (!profile || !profile.sector) return 0;
    var score = 0; var reasons = [];
    if (profile.sector === opp.sector) { score += 40; reasons.push('Sector matches your profile (' + opp.sector + ')'); }
    if (profile.district && profile.district === opp.district) { score += 20; reasons.push('Same district — lower execution friction'); }
    var pStage = norm(profile.stage || '');
    var oStage = norm(opp.stage || '');
    if (pStage && oStage && pStage === oStage) { score += 15; reasons.push('Stage alignment'); }
    else if (pStage && oStage && (pStage === 'early' || oStage === 'early')) { score += 8; reasons.push('Partial stage overlap'); }
    if (profile.fundingNeed) {
      var need = parseFloat(profile.fundingNeed) || 0;
      var amount = parseFloat(String(opp.amount || '').replace(/[^0-9.]/g, ''));
      if (amount && need && amount >= need * 0.5 && amount <= need * 3) { score += 10; reasons.push('Funding amount range compatible'); }
    }
    if (profile.motivation && opp.impact === 'High') { score += 5; reasons.push('High-impact opportunity'); }
    if (profile.district && profile.district !== opp.district && opp.district === 'All districts') { score += 5; reasons.push('Applies state-wide'); }
    if ((opp.match || []).some(function (m) { return norm(m) === norm(profile.sector); })) { score += 5; reasons.push('Listed as a target profile for this opportunity'); }
    var capped = Math.min(100, Math.round(score));
    if (reasons.length === 0) reasons.push('Not enough profile data — build your profile to unlock matching');
    return { score: capped, reasons: reasons };
  }

  /* ---------------------------- Public API ---------------------------- */
  var store = buildStore();

  function persistAll() {
    saveJSON(LS_KEY, {
      schemes: store.schemes, funding: store.funding, problems: store.problems,
      opportunities: store.opportunities, knowledge: store.knowledge
    });
  }

  function uid(prefix) {
    return (prefix || 'rec') + '-' + Date.now().toString(36) + '-' + Math.floor(Math.random() * 1e5).toString(36);
  }

  window.TADS = {
    STATUS: DATA_STATUS,
    DISTRICTS: DISTRICTS.slice(),
    SECTORS: SECTORS.slice(),
    PROBLEM_CATEGORIES: PROBLEM_CATEGORIES.slice(),
    PROBLEM_STATUSES: PROBLEM_STATUSES.slice(),
    GOV_CATEGORIES: GOV_CATEGORIES.slice(),
    KNOWLEDGE_CATEGORIES: KNOWLEDGE_CATEGORIES.slice(),

    getSchemes: function () { return store.schemes; },
    getFunding: function () { return store.funding; },
    getProblems: function () { return store.problems; },
    getOpportunities: function () { return store.opportunities; },
    getKnowledge: function () { return store.knowledge; },
    getUserProblems: function () { return store.userProblems; },

    searchSchemes: function (q, f, page, perPage) { return paginate(filterBy(searchIn(store.schemes, q), f), page, perPage); },
    searchFunding: function (q, f, page, perPage) { return paginate(filterBy(searchIn(store.funding, q), f), page, perPage); },
    searchProblems: function (q, f, page, perPage) { return paginate(filterBy(searchIn(store.problems, q), f), page, perPage); },
    searchOpportunities: function (q, f, page, perPage) { return paginate(filterBy(searchIn(store.opportunities, q), f), page, perPage); },
    searchKnowledge: function (q, f, page, perPage) { return paginate(filterBy(searchIn(store.knowledge, q), f), page, perPage); },

    /* Unified search across all datasets */
    searchAll: function (q, f, limit) {
      var lim = limit || 30;
      var res = {
        schemes: searchIn(store.schemes, q).slice(0, lim),
        funding: searchIn(store.funding, q).slice(0, lim),
        problems: searchIn(store.problems, q).slice(0, lim),
        opportunities: searchIn(store.opportunities, q).slice(0, lim),
        knowledge: searchIn(store.knowledge, q).slice(0, lim),
        total: 0
      };
      if (f && f.dataStatus && f.dataStatus !== 'ALL') {
        res.schemes = res.schemes.filter(function (r) { return (r.dataStatus || '').toUpperCase() === f.dataStatus.toUpperCase(); });
        res.funding = res.funding.filter(function (r) { return (r.dataStatus || '').toUpperCase() === f.dataStatus.toUpperCase(); });
        res.problems = res.problems.filter(function (r) { return (r.dataStatus || '').toUpperCase() === f.dataStatus.toUpperCase(); });
        res.opportunities = res.opportunities.filter(function (r) { return (r.dataStatus || '').toUpperCase() === f.dataStatus.toUpperCase(); });
        res.knowledge = res.knowledge.filter(function (r) { return (r.dataStatus || '').toUpperCase() === f.dataStatus.toUpperCase(); });
      }
      res.total = res.schemes.length + res.funding.length + res.problems.length + res.opportunities.length + res.knowledge.length;
      return res;
    },

    getRecord: function (type, id) {
      var list = store[type] || [];
      for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
      return null;
    },

    /* AI-assisted categorisation + prioritisation for citizen problems
       (keyword heuristic — swap for a real NLP model later). */
    aiAnalyse: function (title, description) {
      var text = norm(title + ' ' + description);
      var cat = 'Local infrastructure';
      var best = 0;
      var map = {
        'Roads': ['road', 'pothole', 'bridge', 'street'], 'Water': ['water', 'supply', 'pipeline', 'tube well'],
        'Electricity': ['power', 'electric', 'light', 'outage'], 'Waste': ['waste', 'garbage', 'trash', 'litter'],
        'Transport': ['bus', 'transport', 'train', 'auto'], 'Education': ['school', 'student', 'college', 'teacher'],
        'Healthcare': ['hospital', 'health', 'doctor', 'clinic'], 'Agriculture': ['crop', 'farm', 'irrigation', 'fertiliser'],
        'Tourism': ['tourist', 'heritage', 'temple', 'tourism'], 'Government services': ['certificate', 'licence', 'ration', 'scheme'],
        'Internet/Connectivity': ['internet', 'mobile', 'signal', 'network', 'broadband', '4g', 'connectivity']
      };
      Object.keys(map).forEach(function (k) {
        var c = 0;
        map[k].forEach(function (w) { if (text.indexOf(w) !== -1) c++; });
        if (c > best) { best = c; cat = k; }
      });
      var priority = 'Low';
      var keys = ['urgent', 'emergency', 'safety', 'accident', 'danger', 'blocked', 'no water', 'no power'];
      keys.forEach(function (w) { if (text.indexOf(w) !== -1) priority = 'High'; });
      if (priority === 'Low' && best >= 2) priority = 'Medium';
      var confidence = Math.min(0.97, 0.55 + best * 0.12);
      return { category: cat, priority: priority, confidence: Math.round(confidence * 100) / 100 };
    },

    addProblem: function (data) {
      var rec = {
        id: uid('prob'), title: data.title, description: data.description,
        category: data.category, district: data.district, location: data.location || '',
        image: data.image || '', contact: data.contact || '', status: 'Submitted',
        priority: data.priority || 'Medium', submittedAt: new Date().toISOString(),
        dataStatus: 'USER SUBMITTED', source: 'Submitted by citizen via DADSync Tripura AI',
        sourceUrl: '', verifiedBy: '', verificationDate: '',
        aiCategorisation: data.aiCategorisation || '', aiPriority: data.aiPriority || '',
        aiConfidence: data.aiConfidence || null
      };
      store.problems.unshift(rec);
      store.userProblems.unshift(rec);
      persistAll();
      saveJSON(PROBLEM_KEY, store.userProblems);
      return rec;
    },

    /* Admin: update any record (verification status, source fields, content) */
    updateRecord: function (type, id, patch) {
      var list = store[type];
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) {
          var next = {};
          var k;
          for (k in list[i]) next[k] = list[i][k];
          for (k in patch) if (patch[k] !== undefined) next[k] = patch[k];
          if (patch.dataStatus) { next.verifiedBy = patch.verifiedBy || ''; next.verificationDate = patch.verificationDate || ''; }
          list[i] = next;
          persistAll();
          return next;
        }
      }
      return null;
    },

    addRecord: function (type, data) {
      var rec = Object.assign({ id: uid(type), dataStatus: 'USER SUBMITTED', source: '', sourceUrl: '', verifiedBy: '', verificationDate: '' }, data);
      store[type].unshift(rec);
      persistAll();
      return rec;
    },

    /* Entrepreneur profile (stored locally, never transmitted) */
    getProfile: function () { return loadJSON(PROFILE_KEY, null); },
    saveProfile: function (p) { saveJSON(PROFILE_KEY, p); return p; },
    matchScore: matchScore,

    /* Saved/bookmarked opportunities */
    getSaved: function () { return loadJSON(SAVED_KEY, []); },
    isSaved: function (id) { return loadJSON(SAVED_KEY, []).indexOf(id) !== -1; },
    toggleSaved: function (id) {
      var s = loadJSON(SAVED_KEY, []);
      var i = s.indexOf(id);
      if (i === -1) s.push(id); else s.splice(i, 1);
      saveJSON(SAVED_KEY, s);
      return i === -1;
    },

    resetData: function () {
      try { localStorage.removeItem(LS_KEY); localStorage.removeItem(PROBLEM_KEY); } catch (e) {}
      store = buildStore();
      return true;
    },

    /* API interface contract (for a future backend) */
    API: {
      baseUrl: '',            /* e.g. https://api.dadsync.in/v1 — set via env at build time */
      authToken: '',          /* injected at runtime; NEVER hardcoded */
      endpoints: {
        schemes: '/governance/schemes', funding: '/funding/opportunities', problems: '/citizen/problems',
        opportunities: '/opportunities/map', knowledge: '/knowledge/articles', profile: '/profile/me'
      },
      note: 'When a backend is connected, replace the local store functions with fetch() calls to these endpoints. The UI only talks to window.TADS, so no UI change is required.'
    }
  };
})();
