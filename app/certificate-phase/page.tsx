"use client";
import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  InputGroup,
  InputLeftAddon,
  Input,
  Button,
  Text,
  VStack,
  HStack,
  useColorModeValue,
  Spinner,
  Select,
} from "@chakra-ui/react";
import Link from "next/link";

export default function CertificatePhase() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key");
  const content = searchParams.get("content");

  // 何かエラーが起きた時に吐き出す
  const [error, setError] = useState("");
  // 生成AIの処理が終わったかどうか判定する変数
  const [finished, setFinished] = useState(false);
  // 認証に使うデータを格納する変数
  const [episodeElement, setEpisodeElement] = useState<EpisodeData[]>([]);
  // 正解データを入れる
  const [correctData, setCorrectData] = useState<string[]>([]);
  // 回答データを入れる
  const [selectingData, setSelectingData] = useState<UserSelectData[]>([]);
  useEffect(() => {
    // selectingData が変更されたらコンソールにログを出力
    console.log("selectingData updated:", selectingData);
  }, [selectingData]);

  // 型定義
  type EpisodeData = {
    question: string[];
    answer: string[];
  };

  type UserSelectData = {
    index: number;
    index2: number;
    answer: string;
  };

  // gemini呼び出しのための関数
  async function geminiCall(systemInstruction: string, prompt: string) {
    const apiKey: string = key as string;
    const genAI = new GoogleGenerativeAI(apiKey);

    const generationConfig: any = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseMimeType: "text/plain",
    };

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: generationConfig,
      systemInstruction: systemInstruction,
    });

    console.log("promptの確認：" + prompt);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("AIからのoutput生データ：" + text);

    return text;
  }

  async function elementsCreate() {
    try {
      // まずはデータフォーマットと選定
      const inputFormatString: string =
        'あなたは、ユーザーが回答したデータを整形する人です。あなたに，AIが質問した内容とユーザーが回答した内容のJSONデータを渡します。あなたは、そのデータに基づいて短い質問と短い回答を再構成必要があります。例えば、{旅行:{"question": "あなたの人生で最も印象に残っている旅行はいつどこでしたか？具体的な場所や経験、誰と一緒だったかなど、可能な限り詳細を教えてください。 ",\n"answer": "グアムで家族と行った、ナマコいっぱい拾った"}} は [{question: "家族と行った人生の中で印象に残っている旅行の場所はどこか？", answer: "グアム"},{question: "家族と行った人生の中で印象に残っている旅行先で何をしたか？",answer: "ナマコを拾った"}] のようになります。出力は "{category: [{question: answer]}" のようなJSON形式のみで出力してください。 回答が「わからない」「覚えてない」などの求めている回答になっていないものや，個人の意見や感想に基づくものは、スキップして出力しないでください。感じたことや思ったことや気持ちは出力しないでください．できる限り多くの要素に分けて出力して下さい．ただし，いつ頃の出来事なのかは質問にちゃんと加え,できる限り単語か短い文章で出力してください．';
      const formatedData = await geminiCall(
        inputFormatString,
        content as string
      );

      // 次はデータ選定を行う
      const inputSelectString: string =
        'あなたは，セキュリティ質問として適切で強固な，質問と回答のセットを選定する人です．入力された質問と回答のJSONデータの中から，他人に見破られにくい質問と回答を5つ挙げて下さい．出力形式は[{question: ["家族と行った人生の中で印象に残っている旅行の場所は？"], answer: ["グアム"]},{question: ["家族と行った人生の中で印象に残っている旅行先で何をしたか？"],answer: ["ナマコをいっぱい拾った"]}] のようになります。出力は "[{"question":["質問1"],"answer":["回答1"]},{"question":["質問2"],"answer":["回答2"]}]" のようなJSON形式のみ許可します．また，**絶対に同じような質問は含めてないでください**．感じたことや気持ちを含むものは含めないでください．入力データから意味を変更しないでください．';
      const selectedData = await geminiCall(inputSelectString, formatedData);
      const replacedSelectedData = selectedData
        .replace("```", "")
        .replace("json", "")
        .replace("```", "");
      console.log("選定後データ確認・JSONパース前：" + replacedSelectedData);
      const parsedJsonData: EpisodeData[] = JSON.parse(replacedSelectedData);
      console.log(
        "選定後データ確認・JSONパース後：" +
          parsedJsonData.map((data) => data.question + ":" + data.answer)
      );
      const resolvedData: EpisodeData[] = parsedJsonData;

      // 一つ一つのデータに対してダミーデータを生成
      const inputDummyString: string =
        "あなたはダミーデータを生成するスペシャリストです。ユーザーは質問と正しい回答を入力するので、回答のダミー文9個を**カンマ区切り形式で**出力して下さい。回答が文章であれば文章のダミーデータを，単語であれば単語のダミーデータを出力をしてください．質問に対する回答ダミーデータを作成してください．正解のデータと区別がつくようにしてください．意味が似ている回答ダミーデータのセットを絶対作ってはいけません．出力は，hoge,hoge,hoge,hogeのような，カンマ区切りで，回答ダミーデータだけを出力して下さい．必ずカンマ(,)で区切って出力してください．**必ずカンマ(,)で区切って出力してください!!!!**";
      for (const episode of resolvedData) {
        setCorrectData([...correctData, episode.answer[0]]);
        const outputDummyData: string = await geminiCall(
          inputDummyString,
          "質問：" + episode.question[0] + "回答：" + episode.answer[0]
        );
        const dummyData: string[] = outputDummyData.split(",");
        episode.answer.push(...dummyData);
        episode.answer.sort(() => Math.random() - 0.5);
        console.log("1ダミーデータ生成：" + episode.answer);
        setEpisodeElement((prevEpisodeElement) => [
          ...prevEpisodeElement,
          episode,
        ]);
      }
      await console.log("最終出力物：" + episodeElement);
      setFinished(true);
    } catch (error: any) {
      console.error("エラー:", error);
      setError(error);
    }
  }

  // 認証処理が成功できるかどうかのチャレンジ
  const [ok, setOk] = useState<boolean | undefined>(undefined);
  function challenge() {
    console.log(selectingData);
    console.log(correctData);
    if (selectingData.length !== correctData.length) {
      console.log("回答数が足りません");
      return false;
    }
    for (let i = 0; i < selectingData.length; i++) {
      if (selectingData[i].answer !== correctData[i]) {
        console.log("回答が間違っています");
        return false;
      }
    }
    console.log("認証成功");
    return true;
  }

  // 実験データの送信先と送信処理
  const WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbxAjbVHyrYOjVTYS2SwKXv7DQvK6a1_Gw9LOtyFEPGYINJ8BrbzIT003rk0G6STnBMYaA/exec";

  const handleDataSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const res = await fetch(WEB_APP_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          postData:
            (content as string) +
            "😃" +
            episodeElement +
            "😃" +
            correctData +
            "😃" +
            selectingData,
        }),
      });

      if (res.ok) {
        const data = await res.text();
        console.log(data);
      } else {
        console.error("実験データの送信時にエラーが発生しました");
      }
    } catch (error) {
      console.error("実験データの送信時にエラー:", error);
      return;
    }
  };

  useEffect(() => {
    elementsCreate();
  }, []);

  return (
    <div className="flex flex-col justify-center items-center">
      <div className={`${finished ? "hidden" : "block"} my-20 text-center`}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          size="xl"
          className="w-20 h-20 my-16"
        />
        <div>処理中だよ，ちょっと待ってね</div>
        <div className={`${error == "" ? "hidden" : "block"}`}>
          エラーが発生しました💦
          <br />
          {error}
        </div>
      </div>
      <div
        className={`${
          finished ? "block" : "hidden"
        } max-w-lg md:max-w-4xl space-y-8`}
      >
        {episodeElement.map((element, index) => {
          return (
            <div key={index} className=" space-y-2 mx-8 mt-16">
              <h2 className=" text-lg">{element.question[0]}</h2>
              <div className=" flex flex-wrap space-y-2 space-x-2">
                {element.answer.map((answer, index2) => {
                  const isSelected = selectingData.find(
                    (data) => data.answer === answer
                  );
                  return (
                    <button
                      key={index2}
                      onClick={() => {
                        setSelectingData((alreadySelection) => {
                          const existingIndex = alreadySelection.findIndex(
                            (data) => data.index === index
                          );
                          if (existingIndex !== -1) {
                            const updatedSelection = [...alreadySelection];
                            updatedSelection[existingIndex] = {
                              index,
                              index2,
                              answer,
                            };
                            return updatedSelection;
                          } else {
                            return [
                              ...alreadySelection,
                              { index, index2, answer },
                            ];
                          }
                        });
                      }}
                      className={`${
                        isSelected ? " bg-blue-400 " : "bg-gray-300"
                      } outline rounded-md px-2 py-2`}
                    >
                      {answer}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div className="mx-auto my-16">
          <button
            onClick={() => {
              setOk(challenge());
            }}
            className=" w-28 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 m-10"
          >
            認証
          </button>
          <div className={`${ok == undefined ? "hidden" : "block"}`}>
            {ok ? "認証成功" : "認証失敗"}
          </div>
        </div>
      </div>
    </div>
  );
}
