"use client";

import Image from "next/image";
import Link from "next/link";

export default function MockupMemberCardsPage() {
  const dummyUser = {
    name: "Alex Dev",
    role: "President",
    id: "EXEC-2026",
    avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=AlexDev&backgroundColor=transparent",
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen">
      <div className="mb-8">
        <Link href="/" className="text-text-secondary hover:text-accent-primary font-medium text-sm mb-4 inline-block">← Back to Main</Link>
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">Executive Panel Card Mockups</h1>
        <p className="text-text-secondary">Review the proposed creative designs at their exact sizes (3-column grid).</p>
      </div>

      {/* 1. Neo-Brutalist ID Card */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-text-primary mb-2">1. Neo-Brutalist ID Card</h2>
        <p className="text-text-secondary mb-6 max-w-xl">A high-contrast, physical ID badge feel with brutalist borders and shadows. Perfect for a developer/tech club aesthetic.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-surface-primary border-2 border-text-primary rounded-md shadow-[6px_6px_0px_var(--accent-primary)] p-4 flex flex-col items-center text-center transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0px_var(--accent-primary)]">
            <div className="flex justify-between items-center border-b-2 border-text-primary pb-2 mb-4 w-full">
              <span className="font-mono text-xs font-bold tracking-widest">{dummyUser.id}</span>
              <span className="font-mono text-lg tracking-tighter opacity-50">||||||| | |||||</span>
            </div>
            
            <div className="w-full aspect-square border-2 border-text-primary rounded-sm bg-surface-secondary mb-4 relative overflow-hidden">
              <Image src={dummyUser.avatar} alt="avatar" fill className="object-contain p-2.5" unoptimized />
            </div>
            
            <h3 className="font-heading text-2xl font-black leading-tight mb-1 uppercase text-text-primary">{dummyUser.name}</h3>
            <div>
              <span className="font-mono text-xs text-surface-primary bg-text-primary px-2 py-1 inline-block font-bold uppercase">{dummyUser.role}</span>
            </div>
            
            <div className="mt-auto pt-4 flex gap-2">
              <a href="#" className="border-2 border-text-primary w-9 h-9 flex items-center justify-center rounded-full text-text-primary hover:bg-accent-primary hover:text-surface-primary hover:border-accent-primary font-bold text-xs" aria-label="GitHub">GH</a>
              <a href="#" className="border-2 border-text-primary w-9 h-9 flex items-center justify-center rounded-full text-text-primary hover:bg-accent-primary hover:text-surface-primary hover:border-accent-primary font-bold text-xs" aria-label="LinkedIn">LI</a>
              <a href="#" className="border-2 border-text-primary w-9 h-9 flex items-center justify-center rounded-full text-text-primary hover:bg-accent-primary hover:text-surface-primary hover:border-accent-primary font-bold text-xs" aria-label="Codeforces">CF</a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Brutalist Ticket/Polaroid */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-text-primary mb-2">2. Brutalist Ticket</h2>
        <p className="text-text-secondary mb-6 max-w-xl">A dashed border design reminiscent of a ticket stub or polaroid frame.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="bg-surface-primary border-2 border-dashed border-text-primary shadow-[8px_8px_0px_var(--text-primary)] p-4 flex flex-col transition-all hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_var(--accent-primary)] hover:border-solid">
            <div className="w-full aspect-square border-2 border-text-primary bg-surface-secondary relative overflow-hidden mb-4">
              <Image src={dummyUser.avatar} alt="avatar" fill className="object-contain" unoptimized />
            </div>
            
            <div className="border-t-2 border-dashed border-text-primary pt-4 mt-auto">
              <h3 className="font-heading text-2xl font-black uppercase mb-1 text-text-primary">{dummyUser.name}</h3>
              <div className="font-mono text-sm text-text-secondary uppercase tracking-wider">{dummyUser.role}</div>
              
              <div className="mt-4 flex gap-2">
                <a href="#" className="font-mono text-xs font-bold border border-text-primary px-2 py-1 text-text-primary bg-surface-secondary hover:bg-text-primary hover:text-surface-primary" aria-label="GitHub">GH</a>
                <a href="#" className="font-mono text-xs font-bold border border-text-primary px-2 py-1 text-text-primary bg-surface-secondary hover:bg-text-primary hover:text-surface-primary" aria-label="LinkedIn">LI</a>
                <a href="#" className="font-mono text-xs font-bold border border-text-primary px-2 py-1 text-text-primary bg-surface-secondary hover:bg-text-primary hover:text-surface-primary" aria-label="Codeforces">CF</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Brutalist Folder Tab */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-text-primary mb-2">3. Brutalist Folder Tab</h2>
        <p className="text-text-secondary mb-6 max-w-xl">A playful, file-folder design with a top tab indicating the role.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <div className="relative mt-8">
            <div className="absolute -top-7 left-0 bg-accent-primary text-surface-primary border-2 border-text-primary border-b-0 px-4 py-1 font-mono font-bold text-xs uppercase rounded-t-sm">
              {dummyUser.role}
            </div>
            
            <div className="bg-surface-primary border-2 border-text-primary rounded-r-sm rounded-b-sm shadow-[4px_4px_0px_var(--text-primary)] flex flex-col transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_var(--text-primary)] overflow-hidden bg-[radial-gradient(var(--border-default)_1px,transparent_1px)] bg-[size:16px_16px]">
              <div className="w-[calc(100%-1.5rem)] aspect-square border-2 border-text-primary bg-surface-secondary relative overflow-hidden mt-3 mx-auto">
                <Image src={dummyUser.avatar} alt="avatar" fill className="object-contain" unoptimized />
              </div>
              
              <div className="p-3 bg-surface-primary border-t-2 border-text-primary mt-3">
                <h3 className="font-heading text-xl font-bold text-text-primary uppercase">{dummyUser.name}</h3>
                <div className="font-mono text-xs text-accent-primary-hover mt-0.5">{dummyUser.id}</div>
                
                <div className="mt-3 flex justify-between">
                  <a href="#" className="underline font-mono text-xs text-text-primary font-bold hover:text-accent-primary">GITHUB</a>
                  <a href="#" className="underline font-mono text-xs text-text-primary font-bold hover:text-accent-primary">LINKEDIN</a>
                  <a href="#" className="underline font-mono text-xs text-text-primary font-bold hover:text-accent-primary">CODEFORCES</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
