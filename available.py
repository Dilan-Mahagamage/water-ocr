import google.generativeai as genai

# Use your existing configuration
genai.configure(api_key='AIzaSyBqkIi37IiV7JLRPSIysqTCLzytr5YEars')

print("Available models that support content generation:")
for m in genai.list_models():
    if 'generateContent' in m.supported_generation_methods:
        print(f"Name: {m.name}")
        print(f"Display Name: {m.display_name}")
        print(f"Description: {m.description}\n")