# 🚀 Development Workflow & Best Practices

This guide covers how to work effectively on the Flight Booking System project, including development workflow, code standards, and best practices.

## Development

- Use TypeScript strictly
- Follow the Result pattern for error handling
- Keep business logic in services, UI logic in components
- Use the provided UI components from `src/core/components/ui/`

## Code Standards

### TypeScript Usage
- **Strict mode enabled** - No `any` types allowed
- **Explicit typing** - Define types for all function parameters and return values
- **Interface over type** - Use interfaces for object shapes, types for unions
- **Generic constraints** - Use generics appropriately for reusable code

### Error Handling
- **Result pattern** - All service functions return `Result<T, E>`
- **Consistent errors** - Use predefined error types from `@/core/lib/http/result`
- **Graceful degradation** - Handle errors at appropriate UI boundaries
- **Logging** - Log errors for debugging, don't expose sensitive information

### Component Patterns
- **Composition over inheritance** - Build complex UIs from simple components
- **Custom hooks** - Extract reusable logic into custom hooks
- **Props interface** - Define clear component prop interfaces
- **Default props** - Provide sensible defaults where appropriate

## Development Workflow

### Adding New Features

1. **Plan the feature**
   - Understand the requirements and user story
   - Identify which feature module it belongs to
   - Consider database schema changes if needed

2. **Create the feature module structure**
   ```bash
   mkdir -p src/features/new-feature/{components,hooks,services,validations}
   ```

3. **Implement from inside out**
   - Start with types and validation schemas
   - Implement service layer with business logic
   - Create repository methods if needed
   - Build UI components
   - Add API routes
   - Connect everything together

4. **Test thoroughly**
   - Unit test business logic
   - Integration test API endpoints
   - Manual test UI flows
   - Test error scenarios

5. **Update documentation**
   - Add feature to relevant README sections
   - Document any new patterns or conventions

### Database Schema Changes

1. **Update schema** in `src/infrastructure/db/schema.ts`
2. **Generate migration**: `pnpm drizzle-kit generate`
3. **Apply migration**: `pnpm run db:reset` (for development)
4. **Update repositories** if schema changes affect queries
5. **Update types** to reflect new schema

### API Development

1. **Define the route** in appropriate `src/app/api/` directory
2. **Implement validation** using Zod schemas
3. **Call service methods** from the feature module
4. **Handle results properly** using `toJsonResponse()`
5. **Add proper error responses**

## Best Practices

### General Guidelines

- **Single responsibility** - Each function/class/module has one clear purpose
- **DRY principle** - Don't repeat yourself, extract common code
- **KISS principle** - Keep it simple, stupid
- **YAGNI** - You ain't gonna need it (don't over-engineer)
- **SOLID principles** - Especially Single Responsibility and Dependency Inversion

### React Best Practices

- **Functional components** with hooks over class components
- **Custom hooks** for shared logic
- **Memoization** for expensive computations (`useMemo`, `useCallback`)
- **Keys** in lists for efficient re-rendering
- **Error boundaries** for graceful error handling

### Database Best Practices

- **Atomic operations** - Use the `atomic()` wrapper for multi-step operations
- **Indexes** - Add appropriate indexes for query performance
- **Constraints** - Use database constraints for data integrity
- **Migrations** - Always use migrations, never manual schema changes
- **Prepared statements** - Drizzle handles this automatically

### Security Best Practices

- **Input validation** - Validate all inputs with Zod schemas
- **SQL injection prevention** - Drizzle ORM prevents this
- **Authentication checks** - Verify user permissions on protected routes
- **Environment variables** - Never commit secrets to version control
- **HTTPS** - Always use HTTPS in production

## Code Quality Tools

### Linting and Formatting

- **Biome** - Fast linter and formatter
- **ESLint** - Additional code quality rules
- **TypeScript** - Compiler checks

### Running Quality Checks

```bash
# Format code
pnpm format

# Lint code
pnpm lint

# Type check
pnpm tsc

# All checks
pnpm check
```

## Testing Strategy

### Unit Tests
- **Business logic** - Test service functions
- **Utilities** - Test pure functions
- **Validation** - Test Zod schemas

