/**
 * Merchant keyword mappings for smart category prediction
 */

export const CATEGORY_KEYWORDS: Record<string, string[]> = {
  food: [
    'starbucks', 'mcdonald', 'subway', 'kfc', 'burger king', 'wendy',
    'restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'food', 'dining',
    'breakfast', 'lunch', 'dinner', 'bakery', 'deli', 'sushi', 'chinese',
    'domino', 'papa john', 'dunkin', 'chipotle', 'taco bell', 'panera'
  ],
  transport: [
    'uber', 'lyft', 'grab', 'gojek', 'taxi', 'gas', 'fuel', 'shell',
    'chevron', 'exxon', 'parking', 'toll', 'metro', 'bus', 'train',
    'airline', 'flight', 'car rental', 'hertz', 'enterprise', 'avis'
  ],
  shopping: [
    'amazon', 'walmart', 'target', 'costco', 'mall', 'store', 'shop',
    'best buy', 'home depot', 'ikea', 'zara', 'h&m', 'nike', 'adidas',
    'apple store', 'ebay', 'etsy', 'clothing', 'electronics'
  ],
  entertainment: [
    'netflix', 'spotify', 'apple music', 'youtube', 'cinema', 'movie',
    'concert', 'game', 'steam', 'playstation', 'xbox', 'nintendo',
    'disney', 'hulu', 'hbo', 'prime video', 'theater', 'amusement park'
  ],
  utilities: [
    'electric', 'electricity', 'water', 'gas bill', 'internet', 'phone',
    'mobile', 'telecom', 'wifi', 'broadband', 'cable', 'utility',
    'verizon', 'at&t', 't-mobile', 'comcast', 'spectrum'
  ],
  healthcare: [
    'hospital', 'clinic', 'pharmacy', 'doctor', 'medicine', 'cvs',
    'walgreens', 'medical', 'dental', 'dentist', 'health', 'therapy',
    'prescription', 'lab', 'urgent care'
  ],
  groceries: [
    'whole foods', 'trader joe', 'safeway', 'kroger', 'publix',
    'grocery', 'supermarket', 'market', 'fresh', 'organic'
  ],
  fitness: [
    'gym', 'fitness', 'yoga', 'planet fitness', 'equinox', 'crunch',
    'crossfit', 'pilates', 'sports', 'training'
  ],
};

export interface Category {
  id: string;
  name: string;
  color?: string;
}

/**
 * Predicts the most likely category based on description/merchant name
 * Returns the category ID if a match is found, null otherwise
 */
export function predictCategory(
  description: string,
  categories: Category[]
): string | null {
  if (!description || !categories || categories.length === 0) {
    return null;
  }

  const lowerDesc = description.toLowerCase().trim();

  // Try to find a matching category
  for (const [categoryKey, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const hasMatch = keywords.some(keyword =>
      lowerDesc.includes(keyword.toLowerCase())
    );

    if (hasMatch) {
      // Find the actual category from the user's categories
      const matchedCategory = categories.find(c =>
        c.name.toLowerCase().includes(categoryKey) ||
        categoryKey.includes(c.name.toLowerCase())
      );

      if (matchedCategory) {
        return matchedCategory.id;
      }
    }
  }

  return null;
}

/**
 * Get the suggested category name for display purposes
 */
export function getSuggestedCategoryName(
  description: string,
  categories: Category[]
): string | null {
  const categoryId = predictCategory(description, categories);
  if (!categoryId) return null;

  const category = categories.find(c => c.id === categoryId);
  return category?.name || null;
}
