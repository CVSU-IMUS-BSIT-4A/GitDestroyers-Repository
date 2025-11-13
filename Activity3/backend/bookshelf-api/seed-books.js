const axios = require('axios');

const API_BASE = 'http://localhost:3003';

async function createAuthor(name) {
  try {
    const response = await axios.post(`${API_BASE}/authors`, { name });
    return response.data;
  } catch (error) {
    console.error(`Error creating author ${name}:`, error.response?.data || error.message);
    // Try to find existing author
    const listResponse = await axios.get(`${API_BASE}/authors`);
    const existing = listResponse.data.find(a => a.name === name);
    return existing || null;
  }
}

async function createCategory(name) {
  try {
    const response = await axios.post(`${API_BASE}/categories`, { name });
    return response.data;
  } catch (error) {
    console.error(`Error creating category ${name}:`, error.response?.data || error.message);
    // Try to find existing category
    const listResponse = await axios.get(`${API_BASE}/categories`);
    const existing = listResponse.data.find(c => c.name === name);
    return existing || null;
  }
}

async function createBook(bookData) {
  try {
    const response = await axios.post(`${API_BASE}/books`, bookData);
    console.log(`✓ Created book: ${bookData.title}`);
    return response.data;
  } catch (error) {
    console.error(`Error creating book ${bookData.title}:`, error.response?.data || error.message);
    return null;
  }
}

