import { MainLayout } from "@/components/layout/MainLayout";
import { HomePage } from "@/components/home/HomePage";
import {
  getActiveCategories,
  getProductInventory,
  getProducts,
} from "@/lib/marketplace/data";

export default async function Page() {
  const [products, categories] = await Promise.all([
    getProducts({ limit: 24 }),
    getActiveCategories(),
  ]);

  const stockByProduct = new Map(
    await Promise.all(
      products.map(async (product) => [
        product.id,
        await getProductInventory(product.id),
      ] as const),
    ),
  );

  return (
    <MainLayout>
      <HomePage
        products={products}
        categories={categories}
        stockByProduct={stockByProduct}
      />
    </MainLayout>
  );
}
