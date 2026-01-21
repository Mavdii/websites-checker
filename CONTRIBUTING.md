# Contributing to Cruel Stack

Thank you for your interest in contributing to Cruel Stack! This document provides guidelines and instructions for contributing.

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/websites-checker.git
   cd websites-checker
   ```
3. **Install dependencies**
   ```bash
   npm install
   ```
4. **Create a branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💻 Development Workflow

### Running the Development Server

```bash
npm run dev
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Code Quality

```bash
# Lint your code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 📝 Commit Guidelines

We follow conventional commits for clear and structured commit messages:

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Example:
```bash
git commit -m "feat: add performance analysis module"
git commit -m "fix: resolve URL validation edge case"
```

## 🧪 Testing Requirements

- All new features must include tests
- Maintain or improve code coverage
- Ensure all tests pass before submitting PR

## 📋 Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new features
3. **Ensure all tests pass**
4. **Update README.md** if adding new features
5. **Submit PR** with clear description

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests added/updated
- [ ] All tests passing
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots here
```

## 🎨 Code Style

- Use TypeScript for all new code
- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

## 🐛 Reporting Bugs

When reporting bugs, please include:

1. **Description** - Clear description of the bug
2. **Steps to Reproduce** - How to reproduce the issue
3. **Expected Behavior** - What should happen
4. **Actual Behavior** - What actually happens
5. **Environment** - OS, Node version, browser, etc.
6. **Screenshots** - If applicable

## 💡 Feature Requests

We welcome feature requests! Please:

1. Check if the feature already exists
2. Provide clear use case
3. Explain expected behavior
4. Consider implementation complexity

## 📞 Questions?

Feel free to open an issue for questions or discussions.

## 🙏 Thank You!

Your contributions make this project better for everyone!
