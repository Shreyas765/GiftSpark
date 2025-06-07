import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { format } = await request.json();

    const prompt = `Describe this email format pattern in a clear, concise way: ${format}
    Focus on explaining how it works and what it's good for. Keep it under 2 sentences.`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      max_tokens: 100,
      temperature: 0.7,
    });

    const description = completion.choices[0]?.message?.content || '';

    return NextResponse.json({ description });
  } catch (error) {
    console.error('Error generating format description:', error);
    return NextResponse.json(
      { error: 'Failed to generate description' },
      { status: 500 }
    );
  }
} 