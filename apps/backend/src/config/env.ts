import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiUrl: process.env.API_URL || 'http://localhost:3001',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  database: {
    url: process.env.DATABASE_URL || 'postgresql://taskboard:taskboard_dev_password@localhost:5432/living_taskboard'
  },

  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-change-in-production',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    googleClientId: process.env.OAUTH_GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET
  },

  claude: {
    apiKey: process.env.CLAUDE_API_KEY || ''
  },

  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'us-east-1',
    s3Bucket: process.env.AWS_S3_BUCKET || 'living-taskboard-uploads'
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    priceIds: {
      pro: process.env.STRIPE_PRICE_ID_PRO || '',
      team: process.env.STRIPE_PRICE_ID_TEAM || ''
    }
  },

  limits: {
    free: {
      boards: 5,
      storage: 100 * 1024 * 1024 // 100MB
    },
    pro: {
      boards: 100,
      storage: 10 * 1024 * 1024 * 1024 // 10GB
    },
    team: {
      boards: -1, // unlimited
      storage: 100 * 1024 * 1024 * 1024 // 100GB
    }
  }
};

// Production security validation
if (config.nodeEnv === 'production') {
  if (config.auth.jwtSecret === 'your-jwt-secret-change-in-production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  if (!config.stripe.secretKey) {
    throw new Error('STRIPE_SECRET_KEY must be set in production');
  }
  if (!config.stripe.webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET must be set in production');
  }
}
