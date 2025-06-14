from typing import List, Dict, Any, Optional
import logging

from models.book import Book
from models.author import Author
from services.database_service import DatabaseService
from filters.base_filter import FilterCombiner
from filters.book_filters import TextFilter, ExactFilter, NumericRangeFilter, MultiValueFilter

logger = logging.getLogger(__name__)


class BookService:
    def __init__(self, db_service: DatabaseService = None):
        self.db_service = db_service or DatabaseService()
        self._initialize_filters()
    
    def _initialize_filters(self):
        self.available_filters = [
            TextFilter('title', case_sensitive=False),
            TextFilter('author', case_sensitive=False),
            TextFilter('author_bio', case_sensitive=False),
            TextFilter('authors', case_sensitive=False),
            TextFilter('publisher', case_sensitive=False),
            TextFilter('synopsis', case_sensitive=False),
            TextFilter('subjects', case_sensitive=False),
            TextFilter('overview', case_sensitive=False),
            TextFilter('excerpt', case_sensitive=False),
            ExactFilter('author_slug'),
            ExactFilter('format'),
            ExactFilter('edition'),
            NumericRangeFilter('pages'),
            NumericRangeFilter('isbn13'),
            MultiValueFilter('subjects'),
            MultiValueFilter('format'),
        ]
        
        self.filter_combiner = FilterCombiner(self.available_filters, combiner="AND")
    
    def get_books_with_filters(
        self, 
        filters: Dict[str, Any] = None, 
        page: int = 1, 
        page_size: int = 10,
        order_by: str = None,
        order_direction: str = 'ASC'
    ) -> Dict[str, Any]:
        
        if filters is None:
            filters = {}
        
        try:
            where_clause, parameters = self.filter_combiner.build_query(filters)
            
            base_query = "SELECT * FROM book"
            
            if where_clause:
                base_query += where_clause
            
            if order_by and self._is_valid_column(order_by):
                direction = 'DESC' if order_direction.upper() == 'DESC' else 'ASC'
                base_query += f" ORDER BY {order_by} {direction}"
            
            count_query = f"SELECT COUNT(*) FROM book{where_clause}"
            count_result = self.db_service.execute_query(count_query, parameters)
            total_count = count_result[0][0] if count_result else 0
            
            offset = (page - 1) * page_size
            paginated_query = base_query + f" LIMIT {page_size} OFFSET {offset}"
            
            results = self.db_service.execute_query(paginated_query, parameters)
            
            books = []
            for row in results:
                try:
                    book = Book.from_db_row(row)
                    books.append(book.to_dict())
                except ValueError as e:
                    logger.warning(f"Skipping invalid book row: {e}")
                    continue
            
            total_pages = (total_count + page_size - 1) // page_size
            has_next = page < total_pages
            has_prev = page > 1
            
            return {
                'books': books,
                'pagination': {
                    'current_page': page,
                    'page_size': page_size,
                    'total_count': total_count,
                    'total_pages': total_pages,
                    'has_next': has_next,
                    'has_prev': has_prev
                },
                'filters_applied': {k: v for k, v in filters.items() if v is not None}
            }
            
        except Exception as e:
            logger.error(f"Error in get_books_with_filters: {e}")
            raise
    
    def get_book_by_id(self, book_id: int) -> Optional[Dict[str, Any]]:
        
        try:
            query = "SELECT * FROM book WHERE id = ?"
            results = self.db_service.execute_query(query, [book_id])
            
            if not results:
                return None
            
            book = Book.from_db_row(results[0])
            return book.to_dict()
            
        except Exception as e:
            logger.error(f"Error getting book by ID {book_id}: {e}")
            raise
    
    def create_book(self, book_data: Dict[str, Any]) -> Dict[str, Any]:
        
        try:
            required_fields = ['title', 'author']
            for field in required_fields:
                if not book_data.get(field):
                    raise ValueError(f"Missing required field: {field}")
            
            fields = []
            values = []
            placeholders = []
            
            field_mapping = {
                'title': 'title',
                'author': 'author',
                'author_bio': 'author_bio',
                'authors': 'authors',
                'author_slug': 'author_slug',
                'publisher': 'publisher',
                'synopsis': 'synopsis',
                'subjects': 'subjects',
                'isbn13': 'isbn13',
                'isbn10': 'isbn10',
                'price': 'price',
                'format': 'format',
                'pages': 'pages',
                'overview': 'overview',
                'excerpt': 'excerpt'
            }
            
            for api_field, db_field in field_mapping.items():
                if api_field in book_data and book_data[api_field] is not None:
                    fields.append(db_field)
                    values.append(book_data[api_field])
                    placeholders.append('?')
            
            if not fields:
                raise ValueError("No valid fields provided for book creation")
            
            query = f"""
                INSERT INTO book ({', '.join(fields)}) 
                VALUES ({', '.join(placeholders)})
            """
            
            book_id = self.db_service.execute_insert(query, values)
            
            return self.get_book_by_id(book_id)
            
        except Exception as e:
            logger.error(f"Error creating book: {e}")
            raise

    def update_book(self, book_id: int, book_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        try:
            existing_book = self.get_book_by_id(book_id)
            if not existing_book:
                return None
            
            fields = []
            values = []
            
            field_mapping = {
                'title': 'title',
                'author': 'author',
                'author_bio': 'author_bio',
                'authors': 'authors',
                'author_slug': 'author_slug',
                'publisher': 'publisher',
                'synopsis': 'synopsis',
                'subjects': 'subjects',
                'isbn13': 'isbn13',
                'isbn10': 'isbn10',
                'price': 'price',
                'format': 'format',
                'pages': 'pages',
                'overview': 'overview',
                'excerpt': 'excerpt'
            }
            
            for api_field, db_field in field_mapping.items():
                if api_field in book_data:
                    fields.append(f"{db_field} = ?")
                    values.append(book_data[api_field])
            
            if not fields:
                raise ValueError("No valid fields provided for book update")
            
            values.append(book_id)
            
            query = f"""
                UPDATE book 
                SET {', '.join(fields)}
                WHERE id = ?
            """
            
            affected_rows = self.db_service.execute_update(query, values)
            
            if affected_rows == 0:
                return None
            
            logger.info(f"Book updated: ID {book_id}")
            return self.get_book_by_id(book_id)
            
        except Exception as e:
            logger.error(f"Error updating book {book_id}: {e}")
            raise

    def delete_book(self, book_id: int) -> bool:
        
        try:
            existing_book = self.get_book_by_id(book_id)
            if not existing_book:
                return False
            
            query = "DELETE FROM book WHERE id = ?"
            affected_rows = self.db_service.execute_delete(query, [book_id])
            
            if affected_rows > 0:
                logger.info(f"Book deleted: ID {book_id}")
                return True
            else:
                logger.warning(f"No book found with ID {book_id} for deletion")
                return False
                
        except Exception as e:
            logger.error(f"Error deleting book {book_id}: {e}")
            raise
    
    def get_authors(self) -> List[Dict[str, Any]]:
        
        try:
            query = "SELECT * FROM author ORDER BY title"
            results = self.db_service.execute_query(query)
            
            authors = []
            for row in results:
                try:
                    author = Author.from_db_row(row)
                    authors.append(author.to_dict())
                except ValueError as e:
                    logger.warning(f"Skipping invalid author row: {e}")
                    continue
            
            return authors
            
        except Exception as e:
            logger.error(f"Error getting authors: {e}")
            raise
    
    def get_available_subjects(self) -> List[str]:
        
        try:
            query = "SELECT DISTINCT subjects FROM book WHERE subjects IS NOT NULL AND subjects != ''"
            results = self.db_service.execute_query(query)
            
            subjects = set()
            for row in results:
                subject_str = row[0]
                if subject_str:
                    for subject in subject_str.split(','):
                        cleaned = subject.strip()
                        if cleaned:
                            subjects.add(cleaned)
            
            return sorted(list(subjects))
            
        except Exception as e:
            logger.error(f"Error getting subjects: {e}")
            raise
    
    def get_available_publishers(self) -> List[str]:
        
        try:
            query = "SELECT DISTINCT publisher FROM book WHERE publisher IS NOT NULL AND publisher != '' ORDER BY publisher"
            results = self.db_service.execute_query(query)
            
            return [row[0] for row in results]
            
        except Exception as e:
            logger.error(f"Error getting publishers: {e}")
            raise
    
    def _is_valid_column(self, column_name: str) -> bool:
        
        valid_columns = {
            'id', 'title', 'author', 'author_bio', 'authors', 'title_slug',
            'author_slug', 'isbn13', 'isbn10', 'price', 'format', 'publisher',
            'pubdate', 'edition', 'subjects', 'lexile', 'pages', 'dimensions',
            'overview', 'excerpt', 'synopsis', 'toc', 'editorial_reviews'
        }
        
        return column_name in valid_columns
    
    def get_filter_options(self) -> Dict[str, Any]:
        
        try:
            return {
                'text_filters': [
                    'title', 'author', 'author_bio', 'authors', 'publisher', 
                    'synopsis', 'subjects', 'overview', 'excerpt'
                ],
                'exact_filters': [
                    'author_slug', 'format', 'edition'
                ],
                'numeric_filters': [
                    'pages', 'isbn13'
                ],
                'multi_value_filters': [
                    'subjects', 'format'
                ],
                'available_subjects': self.get_available_subjects(),
                'available_publishers': self.get_available_publishers(),
                'sort_options': [
                    'title', 'author', 'publisher', 'pubdate', 'pages'
                ]
            }
            
        except Exception as e:
            logger.error(f"Error getting filter options: {e}")
            raise 