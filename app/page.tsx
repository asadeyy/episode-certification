import Link from "next/link";
export default function Home() {
  return (
    <main className="flex justify-center items-center">
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
          上記をご了承の上，以下のボタンからアプリをご体験ください．
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
