export interface Post {
  _meta: {
    id: string;
    createdAt: number;
    updatedAt: number;
  };

  text: string;
}
