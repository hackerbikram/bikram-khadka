export type Contact = {
  id?: number;
  name: string;
  email: string;
  message: string;
  confirm: boolean; // 0 = false (pending), 1 = true (admin confirmed)
  createdAt: string;
};