import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Return mock products directly without making API calls
    const mockProducts = [
      {
        id: 'B00EXAMPLE1',
        title: 'Premium Gift Box Set - ' + query,
        imageUrl: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=500&h=500&fit=crop',
        price: '$49.99',
        url: 'https://www.amazon.com/dp/B00EXAMPLE1'
      },
      {
        id: 'B00EXAMPLE2',
        title: 'Luxury Gift Basket - ' + query,
        imageUrl: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=500&h=500&fit=crop',
        price: '$79.99',
        url: 'https://www.amazon.com/dp/B00EXAMPLE2'
      },
      {
        id: 'B00EXAMPLE3',
        title: 'Gourmet Gift Collection - ' + query,
        imageUrl: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=500&h=500&fit=crop',
        price: '$89.99',
        url: 'https://www.amazon.com/dp/B00EXAMPLE3'
      },
      {
        id: 'B00EXAMPLE4',
        title: 'Premium Gift Hamper - ' + query,
        imageUrl: 'https://images.unsplash.com/photo-1517673400267-0251440c45dc?w=500&h=500&fit=crop',
        price: '$129.99',
        url: 'https://www.amazon.com/dp/B00EXAMPLE4'
      }
    ];

    return NextResponse.json({ products: mockProducts });
  } catch (error) {
    console.error('Error generating mock products:', error);
    return NextResponse.json(
      { error: 'Failed to generate product suggestions' },
      { status: 500 }
    );
  }
} 