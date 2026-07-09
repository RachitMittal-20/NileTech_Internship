// Runs async tasks with limited concurrency instead of firing every request
// at once — keeps broadcast sends from hammering the email provider when a
// cycle has many recipients.
export async function runInBatches<T, R>(
  items: T[],
  batchSize: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = []
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(worker))
    results.push(...batchResults)
  }
  return results
}
