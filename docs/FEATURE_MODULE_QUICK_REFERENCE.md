# Feature Module Quick Reference

## TL;DR Structure

```
src/features/{feature}/
├── api/              # React Query hooks (Frontend)
├── components/       # React UI components
├── hooks/            # Custom React hooks
├── repository/       # Database operations (Backend)
├── services/         # Business logic (Backend)
├── store/            # State management (Zustand)
├── utils/            # Helper functions
├── validations/      # Zod schemas
└── types.ts          # TypeScript types
```

## Quick Decision Tree

### "Where should I put this code?"

```
Is it a React component?
├─ YES → components/
└─ NO ↓

Does it fetch/mutate data from API?
├─ YES → api/ (queries.ts or mutations.ts)
└─ NO ↓

Is it reusable React logic?
├─ YES → hooks/
└─ NO ↓

Does it manage global state?
├─ YES → store/
└─ NO ↓

Does it interact with database?
├─ YES → repository/
└─ NO ↓

Does it contain business logic?
├─ YES → services/
└─ NO ↓

Is it a validation schema?
├─ YES → validations/
└─ NO ↓

Is it a helper function?
├─ YES → utils/
└─ NO ↓

Is it a type definition?
└─ YES → types.ts
```

## Layer Responsibilities

| Layer | Purpose | Used By | Uses |
|-------|---------|---------|------|
| **api/** | API communication | Components, Hooks | httpClient |
| **components/** | UI rendering | Pages | api/, hooks/, store/ |
| **hooks/** | Reusable logic | Components | api/, store/ |
| **repository/** | Database ops | Services | Database (Drizzle) |
| **services/** | Business logic | API Routes | repository/ |
| **store/** | Global state | Components, Hooks | - |
| **utils/** | Helper functions | Any | - |
| **validations/** | Data validation | API Routes, Forms | - |
| **types.ts** | Type definitions | Any | - |

## Common Patterns

### Pattern 1: Fetch and Display Data

```typescript
// 1. Define type (types.ts)
export interface Product {
  id: number;
  name: string;
  price: number;
}

// 2. Create query hook (api/queries.ts)
export function useProductsQuery() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => httpClient.get<Product[]>("/products"),
  });
}

// 3. Use in component (components/product-list.tsx)
export function ProductList() {
  const { data: products, isLoading } = useProductsQuery();
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div>
      {products?.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Pattern 2: Create New Record

```typescript
// 1. Define validation (validations/create-product.ts)
export const createProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
});

export type CreateProductSchema = z.infer<typeof createProductSchema>;

// 2. Create mutation hook (api/mutations.ts)
export function useCreateProductMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: CreateProductSchema) => {
      return httpClient.post<Product>("/products", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// 3. Use in component (components/product-form.tsx)
export function ProductForm() {
  const createProduct = useCreateProductMutation();
  
  const handleSubmit = async (data: CreateProductSchema) => {
    try {
      await createProduct.mutateAsync(data);
      toast.success("Product created!");
    } catch (error) {
      toast.error("Failed to create product");
    }
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Pattern 3: Backend Service with Repository

```typescript
// 1. Repository (repository/index.ts)
export const productsRepository = {
  findAll: async () => {
    return await db.select().from(products);
  },
  
  create: async (data: typeof products.$inferInsert) => {
    const [product] = await db.insert(products).values(data).returning();
    return product;
  },
};

// 2. Service (services/products.service.ts)
export class ProductsService {
  async createProduct(data: CreateProductSchema) {
    try {
      // Business logic
      if (data.price < 0) {
        return err(errors.validationError("Price must be positive"));
      }
      
      // Use repository
      const product = await productsRepository.create(data);
      
      return ok(product);
    } catch (error) {
      return err(errors.internalError("Failed to create product"));
    }
  }
}

export const productsService = new ProductsService();

// 3. API Route (app/api/products/route.ts)
export const POST = async (req: Request) => {
  const body = await req.json();
  
  // Validate
  const validation = createProductSchema.safeParse(body);
  if (!validation.success) {
    return Response.json({ error: validation.error }, { status: 400 });
  }
  
  // Use service
  const result = await productsService.createProduct(validation.data);
  
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 500 });
  }
  
  return Response.json({ data: result.value });
};
```

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Component | PascalCase | `ProductCard.tsx` |
| Hook | camelCase with `use` prefix | `useProducts.ts` |
| Service | camelCase with `.service` suffix | `products.service.ts` |
| Repository | camelCase with `Repository` suffix | `productsRepository` |
| Validation | kebab-case | `create-product.ts` |
| Type | PascalCase | `Product`, `CreateProductSchema` |
| Util | camelCase | `formatPrice.ts` |

## Import/Export Patterns

### Always use index.ts for public exports

```typescript
// ❌ Bad
import { ProductCard } from "@/features/products/components/product-card";
import { ProductList } from "@/features/products/components/product-list";

// ✅ Good
import { ProductCard, ProductList } from "@/features/products/components";
```

### Barrel exports (index.ts)

```typescript
// components/index.ts
export { ProductCard } from "./product-card";
export { ProductList } from "./product-list";
export { ProductForm } from "./product-form";

// api/index.ts
export { useProductsQuery, useProductQuery } from "./queries";
export { useCreateProductMutation, useUpdateProductMutation } from "./mutations";
```

## Common Mistakes to Avoid

### ❌ Don't mix layers

```typescript
// ❌ Bad: Component directly accessing database
export function ProductList() {
  const products = await db.select().from(products); // NO!
  return <div>...</div>;
}

// ✅ Good: Component uses API hook
export function ProductList() {
  const { data: products } = useProductsQuery();
  return <div>...</div>;
}
```

### ❌ Don't put business logic in components

```typescript
// ❌ Bad: Business logic in component
export function ProductForm() {
  const handleSubmit = async (data) => {
    // Complex validation
    if (data.price < 0) return;
    if (data.name.length < 3) return;
    // Complex calculation
    const discount = calculateDiscount(data);
    // Direct API call
    await fetch("/api/products", { ... });
  };
}

// ✅ Good: Business logic in service, component uses hook
export function ProductForm() {
  const createProduct = useCreateProductMutation();
  
  const handleSubmit = async (data) => {
    await createProduct.mutateAsync(data);
  };
}
```

### ❌ Don't skip validation

```typescript
// ❌ Bad: No validation
export const POST = async (req: Request) => {
  const body = await req.json();
  const result = await productsService.create(body); // Unsafe!
};

// ✅ Good: Validate with Zod
export const POST = async (req: Request) => {
  const body = await req.json();
  const validation = createProductSchema.safeParse(body);
  if (!validation.success) {
    return Response.json({ error: validation.error }, { status: 400 });
  }
  const result = await productsService.create(validation.data);
};
```

## Checklist for New Feature

```
Backend:
□ Schema in src/infrastructure/db/schema.ts
□ Repository with CRUD operations
□ Service with business logic
□ API routes in src/app/api/{feature}/
□ Validation schemas (Zod)
□ Types defined

Frontend:
□ Query hooks in api/queries.ts
□ Mutation hooks in api/mutations.ts
□ Components in components/
□ Custom hooks in hooks/ (if needed)
□ Store in store/ (if needed)
□ Types imported/defined

Documentation:
□ API README.md
□ Usage EXAMPLES.md
□ Comments for complex logic

Testing:
□ Service tests
□ API route tests
□ Component tests
```

## Quick Commands

```bash
# Create new feature structure
mkdir -p src/features/{feature}/{api,components,hooks,repository,services,validations}

# Create essential files
touch src/features/{feature}/types.ts
touch src/features/{feature}/api/{index,queries,mutations}.ts
touch src/features/{feature}/components/index.tsx
touch src/features/{feature}/repository/index.ts
touch src/features/{feature}/services/{feature}.service.ts
touch src/features/{feature}/validations/create-{feature}.ts
```

## Need Help?

- **Full documentation:** `docs/FEATURE_MODULE_STRUCTURE.md`
- **Bookings example:** `src/features/bookings/`
- **Flights example:** `src/features/flights/`
- **Seats example:** `src/features/seats/`
