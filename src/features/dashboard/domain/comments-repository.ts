export interface Comment {
  name: string;
  text: string;
  time: string;
}

export interface PaginatedComments {
  comments: Comment[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface ICommentsRepository {
  getComments(
    courseId: string,
    partTitle: string,
    limit?: number,
    offset?: number,
  ): Promise<PaginatedComments>;
}
