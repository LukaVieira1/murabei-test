from flask import Flask, jsonify
from flask_cors import CORS
from typing import Optional
import logging
from config import get_config, Config

from core.container import container
from services.database_service import DatabaseService
from services.book_service import BookService

from middleware.logging_middleware import setup_request_logging

from routes.health import health_bp
from routes.books import books_bp
from routes.authors import authors_bp


def configure_logging(config: Config) -> None:
    logging.basicConfig(
        level=getattr(logging, config.LOG_LEVEL),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )


def register_services(config: Config) -> None:
    logger = logging.getLogger(__name__)
    
    def create_db_service():
        return DatabaseService(db_path=config.DATABASE_PATH)
    
    def create_book_service():
        db_service = container.get('database_service')
        return BookService(db_service=db_service)
    
    container.register_singleton('database_service', create_db_service)
    container.register_singleton('book_service', create_book_service)
    
    logger.info("Services registered successfully")


def register_blueprints(app: Flask) -> None:
    app.register_blueprint(health_bp)
    app.register_blueprint(books_bp, url_prefix='/api/v1')
    app.register_blueprint(authors_bp, url_prefix='/api/v1')


def register_error_handlers(app: Flask) -> None:
    logger = logging.getLogger(__name__)
    
    @app.errorhandler(Exception)
    def handle_error(error):
        logger.error(f"Unhandled error: {error}", exc_info=True)
        return jsonify({
            'error': 'Internal server error',
            'message': 'An unexpected error occurred'
        }), 500
    
    @app.errorhandler(ValueError)
    def handle_value_error(error):
        logger.warning(f"Validation error: {error}")
        return jsonify({
            'error': 'Validation error',
            'message': str(error)
        }), 400
    
    @app.errorhandler(404)
    def handle_not_found(error):
        return jsonify({
            'error': 'Not found',
            'message': 'The requested resource was not found'
        }), 404
    
    @app.errorhandler(405)
    def handle_method_not_allowed(error):
        return jsonify({
            'error': 'Method not allowed',
            'message': 'The HTTP method is not allowed for this endpoint'
        }), 405
    
    @app.errorhandler(500)
    def handle_internal_error(error):
        logger.error(f"Internal server error: {error}")
        return jsonify({
            'error': 'Internal server error',
            'message': 'An internal server error occurred'
        }), 500


def verify_services() -> None:
    logger = logging.getLogger(__name__)
    try:
        db_service = container.get('database_service')
        db_service.execute_query("SELECT 1")
        logger.info("All services verified successfully")
    except Exception as e:
        logger.error(f"Service verification failed: {e}")
        raise


def create_app(config_name: Optional[str] = None) -> Flask:
    config = get_config() if config_name is None else get_config()
    
    configure_logging(config)
    logger = logging.getLogger(__name__)
    
    app = Flask(__name__)
    app.config.from_object(config)
    
    CORS(app, origins=config.CORS_ORIGINS)
    
    setup_request_logging(app)
    
    register_services(config)
    
    register_blueprints(app)
    
    register_error_handlers(app)
    
    verify_services()
    logger.info("Flask app created and services verified")
    
    return app


app = create_app()

if __name__ == '__main__':
    logger = logging.getLogger(__name__)
    logger.info("Starting Book API server...")
    
    config = get_config()
    app.run(
        host=config.HOST,
        port=config.PORT,
        debug=config.DEBUG
    ) 