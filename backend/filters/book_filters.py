from typing import Any, List, Tuple
from filters.base_filter import BaseFilter


class TextFilter(BaseFilter):
 
    def __init__(self, field_name: str, case_sensitive: bool = False):
        super().__init__(field_name, "LIKE")
        self.case_sensitive = case_sensitive
    
    def apply(self, value: Any) -> Tuple[str, List[Any]]:

        if not self.is_valid(value):
            return "", []
        
        search_value = f"%{value}%"
        
        if self.case_sensitive:
            condition = f"{self.field_name} LIKE ?"
        else:
            condition = f"LOWER({self.field_name}) LIKE LOWER(?)"
        
        return condition, [search_value]
    
    def is_valid(self, value: Any) -> bool:
   
        return isinstance(value, str) and len(value.strip()) > 0


class ExactFilter(BaseFilter):
   
    def __init__(self, field_name: str):
        super().__init__(field_name, "=")
    
    def apply(self, value: Any) -> Tuple[str, List[Any]]:
  
        if not self.is_valid(value):
            return "", []
        
        condition = f"{self.field_name} = ?"
        return condition, [value]
    
    def is_valid(self, value: Any) -> bool:
        if value is None:
            return False
        if isinstance(value, str):
            return len(value.strip()) > 0
        return True


class NumericRangeFilter(BaseFilter):
    def __init__(self, field_name: str, min_value: float = None, max_value: float = None):

        super().__init__(field_name, "BETWEEN")
        self.min_value = min_value
        self.max_value = max_value
    
    def apply(self, value: Any) -> Tuple[str, List[Any]]:

        if not self.is_valid(value):
            return "", []
        
        conditions = []
        parameters = []
        
        if isinstance(value, dict):
            min_val = value.get('min')
            max_val = value.get('max')
        else:
            min_val = max_val = value
        
        if min_val is not None:
            conditions.append(f"{self.field_name} >= ?")
            parameters.append(min_val)
        
        if max_val is not None:
            conditions.append(f"{self.field_name} <= ?")
            parameters.append(max_val)
        
        if not conditions:
            return "", []
        
        condition = " AND ".join(conditions)
        return condition, parameters
    
    def is_valid(self, value: Any) -> bool:

        if isinstance(value, (int, float)):
            return True
        
        if isinstance(value, dict):
            min_val = value.get('min')
            max_val = value.get('max')
            
            if min_val is None and max_val is None:
                return False
            
            if min_val is not None and not isinstance(min_val, (int, float)):
                return False
            
            if max_val is not None and not isinstance(max_val, (int, float)):
                return False
            
            return True
        
        return False


class MultiValueFilter(BaseFilter):

    def __init__(self, field_name: str):
        super().__init__(field_name, "IN")
    
    def apply(self, value: Any) -> Tuple[str, List[Any]]:

        if not self.is_valid(value):
            return "", []
        
        values = value if isinstance(value, list) else [value]
        values = [v for v in values if v is not None]
        
        if not values:
            return "", []
        
        placeholders = ", ".join(["?" for _ in values])
        condition = f"{self.field_name} IN ({placeholders})"
        
        return condition, values
    
    def is_valid(self, value: Any) -> bool:
        if value is None:
            return False
        
        if isinstance(value, list):
            return len(value) > 0 and any(v is not None for v in value)
        
        return True 