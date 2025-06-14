from dataclasses import dataclass
from typing import Optional, Dict, Any


@dataclass
class Book:
    id: Optional[int] = None
    title: Optional[str] = None
    author: Optional[str] = None
    author_id: Optional[int] = None
    author_bio: Optional[str] = None
    authors: Optional[str] = None
    title_slug: Optional[str] = None
    author_slug: Optional[str] = None
    isbn13: Optional[int] = None
    isbn10: Optional[str] = None
    price: Optional[str] = None
    format: Optional[str] = None
    publisher: Optional[str] = None
    pubdate: Optional[str] = None
    edition: Optional[str] = None
    subjects: Optional[str] = None
    lexile: Optional[str] = None
    pages: Optional[float] = None
    dimensions: Optional[str] = None
    overview: Optional[str] = None
    excerpt: Optional[str] = None
    synopsis: Optional[str] = None
    toc: Optional[str] = None
    editorial_reviews: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            'id': self.id,
            'title': self.title,
            'author': self.author,
            'author_id': self.author_id,
            'biography': self.author_bio,
            'authors': self.authors,
            'title_slug': self.title_slug,
            'author_slug': self.author_slug,
            'isbn13': self.isbn13,
            'isbn10': self.isbn10,
            'price': self.price,
            'format': self.format,
            'publisher': self.publisher,
            'pubdate': self.pubdate,
            'edition': self.edition,
            'subjects': self.subjects,
            'lexile': self.lexile,
            'pages': self.pages,
            'dimensions': self.dimensions,
            'overview': self.overview,
            'excerpt': self.excerpt,
            'synopsis': self.synopsis,
            'toc': self.toc,
            'editorial_reviews': self.editorial_reviews
        }

    @classmethod
    def from_db_row(cls, row: tuple) -> 'Book':
        if not row or len(row) < 24:
            raise ValueError("Invalid database row for Book")
        
        return cls(
            id=row[0],
            title=row[1],
            author=row[2],
            author_id=row[3],
            author_bio=row[4],
            authors=row[5],
            title_slug=row[6],
            author_slug=row[7],
            isbn13=row[8],
            isbn10=row[9],
            price=row[10],
            format=row[11],
            publisher=row[12],
            pubdate=row[13],
            edition=row[14],
            subjects=row[15],
            lexile=row[16],
            pages=row[17],
            dimensions=row[18],
            overview=row[19],
            excerpt=row[20],
            synopsis=row[21],
            toc=row[22],
            editorial_reviews=row[23]
        ) 