"use client";
import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  Box,
  InputGroup,
  InputLeftAddon,
  Input,
  Button,
  Text,
  VStack,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { FaUser, FaRobot } from "react-icons/fa";

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
        'あなたはインタビュアーです。エピソードベースの印象深い出来事について、知人や友人が推測できないようなセキュリティ質問を作成するために、質問をしています。質問内容には，回答しやすいように回答例も提示してください。日本語で一質問ずつ質問してください。回答が不十分な場合は、同じ質問についてもう一度質問してください。3つのエピソードとその深掘りを入手することができたら、質問を停止し、{category: "", [{question: "answer}, {"question": "answer"}, {"question": "answer"}]}{category2:"", [{"question":"answer"}]}のようなjsonのみの形式ですべてのデータを出力してください。なお，セキュリティ質問を収集する以外の会話をしてはいけません．',
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
      setMessages([...newMessages, { role: "model", content: text }]);
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

  const inputBgColor = useColorModeValue("gray.100", "gray.700");

  return (
    <div className="flex items-center justify-center">
      <VStack className="my-8 md:my-20 mx-8 max-w-4xl">
        <div className="flex items-center justify-center">
          <InputGroup>
            <InputLeftAddon>API Key を入力：</InputLeftAddon>
            <Input
              id="apiKey"
              placeholder="API Keyを入力してください"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              bg={inputBgColor}
              className="border px-4 border-gray-400 w-40 md:w-80"
            />
          </InputGroup>
          <form onSubmit={handleSubmit}>
            <input className="hidden" value="質問を開始してください" />
            <button
              type="submit"
              className="hidden md:inline-block w-28 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 m-10"
            >
              質問を開始
            </button>
          </form>
        </div>
        <form onSubmit={handleSubmit}>
          <input className="hidden" value="質問を開始してください" />
          <button
            type="submit"
            className="md:hidden w-28 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 m-10"
          >
            質問を開始
          </button>
        </form>

        <VStack
          h="55vh"
          overflowY="auto"
          spacing={4}
          p={2}
          className="no-scrollbar"
        >
          {messages.map((msg, index) => (
            <HStack
              key={index}
              alignSelf={msg.role === "user" ? "flex-end" : "flex-start"}
              w="fit-content"
              p={3}
              borderRadius="md"
              className={`${
                msg.role === "user" ? "bg-blue-100" : "bg-gray-200"
              }`}
            >
              {msg.role !== "user" && <FaRobot className="w-10 px-2" />}
              <Text className="max-w-64 md:max-w-3xl">{msg.content}</Text>
              {msg.role === "user" && <FaUser className="w-10 px-2" />}
            </HStack>
          ))}
          <div ref={messagesEndRef} />
        </VStack>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <HStack>
            <textarea
              placeholder="メッセージを入力"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              className="border px-4 border-gray-400 w-full"
              rows={3}
            />
            <Button
              type="submit"
              colorScheme="blue"
              className=" border rounded-md px-2 bg-gray-200"
            >
              送信
            </Button>
          </HStack>
        </form>
      </VStack>
    </div>
  );
}
