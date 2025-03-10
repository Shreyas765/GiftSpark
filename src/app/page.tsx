import React from 'react';
import Link from 'next/link';

export default function HomePage() {

  const profiles = [
    {
      id: 1,
      name: 'Shreyas',
      avatar: '/landing_images/test_profile_pic.svg'
    }
  ]

  return (
    <div className= "min-h-screen bg-cyan-100 flex flex-col">
      {/* Top Navigation Bar*/}
      <header className="flex justify-between items-center by-cyan-400 p-4 bg-cyan-800">
         {/* YOUR PROFILES BUTTON*/}
         <Link href="/profiles">
          <button className='bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded'>
            Your Profiles
          </button>
         </Link>

         <div className='flex gap-4'>
          <Link href='/login'>
            <button className='bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded'>
              Login
            </button>
          </Link>
          <Link href='/signup'>
            <button className='bg-cyan-600 hover:bg-cyan-700 text-white py-2 px-4 rounded'>
              Sign Up
            </button>
          </Link>
         </div>
      </header>

      {/* Main Content */}
      <main className='flex flex-1'>
        {/* Sidebar for profiles*/}
        <aside className='bg-cyan-800  w-24 flex-col items-center py-12 space-y-6'>
          {/* Loop over profiles */}
          {profiles.length > 0 && profiles.map((profile) => (
            <div key={profile.id} className="flex flex-col items-center">
              <div className="w-16 h-1 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img src={profile.avatar} alt={`Profile for ${profile.name}`} className="object-cover w-full h-full" />
              </div>
              <button className="mt-2 text-xs bg-cyan-600 text-white py-1 px-2 rounded hover:bg-cyan-700">
                Shop Again For
              </button>
            </div>
          ))}
        </aside>
      </main>
    </div>
  )
}


// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
//       <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={180}
//           height={38}
//           priority
//         />
//         <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
//           <li className="mb-2">
//             Get started by editing{" "}
//             <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
//               src/app/page.tsx
//             </code>
//             .
//           </li>
//           <li>Save and see your changes instantly.</li>
//         </ol>

//         <div className="flex gap-4 items-center flex-col sm:flex-row">
//           <a
//             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={20}
//               height={20}
//             />
//             Deploy now
//           </a>
//           <a
//             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Read our docs
//           </a>
//         </div>
//       </main>
//       <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/file.svg"
//             alt="File icon"
//             width={16}
//             height={16}
//           />
//           Learn
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/window.svg"
//             alt="Window icon"
//             width={16}
//             height={16}
//           />
//           Examples
//         </a>
//         <a
//           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
//           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           <Image
//             aria-hidden
//             src="/globe.svg"
//             alt="Globe icon"
//             width={16}
//             height={16}
//           />
//           Go to nextjs.org →
//         </a>
//       </footer>
//     </div>
//   );
// }
