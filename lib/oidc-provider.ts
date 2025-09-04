// Simple OIDC Provider Configuration
// This provides the configuration for our basic OIDC implementation

export const oidcConfig = {
  issuer: process.env.OIDC_ISSUER || 'http://localhost:3000',
  clientId: process.env.OIDC_CLIENT_ID || 'sevis-portal-client',
  clientSecret: process.env.OIDC_CLIENT_SECRET || 'sevis-portal-secret-change-in-production',
  redirectUri: process.env.OIDC_REDIRECT_URI || 'http://localhost:3002/auth/callback',
  scope: process.env.OIDC_SCOPE || 'openid profile email phone address',
  
  // Token TTL (Time To Live) in seconds
  tokenTTL: {
    accessToken: 60 * 60, // 1 hour
    authorizationCode: 10 * 60, // 10 minutes
    idToken: 60 * 60, // 1 hour
    refreshToken: 24 * 60 * 60, // 1 day
  },

  // Mock user data for demo purposes
  mockUser: {
    sub: 'sevis_user_123',
    name: 'SEVIS Pass User',
    email: 'user@sevispass.gov.pg',
    email_verified: true,
    phone_number: '+675123456789',
    phone_number_verified: true,
    preferred_username: 'sevisuser',
    address: {
      formatted: 'Port Moresby, Papua New Guinea',
      country: 'Papua New Guinea'
    }
  }
};

// Utility functions for OIDC operations
export function validateClient(clientId: string, clientSecret?: string): boolean {
  if (clientId !== oidcConfig.clientId) {
    return false;
  }
  
  if (clientSecret && clientSecret !== oidcConfig.clientSecret) {
    return false;
  }
  
  return true;
}

export function generateAuthorizationCode(): string {
  return `sevis_auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateAccessToken(): string {
  return `sevis_access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateIdToken(userId: string = 'sevis_user_123'): string {
  const header = { 
    alg: 'RS256', 
    typ: 'JWT', 
    kid: 'sevis-pass-key-1' 
  };
  
  const payload = {
    iss: oidcConfig.issuer,
    aud: oidcConfig.clientId,
    exp: Math.floor(Date.now() / 1000) + oidcConfig.tokenTTL.idToken,
    iat: Math.floor(Date.now() / 1000),
    ...oidcConfig.mockUser,
    sub: userId, // Override with provided userId
  };

  // Simple base64 encoding (not cryptographically secure - for demo only)
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = 'demo_signature'; // In production, sign with private key

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}