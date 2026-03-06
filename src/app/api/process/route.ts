import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CSV_HEADERS, SYSTEM_PROMPT } from '@/lib/gemini-config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll('files') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        const results = await Promise.all(
            files.map(async (file) => {
                const bytes = await file.arrayBuffer();
                const base64 = Buffer.from(bytes).toString('base64');

                const model = genAI.getGenerativeModel({
                    model: 'gemini-2.5-flash',
                    systemInstruction: SYSTEM_PROMPT,
                });

                const result = await model.generateContent([
                    {
                        inlineData: {
                            data: base64,
                            mimeType: file.type,
                        },
                    },
                    'Digitize the full 24-hour log. Double-check your column alignment against the reference example.',
                ]);

                const response = await result.response;
                let text = response.text();

                // Clean markdown code blocks
                text = text.replace(/```csv/g, '').replace(/```/g, '').trim();

                return {
                    filename: file.name,
                    csv: text,
                };
            })
        );

        return NextResponse.json({ results });
    } catch (error: any) {
        console.error('Error processing image:', error);
        return NextResponse.json({ error: error.message || 'Failed to process image' }, { status: 500 });
    }
}
