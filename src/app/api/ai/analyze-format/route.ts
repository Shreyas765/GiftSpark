import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GIFTSPARK_OPENAI,
});

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    const prompt = `Given the following employee name and email address, output:
1. The email template pattern as a string using variables in curly braces (e.g., {firstName}{lastName}@company.com)
2. A concise description of the pattern, using only symbols and variable names (e.g., 'first name + last name + @company.com').
3. An example email for the name 'Jane Doe' using the same pattern and the same domain as the input email. Do NOT use the original input email for the example. The example must be for Jane Doe only.
Respond in JSON:
{"format": "...", "description": "...", "example": "..."}

Name: ${name}
Email: ${email}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
      max_tokens: 120,
      temperature: 0,
    });

    // Try to parse the JSON from the response
    const response = completion.choices[0]?.message?.content?.trim() || '';
    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch {
      parsed = { format: response, description: '', example: '' };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error analyzing email format:', error);
    return NextResponse.json(
      { error: 'Failed to analyze email format' },
      { status: 500 }
    );
  }
} 