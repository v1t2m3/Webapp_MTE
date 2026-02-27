'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from 'ai/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { X, Send } from 'lucide-react'; // Assuming X and Send are from lucide-react

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        onToolCall({ toolCall }) {
            if (toolCall.toolName === 'navigateToPage') {
                const { path } = toolCall.args as { path: string };
                console.log(`AI NAVIDATING TO: ${path}`);
                router.push(path);
                setIsOpen(false); // Optionally close chat when navigating
            }
        },
    });
    const onClose = () => setIsOpen(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of chat
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]); // isOpen is removed from dependency array as it's no longer internal state

    return (
        <>
            {/* Floating Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)} // Toggle isOpen state
                className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50 hover:scale-105 transition-transform"
                size="icon"
            >
                {isOpen ? <X className="h-6 w-6" /> : <Send className="h-6 w-6" />} {/* Changed icon based on isOpen */}
            </Button>

            {/* Chat Window */}
            {isOpen && (
                <Card className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] h-[500px] flex flex-col shadow-2xl z-50 border-primary/20 bg-background/95 backdrop-blur-sm animate-in slide-in-from-bottom-5">
                    <CardHeader className="p-4 border-b bg-primary/5 rounded-t-xl">
                        <CardTitle className="text-lg font-semibold">Chat with AI</CardTitle>
                        <Button
                            onClick={onClose} // Changed to use onClose prop
                            className="absolute top-4 right-4"
                            variant="ghost"
                            size="icon"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((m, index) => {
                            if (!m.content && (!m.toolInvocations || m.toolInvocations.length === 0)) return null;
                            return (
                                <div
                                    key={index}
                                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${m.role === 'user'
                                            ? 'bg-primary text-primary-foreground shadow-md rounded-br-sm'
                                            : 'bg-white text-slate-900 border border-slate-200 shadow-sm rounded-bl-sm dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700'
                                            }`}
                                    >
                                        {m.content || (
                                            <span className="italic opacity-60">
                                                {m.toolInvocations?.some(t => t.toolName === 'navigateToPage')
                                                    ? 'Đang chuyển trang...'
                                                    : 'Đang tra cứu dữ liệu...'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </CardContent>
                    <CardFooter className="p-4 border-t bg-primary/5 rounded-b-xl">
                        <form onSubmit={handleSubmit} className="flex w-full items-center space-x-2">
                            <Input
                                placeholder="Say something..."
                                value={input}
                                onChange={handleInputChange}
                                className="flex-1"
                                autoFocus
                            />
                        </form >
                    </CardFooter >
                </Card >
            )
            }
        </>
    );
}
