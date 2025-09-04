import { NextRequest, NextResponse } from 'next/server';
import { 
  oidcConfig, 
  validateClient, 
  generateAuthorizationCode, 
  generateAccessToken, 
  generateIdToken 
} from '@/lib/oidc-provider';

// Simple OIDC endpoints without complex provider setup
// This provides basic OIDC compliance for client authentication

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  const url = new URL(request.url);
  
  try {
    // Handle different OIDC endpoints
    switch (path) {
      case 'auth':
        return handleAuth(request, url);
      case '.well-known/openid-configuration':
        return handleDiscovery();
      case 'jwks':
        return handleJWKS();
      default:
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('OIDC error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  const path = params.path.join('/');
  
  try {
    switch (path) {
      case 'token':
        return handleToken(request);
      case 'me':
        return handleUserInfo(request);
      default:
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('OIDC error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Authorization endpoint
async function handleAuth(request: NextRequest, url: URL) {
  const clientId = url.searchParams.get('client_id');
  const redirectUri = url.searchParams.get('redirect_uri');
  const scope = url.searchParams.get('scope');
  const state = url.searchParams.get('state');
  const responseType = url.searchParams.get('response_type');

  // Validate required parameters
  if (!clientId || !redirectUri || responseType !== 'code') {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }

  // Generate authorization code
  const code = generateAuthorizationCode();
  
  // In a real implementation, you would show a login/consent screen
  // For now, we'll redirect back with a code
  const redirectUrl = new URL(redirectUri);
  redirectUrl.searchParams.set('code', code);
  if (state) redirectUrl.searchParams.set('state', state);

  return NextResponse.redirect(redirectUrl.toString());
}

// Token endpoint
async function handleToken(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    let grantType, code, clientId;

    if (contentType?.includes('application/json')) {
      const body = await request.json();
      grantType = body.grant_type;
      code = body.code;
      clientId = body.client_id;
    } else {
      const body = await request.formData();
      grantType = body.get('grant_type');
      code = body.get('code');
      clientId = body.get('client_id');
    }

    if (grantType !== 'authorization_code' || !code || !clientId) {
      return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
    }

    // Generate tokens
    const accessToken = generateAccessToken();
    const idToken = generateIdToken();

    return NextResponse.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      id_token: idToken,
      scope: 'openid profile email phone address'
    });
  } catch (error) {
    return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  }
}

// UserInfo endpoint
async function handleUserInfo(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 });
  }

  // Mock user data - in real implementation, validate token and fetch user
  return NextResponse.json(oidcConfig.mockUser);
}

// Discovery document
function handleDiscovery() {
  const issuer = oidcConfig.issuer;
  
  return NextResponse.json({
    issuer,
    authorization_endpoint: `${issuer}/api/oidc/auth`,
    token_endpoint: `${issuer}/api/oidc/token`,
    userinfo_endpoint: `${issuer}/api/oidc/me`,
    jwks_uri: `${issuer}/api/oidc/jwks`,
    scopes_supported: ['openid', 'profile', 'email', 'phone', 'address'],
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code'],
    subject_types_supported: ['public'],
    id_token_signing_alg_values_supported: ['RS256'],
    token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post']
  });
}

// JWKS endpoint
function handleJWKS() {
  return NextResponse.json({
    keys: [
      {
        kty: 'RSA',
        kid: 'sevis-pass-key-1',
        use: 'sig',
        alg: 'RS256',
        n: 'demo-modulus-replace-in-production',
        e: 'AQAB'
      }
    ]
  });
}

