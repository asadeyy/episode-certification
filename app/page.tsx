import Link from "next/link";
export default function Home() {
  return (
    <main className="flex flex-col justify-center items-center">
      <div className="max-w-xl m-20 md:max-w-4xl md:m-40">
        <div className="text-lg md:text-2xl ">
          このサイトでは，episode-certificationアプリを体験することができます．
          <br />
          実験データ収集の為，このサイトに記入された情報は研究・分析に使用致します．
          <br />
          第三者に情報が提供されることはありません．
          <br />
          研究・分析の結果は，個人を特定できないような形で論文や学会発表などに使用される可能性があります．
          <br />
          <br />
          また，デモで使用する生成AIのAPIキーはデモ体験者各自に入力していただきます．無料のものを使用する場合は，あなたの情報が，使用した生成AIに学習される可能性もありますのでご注意ください．
          <br />
          生成AIは現在はGeminiAPIにしか対応しておりませんが，順次拡大予定です．
          <br />
          <br />
          生成AIを使用しているため，途中でハルシネーションを起こしてしまい，うまくデモが進行しない場合があります．実験段階であることをご理解いただいた上でご体験ください．何度かお試し頂くと最後までご体験できます．こちらは順次改善して参ります．
          <br />
          <br />
          上記をご了承の上，以下のボタンからアプリをご体験ください．
          <br />
          (遷移には数秒かかる場合があります)
        </div>
      </div>
      <div className="flex justify-center items-center ">
        <button
          type="button"
          className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 m-10"
        >
          <Link href={"/collect-phase"}>デモアプリを体験する</Link>
        </button>
      </div>
    </main>
  );
}
