# Blog Summarizer Backend

A Node.js/Express backend service that provides AI-powered text summarization using the Cerebras Cloud SDK.

## Features

- **Text Summarization**: Convert long articles into concise bullet points and TL;DR summaries
- **Multiple Length Options**: Short (~120 words), Medium (~240 words), and Long (~420 words) summaries
- **Text Cleaning**: Automatic HTML removal, deduplication, and content normalization
- **Chunking Support**: Handles very long texts by processing in chunks
- **Rate Limiting**: Built-in protection against abuse
- **Health Monitoring**: Comprehensive health checks and service status
- **Error Handling**: Robust error handling with fallback summaries
- **Logging**: Structured logging with Winston

## Quick Start

### Prerequisites

- Node.js 18+ 
- Cerebras API key

### Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env
```

4. Edit `.env` with your configuration:
```env
CEREBRAS_API_KEY=your_cerebras_api_key_here
MODEL_NAME=llama-2-7b-chat
PORT=3001
FRONTEND_ORIGIN=http://localhost:3000
```

5. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
```
GET /health
```
Returns service status and health information.

### Summarize Text
```
POST /summarize
```

**Request Body:**
```json
{
  "text": "Your article text here...",
  "length": "medium"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "bullets": [
      "• Key point 1",
      "• Key point 2",
      "• Key point 3"
    ],
    "tldr": "Brief summary of the content...",
    "meta": {
      "tokensUsed": 150,
      "model": "qwen-3-235b-a22b-instruct-2507",
      "length": "medium",
      "processingTime": "2.5s"
    }
  }
}
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `CEREBRAS_API_KEY` | Your Cerebras API key | Required |
| `MODEL_NAME` | LLM model to use | `llama-3.3-70b` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `FRONTEND_ORIGIN` | CORS origin | `http://localhost:3000` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |
| `LOG_LEVEL` | Logging level | `info` |

### Text Limits

- **Minimum length**: 50 characters
- **Maximum length**: 15,000 characters
- **Chunk size**: 2,000 characters (for very long texts)

### Summary Lengths

| Length | Target Words | Max Tokens | Description |
|--------|--------------|------------|-------------|
| `short` | ~120 | 200 | Brief overview with key points |
| `medium` | ~240 | 400 | Balanced summary with context |
| `long` | ~420 | 600 | Comprehensive summary with details |

## Development

### Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration management
│   ├── middleware/      # Express middleware
│   ├── routes/          # API route handlers
│   ├── services/        # External service integrations
│   ├── utils/           # Utility functions
│   └── app.js          # Main application file
├── package.json
├── env.example
└── README.md
```

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests (when implemented)

### Adding New Features

1. **New Routes**: Add route files in `src/routes/`
2. **Middleware**: Add middleware in `src/middleware/`
3. **Services**: Add external service integrations in `src/services/`
4. **Utilities**: Add helper functions in `src/utils/`

## Error Handling

The API provides comprehensive error handling:

- **400 Bad Request**: Invalid input or validation errors
- **401 Unauthorized**: Authentication issues
- **408 Request Timeout**: API timeout
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side errors
- **502 Bad Gateway**: External service (Cerebras) issues

## Monitoring and Logging

- **Health Checks**: `/health` and `/health/detailed` endpoints
- **Structured Logging**: JSON-formatted logs with Winston
- **Request Tracking**: Request IDs for tracing
- **Performance Metrics**: Response times and token usage

## Security Features

- **Helmet**: Security headers
- **CORS**: Configurable cross-origin requests
- **Rate Limiting**: Per-IP request limiting
- **Input Validation**: Joi schema validation
- **Error Sanitization**: No sensitive data in error responses

## Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Configure production CORS origins
3. Set up proper logging (file-based in production)
4. Configure reverse proxy (nginx/Apache) if needed

### Docker (Optional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 3001
CMD ["npm", "start"]
```

## Troubleshooting

### Common Issues

1. **Cerebras API Errors**: Check API key and model availability
2. **Rate Limiting**: Adjust limits in configuration
3. **Memory Issues**: Monitor chunk processing for very long texts
4. **CORS Issues**: Verify frontend origin configuration

### Debug Mode

Set `LOG_LEVEL=debug` for detailed logging information.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
