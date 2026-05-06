/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface WalletState {
  address: string | null;
  balance: string | null;
  provider: string | null;
  isConnected: boolean;
}

export type DropStatus = 'minting' | 'upcoming' | 'completed';

export interface DropItem {
  id: string;
  title: string;
  creator: {
    name: string;
    avatar: string;
    username: string;
  };
  image: string;
  price: string;
  totalMinted: number;
  maxSupply: number;
  status: DropStatus;
  releaseTime: string; // ISO string
  description: string;
  category: 'art' | 'music' | 'gaming' | 'fashion';
  likes: number;
  hasLiked?: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export interface SearchSuggestion {
  id: string;
  title: string;
  type: 'drop' | 'creator' | 'collection';
  url?: string;
}
