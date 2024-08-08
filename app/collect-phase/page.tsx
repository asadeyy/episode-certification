"use client";
import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // API キーが設定されているか確認
    if (!apiKey) {
      alert("API キーを入力してください。");
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction:
        'あなたはインタビュアーです。過去に起きた印象深い複雑な出来事について、友人が推測できないようなセキュリティ質問を作成するために、たくさんの質問をします。各質問に対して回答例も提示してください。日本語で一つずつ質問してください。回答が不十分な場合は、同じ質問についてもう一度質問してください。「以上で回答を終わります」と言われたら、質問を停止し、{category: "", [{question: "answer}, {"question": "answer"}, {"question": "answer"}]}{category2:"", [{"question":"answer"}]}のようなjson形式ですべてのデータを出力してください。',
    });

    const generationConfig: any = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    const newMessages = [...messages, { role: "user", content: userInput }];
    setMessages(newMessages);
    setUserInput("");

    try {
      const result = await model.generateContent(userInput, generationConfig);
      const response = await result.response;
      const text = response.text();
      setMessages([...newMessages, { role: "assistant", content: text }]);
    } catch (error: any) {
      // API キーが無効な場合のエラー処理
      if (error.message.includes("unregistered callers")) {
        alert("API キーが無効です。");
      } else {
        console.error(error);
        alert("エラーが発生しました。");
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="container mx-auto p-4">
      <div className="api-key-form mb-4">
        <input
          type="text"
          placeholder="API キーを入力"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>

      <div className="messages space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message ${
              msg.role === "user" ? "user-message" : "assistant-message"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="mt-4">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="input input-bordered w-full"
        />
        <button type="submit" className="btn btn-primary mt-2">
          送信
        </button>
      </form>
    </main>
  );
}
