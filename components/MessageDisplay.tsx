
import React from 'react';
import { ChatMessage, Document } from '../types';

const UserIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-violet-500 flex-shrink-0 flex items-center justify-center font-bold">
        م
    </div>
);

const ModelIcon: React.FC = () => (
    <div className="w-8 h-8 rounded-full bg-blue-500 flex-shrink-0 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
    </div>
);

const SourcePill: React.FC<{ source: Document }> = ({ source }) => (
    <div className="bg-gray-700 text-xs text-gray-300 rounded-full px-3 py-1 transition-colors hover:bg-gray-600" title={source.content}>
        {source.title}{source.pageNumber && ` (صفحة ${source.pageNumber})`}
    </div>
);

const MessageDisplay: React.FC<{ messages: ChatMessage[] }> = ({ messages }) => {
    return (
        <div className="space-y-6 max-w-4xl mx-auto w-full">
            {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-start' : 'justify-end'} animate-fade-in-up`}>
                    {msg.role === 'model' && <ModelIcon />}
                    <div className={`rounded-2xl p-4 max-w-2xl ${msg.role === 'user' ? 'bg-violet-600 rounded-bl-none' : 'bg-gray-800 rounded-br-none'}`}>
                        <div className="prose prose-invert prose-sm max-w-none text-gray-200" dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br />') }} />
                        {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-4 border-t border-gray-700 pt-3">
                                <h4 className="text-xs font-semibold text-gray-400 mb-2">المصادر:</h4>
                                <div className="flex flex-wrap gap-2">
                                    {msg.sources.map(source => <SourcePill key={source.id} source={source} />)}
                                </div>
                            </div>
                        )}
                    </div>
                    {msg.role === 'user' && <UserIcon />}
                </div>
            ))}
        </div>
    );
};

export default MessageDisplay;
