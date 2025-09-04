import { NextRequest, NextResponse } from 'next/server';

// Test OIDC provider connectivity
export async function GET(request: NextRequest) {
  try {
    const sevisPassUrl = process.env.SEVIS_PASS_AUTH_URL || 'http://localhost:3000/api/oidc/auth';
    const tokenUrl = process.env.SEVIS_PASS_TOKEN_URL || 'http://localhost:3000/api/oidc/token';
    const userinfoUrl = process.env.SEVIS_PASS_USERINFO_URL || 'http://localhost:3000/api/oidc/me';

    console.log('Testing OIDC connectivity...');
    console.log('Auth URL:', sevisPassUrl);
    console.log('Token URL:', tokenUrl);
    console.log('UserInfo URL:', userinfoUrl);

    const results = {
      config: {
        authUrl: sevisPassUrl,
        tokenUrl: tokenUrl,
        userinfoUrl: userinfoUrl,
        clientId: process.env.OIDC_CLIENT_ID,
        redirectUri: process.env.OIDC_REDIRECT_URI
      },
      connectivity: {} as any
    };

    // Test auth endpoint
    try {
      const authResponse = await fetch(sevisPassUrl + '?test=true', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      results.connectivity.auth = {
        status: authResponse.status,
        ok: authResponse.ok,
        url: sevisPassUrl
      };
    } catch (error: any) {
      results.connectivity.auth = {
        error: error.message,
        url: sevisPassUrl
      };
    }

    // Test token endpoint
    try {
      const tokenResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ test: true })
      });
      results.connectivity.token = {
        status: tokenResponse.status,
        ok: tokenResponse.ok,
        url: tokenUrl
      };
    } catch (error: any) {
      results.connectivity.token = {
        error: error.message,
        url: tokenUrl
      };
    }

    // Test userinfo endpoint  
    try {
      const userinfoResponse = await fetch(userinfoUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': 'Bearer test_token'
        }
      });
      results.connectivity.userinfo = {
        status: userinfoResponse.status,
        ok: userinfoResponse.ok,
        url: userinfoUrl
      };
    } catch (error: any) {
      results.connectivity.userinfo = {
        error: error.message,
        url: userinfoUrl
      };
    }

    return NextResponse.json(results);

  } catch (error) {
    console.error('OIDC connectivity test error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to test OIDC connectivity', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}