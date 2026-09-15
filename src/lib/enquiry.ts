export type Enquiry = {
  id: string;
  name: string;
  phone: string;
  email: string;
  projectType: string;
  zone: string;
  stage: string;
  startDate: string;
  description: string;
  sqm?: number;
  finish?: string;
  indicativeMin?: number;
  indicativeMax?: number;
  diaspora: boolean;
  createdAt: string;
};

const KEY = "atro.enquiries";

export function saveEnquiry(partial: Omit<Enquiry, "id" | "createdAt">): Enquiry {
  const row: Enquiry = {
    ...partial,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const prev = listEnquiries();
  localStorage.setItem(KEY, JSON.stringify([row, ...prev].slice(0, 40)));
  return row;
}

export function listEnquiries(): Enquiry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Enquiry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
