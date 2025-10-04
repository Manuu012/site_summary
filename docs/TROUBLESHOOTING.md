# Common Issues & Solutions

## Deployment Issues
1. **GitHub Pages 404 on refresh**
   - Solution: Use HashRouter or configure 404.html

2. **Database connection failures**
   - Solution: Verify Neon connection string in Render environment variables

## Development Issues
1. **CORS errors in development**
   - Solution: Configure proxy in vite.config.js

2. **Prisma migration issues**
   - Solution: Run `npx prisma db push`