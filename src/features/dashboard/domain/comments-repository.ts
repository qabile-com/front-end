export interface Comment {
  id: string;
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
    sectionId: string,
    limit?: number,
    offset?: number,
  ): Promise<PaginatedComments>;
  addComment(courseId: string, sectionId: string, text: string): Promise<Comment>;
}
