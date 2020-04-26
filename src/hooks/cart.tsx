import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cart = await AsyncStorage.getItem('@GoMarketplace:cart');

      if (cart) {
        setProducts(JSON.parse(cart));
      }
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const rest = products.filter(item => item.id !== id);
      const newItem = products.find(item => item.id === id);

      if (newItem) {
        newItem.quantity += 1;
        setProducts([...rest, newItem]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const productIndex = products.findIndex(item => item.id === product.id);

      if (productIndex < 0) {
        setProducts(oldProductsStage => [
          ...oldProductsStage,
          { ...product, quantity: 1 },
        ]);

        await AsyncStorage.setItem(
          '@GoMarketplace:cart',
          JSON.stringify([...products, { ...product, quantity: 1 }]),
        );

        return;
      }

      increment(product.id);
    },
    [products, increment],
  );

  const decrement = useCallback(
    async id => {
      const rest = products.filter(item => item.id !== id);
      const removeItem = products.find(item => item.id === id);

      if (removeItem) {
        if (removeItem.quantity <= 1) {
          setProducts(rest);
          return;
        }
        removeItem.quantity -= 1;
        setProducts([...rest, removeItem]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
