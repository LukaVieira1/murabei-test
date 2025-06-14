import sqlite3
from contextlib import contextmanager
from typing import List, Tuple, Any
import logging


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class DatabaseService:    
    def __init__(self, db_path: str = 'db.sqlite'):
        self.db_path = db_path
    
    @contextmanager
    def get_connection(self):
        conn = None
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row
            yield conn
        except sqlite3.Error as e:
            logger.error(f"Database error: {e}")
            if conn:
                conn.rollback()
            raise
        finally:
            if conn:
                conn.close()
    
    def execute_query(self, query: str, parameters: List[Any] = None) -> List[Tuple]:
        if parameters is None:
            parameters = []
        
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                logger.info(f"Executing query: {query} with params: {parameters}")
                cursor.execute(query, parameters)
                results = cursor.fetchall()
                logger.info(f"Query returned {len(results)} rows")
                return results
        except sqlite3.Error as e:
            logger.error(f"Query execution failed: {e}")
            raise
    
    def execute_insert(self, query: str, parameters: List[Any] = None) -> int:
        if parameters is None:
            parameters = []
        
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                logger.info(f"Executing insert: {query} with params: {parameters}")
                cursor.execute(query, parameters)
                conn.commit()
                last_id = cursor.lastrowid
                logger.info(f"Insert successful, last row ID: {last_id}")
                return last_id
        except sqlite3.Error as e:
            logger.error(f"Insert execution failed: {e}")
            raise
    
    def execute_update(self, query: str, parameters: List[Any] = None) -> int:
        if parameters is None:
            parameters = []
        
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                logger.info(f"Executing update: {query} with params: {parameters}")
                cursor.execute(query, parameters)
                conn.commit()
                affected_rows = cursor.rowcount
                logger.info(f"Update successful, affected rows: {affected_rows}")
                return affected_rows
        except sqlite3.Error as e:
            logger.error(f"Update execution failed: {e}")
            raise
    
    def execute_delete(self, query: str, parameters: List[Any] = None) -> int:
        if parameters is None:
            parameters = []
        
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                logger.info(f"Executing delete: {query} with params: {parameters}")
                cursor.execute(query, parameters)
                conn.commit()
                affected_rows = cursor.rowcount
                logger.info(f"Delete successful, affected rows: {affected_rows}")
                return affected_rows
        except sqlite3.Error as e:
            logger.error(f"Delete execution failed: {e}")
            raise
    
    def get_table_schema(self, table_name: str) -> List[Tuple]:
        query = f"PRAGMA table_info({table_name})"
        return self.execute_query(query)
    
    def table_exists(self, table_name: str) -> bool:
        query = """
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name=?
        """
        results = self.execute_query(query, [table_name])
        return len(results) > 0 