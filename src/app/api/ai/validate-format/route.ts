import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { format, testName } = await request.json();

    const prompt = `Validate this email format pattern: ${format}
    Test it with this name: ${testName.firstName} ${testName.lastName}
    
    Check for:
    1. Proper variable usage (firstName and lastName)
    2. Valid email structure (@ and domain)
    3. Any potential issues
    
    Respond with either:
    - "VALID" if the format is correct
    - A specific error message if there are issues`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      max_tokens: 150,
      temperature: 0.3,
    });

    const response = completion.choices[0]?.message?.content || '';
    
    if (response.trim() === 'VALID') {
      return NextResponse.json({ valid: true });
    } else {
      return NextResponse.json({ error: response });
    }
  } catch (error) {
    console.error('Error validating format:', error);
    return NextResponse.json(
      { error: 'Failed to validate format' },
      { status: 500 }
    );
  }
} 