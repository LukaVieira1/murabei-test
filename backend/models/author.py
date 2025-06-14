from dataclasses import dataclass
from typing import Optional, Dict, Any


@dataclass
class Author:
    id: Optional[int] = None
    title: Optional[str] = None
    slug: Optional[str] = None
    biography: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'title': self.title,
            'slug': self.slug,
            'biography': self.biography
        }

    @classmethod
    def from_db_row(cls, row: tuple) -> 'Author':
        if not row or len(row) < 4:
            raise ValueError("Invalid database row for Author")
        
        return cls(
            id=row[0],
            title=row[1],
            slug=row[2],
            biography=row[3]
        ) 