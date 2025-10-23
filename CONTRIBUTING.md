# Contributing Guide

## Development Workflow

### Before You Start Coding

1. **Pull latest changes**
   ```bash
   git pull origin main
   ```

2. **Install dependencies** (if package.json changed)
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

### While Coding

- Follow the rules defined in `.cursorrules`
- Test your changes in the browser as you develop
- Check the browser console for errors
- Use TypeScript strictly (no `any` types)

### Before Committing

Run the validation script to ensure code quality:

```bash
npm run validate
```

This will run:
- ESLint to check code quality
- TypeScript type checking

Or run the full pre-commit check:

```bash
npm run pre-commit
```

This will run:
- ESLint
- TypeScript type checking
- Full build

### Committing Changes

The pre-commit hook will automatically run when you commit. It will:
1. Run ESLint
2. Run TypeScript build to check for errors
3. Block the commit if there are any errors

```bash
# Stage your changes
git add .

# Commit (pre-commit hook runs automatically)
git commit -m "[feat] Your descriptive message"

# Push to remote
git push origin main
```

### If Pre-Commit Hook Fails

1. **Read the error messages carefully**
2. **Fix the issues** (linting errors, TypeScript errors)
3. **Re-run validation**:
   ```bash
   npm run validate
   ```
4. **Try committing again**

### Bypassing Pre-Commit Hook (NOT RECOMMENDED)

Only use this in emergencies:
```bash
git commit --no-verify -m "message"
```

## Available Scripts

| Script | Description | When to Use |
|--------|-------------|-------------|
| `npm run dev` | Start development server | Daily development |
| `npm run build` | Build for production | Before committing |
| `npm run start` | Start production server | Testing production build |
| `npm run lint` | Check for linting errors | Before committing |
| `npm run lint:fix` | Auto-fix linting errors | When you have lint errors |
| `npm run type-check` | Check TypeScript types without building | Quick type validation |
| `npm run validate` | Run lint + type-check | Quick validation |
| `npm run pre-commit` | Full validation + build | Before major commits |

## Code Quality Checklist

Before creating a pull request or pushing to main:

- [ ] Code runs without errors (`npm run dev`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No linting errors (`npm run lint`)
- [ ] Build completes successfully (`npm run build`)
- [ ] Tested functionality manually
- [ ] Responsive design checked on different screen sizes
- [ ] No console errors or warnings
- [ ] Environment variables are not hardcoded
- [ ] Followed `.cursorrules` guidelines

## Common Issues & Solutions

### Pre-commit hook not running

**Solution:**
```bash
chmod +x .git/hooks/pre-commit
```

### ESLint errors

**Solution:**
```bash
npm run lint:fix  # Auto-fix what can be fixed
npm run lint      # Check remaining errors
```

### TypeScript errors

**Solution:**
- Check the error message carefully
- Ensure all types are properly defined
- Don't use `any` - define proper types
- Run `npm run type-check` to see all errors

### Build fails

**Common causes:**
- Unused imports
- Missing type definitions
- Syntax errors
- Missing dependencies

**Solution:**
```bash
npm run build  # See the full error
# Fix the errors shown
npm run build  # Try again
```

### Git hook doesn't work in VS Code/Cursor

**Solution:**
Ensure you're committing from the terminal, or check your IDE's git settings to ensure it respects git hooks.

## Cursor AI Integration

This project includes a `.cursorrules` file that provides guidelines for Cursor AI. When using Cursor:

1. **Cursor will automatically follow the rules** defined in `.cursorrules`
2. **It will suggest code that follows our patterns**
3. **It will remind you to run tests before committing**

### Using Cursor Effectively

- Ask Cursor to "follow the project rules"
- Request "build the project to check for errors"
- Use Cursor to help fix linting/TypeScript errors
- Let Cursor suggest component patterns from `.cursorrules`

## Best Practices

### 1. Commit Often
- Make small, focused commits
- Each commit should represent one logical change
- Write clear commit messages

### 2. Test Before Pushing
- Always run `npm run validate` before pushing
- Manually test your changes
- Check different screen sizes

### 3. Keep Dependencies Updated
```bash
npm outdated        # Check for updates
npm update         # Update packages
```

### 4. Environment Variables
- Never commit `.env.local`
- Always use `.env.example` as a template
- Document new environment variables in README

### 5. Component Development
- Keep components small and focused
- Use TypeScript interfaces for props
- Implement proper error handling
- Add loading states for async operations

## Getting Help

- Check `.cursorrules` for coding guidelines
- Review `README.md` for setup instructions
- Check `requirements/todo.md` for project status
- Ask Cursor AI for help with specific patterns

## Git Commit Message Format

```
[type] Brief description

Detailed explanation if needed
- Change 1
- Change 2

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## Questions?

If you have questions about the development workflow:
1. Check the `.cursorrules` file
2. Review this CONTRIBUTING.md
3. Check the README.md
4. Ask your team lead
