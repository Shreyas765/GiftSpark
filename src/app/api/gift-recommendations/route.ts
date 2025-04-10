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

    const prompt = `You are a helpful and creative gift recommendation assistant. A user will provide a short description of someone, including their age, interests, personality, and preferences. Based on this description, generate a list of 10 personalized gift idea categories featuring products that can be bought on Amazon. Ensure that all recommendations are for tangible products only, excluding service-based or intangible gifts like tickets. If possible generate known brands and try to get the gifts to be thoughtful and sentimental.
        

        For each category, provide:
        1. A clear gift category title
        2. A search query that could be passed into a product search engine (like Amazon)

        Format each category exactly like this example:
        Category: Cozy Movie Night Kit
        Query: movie night gift set for teen girl

        Rules:
        1. Include exactly 10 categories
        2. Each category must have both a title and a search query
        3. Do not include any product names or URLs
        4. Use the exact format shown above with "Category:" and "Query:" labels
        5. Include exactly 3 of the 10 categories to be loosely related—quirky, unexpected, or imaginative, yet still reflect the person’s vibe in a surprising way.

        User description: ${description}`;

    
    console.log('Sending request to OpenAI wait shreyas...');

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a gift recommendation assistant. Provide exactly 10 gift categories, each with a title and search query. Use the exact format specified in the prompt."
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