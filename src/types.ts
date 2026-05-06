export interface SpecialItem {
  id: string;
  name: string;
  originalPrice: number;
  salePrice: number;
  category: 'Produce' | 'Meat & Seafood' | 'Dairy & Eggs' | 'Pantry' | 'Bakery';
  imagePlaceholder?: string;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: string[];
  instructions: string[];
  imageUrl: string;
}
