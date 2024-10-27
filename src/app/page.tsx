import ChatForm from "@/components/chatForm";

export default function Home() {
  return (
    <div
      className=" items-center justify-items-center  font-[family-name:var(--font-geist-sans)] 
   min-h-screen flex flex-col
      bg-[conic-gradient(at_bottom_right,_var(--tw-gradient-stops))] from-blue-700 via-blue-800 to-gray-900

      
  
   
   
   "
    >
      <h1 className="text-2xl font-bold text-white mt-8 mb-4">ChatGPT</h1>
      <ChatForm />
    </div>
  );
}