### Integration Tests
- **API routes** - Test complete request/response cycles
- **Database operations** - Test repository methods

### E2E Tests (Future)
- **User journeys** - Test complete user workflows
- **Critical paths** - Booking flow, authentication

## Performance Optimization

### Bundle Size
- **Tree shaking** - Only include used code
- **Dynamic imports** - Lazy load non-critical features
- **Component splitting** - Split large components

### Runtime Performance
- **Memoization** - Cache expensive computations
- **Virtualization** - For large lists (future)
- **Image optimization** - Use Next.js Image component

### Database Performance
- **Indexes** - Add indexes for frequently queried columns
- **Query optimization** - Use appropriate Drizzle methods
- **Connection pooling** - Neon handles this automatically

## Deployment

### Environment Setup

1. **Environment variables**
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=your-secret
   NEXTAUTH_URL=https://your-domain.com
   ```

2. **Build the application**
   ```bash
   pnpm build
   ```

3. **Database migration**
   ```bash
   pnpm drizzle-kit push
   ```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database schema up to date
- [ ] SSL certificate configured
- [ ] Monitoring and logging set up
- [ ] Backup strategy in place
- [ ] CDN configured for static assets

## Common Patterns

### Creating a New Service

```typescript
// src/features/example/services/example.service.ts
import { Result } from '@/core/lib/http/result';
import { exampleRepository } from '../repository';

export class ExampleService {
  static async createExample(data: CreateExampleData): Promise<Result<Example>> {
    // Validation
    const validation = createExampleSchema.safeParse(data);
    if (!validation.success) {
      return Result.failed(errors.validationError('Invalid data', validation.error));
    }

    // Business logic
    const existing = await exampleRepository.findByName(data.name);
    if (existing) {
      return Result.failed(errors.conflict('Example already exists'));
    }

    // Database operation
    try {
      const example = await exampleRepository.create(validation.data);
      return Result.ok(example);
    } catch (error) {
      return Result.failed(errors.internalError('Failed to create example'));
    }
  }
}
```

### Creating a New Component

```typescript
// src/features/example/components/ExampleCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/core/components/ui/card';

interface ExampleCardProps {
  title: string;
  description?: string;
  onClick?: () => void;
}

export function ExampleCard({ title, description, onClick }: ExampleCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      {description && (
        <CardContent>
          <p className="text-muted-foreground">{description}</p>
        </CardContent>
      )}
    </Card>
  );
}
```

### Creating a New API Route

```typescript
// src/app/api/examples/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ExampleService } from '@/features/example/services/example.service';
import { toJsonResponse } from '@/core/lib/http/result';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await ExampleService.createExample(body);

    return new Response(
      toJsonResponse(result, { requestId: request.headers.get('x-request-id') || 'unknown' }).body,
      {
        status: toJsonResponse(result).status,
        headers: toJsonResponse(result).headers,
      }
    );
  } catch (error) {
    // This should rarely happen due to Result pattern
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Troubleshooting

### Common Issues

**TypeScript errors:**
- Check for missing imports
- Ensure proper type definitions
- Use `pnpm tsc` for detailed error messages

**Database connection issues:**
- Verify DATABASE_URL environment variable
- Check database server status
- Ensure proper permissions

**Build failures:**
- Clear node_modules: `rm -rf node_modules && pnpm install`
- Clear Next.js cache: `rm -rf .next`
- Check for circular dependencies

**Runtime errors:**
- Check browser console for client-side errors
- Check server logs for API errors
- Verify environment variables are loaded

## Contributing Guidelines

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Create** a Pull Request

### PR Requirements

- [ ] Code follows project conventions
- [ ] Tests added for new functionality
- [ ] Documentation updated
- [ ] TypeScript types correct
- [ ] Linting passes
- [ ] No console.log statements in production code

## Resources

### Learning Materials
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [TanStack Query Docs](https://tanstack.com/query)

### Tools
- [Biome Playground](https://biomejs.dev/playground)
- [TypeScript Playground](https://www.typescriptlang.org/play)
- [Zod Playground](https://zod-playground.vercel.app)

## Next Steps

- **[README.md](README.md)** - Back to main project overview
- **[CONCEPTS.md](CONCEPTS.md)** - Review core concepts
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Understand project structure
