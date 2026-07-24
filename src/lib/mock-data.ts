export type KitStatus = 'stash' | 'in-progress' | 'completed' | 'wishlist';

export interface Kit {
  id: string;
  name: string;
  brand: string;
  scale: string;
  category: string;
  reference: string;
  barcode?: string;
  imageUrl: string;
  scalematesUrl?: string;
  year?: number;
}

export interface UserKit {
  id: string;
  kit: Kit;
  status: KitStatus;
  notes?: string;
  photos: string[];
  purchaseDate?: string;
  price?: number;
  addedAt: string;
}

export const mockKits: Kit[] = [
  {
    id: '1',
    name: 'Spitfire Mk.IX',
    brand: 'Tamiya',
    scale: '1/48',
    category: 'Aircraft',
    reference: '61033',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop',
    scalematesUrl: 'https://scalemates.com/kits/tamiya-61033',
    year: 2019,
  },
  {
    id: '2',
    name: 'Tiger I Early Production',
    brand: 'Rye Field Model',
    scale: '1/35',
    category: 'Armor',
    reference: 'RM-5003',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop',
    year: 2020,
  },
  {
    id: '3',
    name: 'U.S.S. Enterprise CVN-65',
    brand: 'Trumpeter',
    scale: '1/350',
    category: 'Ships',
    reference: '05521',
    imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop',
    year: 2018,
  },
  {
    id: '4',
    name: 'Porsche 911 GT3 RS',
    brand: 'Revell',
    scale: '1/24',
    category: 'Cars',
    reference: '07028',
    imageUrl: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=300&fit=crop',
    year: 2021,
  },
  {
    id: '5',
    name: 'Saturn V Rocket',
    brand: 'Airfix',
    scale: '1/144',
    category: 'Space',
    reference: 'A11170',
    imageUrl: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&h=300&fit=crop',
    year: 2019,
  },
  {
    id: '6',
    name: 'Messerschmitt Bf 109 G-6',
    brand: 'Eduard',
    scale: '1/48',
    category: 'Aircraft',
    reference: '82111',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=300&fit=crop',
    year: 2022,
  },
];

export const mockUserKits: UserKit[] = [
  {
    id: 'uk1',
    kit: mockKits[0],
    status: 'in-progress',
    notes: 'Pintando el camuflaje del fuselaje',
    photos: [],
    purchaseDate: '2024-06-15',
    price: 32.50,
    addedAt: '2024-06-15',
  },
  {
    id: 'uk2',
    kit: mockKits[1],
    status: 'stash',
    photos: [],
    purchaseDate: '2024-08-20',
    price: 55.00,
    addedAt: '2024-08-20',
  },
  {
    id: 'uk3',
    kit: mockKits[2],
    status: 'completed',
    notes: 'Terminado con weathering completo',
    photos: [],
    purchaseDate: '2024-01-10',
    price: 120.00,
    addedAt: '2024-01-10',
  },
  {
    id: 'uk4',
    kit: mockKits[3],
    status: 'wishlist',
    photos: [],
    addedAt: '2024-09-01',
  },
  {
    id: 'uk5',
    kit: mockKits[4],
    status: 'stash',
    photos: [],
    purchaseDate: '2024-07-05',
    price: 45.00,
    addedAt: '2024-07-05',
  },
  {
    id: 'uk6',
    kit: mockKits[5],
    status: 'stash',
    photos: [],
    purchaseDate: '2024-10-12',
    price: 38.00,
    addedAt: '2024-10-12',
  },
];

export const statusLabels: Record<KitStatus, string> = {
  stash: 'En Stash',
  'in-progress': 'En Progreso',
  completed: 'Completado',
  wishlist: 'Wishlist',
};

export const statusColors: Record<KitStatus, string> = {
  stash: 'bg-primary/20 text-primary',
  'in-progress': 'bg-accent/20 text-accent',
  completed: 'bg-[hsl(var(--kit-completed))]/20 text-[hsl(var(--kit-completed))]',
  wishlist: 'bg-[hsl(var(--kit-wishlist))]/20 text-[hsl(var(--kit-wishlist))]',
};

export const categories = ['All', 'Aircraft', 'Armor', 'Ships', 'Cars', 'Space', 'Figures', 'Sci-Fi'];
