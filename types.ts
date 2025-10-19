
export interface Document {
  id: string;
  title: string;
  content: string;
  pageNumber?: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  sources?: Document[];
}
