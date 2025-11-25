export interface Quote {
  id?: number;
  text: string;
  author: string;
  userId?: number;
}

export interface QuoteDto {
  text: string;
  author: string;
}
