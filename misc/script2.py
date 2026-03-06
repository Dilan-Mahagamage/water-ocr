import os
import time
from pathlib import Path
from google import genai
from google.genai import types

# 1. Setup Client
client = genai.Client(api_key='AIzaSyC0YG04sSB3C5at3TEceIPqMGKqA_Pb5sE')

# EXACT headers from your reference file
CSV_HEADERS = """Date,Hour,Raw Water (m3/h),Intake Pumo Comb,Raw Water_Tur,PH.,Con,prelime_ppm,prelime_l/m,Alum_ppm,Alum_Tank_strength,Aetator_Flow rate (l/m),D Chamber_Flow rate (l/m),Post lime_SPH 1_ppm,Post lime_SPH1_l/m,Post lime_SPH2_ppm,Post lime_SPH2_l/m,Chlorine_Pre_ppm,Chlorine_Pre_l/m,Chlorine_Post_ppm,Chlorine_Post_l/m,Settled Water_Pul: Tube_Tur.,Settled Water_Pul: Tube_PH.,Settled Water_Pulsator_Tur.,Settled Water_Pulsator_PH.,Settled Water_CF1_Tur.,Settled Water_CF1_PH.,Settled Water_CF2_Tur.,Settled Water_CF2_PH.,Settled Water_PT1_Tur.,Settled Water_PT1_PH.,Settled Water_PT2_Tur.,Settled Water_PT2_PH.,Filtered Water_Tur,Filtered Water_PH,Final Water_SPH1_Tur,Final Water_SPH1_PH,Final Water_SPH1_Co,Final Water_SPH1_RCL,Final Water_SPH2_Tur,Final Water_SPH2_PH,Final Water_SPH2_Co,Final Water_SPH2_RCL"""

# ADD A REFERENCE EXAMPLE (Take one row you know is 100% correct)
EXAMPLE_ROW = "2022-08-23,0,12500,60+12,9.3,6.8,68,0,0,9,7.5,10,19,5,10,5,8,1,13,1.2,15,1.7,6.5,2.2,6.5,1.9,6.5,-,-,2.1,6.5,1.7,6.5,0.5,6.5,1.1,6.8,72.0,0.5,0.6,6.7,67.0,0.5"

SYSTEM_PROMPT = f"""
ROLE: You are an industrial data entry expert.
TASK: Extract handwriting into a 43-column CSV row.

REFERENCE STRUCTURE:
Headers: {CSV_HEADERS}
Example Correct Row: {EXAMPLE_ROW}

STRICT DATA GAPS:
- 'Settled Water' (Col 22-33): Leave BLANK (,,) for hours: 1,3,5,7,9,11,15,17,19,21,23.
- 'Filtered/Final' (Col 34-43): Leave BLANK (,,) for hours: 1,2,4,5,7,8,10,11,13,14,16,17,19,20,22,23.

ACCURACY RULES:
- Scan line-by-line using the 'Hour' column as your anchor.
- If a value is present on the paper but doesn't match the blank-hour rule, follow the paper's data.
- If a value is genuinely unreadable, use 'nan'.
- Output ONLY raw CSV text.
"""

def process_batch():
    IMAGE_DIR = Path(r"D:\gvision OCR\Script\img")
    OUTPUT_FILE = r"D:\gvision OCR\Script\Improved_Water_Data.csv"

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(CSV_HEADERS + "\n")

    for img_path in IMAGE_DIR.glob('*'):
        if img_path.suffix.lower() in ['.png', '.jpg', '.jpeg']:
            print(f"Analyzing {img_path.name} with deep reasoning...")
            
            with open(img_path, 'rb') as img_file:
                image_bytes = img_file.read()

            try:
                # Using Gemini 3 Flash Preview for the best vision reasoning
                response = client.models.generate_content(
                    model='gemini-2.5-flash',
                    contents=[
                        types.Part.from_bytes(data=image_bytes, mime_type='image/png'),
                        "Digitize the full 24-hour log. Double-check your column alignment against the reference example."
                    ],
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        temperature=0.0,
                        # Setting top_p and top_k to minimize randomness
                        top_p=0.1,
                        top_k=1
                    )
                )

                if response.text:
                    # Clean any accidental markdown code blocks
                    clean_text = response.text.replace('```csv', '').replace('```', '').strip()
                    with open(OUTPUT_FILE, 'a', encoding='utf-8') as f:
                        f.write(clean_text + "\n")
                
                time.sleep(2) # Protect API quota

            except Exception as e:
                print(f"Skipped {img_path.name}: {e}")

if __name__ == "__main__":
    process_batch()