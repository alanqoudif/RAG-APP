
import { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { ChatMessage, Document } from '../types';

/**
 * Uses the Gemini model to perform a semantic search over the provided documents
 * to find the most relevant ones to the user's query.
 * @param query The user's question.
 * @param documents The list of all available documents.
 * @param ai The GoogleGenAI client instance.
 * @returns A promise that resolves to an array of relevant documents.
 */
const findRelevantDocumentsWithAi = async (
  query: string,
  documents: Document[],
  ai: GoogleGenAI
): Promise<Document[]> => {
  if (documents.length === 0) return [];

  // Prepare the document content for the prompt
  const documentsForPrompt = documents
    .map(doc => `--- Document ID: ${doc.id} ---\nTitle: ${doc.title}\nPage: ${doc.pageNumber}\nContent: ${doc.content}`)
    .join('\n\n');

  // Create a prompt that asks the model to act as a retriever
  const retrievalPrompt = `
You are a highly intelligent document retrieval assistant. Your task is to analyze a user's query and a list of documents and identify the documents that are most relevant to answering the query.

User Query: "${query}"

Available Documents:
${documentsForPrompt}

Based on the query and the documents provided, please return a JSON object containing a single key "relevant_document_ids", which is an array of the ID strings of up to 3 of the most relevant documents. The array should be ordered from most to least relevant. If no documents are relevant, return an empty array.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: retrievalPrompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            relevant_document_ids: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ['relevant_document_ids'],
        },
        temperature: 0, // Use a low temperature for more deterministic retrieval
      },
    });

    const result = JSON.parse(response.text);
    const relevantIds: string[] = result.relevant_document_ids || [];

    // Map the retrieved IDs back to the full document objects, preserving the order of relevance.
    const relevantDocs = relevantIds
      .map(id => documents.find(doc => doc.id === id))
      .filter((doc): doc is Document => doc !== undefined); // Filter out any undefined results

    return relevantDocs;
  } catch (error) {
    console.error('Error in AI-based document retrieval:', error);
    // In case of an error, return no documents to avoid feeding bad context.
    return [];
  }
};


export const useRag = (documents: Document[]) => {
  const [isLoading, setIsLoading] = useState(false);

  const generateAnswer = useCallback(async (query: string, history: ChatMessage[]) => {
    setIsLoading(true);
    
    try {
      if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // 1. Find relevant documents using AI-powered semantic search
      const relevantDocs = await findRelevantDocumentsWithAi(query, documents, ai);
      const context = relevantDocs.map(doc => `Title: ${doc.title}\nPage: ${doc.pageNumber}\nContent: ${doc.content}`).join('\n\n---\n\n');

      // 2. Generate the final answer, instructing the model to reply in the user's language
      const systemInstruction = `You are a helpful and friendly expert. You must answer the user in the same language as their question.
Answer the user's question based *only* on the provided context.
If the context contains the answer, you **must** cite the page number of the source document at the end of your answer, like this: (Page X).
If the context does not contain the answer, state that you don't have enough information in your knowledge base to answer. Do not use your general knowledge.
Be concise and clear.`;

      const finalPrompt = `
CONTEXT:
${context || "No relevant context found in the knowledge base."}

Based on the context above, answer this question:
QUESTION:
${query}
`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
        config: {
            systemInstruction: systemInstruction,
            temperature: 0.3
        }
      });
      
      const answer = response.text;

      return { answer, sources: relevantDocs };
    } catch (error) {
      console.error("Error generating answer:", error);
      if (error instanceof Error && error.message.includes('API_KEY')) {
          throw error;
      }
      throw new Error("Failed to generate an answer. The model may be busy or an error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [documents]);

  return { generateAnswer, isLoading };
};
