import { db } from '@/lib/firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';

export interface Product {
    id?: string;
    shopId: string;
    title: string;
    description: string;
    images: string[];
    price?: number;
    contactForPrice: boolean;
    createdAt: number;
}

const PRODUCTS_COLLECTION = 'products';

/**
 * Adds a new product to a shop
 */
export const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
    try {
        const productData = {
            ...product,
            createdAt: Date.now(),
        };
        const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), productData);
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error("Error adding product:", error);
        throw error;
    }
};

/**
 * Updates an existing product
 */
export const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
        const productRef = doc(db, PRODUCTS_COLLECTION, id);
        await updateDoc(productRef, updates);
        return { success: true };
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
};

/**
 * Deletes a product
 */
export const deleteProduct = async (id: string) => {
    try {
        await deleteDoc(doc(db, PRODUCTS_COLLECTION, id));
        return { success: true };
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
};

/**
 * Gets all products for a specific shop
 */
export const getShopProducts = async (shopId: string) => {
    try {
        const q = query(
            collection(db, PRODUCTS_COLLECTION),
            where('shopId', '==', shopId)
        );
        const querySnapshot = await getDocs(q);
        const products: Product[] = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() } as Product);
        });
        return products.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
        console.error("Error getting shop products:", error);
        throw error;
    }
};
