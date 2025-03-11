# RAG Workshop Examples

This repository contains examples demonstrating RAG (Retrieval Augmented Generation) capabilities using Mastra.

## Structure

### Sample Documents (`src/documents/`)

Contains markdown documents used to test our RAG functionality:

- `auth.ts` - Authentication guide with JWT examples
- `error-handling.ts` - Error handling patterns and best practices
- `logging.ts` - Logging system documentation
- `upsert.ts` - Script to insert documents into the vector store

### Basic Chunking Examples (`src/examples/01-04`)

1. **Character Chunking** (`01-character-chunking.ts`)
   - Simple text chunking by character count
   - Shows basic overlapping chunks

2. **Recursive Code Chunking** (`02-recursive-code-chunking.ts`)
   - Code-aware chunking that preserves function boundaries
   - Demonstrates chunking while maintaining code context

3. **JSON Chunking** (`03-json-chunking.ts`)
   - Chunks JSON while preserving valid structure
   - Shows how to handle structured data formats

4. **Markdown Chunking** (`04-markdown-chunking.ts`)
   - Header-aware markdown chunking
   - Demonstrates hierarchical document splitting

5. **Embeddings** (`05-embedding.ts`)
   - Different embedding models and their characteristics
   - Single vs batch embedding
   - Comparing embedding dimensions and quality

### Vector Store Operations (`src/examples/05-07`)

5. **Vector Upserting** (`06-vector-upserting.ts`)
   - How to insert documents into PgVector
   - Complete flow: chunking → embedding → storing

6. **Vector Search** (`07-vector-search.ts`)
   - Basic vector similarity search
   - Shows simple querying with filters

7. **Vector Reranking** (`08-vector-reranking.ts`)
   - Advanced search with result reranking
   - Demonstrates improving result relevance

### Agent Examples (`src/examples/09-10`)

8. **Basic Search** (`09-basic-search-usage.ts`)
   - Simple keyword search through an agent
   - Example: "What does our documentation say about authentication?"

9. **Vector Search** (`010-query-vector-usage.ts`)
   - Semantic search through an agent with:
     - Basic search
     - Filtered search (by file type)
     - Reranked search for better results

### Bonus Examples (`src/bonus/`)

- **Advanced Code Usage** (`01-find-code-usage.ts`)
  - Code-aware search through an agent
  - Examples:
    - Finding function definitions
    - Finding usage examples

## Usage

1. First, insert the sample documents:
```bash
ts-node src/documents/upsert.ts
```

2. Try the chunking examples to understand different strategies:
```bash
ts-node src/examples/01-character-chunking.ts
ts-node src/examples/02-recursive-code-chunking.ts
# etc...
```

3. Explore the agent examples to see RAG in action:
```bash
ts-node src/examples/09-basic-search-usage.ts
ts-node src/examples/10-query-vector-usage.ts
```

## Key Concepts

### Chunking
- Breaking documents into meaningful pieces
- Different strategies for different content types
- Preserving context and structure

### Vector Operations
- Converting text to embeddings
- Storing in PgVector
- Similarity search
- Result reranking

### Agent Tools
- Basic keyword search
- Semantic search with filters