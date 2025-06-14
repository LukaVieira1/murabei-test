from flask import Blueprint, jsonify
import logging
import time
from datetime import datetime
from core.container import container

logger = logging.getLogger(__name__)

health_bp = Blueprint('health', __name__)


@health_bp.route("/", methods=["GET"])
def health_check():
    return jsonify({
        'status': 'healthy',
        'service': 'Book API',
        'version': '2.0.0',
        'timestamp': datetime.utcnow().isoformat()
    })


@health_bp.route("/favicon.ico", methods=["GET"])
def favicon():
    return '', 204


@health_bp.route("/health", methods=["GET"])
def detailed_health_check():
    start_time = time.time()
    health_status = {
        'status': 'healthy',
        'service': 'Book API',
        'version': '2.0.0',
        'timestamp': datetime.utcnow().isoformat(),
        'checks': {}
    }
    
    try:
        db_service = container.get('database_service')
        db_start = time.time()
        result = db_service.execute_query("SELECT 1 as health_check")
        db_time = time.time() - db_start
        
        health_status['checks']['database'] = {
            'status': 'healthy',
            'response_time_ms': round(db_time * 1000, 2),
            'message': 'Database connection successful'
        }
        
        book_service = container.get('book_service')
        service_start = time.time()
        options = book_service.get_filter_options()
        service_time = time.time() - service_start
        
        health_status['checks']['book_service'] = {
            'status': 'healthy',
            'response_time_ms': round(service_time * 1000, 2),
            'message': 'Book service operational'
        }
        
        total_time = time.time() - start_time
        health_status['response_time_ms'] = round(total_time * 1000, 2)
        
        logger.info("Health check completed successfully")
        return jsonify(health_status)
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        
        health_status['status'] = 'unhealthy'
        health_status['checks']['error'] = {
            'status': 'unhealthy',
            'message': str(e),
            'response_time_ms': round((time.time() - start_time) * 1000, 2)
        }
        
        return jsonify(health_status), 503


@health_bp.route("/health/ready", methods=["GET"])
def readiness_check():
    try:
        db_service = container.get('database_service')
        db_service.execute_query("SELECT 1")
        
        return jsonify({
            'status': 'ready',
            'timestamp': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Readiness check failed: {e}")
        return jsonify({
            'status': 'not_ready',
            'error': str(e),
            'timestamp': datetime.utcnow().isoformat()
        }), 503


@health_bp.route("/health/live", methods=["GET"])
def liveness_check():
    return jsonify({
        'status': 'alive',
        'timestamp': datetime.utcnow().isoformat()
    }) 