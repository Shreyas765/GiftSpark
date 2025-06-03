import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.GIFTSPARK_OPENAI,
});

export async function POST(req: Request) {
  try {
    const { description } = await req.json();

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    console.log('Generating recommendations for:', description);

    const prompt = `You are a helpful and creative corporate gift assistant. HR will provide a short description of an employee including age, role, personality traits, interests, and any notable achievements or events. Based on this, recommend one tangible, thoughtful gift that reflects their persona and contribution. Include:

      Gift: [Gift Title]
      Query: [Search query HR can use on Amazon or a vendor site]

      Rules:
      - Only one gift
      - Must be a real tangible item, not a gift card, event, or subscription
      - Try to reflect the employee’s personality or current achievements
      - Use the exact "Gift:" and "Query:" format
      `;

    
    console.log('Sending request to OpenAI wait shreyas...');

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a gift recommendation assistant. Keep the gifts professional and one per employee."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2048,
      temperature: 0.7,
    });

    console.log('Received response from OpenAI');

    const response = completion.choices[0].message.content;
    
    if (!response) {
      throw new Error('No response received from OpenAI');
    }

    console.log('Raw response:', response);

    try {
      // Split the response into lines and process each category
      const lines = response.split('\n').map(line => line.trim()).filter(line => line);
      const categories = [];
      let currentCategory = null;

      for (const line of lines) {
        if (line.startsWith('Category:')) {
          if (currentCategory) {
            categories.push(currentCategory);
          }
          currentCategory = {
            title: line.replace('Category:', '').trim(),
            searchQuery: ''
          };
        } else if (line.startsWith('Query:') && currentCategory) {
          currentCategory.searchQuery = line.replace('Query:', '').trim();
        }
      }

      // Add the last category if it exists
      if (currentCategory && currentCategory.searchQuery) {
        categories.push(currentCategory);
      }

      // Validate we have exactly 10 categories
      if (categories.length !== 10) {
        throw new Error(`Expected 10 categories, got ${categories.length}`);
      }

      // Validate each category has both properties
      const validCategories = categories.filter(category => 
        category.title && category.searchQuery
      );

      if (validCategories.length !== 10) {
        throw new Error(`Expected 10 valid categories, got ${validCategories.length}`);
      }

      console.log('Parsed categories:', validCategories);
      return NextResponse.json({ categories: validCategories });
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.error('Response that caused error:', response);
      throw new Error('Failed to parse gift recommendations. Please try again.');
    }
  } catch (error) {
    console.error('Error in gift-recommendations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate gift recommendations' },
      { status: 500 }
    );
  }
} 