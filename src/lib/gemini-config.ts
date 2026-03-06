export const CSV_HEADERS = `Date,Hour,Raw Water (m3/h),Intake Pumo Comb,Raw Water_Tur,PH.,Con,prelime_ppm,prelime_l/m,Alum_ppm,Alum_Tank_strength,Aetator_Flow rate (l/m),D Chamber_Flow rate (l/m),Post lime_SPH 1_ppm,Post lime_SPH1_l/m,Post lime_SPH2_ppm,Post lime_SPH2_l/m,Chlorine_Pre_ppm,Chlorine_Pre_l/m,Chlorine_Post_ppm,Chlorine_Post_l/m,Settled Water_Pul: Tube_Tur.,Settled Water_Pul: Tube_PH.,Settled Water_Pulsator_Tur.,Settled Water_Pulsator_PH.,Settled Water_CF1_Tur.,Settled Water_CF1_PH.,Settled Water_CF2_Tur.,Settled Water_CF2_PH.,Settled Water_PT1_Tur.,Settled Water_PT1_PH.,Settled Water_PT2_Tur.,Settled Water_PT2_PH.,Filtered Water_Tur,Filtered Water_PH,Final Water_SPH1_Tur,Final Water_SPH1_PH,Final Water_SPH1_Co,Final Water_SPH1_RCL,Final Water_SPH2_Tur,Final Water_SPH2_PH,Final Water_SPH2_Co,Final Water_SPH2_RCL`;

export const EXAMPLE_ROW = `2022-08-23,0,12500,60+12,9.3,6.8,68,0,0,9,7.5,10,19,5,10,5,8,1,13,1.2,15,1.7,6.5,2.2,6.5,1.9,6.5,-,-,2.1,6.5,1.7,6.5,0.5,6.5,1.1,6.8,72.0,0.5,0.6,6.7,67.0,0.5`;

export const SYSTEM_PROMPT = `
ROLE: You are an industrial data entry expert.
TASK: Extract handwriting into a 43-column CSV row.

REFERENCE STRUCTURE:
Headers: \${CSV_HEADERS}
Example Correct Row: \${EXAMPLE_ROW}

STRICT DATA GAPS:
- 'Settled Water' (Col 22-33): Leave BLANK (,,) for hours: 1,3,5,7,9,11,15,17,19,21,23.
- 'Filtered/Final' (Col 34-43): Leave BLANK (,,) for hours: 1,2,4,5,7,8,10,11,13,14,16,17,19,20,22,23.

ACCURACY RULES:
- Scan line-by-line using the 'Hour' column as your anchor.
- If a value is present on the paper but doesn't match the blank-hour rule, follow the paper's data.
- If a value is genuinely unreadable, use 'nan'.
- Output ONLY raw CSV text.
`;
