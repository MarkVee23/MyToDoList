export type Priority = 'low' | 'medium' | 'high';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface ListMember {
  uid?: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'owner' | 'editor' | 'viewer';
  joinedAt?: number;
}

export interface ToDoList {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  color?: string;
  ownerId: string;
  ownerEmail: string;
  ownerName?: string;
  members: string[]; // List of user emails or UIDs for quick array-contains queries
  memberDetails: ListMember[];
  inviteCode: string;
  isPublic?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Task {
  id: string;
  listId: string;
  title: string;
  description?: string;
  completed: boolean;
  completedBy?: {
    uid: string;
    displayName: string;
    email: string;
  } | null;
  completedAt?: number | null;
  priority: Priority;
  category?: string;
  dueDate?: string | null;
  assignedTo?: {
    uid?: string;
    displayName: string;
    email: string;
    photoURL?: string;
  } | null;
  createdBy: {
    uid: string;
    displayName: string;
    email: string;
    photoURL?: string;
  };
  createdAt: number;
  updatedAt: number;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
