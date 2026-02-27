const fs = require('fs');
let c = fs.readFileSync('src/components/chat/chat-widget.tsx', 'utf8');
c = c.replace(/import \{ useChat \} from '@ai-sdk\/react';/, "import { useChat } from 'ai/react';");
c = c.replace(/\/\/\s*@ts-ignore[\s\r\n]*const \{\s*messages,\s*input,\s*handleInputChange,\s*handleSubmit,\s*isLoading\s*\} = useChat\(\);/g, "const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();");
c = c.replace(/\{\/\*\s*@ts-ignore\s*\*\/\}\s*\{m\.content\}/g, "{m.content}");
fs.writeFileSync('src/components/chat/chat-widget.tsx', c);
console.log('Replaced');
