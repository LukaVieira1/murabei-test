from flask import Blueprint, jsonify
import logging
from core.container import container

logger = logging.getLogger(__name__)

authors_bp = Blueprint('authors', __name__)


def get_book_service():
    return container.get('book_service')


@authors_bp.route('/authors', methods=['GET'])
def get_authors():
    try:
        book_service = get_book_service()
        authors = book_service.get_authors()
        logger.info(f"Authors retrieved: {len(authors)} items")
        return jsonify(authors)
        
    except Exception as e:
        logger.error(f"Error getting authors: {e}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'Failed to retrieve authors'
        }), 500 