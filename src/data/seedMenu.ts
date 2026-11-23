import type { MenuItem } from '../types/pos';

export const INITIAL_MENU: MenuItem[] = [
  // COFFEE
  {
    id: 'c-01',
    name: 'Kopi Susu Gula Aren',
    category: 'Coffee',
    basePrice: 22000,
    description: 'Espresso double shot, susu segar, dan sirup gula aren organik premium',
    isAvailable: true,
    badge: 'Signature',
    variants: [
      {
        id: 'temp',
        name: 'Suhu',
        options: [
          { id: 'iced', name: 'Iced (Dingin)', priceDelta: 0 },
          { id: 'hot', name: 'Hot (Hangat)', priceDelta: 0 },
        ],
        defaultOptionId: 'iced',
      },
      {
        id: 'size',
        name: 'Ukuran',
        options: [
          { id: 'reg', name: 'Regular (12oz)', priceDelta: 0 },
          { id: 'lrg', name: 'Large (16oz)', priceDelta: 4000 },
        ],
        defaultOptionId: 'reg',
      },
      {
        id: 'sugar',
        name: 'Tingkat Manis',
        options: [
          { id: 'norm', name: 'Normal Sweet', priceDelta: 0 },
          { id: 'less', name: 'Less Sugar (70%)', priceDelta: 0 },
          { id: 'no', name: 'No Sugar', priceDelta: 0 },
        ],
        defaultOptionId: 'norm',
      },
    ],
  },
  {
    id: 'c-02',
    name: 'Americano / Long Black',
    category: 'Coffee',
    basePrice: 20000,
    description: 'Double shot espresso murni dengan air mineral panas atau dingin',
    isAvailable: true,
    badge: 'Favorit',
    variants: [
      {
        id: 'temp',
        name: 'Suhu',
        options: [
          { id: 'iced', name: 'Iced', priceDelta: 0 },
          { id: 'hot', name: 'Hot', priceDelta: 0 },
        ],
        defaultOptionId: 'iced',
      },
      {
        id: 'size',
        name: 'Ukuran',
        options: [
          { id: 'reg', name: 'Regular', priceDelta: 0 },
          { id: 'lrg', name: 'Large', priceDelta: 4000 },
        ],
        defaultOptionId: 'reg',
      },
    ],
  },
  {
    id: 'c-03',
    name: 'Caffe Latte',
    category: 'Coffee',
    basePrice: 25000,
    description: 'Espresso kaya rasa dipadu dengan steamed milk lembut dan microfoam tipis',
    isAvailable: true,
    variants: [
      {
        id: 'temp',
        name: 'Suhu',
        options: [
          { id: 'hot', name: 'Hot', priceDelta: 0 },
          { id: 'iced', name: 'Iced', priceDelta: 0 },
        ],
        defaultOptionId: 'hot',
      },
      {
        id: 'size',
        name: 'Ukuran',
        options: [
          { id: 'reg', name: 'Regular', priceDelta: 0 },
          { id: 'lrg', name: 'Large', priceDelta: 5000 },
        ],
        defaultOptionId: 'reg',
      },
    ],
  },
  {
    id: 'c-04',
    name: 'Cappuccino',
    category: 'Coffee',
    basePrice: 25000,
    description: 'Komposisi seimbang espresso, steamed milk, dan foam susu tebal dengan taburan cokelat',
    isAvailable: true,
    variants: [
      {
        id: 'temp',
        name: 'Suhu',
        options: [
          { id: 'hot', name: 'Hot', priceDelta: 0 },
          { id: 'iced', name: 'Iced', priceDelta: 0 },
        ],
        defaultOptionId: 'hot',
      },
    ],
  },
  {
    id: 'c-05',
    name: 'Caramel Macchiato',
    category: 'Coffee',
    basePrice: 28000,
    description: 'Espresso dengan sirup vanilla, steamed milk, dan saus karamel lumer di atasnya',
    isAvailable: true,
    badge: 'Best Seller',
    variants: [
      {
        id: 'temp',
        name: 'Suhu',
        options: [
          { id: 'iced', name: 'Iced', priceDelta: 0 },
          { id: 'hot', name: 'Hot', priceDelta: 0 },
        ],
        defaultOptionId: 'iced',
      },
      {
        id: 'size',
        name: 'Ukuran',
        options: [
          { id: 'reg', name: 'Regular', priceDelta: 0 },
          { id: 'lrg', name: 'Large', priceDelta: 5000 },
        ],
        defaultOptionId: 'reg',
      },
    ],
  },
  {
    id: 'c-06',
    name: 'Espresso Single / Double',
    category: 'Coffee',
    basePrice: 15000,
    description: 'Ekstraksi kopi murni dengan crema emas tebal dan aroma intens',
    isAvailable: true,
    variants: [
      {
        id: 'shot',
        name: 'Shot',
        options: [
          { id: 'single', name: 'Single Shot', priceDelta: 0 },
          { id: 'double', name: 'Double Shot', priceDelta: 5000 },
        ],
        defaultOptionId: 'single',
      },
    ],
  },

  // MANUAL BREW
  {
    id: 'mb-01',
    name: 'V60 Pour Over (Aceh Gayo)',
    category: 'Manual Brew',
    basePrice: 28000,
    description: 'Single origin Aceh Gayo washed, tasting notes: brown sugar, citrus, black tea',
    isAvailable: true,
    badge: 'Specialty',
    variants: [
      {
        id: 'temp',
        name: 'Sajian',
        options: [
          { id: 'hot', name: 'Hot Brew', priceDelta: 0 },
          { id: 'iced', name: 'Japanese Iced', priceDelta: 2000 },
        ],
        defaultOptionId: 'hot',
      },
    ],
  },
  {
    id: 'mb-02',
    name: 'V60 Pour Over (Kerinci Natural)',
    category: 'Manual Brew',
    basePrice: 30000,
    description: 'Single origin Gunung Kerinci Natural, tasting notes: ripe mango, berry, floral',
    isAvailable: true,
    badge: 'Specialty',
    variants: [
      {
        id: 'temp',
        name: 'Sajian',
        options: [
          { id: 'hot', name: 'Hot Brew', priceDelta: 0 },
          { id: 'iced', name: 'Japanese Iced', priceDelta: 2000 },
        ],
        defaultOptionId: 'hot',
      },
    ],
  },
  {
    id: 'mb-03',
    name: 'Cold Brew Signature 24H',
    category: 'Manual Brew',
    basePrice: 26000,
    description: 'Kopi seduh dingin selama 24 jam, low acidity, sangat segar dan kaya rasa',
    isAvailable: true,
    badge: 'Favorit',
  },

  // NON-COFFEE
  {
    id: 'nc-01',
    name: 'Matcha Uji Latte',
    category: 'Non-Coffee',
    basePrice: 26000,
    description: '100% bubuk ceremonial matcha Jepang autentik dengan susu segar creamy',
    isAvailable: true,
    badge: 'Best Seller',
    variants: [
      {
        id: 'temp',
        name: 'Suhu',
        options: [
          { id: 'iced', name: 'Iced', priceDelta: 0 },
          { id: 'hot', name: 'Hot', priceDelta: 0 },
        ],
        defaultOptionId: 'iced',
      },
      {
        id: 'size',
        name: 'Ukuran',
        options: [
          { id: 'reg', name: 'Regular', priceDelta: 0 },
          { id: 'lrg', name: 'Large', priceDelta: 5000 },
        ],
        defaultOptionId: 'reg',
      },
    ],
  },
  {
    id: 'nc-02',
    name: 'Dark Chocolate Velvet',
    category: 'Non-Coffee',
    basePrice: 25000,
    description: 'Cokelat Belgia hitam 70% kaya antioksidan dengan susu hangat/dingin',
    isAvailable: true,
    variants: [
      {
        id: 'temp',
        name: 'Suhu',
        options: [
          { id: 'iced', name: 'Iced', priceDelta: 0 },
          { id: 'hot', name: 'Hot', priceDelta: 0 },
        ],
        defaultOptionId: 'iced',
      },
      {
        id: 'size',
        name: 'Ukuran',
        options: [
          { id: 'reg', name: 'Regular', priceDelta: 0 },
          { id: 'lrg', name: 'Large', priceDelta: 4000 },
        ],
        defaultOptionId: 'reg',
      },
    ],
  },
  {
    id: 'nc-03',
    name: 'Earl Grey Milk Tea',
    category: 'Non-Coffee',
    basePrice: 24000,
    description: 'Seduhan teh Earl Grey bergamot harum berpadu dengan susu kental manis lembut',
    isAvailable: true,
    variants: [
      {
        id: 'temp',
        name: 'Suhu',
        options: [
          { id: 'iced', name: 'Iced', priceDelta: 0 },
          { id: 'hot', name: 'Hot', priceDelta: 0 },
        ],
        defaultOptionId: 'iced',
      },
    ],
  },
  {
    id: 'nc-04',
    name: 'Sparkling Lemonade Peach',
    category: 'Non-Coffee',
    basePrice: 23000,
    description: 'Minuman soda segar rasa persik dengan perasan lemon asli dan daun mint',
    isAvailable: true,
    badge: 'Segar',
  },

  // FOODS
  {
    id: 'f-01',
    name: 'Nasi Goreng Spesial CY',
    category: 'Foods',
    basePrice: 35000,
    description: 'Nasi goreng harum rempah dengan suwiran ayam, telur ceplok, sate ayam, dan kerupuk udang',
    isAvailable: true,
    badge: 'Favorit',
    variants: [
      {
        id: 'spicy',
        name: 'Tingkat Pedas',
        options: [
          { id: 'sedang', name: 'Sedang', priceDelta: 0 },
          { id: 'pedas', name: 'Pedas', priceDelta: 0 },
          { id: 'extrapedas', name: 'Extra Pedas', priceDelta: 2000 },
        ],
        defaultOptionId: 'sedang',
      },
    ],
  },
  {
    id: 'f-02',
    name: 'Spaghetti Aglio Olio Smoked Beef',
    category: 'Foods',
    basePrice: 38000,
    description: 'Pasta al dente ditumis minyak zaitun, bawang putih, cabai kering, dan irisan daging asap',
    isAvailable: true,
    badge: 'Chef Rec',
  },
  {
    id: 'f-03',
    name: 'Chicken Rice Bowl Sambal Matah',
    category: 'Foods',
    basePrice: 32000,
    description: 'Ayam krispi gurih dengan sambal matah khas Bali segar di atas nasi pulen hangat',
    isAvailable: true,
  },
  {
    id: 'f-04',
    name: 'Beef Teriyaki Rice Bowl',
    category: 'Foods',
    basePrice: 38000,
    description: 'Irisan daging sapi empuk saus teriyaki manis gurih, daun bawang, dan taburan biji wijen',
    isAvailable: true,
  },

  // SNACKS
  {
    id: 's-01',
    name: 'Truffle French Fries',
    category: 'Snacks',
    basePrice: 25000,
    description: 'Kentang goreng crinkle renyah dengan minyak truffle aromatik dan taburan keju parmesan',
    isAvailable: true,
    badge: 'Camilan',
  },
  {
    id: 's-02',
    name: 'Cireng Krispi Bumbu Rujak',
    category: 'Snacks',
    basePrice: 18000,
    description: 'Cireng kenyal gurih renyah di luar disajikan dengan saus rujak pedas manis legit',
    isAvailable: true,
    badge: 'Favorit',
  },
  {
    id: 's-03',
    name: 'Mix Platter Gorengan',
    category: 'Snacks',
    basePrice: 32000,
    description: 'Platter sharing: sosis panggang, chicken nuggets, dan french fries dengan cocolan saus mayo',
    isAvailable: true,
    badge: 'Best Share',
  },
  {
    id: 's-04',
    name: 'Singkong Goreng Keju',
    category: 'Snacks',
    basePrice: 20000,
    description: 'Singkong goreng merekah lembut dengan taburan keju cheddar parut melimpah',
    isAvailable: true,
  },

  // ADD-ON
  {
    id: 'ao-01',
    name: 'Extra Espresso Shot',
    category: 'Add-on',
    basePrice: 5000,
    description: 'Tambahan 1 shot espresso untuk rasa kopi yang lebih mantap',
    isAvailable: true,
  },
  {
    id: 'ao-02',
    name: 'Ganti Oat Milk (Plant-based)',
    category: 'Add-on',
    basePrice: 7000,
    description: 'Tukar susu sapi dengan susu gandum (Oatside) ramah vegan & lactose-free',
    isAvailable: true,
  },
  {
    id: 'ao-03',
    name: 'Syrup Vanilla / Caramel',
    category: 'Add-on',
    basePrice: 4000,
    description: '1 pump sirup rasa vanilla alami atau saus karamel',
    isAvailable: true,
  },
  {
    id: 'ao-04',
    name: 'Ice Cream Vanilla Scoop',
    category: 'Add-on',
    basePrice: 6000,
    description: '1 scoop es krim vanilla creamy untuk affogato atau topping',
    isAvailable: true,
  },
];

export const INITIAL_SETTINGS = {
  storeName: 'CY Coffee & Roastery',
  tagline: 'Artisan Coffee & Good Vibes',
  address: 'Jl. Senopati No. 8, Kebayoran Baru, Jakarta Selatan',
  phone: '0812-3456-7890',
  serviceChargeRate: 5, // 5% Service Charge (bisa diubah 0% atau nilai lain)
  taxRate: 10, // 10% PB1 Restaurant Tax (bisa diubah 0% atau nilai lain)
  receiptFooter: 'Terima kasih atas kunjungan Anda!\nFollow Instagram kami: @cycoffee.id',
  cashierName: 'Kasir 1',
  cashiers: ['Kasir 1', 'Barista Rama', 'Kasir Sarah'],
  currencyPrefix: 'Rp',
};
