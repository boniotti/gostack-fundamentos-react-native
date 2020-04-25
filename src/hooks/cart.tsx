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
      const cart = await AsyncStorage.getItem('@GoMarketplace');

      if (cart) {
        setProducts(JSON.parse(cart));
      }

      // AsyncStorage.removeItem('@GoMarketplace');
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productIndex = products.findIndex(item => product.id === item.id);

      if (productIndex !== -1) {
        const newProductArray = [...products];
        newProductArray[productIndex].quantity += 1;
        setProducts(newProductArray);

        await AsyncStorage.setItem(
          '@GoMarketplace',
          JSON.stringify(newProductArray),
        );
        return;
      }

      const cartProducts = {
        ...product,
        quantity: 1,
      };

      setProducts([...products, cartProducts]);

      await AsyncStorage.setItem(
        '@GoMarketplace',
        JSON.stringify([...products, cartProducts]),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(item => item.id === id);

      const newProductArray = [...products];
      newProductArray[productIndex].quantity += 1;
      setProducts(newProductArray);

      await AsyncStorage.setItem(
        '@GoMarketplace',
        JSON.stringify(newProductArray),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(item => item.id === id);

      if (products[productIndex].quantity > 0) {
        const newProductArray = [...products];
        newProductArray[productIndex].quantity -= 1;
        setProducts(newProductArray);

        await AsyncStorage.setItem(
          '@GoMarketplace',
          JSON.stringify(newProductArray),
        );
      }
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
