
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Document } from './types';
import { useRag } from './hooks/useRag';
import Header from './components/Header';
import MessageDisplay from './components/MessageDisplay';
import ChatInput from './components/ChatInput';

// Make pdfjsLib available in the window scope
declare const pdfjsLib: any;
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const { generateAnswer, isLoading } = useRag(documents);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Effect to load and parse the default PDF on component mount
  useEffect(() => {
    const loadDefaultDocument = async () => {
      setIsInitializing(true);
      setError(null);
      setMessages([{
        role: 'model',
        content: "جاري تهيئة وتحميل دليل الطالب 2025... يرجى الانتظار.",
      }]);
      
      try {
        const response = await fetch('/StudentGuide2025_compressed.pdf');
        if (!response.ok) {
            throw new Error(`فشل في جلب ملف PDF: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
        const numPages = pdf.numPages;
        
        const pageDocuments: Document[] = [];
        const title = 'StudentGuide2025_compressed.pdf';

        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          
          if (pageText.trim()) { // Only add pages with content
            const newDoc: Document = {
              id: `pdf-${title}-page-${i}`,
              title: title,
              content: pageText,
              pageNumber: i,
            };
            pageDocuments.push(newDoc);
          }
        }

        setDocuments(pageDocuments);

        setMessages([{
            role: 'model',
            content: `أهلاً بك! لقد قمت بتحميل "دليل الطالب 2025". يمكنك الآن طرح أي أسئلة حول محتوياته.`,
        }]);

      } catch (e) {
          const errorMessage = e instanceof Error ? e.message : 'فشل في تحميل مستند PDF الافتراضي.';
          setError(errorMessage);
          setMessages([{
              role: 'model',
              content: `عذراً، حدث خطأ أثناء تحميل الدليل: ${errorMessage}. يرجى محاولة تحديث الصفحة.`
          }]);
      } finally {
          setIsInitializing(false);
      }
    };

    loadDefaultDocument();
  }, []);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (query: string) => {
    if (!query.trim() || isLoading || isInitializing) return;

    const userMessage: ChatMessage = { role: 'user', content: query };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setError(null);

    if (documents.length === 0) {
        const errorResponse: ChatMessage = {
            role: 'model',
            content: "لم يتم تحميل قاعدة المعرفة. يرجى التأكد من توفر دليل الطالب وتحديث الصفحة."
        };
        setMessages((prevMessages) => [...prevMessages, errorResponse]);
        return;
    }

    try {
      const { answer, sources } = await generateAnswer(query, messages);
      const modelMessage: ChatMessage = { role: 'model', content: answer, sources };
      setMessages((prevMessages) => [...prevMessages, modelMessage]);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'حدث خطأ غير معروف.';
      setError(errorMessage);
      const errorResponse: ChatMessage = {
        role: 'model',
        content: `عذراً، حدث خطأ: ${errorMessage}`
      };
      setMessages((prevMessages) => [...prevMessages, errorResponse]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 to-slate-900 text-gray-100 font-sans">
      <Header />
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <MessageDisplay messages={messages} />
        {(isLoading || isInitializing) && (
          <div className="flex justify-start">
              <div className="bg-gray-800 rounded-2xl p-4 max-w-2xl flex items-center space-x-2">
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse"></div>
              </div>
          </div>
        )}
      </main>
      <footer className="border-t border-gray-700 p-4 bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto">
            <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading || isInitializing} />
        </div>
      </footer>
    </div>
  );
};

export default App;
