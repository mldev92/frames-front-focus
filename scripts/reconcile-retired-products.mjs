// Список аудита не является вечным запретом: восстановленный товар возвращается в сборку.
export async function reconcileRetiredProducts(routeSet, reviewedPaths, origin, fetcher = fetch) {
  const retired = [];
  let position = 0;
  async function worker() {
    while (position < reviewedPaths.length) {
      const path = reviewedPaths[position++];
      const parts = path.split('/').filter(Boolean);
      if (!/^catalog_[sn]$/.test(parts[0]) || parts.length < 3) throw new Error(`Invalid reviewed product: ${path}`);
      const slug = parts.at(-1);
      const params = new URLSearchParams({ slug, city: parts[0] === 'catalog_n' ? 'nvk' : 'spb', section: parts.slice(1, -1).join('/') });
      const response = await fetcher(`${origin}/api/store/product.php?${params}`, { signal: AbortSignal.timeout(30000) });
      if (response.status === 404) {
        routeSet.delete(path);
        retired.push(path);
      } else {
        if (!response.ok) throw new Error(`Reviewed product check failed: ${path} (${response.status})`);
        const product = await response.json();
        if (!product.id || product.slug !== slug) throw new Error(`Reviewed product identity mismatch: ${path}`);
        routeSet.add(path);
      }
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  return retired.sort();
}
