import { NextRequest, NextResponse } from 'next/server';

// Debug OIDC configuration
export async function GET(request: NextRequest) {
  try {
    const config = {
      server: {
        OIDC_ISSUER: process.env.OIDC_ISSUER,
        OIDC_CLIENT_ID: process.env.OIDC_CLIENT_ID,
        OIDC_CLIENT_SECRET: process.env.OIDC_CLIENT_SECRET ? '[HIDDEN]' : undefined,
        OIDC_REDIRECT_URI: process.env.OIDC_REDIRECT_URI,
        OIDC_SCOPE: process.env.OIDC_SCOPE,
        SEVIS_PASS_AUTH_URL: process.env.SEVIS_PASS_AUTH_URL,
        SEVIS_PASS_TOKEN_URL: process.env.SEVIS_PASS_TOKEN_URL,
        SEVIS_PASS_USERINFO_URL: process.env.SEVIS_PASS_USERINFO_URL,
      },
      client: {
        NEXT_PUBLIC_OIDC_ISSUER: process.env.NEXT_PUBLIC_OIDC_ISSUER,
        NEXT_PUBLIC_OIDC_CLIENT_ID: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID,
        NEXT_PUBLIC_OIDC_REDIRECT_URI: process.env.NEXT_PUBLIC_OIDC_REDIRECT_URI,
        NEXT_PUBLIC_OIDC_SCOPE: process.env.NEXT_PUBLIC_OIDC_SCOPE,
        NEXT_PUBLIC_SEVIS_PASS_AUTH_URL: process.env.NEXT_PUBLIC_SEVIS_PASS_AUTH_URL,
      },
      legacy: {
        NEXT_PUBLIC_SEVIS_PASS_CLIENT_ID: process.env.NEXT_PUBLIC_SEVIS_PASS_CLIENT_ID,
        SEVIS_PASS_CLIENT_SECRET: process.env.SEVIS_PASS_CLIENT_SECRET ? '[HIDDEN]' : undefined,
      }
    };

    return NextResponse.json(config);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get config', details: String(error) },
      { status: 500 }
    );
  }
}