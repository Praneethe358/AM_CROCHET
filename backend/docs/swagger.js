const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'AM Crochet E-commerce API',
    version: '1.0.0',
    description: 'Production-ready backend API documentation',
  },
  servers: [
    {
      url: process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
      description: 'API Server',
    },
  ],
  tags: [
    { name: 'Auth' },
    { name: 'Products' },
    { name: 'Cart' },
    { name: 'Orders' },
    { name: 'Coupons' },
    { name: 'Reviews' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiSuccess: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: true },
          message: { type: 'string', example: 'Request successful' },
          data: { type: 'object' },
        },
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register user',
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login user',
      },
    },
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'Get products with pagination/filter/sort/search',
      },
      post: {
        tags: ['Products'],
        summary: 'Create product (admin)',
        security: [{ bearerAuth: [] }],
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get product by id',
      },
      put: {
        tags: ['Products'],
        summary: 'Update product (admin)',
        security: [{ bearerAuth: [] }],
      },
      delete: {
        tags: ['Products'],
        summary: 'Delete product (admin)',
        security: [{ bearerAuth: [] }],
      },
    },
    '/api/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Get cart',
        security: [{ bearerAuth: [] }],
      },
      post: {
        tags: ['Cart'],
        summary: 'Add to cart',
        security: [{ bearerAuth: [] }],
      },
      delete: {
        tags: ['Cart'],
        summary: 'Clear cart',
        security: [{ bearerAuth: [] }],
      },
    },
    '/api/orders/create': {
      post: {
        tags: ['Orders'],
        summary: 'Create order and Razorpay order',
        security: [{ bearerAuth: [] }],
      },
    },
    '/api/orders/verify': {
      post: {
        tags: ['Orders'],
        summary: 'Verify Razorpay payment',
        security: [{ bearerAuth: [] }],
      },
    },
    '/api/orders': {
      get: {
        tags: ['Orders'],
        summary: 'Get user orders',
        security: [{ bearerAuth: [] }],
      },
    },
    '/api/orders/{id}': {
      get: {
        tags: ['Orders'],
        summary: 'Get single order',
        security: [{ bearerAuth: [] }],
      },
    },
    '/api/coupons/apply': {
      post: {
        tags: ['Coupons'],
        summary: 'Apply coupon',
        security: [{ bearerAuth: [] }],
      },
    },
    '/api/coupons': {
      post: {
        tags: ['Coupons'],
        summary: 'Create coupon (admin)',
        security: [{ bearerAuth: [] }],
      },
    },
    '/api/reviews': {
      post: {
        tags: ['Reviews'],
        summary: 'Add review',
        security: [{ bearerAuth: [] }],
      },
    },
    '/api/reviews/{productId}': {
      get: {
        tags: ['Reviews'],
        summary: 'Get reviews by product',
      },
    },
    '/api/reviews/{id}': {
      delete: {
        tags: ['Reviews'],
        summary: 'Delete review (owner/admin)',
        security: [{ bearerAuth: [] }],
      },
    },
  },
};

const specs = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: [],
});

module.exports = {
  swaggerUi,
  specs,
};
