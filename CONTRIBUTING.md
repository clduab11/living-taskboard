# Contributing to Living Taskboard

Thank you for your interest in contributing to Living Taskboard! This document provides guidelines and instructions for contributing.

## Code of Conduct

We are committed to providing a welcoming and inclusive experience for everyone. Be respectful, constructive, and professional in all interactions.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/living-taskboard.git`
3. Add upstream remote: `git remote add upstream https://github.com/original/living-taskboard.git`
4. Create a branch: `git checkout -b feature/your-feature-name`

## Development Setup

See the main [README.md](README.md) for detailed setup instructions.

Quick start:
```bash
npm install
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
# Edit .env files with your configuration
npm run docker:up
```

## Development Workflow

### Branch Naming

- Feature: `feature/feature-name`
- Bug fix: `fix/bug-description`
- Documentation: `docs/what-changed`
- Refactor: `refactor/what-changed`

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

Examples:
```
feat: add real-time cursor tracking
fix: resolve authentication token expiration issue
docs: update API documentation for boards endpoint
```

### Code Style

- Use TypeScript for all new code
- Follow the existing code style (ESLint configuration)
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Testing

- Write tests for new features
- Ensure all tests pass before submitting PR
- Run tests: `npm run test`
- Run linter: `npm run lint`

## Pull Request Process

1. **Update your fork**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Make your changes**
   - Write clean, well-documented code
   - Add tests if applicable
   - Update documentation

3. **Test thoroughly**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your branch
   - Fill out the PR template
   - Link any related issues

### PR Guidelines

- Provide a clear description of the changes
- Include screenshots for UI changes
- Reference related issues
- Keep PRs focused on a single feature/fix
- Respond to review comments promptly
- Ensure CI checks pass

## Project Structure

Understanding the codebase:

```
apps/backend/
  src/
    config/         # Configuration files
    controllers/    # HTTP request handlers
    middleware/     # Express middleware
    routes/         # API routes
    services/       # Business logic
    utils/          # Helper functions
    websocket/      # Real-time collaboration

apps/frontend/
  src/
    components/     # Reusable React components
    pages/          # Page components
    hooks/          # Custom React hooks
    services/       # API clients
    store/          # State management
    styles/         # CSS files

packages/shared/
  src/
    types.ts        # Shared TypeScript types
```

## Adding New Features

### Backend Features

1. Add types to `packages/shared/src/types.ts`
2. Create service in `apps/backend/src/services/`
3. Add controller in `apps/backend/src/controllers/`
4. Create routes in `apps/backend/src/routes/`
5. Update database schema if needed
6. Add tests

### Frontend Features

1. Add types (if not already in shared)
2. Create components in `apps/frontend/src/components/`
3. Add to pages if necessary
4. Update store if state management needed
5. Add API service calls
6. Style with TailwindCSS
7. Test in different screen sizes

### AI Features

1. Add generation type to `AIGenerationType` enum
2. Implement in `apps/backend/src/services/claude.service.ts`
3. Add controller method
4. Update frontend AI modal
5. Document in README

## Database Changes

When modifying the database schema:

1. Update `apps/backend/db/init.sql`
2. Create migration script if needed
3. Update TypeScript types in `packages/shared/src/types.ts`
4. Update affected services and controllers
5. Test with fresh database

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments to functions
- Update API documentation
- Add inline comments for complex logic
- Update this guide if workflow changes

## Common Tasks

### Adding a New Tool

1. Add tool type to `Tool` interface
2. Add icon to toolbar
3. Implement in Canvas component
4. Update cursor handling
5. Test all interactions

### Adding a New WebSocket Event

1. Add event to `WSEvent` enum
2. Implement in backend WebSocket server
3. Add handler in frontend WebSocket service
4. Update documentation

### Adding a New API Endpoint

1. Define request/response types
2. Add validation schema
3. Create controller method
4. Add route
5. Update API documentation
6. Add frontend API method

## Reporting Bugs

Create an issue with:

- Clear, descriptive title
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details (OS, browser, Node version)
- Error messages/logs

## Suggesting Features

Create an issue with:

- Clear description of the feature
- Use case and benefits
- Proposed implementation (if you have ideas)
- Mockups/wireframes (for UI features)

## Questions?

- Check existing documentation
- Search closed issues
- Ask in GitHub Discussions
- Join our community Slack

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Our website (if applicable)

Thank you for making Living Taskboard better!
