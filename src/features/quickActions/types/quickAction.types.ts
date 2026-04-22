// ─── QuickAction Entity ───────────────────────────────────────────────────────
export interface QuickAction {
  _id: string;
  title: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
  
  // Static actions (Dashboard)
  name?: string;
  image?: string;
  path?: string;
  isStatic?: boolean;
}

// ─── API Response shapes ──────────────────────────────────────────────────────
export interface QuickActionListResponse {
  success: boolean;
  status: number;
  message: string;
  data: QuickAction[];
}

export interface QuickActionSingleResponse {
  success: boolean;
  status: number;
  message: string;
  data: QuickAction;
}

// ─── Form values ──────────────────────────────────────────────────────────────
export interface QuickActionFormValues {
  title: string;
  icon: File | null;          // new file chosen by user
  existingImage: string;       // current image URL (keep when no new file)
}