async function seedBooks() {
  console.log('Starting to seed books...\n');

  // Create authors
  console.log('Creating authors...');
  const author1 = await createAuthor('J.K. Rowling');
  const author2 = await createAuthor('George R.R. Martin');
  const author3 = await createAuthor('Stephen King');
  const author4 = await createAuthor('Agatha Christie');
  const author5 = await createAuthor('Jane Austen');
  const author6 = await createAuthor('Ernest Hemingway');

  // Create categories
  console.log('Creating categories...');
  const category1 = await createCategory('Fantasy');
  const category2 = await createCategory('Horror');
  const category3 = await createCategory('Mystery');
  const category4 = await createCategory('Classic');
  const category5 = await createCategory('Fiction');

  console.log('\nCreating books...\n');

  // Create 6 books
  const books = [
    {
      title: 'Harry Potter and the Philosopher\'s Stone',
      authorId: author1?.id,
      categoryId: category1?.id,
      publishedYear: 1997,
      isbn: '9780747532699',
      pageCount: 223,
      coverUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzRkODBmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SGFycnkgUG90dGVyPC90ZXh0Pjwvc3ZnPg==',
      plot: 'Harry Potter and the Philosopher\'s Stone is a fantasy novel written by British author J. K. Rowling. The first novel in the Harry Potter series and Rowling\'s debut novel, it follows Harry Potter, a young wizard who discovers his magical heritage on his eleventh birthday, when he receives a letter of acceptance to Hogwarts School of Witchcraft and Wizardry. Harry makes close friends and a few enemies during his first year at the school, and with the help of his friends, he faces an attempted comeback by the dark wizard Lord Voldemort, who killed Harry\'s parents, but failed to kill Harry when he was just 15 months old.'
    },
    {
      title: 'A Game of Thrones',
      authorId: author2?.id,
      categoryId: category1?.id,
      publishedYear: 1996,
      isbn: '9780553103540',
      pageCount: 694,
      coverUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzgwMDAwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+R2FtZSBvZiBUaHJvbmVzPC90ZXh0Pjwvc3ZnPg==',
      plot: 'A Game of Thrones is the first novel in A Song of Ice and Fire, a series of fantasy novels by the American author George R. R. Martin. It was first published on August 1, 1996. The novel won the 1997 Locus Award and was nominated for both the 1997 Nebula Award and the 1997 World Fantasy Award. The novella Blood of the Dragon, comprising the Daenerys Targaryen chapters from the novel, won the 1997 Hugo Award for Best Novella. In January 2011, the novel became a New York Times Bestseller and reached No. 1 on the list in July 2011.'
    },
    {
      title: 'The Shining',
      authorId: author3?.id,
      categoryId: category2?.id,
      publishedYear: 1977,
      isbn: '9780307743657',
      pageCount: 447,
      coverUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VGhlIFNoaW5pbmc8L3RleHQ+PC9zdmc+',
      plot: 'The Shining is a horror novel by American author Stephen King. Published in 1977, it is King\'s third published novel and first hardback bestseller. The success of the book firmly established King as a preeminent author in the horror genre. The setting and characters are influenced by King\'s personal experiences, including his visit to The Stanley Hotel in 1974 and his recovery from alcoholism. The novel centers on the Torrance family: father Jack, mother Wendy, and young son Danny. Jack becomes the winter caretaker of the isolated Overlook Hotel in the Colorado Rockies, hoping to cure his writer\'s block and recover from his alcoholism.'
    },
    {
      title: 'Murder on the Orient Express',
      authorId: author4?.id,
      categoryId: category3?.id,
      publishedYear: 1934,
      isbn: '9780062693662',
      pageCount: 288,
      coverUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2ZmZmYwMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMwMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5NdXJkZXIgb24gdGhlIE9yaWVudCBFeHByZXNzPC90ZXh0Pjwvc3ZnPg==',
      plot: 'Murder on the Orient Express is a detective novel by British writer Agatha Christie featuring the Belgian detective Hercule Poirot. It was first published in the United Kingdom by the Collins Crime Club on 1 January 1934. In the United States, it was published on 28 February 1934, under the title of Murder in the Calais Coach, by Dodd, Mead and Company. The novel features Hercule Poirot and is one of Christie\'s most famous and acclaimed novels. The story takes place on the Orient Express train, where a murder occurs and Poirot must solve the mystery.'
    },
    {
      title: 'Pride and Prejudice',
      authorId: author5?.id,
      categoryId: category4?.id,
      publishedYear: 1813,
      isbn: '9780141439518',
      pageCount: 432,
      coverUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2ZmYzBjYyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMwMDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5QcmlkZSBhbmQgUHJlanVkaWNlPC90ZXh0Pjwvc3ZnPg==',
      plot: 'Pride and Prejudice is an 1813 novel of manners written by Jane Austen. The novel follows the character development of Elizabeth Bennet, the dynamic protagonist who learns about the repercussions of hasty judgments and comes to appreciate the difference between superficial goodness and actual goodness. Its humour lies in its honest depiction of manners, education, marriage, and money during the Regency era in Great Britain. Mr. Bennet of Longbourn estate has five daughters, but his property is entailed, meaning that none of the girls can inherit it. Since his wife had no fortune, it is imperative that at least one of the girls marries well to support the others upon his death.'
    },
    {
      title: 'The Old Man and the Sea',
      authorId: author6?.id,
      categoryId: category5?.id,
      publishedYear: 1952,
      isbn: '9780684801223',
      pageCount: 127,
      coverUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzAwN2ZmZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+VGhlIE9sZCBNYW4gYW5kIHRoZSBTZWE8L3RleHQ+PC9zdmc+',
      plot: 'The Old Man and the Sea is a short novel written by the American author Ernest Hemingway in 1951 in Cayo Blanco, Cuba, and published in 1952. It was the last major work of fiction written by Hemingway that was published during his lifetime. One of his most famous works, it tells the story of Santiago, an aging Cuban fisherman who struggles with a giant marlin far out in the Gulf Stream off the coast of Cuba. In 1953, The Old Man and the Sea was awarded the Pulitzer Prize for Fiction, and it was cited by the Nobel Committee as contributing to their awarding of the Nobel Prize in Literature to Hemingway in 1954.'
    }
  ];

  for (const book of books) {
    await createBook(book);
  }

  console.log('\n✓ Finished seeding books!');
}

// Run the seed function
seedBooks().catch(console.error);

