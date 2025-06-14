from flask import Blueprint, jsonify, request
import logging
from core.container import container

logger = logging.getLogger(__name__)

books_bp = Blueprint('books', __name__)


def get_book_service():
    return container.get('book_service')


@books_bp.route('/books', methods=['GET'])
def get_books():
    try:
        book_service = get_book_service()
        
        page = request.args.get('page', default=1, type=int)
        page_size = min(request.args.get('page_size', default=10, type=int), 100)
        
        order_by = request.args.get('order_by')
        order_direction = request.args.get('order_direction', 'ASC')
        
        filters = {}
        
        text_filters = ['title', 'author', 'publisher', 'subjects', 'synopsis', 'overview', 'excerpt']
        for filter_name in text_filters:
            value = request.args.get(filter_name)
            if value:
                filters[filter_name] = value
        
        exact_filters = ['format', 'edition', 'author_slug']
        for filter_name in exact_filters:
            value = request.args.get(filter_name)
            if value:
                filters[filter_name] = value
        
        pages_min = request.args.get('pages_min', type=int)
        pages_max = request.args.get('pages_max', type=int)
        if pages_min is not None or pages_max is not None:
            filters['pages'] = {}
            if pages_min is not None:
                filters['pages']['min'] = pages_min
            if pages_max is not None:
                filters['pages']['max'] = pages_max
        
        if page < 1:
            raise ValueError("Page must be >= 1")
        if page_size < 1:
            raise ValueError("Page size must be >= 1")
        
        result = book_service.get_books_with_filters(
            filters=filters,
            page=page,
            page_size=page_size,
            order_by=order_by,
            order_direction=order_direction
        )
        
        logger.info(f"Books retrieved: {len(result['books'])} items, page {page}")
        return jsonify(result)
        
    except ValueError as e:
        logger.warning(f"Invalid request parameters: {e}")
        return jsonify({
            'error': 'Invalid parameters',
            'message': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Error in get_books: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'Failed to retrieve books'
        }), 500


@books_bp.route('/books/<int:book_id>', methods=['GET'])
def get_book(book_id: int):
    try:
        book_service = get_book_service()
        book = book_service.get_book_by_id(book_id)
        
        if not book:
            return jsonify({
                'error': 'Not found',
                'message': f'Book with ID {book_id} not found'
            }), 404
        
        logger.info(f"Book retrieved: ID {book_id}")
        return jsonify(book)
        
    except Exception as e:
        logger.error(f"Error getting book {book_id}: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'Failed to retrieve book'
        }), 500


@books_bp.route('/books', methods=['POST'])
def create_book():
    try:
        if not request.is_json:
            raise ValueError("Request must be JSON")
        
        book_data = request.get_json()
        if not book_data:
            raise ValueError("Request body is required")
        
        book_service = get_book_service()
        created_book = book_service.create_book(book_data)
        
        logger.info(f"Book created: ID {created_book.get('id')}")
        return jsonify({
            'message': 'Book created successfully',
            'book': created_book
        }), 201
        
    except ValueError as e:
        logger.warning(f"Invalid book data: {e}")
        return jsonify({
            'error': 'Invalid data',
            'message': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Error creating book: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'Failed to create book'
        }), 500


@books_bp.route('/books/<int:book_id>', methods=['PUT'])
def update_book(book_id: int):
    try:
        if not request.is_json:
            raise ValueError("Request must be JSON")
        
        book_data = request.get_json()
        if not book_data:
            raise ValueError("Request body is required")
        
        book_service = get_book_service()
        updated_book = book_service.update_book(book_id, book_data)
        
        if not updated_book:
            return jsonify({
                'error': 'Not found',
                'message': f'Book with ID {book_id} not found'
            }), 404
        
        logger.info(f"Book updated: ID {book_id}")
        return jsonify({
            'message': 'Book updated successfully',
            'book': updated_book
        }), 200
        
    except ValueError as e:
        logger.warning(f"Invalid book data: {e}")
        return jsonify({
            'error': 'Invalid data',
            'message': str(e)
        }), 400
    except Exception as e:
        logger.error(f"Error updating book {book_id}: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'Failed to update book'
        }), 500


@books_bp.route('/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id: int):
    try:
        book_service = get_book_service()
        deleted = book_service.delete_book(book_id)
        
        if not deleted:
            return jsonify({
                'error': 'Not found',
                'message': f'Book with ID {book_id} not found'
            }), 404
        
        logger.info(f"Book deleted: ID {book_id}")
        return jsonify({
            'message': 'Book deleted successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting book {book_id}: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'Failed to delete book'
        }), 500


@books_bp.route('/subjects', methods=['GET'])
def get_subjects():
    try:
        book_service = get_book_service()
        subjects = book_service.get_available_subjects()
        logger.info(f"Subjects retrieved: {len(subjects)} items")
        return jsonify(subjects)
        
    except Exception as e:
        logger.error(f"Error getting subjects: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'Failed to retrieve subjects'
        }), 500


@books_bp.route('/publishers', methods=['GET'])
def get_publishers():
    try:
        book_service = get_book_service()
        publishers = book_service.get_available_publishers()
        logger.info(f"Publishers retrieved: {len(publishers)} items")
        return jsonify(publishers)
        
    except Exception as e:
        logger.error(f"Error getting publishers: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'Failed to retrieve publishers'
        }), 500


@books_bp.route('/books/author/<author_slug>', methods=['GET'])
def get_books_by_author(author_slug: str):
    try:
        book_service = get_book_service()
        filters = {'author_slug': author_slug}
        result = book_service.get_books_with_filters(filters=filters, page_size=100)
        
        return jsonify(result['books'])
        
    except Exception as e:
        logger.error(f"Error getting books by author {author_slug}: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'Failed to retrieve books by author'
        }), 500


@books_bp.route('/books/subjects/<subject>', methods=['GET'])
def get_books_by_subject(subject: str):
    try:
        book_service = get_book_service()
        filters = {'subjects': subject}
        result = book_service.get_books_with_filters(filters=filters, page_size=100)
        return jsonify(result['books'])
        
    except Exception as e:
        logger.error(f"Error getting books by subject {subject}: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'Failed to retrieve books by subject'
        }), 500


@books_bp.route('/filter-options', methods=['GET'])
def get_filter_options():
    try:
        book_service = get_book_service()
        options = book_service.get_filter_options()
        logger.info("Filter options retrieved")
        return jsonify(options)
        
    except Exception as e:
        logger.error(f"Error getting filter options: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'Failed to retrieve filter options'
        }), 500 