import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GIFTSPARK_OPENAI,
});

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json();

    const prompt = `Given the following employee name and email address, analyze how the email is constructed from the name. Identify the pattern using these variables:
- {firstName}
- {lastName}
- {firstInitial}
- {lastInitial}

1. Output the email template pattern as a string using these variables and the actual domain from the input email (e.g., {firstInitial}{lastName}@company.com).
2. Output a concise description of the pattern (e.g., 'first initial + last name + @company.com').
3. Output an example email for the name 'Jane Doe' using the same pattern and domain.

If the pattern does not match exactly {firstName}{lastName}, do not default to it. Only use the variables that match the pattern.

Respond ONLY in this JSON format:
{"format": "...", "description": "...", "example": "..."}

Name: ${name}
Email: ${email}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
      max_tokens: 180,
      temperature: 0
    });

    const response = completion.choices[0]?.message?.content?.trim() || '';
    let parsed;
    try {
      parsed = JSON.parse(response);
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      return NextResponse.json(
        { error: 'Failed to parse email format analysis' },
        { status: 500 }
      );
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