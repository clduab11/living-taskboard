import { create } from 'zustand';
import { UserPresence } from '@living-taskboard/shared';

interface CollaborationState {
  users: Map<string, UserPresence>;
  addUser: (user: UserPresence) => void;
  removeUser: (userId: string) => void;
  updateUserCursor: (userId: string, cursor: { x: number; y: number }) => void;
  updateUserSelection: (userId: string, objectIds: string[]) => void;
}

export const useCollaborationStore = create<CollaborationState>((set) => ({
  users: new Map(),

  addUser: (user) => set((state) => {
    const newUsers = new Map(state.users);
    newUsers.set(user.userId, user);
    return { users: newUsers };
  }),

  removeUser: (userId) => set((state) => {
    const newUsers = new Map(state.users);
    newUsers.delete(userId);
    return { users: newUsers };
  }),

  updateUserCursor: (userId, cursor) => set((state) => {
    const newUsers = new Map(state.users);
    const user = newUsers.get(userId);
    if (user) {
      newUsers.set(userId, { ...user, cursor, lastActive: new Date() });
    }
    return { users: newUsers };
  }),

  updateUserSelection: (userId, objectIds) => set((state) => {
    const newUsers = new Map(state.users);
    const user = newUsers.get(userId);
    if (user) {
      newUsers.set(userId, { ...user, selectedObjects: objectIds, lastActive: new Date() });
    }
    return { users: newUsers };
  }),
}));
