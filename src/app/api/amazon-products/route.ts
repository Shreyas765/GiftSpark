import { NextResponse } from 'next/server';
import crypto from 'crypto';
import axios, { AxiosError } from 'axios';

const AMAZON_CLIENT_ID = process.env.AMAZON_CLIENT_ID;
const AMAZON_CLIENT_SECRET = process.env.AMAZON_CLIENT_SECRET;

interface AmazonImage {
  URL: string;
}

interface AmazonPrice {
  DisplayAmount: string;
}

interface AmazonListing {
  Price: AmazonPrice;
}

interface AmazonTitle {
  DisplayValue: string;
}

interface AmazonByLineInfo {
  Brand: {
    DisplayValue: string;
  };
}

interface AmazonItemInfo {
  Title: AmazonTitle;
  ByLineInfo: AmazonByLineInfo;
}

interface AmazonImages {
  Primary: {
    Medium: AmazonImage;
  };
}

interface AmazonItem {
  ASIN: string;
  ItemInfo: AmazonItemInfo;
  Images: AmazonImages;
  Offers: {
    Listings: AmazonListing[];
  };
}

interface AmazonSearchResult {
  Items: AmazonItem[];
}

interface AmazonResponse {
  SearchResult: AmazonSearchResult;
}

async function getLwaAccessToken() {
  try {
    if (!AMAZON_CLIENT_ID || !AMAZON_CLIENT_SECRET) {
      throw new Error('Missing Amazon API credentials');
    }

    const response = await axios.post(
      'https://api.amazon.com/auth/o2/token',
      {
        grant_type: 'client_credentials',
        client_id: AMAZON_CLIENT_ID,
        client_secret: AMAZON_CLIENT_SECRET,
        scope: 'advertising::product_search',
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (!response.data.access_token) {
      throw new Error('No access token received from LWA');
    }

    return response.data.access_token;
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('LWA Token Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    } else {
      console.error('LWA Token Error:', error);
    }
    throw error;
  }
}

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

    if (!AMAZON_CLIENT_ID || !AMAZON_CLIENT_SECRET) {
      return NextResponse.json(
        { error: 'Amazon API credentials are not configured' },
        { status: 500 }
      );
    }

    // Get LWA access token
    const accessToken = await getLwaAccessToken();

    // Generate authentication headers for Amazon API
    const timestamp = new Date().toISOString();
    const signature = crypto
      .createHmac('sha256', AMAZON_CLIENT_SECRET)
      .update(`GET\nwebservices.amazon.com\n/paapi5/searchitems\n${timestamp}`)
      .digest('base64');

    const headers = {
      'Content-Type': 'application/json',
      'X-Amz-Date': timestamp,
      'X-Amz-Access-Token': accessToken,
      'X-Amz-Client-Id': AMAZON_CLIENT_ID,
      'X-Amz-Signature': signature,
    };

    // Make request to Amazon Product Advertising API
    const response = await axios.post<AmazonResponse>(
      'https://webservices.amazon.com/paapi5/searchitems',
      {
        Keywords: query,
        Resources: [
          'Images.Primary.Medium',
          'ItemInfo.Title',
          'Offers.Listings.Price',
          'ItemInfo.ByLineInfo',
        ],
        PartnerTag: 'giftspark06-20',
        PartnerType: 'Associates',
        Marketplace: 'www.amazon.com',
      },
      { headers }
    );

    if (!response.data?.SearchResult?.Items) {
      console.error('Unexpected API response:', response.data);
      return NextResponse.json(
        { error: 'Invalid response format from Amazon API' },
        { status: 500 }
      );
    }

    // Transform Amazon API response to match our frontend expectations
    const products = response.data.SearchResult.Items.map((item: AmazonItem) => ({
      id: item.ASIN,
      title: item.ItemInfo.Title.DisplayValue,
      imageUrl: item.Images.Primary.Medium.URL,
      price: item.Offers.Listings[0].Price.DisplayAmount,
      url: `https://www.amazon.com/dp/${item.ASIN}?tag=giftspark-20`,
    }));

    return NextResponse.json({ products });
  } catch (error) {
    if (error instanceof AxiosError) {
      console.error('Amazon API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        headers: error.response?.headers
      });
      return NextResponse.json(
        { 
          error: 'Failed to fetch product suggestions',
          details: error.response?.data || error.message
        },
        { status: error.response?.status || 500 }
      );
    } else {
      console.error('Unexpected Error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch product suggestions' },
        { status: 500 }
      );
    }
  }
}