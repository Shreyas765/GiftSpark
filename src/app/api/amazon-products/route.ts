import { NextResponse } from 'next/server';
import crypto from 'crypto';
import Bottleneck from 'bottleneck';

const AMAZON_ACCESS_KEY = process.env.AMAZON_ACCESS_KEY!;
const AMAZON_SECRET_KEY = process.env.AMAZON_SECRET_KEY!;
const AMAZON_PARTNER_TAG = process.env.AMAZON_PARTNER_TAG! || 'giftspark04-20';
const REGION = 'us-east-1';
const SERVICE = 'ProductAdvertisingAPI';
const HOST = 'webservices.amazon.com';
// CRITICAL FIX: Using correct endpoint path without /v1
const ENDPOINT = `https://${HOST}/paapi5/searchitems`;

// Initialize a rate limiter with Bottleneck
const limiter = new Bottleneck({
  maxConcurrent: 1, // Only one request at a time
  minTime: 2000, // At least 2 seconds between requests (more conservative)
  reservoir: 1, // Only allow 1 request at a time
  reservoirRefreshAmount: 1,
  reservoirRefreshInterval: 2000, // Refresh reservoir every 2 seconds
});

// Add retry logic for rate limit errors
const limitedFetch = limiter.wrap(async (url: string, options: RequestInit) => {
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const response = await fetch(url, options);
      
      // If we get a rate limit error, wait and retry
      if (response.status === 429) {
        retryCount++;
        if (retryCount < maxRetries) {
          const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
          console.log(`Rate limited. Retrying in ${waitTime}ms (attempt ${retryCount + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
      }
      
      return response;
    } catch (error) {
      if (retryCount === maxRetries - 1) throw error;
      retryCount++;
      const waitTime = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error('Max retries exceeded');
});

// Validate environment variables
if (!AMAZON_ACCESS_KEY || !AMAZON_SECRET_KEY || !AMAZON_PARTNER_TAG) {
  console.error('Missing required Amazon API credentials:', {
    hasAccessKey: !!AMAZON_ACCESS_KEY,
    hasSecretKey: !!AMAZON_SECRET_KEY,
    hasPartnerTag: !!AMAZON_PARTNER_TAG
  });
}

function getAmzDate(): string {
  return new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
}

function getDateStamp(): string {
  return new Date().toISOString().slice(0, 10).replace(/-/g, '');
}

function sign(key: Buffer | string, msg: string): Buffer {
  return crypto.createHmac('sha256', key).update(msg).digest();
}

function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string): Buffer {
  const kDate = sign('AWS4' + key, dateStamp);
  const kRegion = sign(kDate, regionName);
  const kService = sign(kRegion, serviceName);
  const kSigning = sign(kService, 'aws4_request');
  return kSigning;
}

export async function GET(request: Request) {
  let query: string | null = null;
  
  try {
    const { searchParams } = new URL(request.url);
    query = searchParams.get('query');
    
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Check if we have valid credentials
    if (!AMAZON_ACCESS_KEY || !AMAZON_SECRET_KEY || !AMAZON_PARTNER_TAG) {
      return NextResponse.json({ error: 'Amazon API credentials not configured' }, { status: 500 });
    }

    console.log('*** FIXED VERSION - Making Amazon PA API request for query:', query);

    const amzDate = getAmzDate();
    const dateStamp = getDateStamp();

    // Construct the payload - exactly matching working curl example
    const payload = {
      Marketplace: 'www.amazon.com',
      PartnerType: 'Associates',
      PartnerTag: AMAZON_PARTNER_TAG,
      Keywords: query,
      SearchIndex: 'All',
      ItemCount: 6,
      Resources: [
        'Images.Primary.Large',
        'ItemInfo.Title',
        'Offers.Listings.Price'
      ]
    };

    const payloadStr = JSON.stringify(payload);
    const payloadHash = crypto.createHash('sha256').update(payloadStr, 'utf8').digest('hex');

    // CRITICAL FIX: Correct canonical URI path
    const canonicalUri = '/paapi5/searchitems';
    const canonicalQueryString = '';
    
    // CRITICAL FIX: Include content-encoding header and correct order
    const canonicalHeaders = [
      `content-encoding:amz-1.0`,
      `host:${HOST}`,
      `x-amz-date:${amzDate}`,
      `x-amz-target:com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems`
    ].join('\n') + '\n';
    
    const signedHeaders = 'content-encoding;host;x-amz-date;x-amz-target';
    
    const canonicalRequest = [
      'POST',
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      payloadHash
    ].join('\n');

    const canonicalRequestHash = crypto.createHash('sha256').update(canonicalRequest, 'utf8').digest('hex');

    // Create string to sign
    const credentialScope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      canonicalRequestHash
    ].join('\n');

    // Calculate signature
    const signingKey = getSignatureKey(AMAZON_SECRET_KEY, dateStamp, REGION, SERVICE);
    const signature = crypto.createHmac('sha256', signingKey).update(stringToSign, 'utf8').digest('hex');

    // Create authorization header
    const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${AMAZON_ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    console.log('*** FIXED VERSION - Request details:', {
      endpoint: ENDPOINT,
      method: 'POST',
      canonicalUri,
      amzDate,
      target: 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
      signedHeaders,
      payloadLength: payloadStr.length
    });

    // CRITICAL FIX: Make the API request with all required headers
    const response = await limitedFetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
        'Content-Encoding': 'amz-1.0',
        'Host': HOST,
        'X-Amz-Date': amzDate,
        'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
        'Authorization': authorizationHeader,
        'User-Agent': 'paapi-docs-curl/1.0.0'
      },
      body: payloadStr
    });

    console.log('Amazon API Response Status:', response.status, response.statusText);

    const responseText = await response.text();
    
    // Enhanced error handling for HTML responses
    if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
      console.error('*** AUTHENTICATION FAILED - Received HTML response instead of JSON');
      console.error('Response preview:', responseText.substring(0, 500));
      console.error('Debug info:', {
        accessKeyPrefix: AMAZON_ACCESS_KEY ? AMAZON_ACCESS_KEY.substring(0, 8) + '...' : 'MISSING',
        secretKeyExists: !!AMAZON_SECRET_KEY,
        partnerTag: AMAZON_PARTNER_TAG,
        endpoint: ENDPOINT,
        canonicalUri,
        amzDate,
        signaturePrefix: signature.substring(0, 16) + '...'
      });
      return NextResponse.json({ 
        error: 'Amazon API authentication failed - check credentials and endpoint',
        debug: 'Received HTML error page instead of JSON response'
      }, { status: 500 });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Amazon API response as JSON:', parseError);
      console.error('Raw response (first 1000 chars):', responseText.substring(0, 1000));
      return NextResponse.json({ error: 'Failed to parse Amazon API response' }, { status: 500 });
    }

    // Handle API errors
    if (!response.ok) {
      console.error('Amazon API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        body: data
      });
      
      // Log specific error details if available
      if (data.__type) {
        console.error('Amazon API Error Type:', data.__type);
      }
      if (data.Errors && Array.isArray(data.Errors)) {
        data.Errors.forEach((error: any) => {
          console.error('Amazon API Error:', error);
        });
      }
      
      return NextResponse.json({ error: 'Amazon API request failed', details: data }, { status: response.status });
    }

    // Check for errors in successful response
    if (data.Errors && Array.isArray(data.Errors) && data.Errors.length > 0) {
      console.error('Amazon API returned errors:', data.Errors);
      return NextResponse.json({ error: 'Amazon API returned errors', details: data.Errors }, { status: 500 });
    }

    // Process successful response
    if (!data.SearchResult || !data.SearchResult.Items) {
      console.log('No items found in search result for query:', query);
      return NextResponse.json({ products: [] });
    }

    const products = data.SearchResult.Items.map((item: any) => {
      // Handle image URL with fallback
      let imageUrl = '';
      if (item.Images?.Primary?.Large?.URL) {
        imageUrl = item.Images.Primary.Large.URL;
      } else if (item.Images?.Primary?.Medium?.URL) {
        imageUrl = item.Images.Primary.Medium.URL;
      }

      // Handle price with fallback
      let price = 'Price not available';
      if (item.Offers?.Listings?.[0]?.Price?.DisplayAmount) {
        price = item.Offers.Listings[0].Price.DisplayAmount;
      } else if (item.Offers?.Listings?.[0]?.Price?.Amount) {
        const amount = item.Offers.Listings[0].Price.Amount;
        const currency = item.Offers.Listings[0].Price.Currency || 'USD';
        price = `${currency === 'USD' ? '$' : currency}${amount}`;
      }

      return {
        id: item.ASIN,
        title: item.ItemInfo?.Title?.DisplayValue || 'Product Title Not Available',
        imageUrl,
        price,
        url: `https://www.amazon.com/dp/${item.ASIN}?tag=${AMAZON_PARTNER_TAG}`,
        features: item.ItemInfo?.Features?.DisplayValues || []
      };
    });

    console.log(`*** SUCCESS - Fetched ${products.length} products for query: ${query}`);
    return NextResponse.json({ products });

  } catch (error) {
    console.error('Unexpected error in Amazon API route:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}