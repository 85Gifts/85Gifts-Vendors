export interface Vendor {
 id: string;
  name: string;
  email: string;
  role: string;
  isEmailVerified: boolean;
  businessName?: string;
  address?: string;
  phone?: string;
}

export interface AuthContextType {
  vendor: Vendor | null;
  loading: boolean;
  register: (userData: RegisterData) => Promise<any>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Vendor>) => Promise<any>;
  forgotPassword: (email: string) => Promise<any>;
  isAuthenticated: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  businessName: string;
  address?: string;
}
