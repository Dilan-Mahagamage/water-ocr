import os
import time
# Note: Ensure you have installed the new SDK: pip install google-genai
from pathlib import Path
from google import genai
from google.genai import types

# 1. Initialize the Client
# Replacement: Use your API key here
client = genai.Client(api_key='AIzaSyC0YG04sSB3C5at3TEceIPqMGKqA_Pb5sE')

# 2. These are your 43 headers
CSV_HEADERS = """Date,Hour,Raw Water (m3/h),Intake Pumo Comb,Raw Water_Tur,PH.,Con,prelime_ppm,prelime_l/m,Alum_ppm,Alum_Tank_strength,Aetator_Flow rate (l/m),D Chamber_Flow rate (l/m),Post lime_SPH 1_ppm,Post lime_SPH1_l/m,Post lime_SPH2_ppm,Post lime_SPH2_l/m,Chlorine_Pre_ppm,Chlorine_Pre_l/m,Chlorine_Post_ppm,Chlorine_Post_l/m,Settled Water_Pul: Tube_Tur.,Settled Water_Pul: Tube_PH.,Settled Water_Pulsator_Tur.,Settled Water_Pulsator_PH.,Settled Water_CF1_Tur.,Settled Water_CF1_PH.,Settled Water_CF2_Tur.,Settled Water_CF2_PH.,Settled Water_PT1_Tur.,Settled Water_PT1_PH.,Settled Water_PT2_Tur.,Settled Water_PT2_PH.,Filtered Water_Tur,Filtered Water_PH,Final Water_SPH1_Tur,Final Water_SPH1_PH,Final Water_SPH1_Co,Final Water_SPH1_RCL,Final Water_SPH2_Tur,Final Water_SPH2_PH,Final Water_SPH2_Co,Final Water_SPH2_RCL"""

def process_water_logs(input_folder, output_file):
    # Initialize the CSV file with headers
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(CSV_HEADERS + "\n")

    folder_path = Path(input_folder)
    
    # Iterate through images in the folder
    for img_path in folder_path.glob('*'):
        if img_path.suffix.lower() in ['.png', '.jpg', '.jpeg']:
            print(f"Processing: {img_path.name}")
            
            # Read the image bytes
            with open(img_path, 'rb') as img_file:
                image_bytes = img_file.read()

            try:
                # FIXED: Changed model to 'gemini-2.0-flash' (or use 'gemini-1.5-flash')
                response = client.models.generate_content(
                    model='gemini-2.5-flash', 
                    contents=[
                        f"Extract the data from this handwritten water quality log. Format as a CSV row using these headers: {CSV_HEADERS}. Only return the row data, no markdown or text. Use 'nan' for empty cells.",
                        types.Part.from_bytes(data=image_bytes, mime_type='image/png')
                    ]
                )

                # Append the response to your master CSV
                if response.text:
                    with open(output_file, 'a', encoding='utf-8') as f:
                        # Strip any accidental markdown formatting
                        clean_row = response.text.replace('```csv', '').replace('```', '').strip()
                        f.write(clean_row + "\n")
                
                # Small delay to prevent hitting rate limits
                time.sleep(1)

            except Exception as e:
                print(f"Failed to process {img_path.name}: {e}")

# --- UPDATED LOCATIONS ---
# Your project location: D:\gvision OCR\Script
# Your image folder: D:\gvision OCR\Script\img
IMAGE_FOLDER = r'D:\gvision OCR\Script\img'
OUTPUT_CSV = 'Consolidated_Water_Data.csv'

process_water_logs(IMAGE_FOLDER, OUTPUT_CSV)
print(f"Digitization complete! File saved as {OUTPUT_CSV}")